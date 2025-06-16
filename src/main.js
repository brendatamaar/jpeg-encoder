import { rgbToYCbCr } from "./encoder/ycbcr.js";
import { splitChannel } from "./encoder/split.js";
import { applyDCT } from "./encoder/dct.js";
import { quantizeLuminance, quantizeChrominance } from "./encoder/quantize.js";
import { zigZagOrderBlock, runLengthEncode } from "./encoder/zigzag.js";
import { huffmanEncodeRLE } from "./encoder/huffman.js";

// DOM elements
const upload = document.getElementById("fileInput");
const output = document.getElementById("originalImage");
const defaultPlaceholder = document.getElementById("default-placeholder");

// Main event listener
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const imageData = await loadImageData(file);
    const encodingResult = encodeImage(imageData, file);
    displayResults(imageData.canvas, file, encodingResult);
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

function loadImageData(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);

        resolve({
          canvas,
          imageData,
          width: img.width,
          height: img.height,
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

function encodeImage(imageInfo, file) {
  const startTime = performance.now();
  const { imageData, width, height } = imageInfo;

  // Step 1: RGB → YCbCr conversion
  const { Y, Cb, Cr } = rgbToYCbCr(imageData);

  // Step 2: Channel splitting into 8×8 blocks
  const channels = splitChannels(Y, Cb, Cr);

  // Step 3: DCT transformation
  const dctBlocks = applyDCTToChannels(channels);

  // Step 4: Quantization
  const quantizedBlocks = quantizeChannels(dctBlocks);

  // Step 5: Zig-zag reordering and RLE
  const rleData = applyZigzagAndRLE(quantizedBlocks);

  // Step 6: Huffman encoding
  const huffmanResult = applyHuffmanEncoding(rleData);

  const endTime = performance.now();

  return {
    ...huffmanResult,
    processingTime: endTime - startTime,
    channels,
    quantizedBlocks,
    rleData,
    originalSize: file.size,
    dimensions: { width, height },
  };
}

function splitChannels(Y, Cb, Cr) {
  return {
    Y: splitChannel(Y),
    Cb: splitChannel(Cb),
    Cr: splitChannel(Cr),
  };
}

function applyDCTToChannels(channels) {
  return {
    Y: channels.Y.map(applyDCT),
    Cb: channels.Cb.map(applyDCT),
    Cr: channels.Cr.map(applyDCT),
  };
}

function quantizeChannels(dctBlocks) {
  return {
    Y: dctBlocks.Y.map(quantizeLuminance),
    Cb: dctBlocks.Cb.map(quantizeChrominance),
    Cr: dctBlocks.Cr.map(quantizeChrominance),
  };
}

function applyZigzagAndRLE(quantizedBlocks) {
  const processBlocks = (blocks) =>
    blocks.map((block) => runLengthEncode(zigZagOrderBlock(block)));

  return {
    Y: processBlocks(quantizedBlocks.Y),
    Cb: processBlocks(quantizedBlocks.Cb),
    Cr: processBlocks(quantizedBlocks.Cr),
  };
}

function applyHuffmanEncoding(rleData) {
  const allRLE = [...rleData.Y, ...rleData.Cb, ...rleData.Cr].flat();
  return {
    ...huffmanEncodeRLE(allRLE),
    allRLE,
  };
}

function displayResults(canvas, file, encodingResult) {
  showOriginalImage(canvas);
  generateReport(file, encodingResult);
}

function showOriginalImage(canvas) {
  const dataUrl = canvas.toDataURL("image/jpeg");
  output.src = dataUrl;
  output.style.display = "block";
  defaultPlaceholder.style.display = "none";
}

function generateReport(file, result) {
  const stats = calculateStatistics(file, result);
  updateReportUI(stats);
}

function calculateStatistics(file, result) {
  const {
    dimensions,
    channels,
    quantizedBlocks,
    allRLE,
    encodedBitString,
    codeMap,
    processingTime,
  } = result;

  const { width, height } = dimensions;

  // Basic metrics
  const totalPixels = width * height;
  const originalSizeKB = (file.size / 1024).toFixed(2);

  // Block counts
  const blockCounts = {
    Y: channels.Y.length,
    Cb: channels.Cb.length,
    Cr: channels.Cr.length,
  };
  const totalBlocks = blockCounts.Y + blockCounts.Cb + blockCounts.Cr;

  // Coefficient counts
  const totalCoefficients = totalBlocks * 64; // 8×8 blocks
  const totalQuantized = Object.values(quantizedBlocks).flat().flat().length;
  const totalRLE = allRLE.length;
  const totalHuffman = encodedBitString.length;

  // Compression metrics
  const encodedBytes = Math.ceil(encodedBitString.length / 8);
  const compressedSizeKB = (encodedBytes / 1024).toFixed(2);
  const compressionRatio = (file.size / encodedBytes).toFixed(2);
  const spaceSaved = (100 - (encodedBytes / file.size) * 100).toFixed(2);
  const bitrate = (encodedBitString.length / totalPixels).toFixed(2);

  // Entropy calculation
  const entropy = calculateEntropy(allRLE);

  // Top Huffman codes
  const topCodes = getTopHuffmanCodes(codeMap);

  return {
    processingTime: processingTime.toFixed(2),
    originalSizeKB,
    dimensions: `${width} px × ${height} px`,
    blockCounts,
    totalBlocks,
    totalCoefficients,
    totalQuantized,
    totalRLE,
    encodedBytes,
    totalHuffman,
    compressedSizeKB,
    compressionRatio,
    spaceSaved,
    bitrate,
    entropy,
    topCodes,
  };
}

function calculateEntropy(allRLE) {
  // Debug: Check if allRLE has data
  if (!allRLE || allRLE.length === 0) {
    console.warn("allRLE is empty, returning entropy 0");
    return "0.000";
  }

  const frequencies = {};

  for (const symbol of allRLE) {
    let key;
    if (typeof symbol === "object" && symbol !== null) {
      if ("run" in symbol && "value" in symbol) {
        key = `${symbol.run}:${symbol.value}`;
      } else if ("length" in symbol && "value" in symbol) {
        key = `${symbol.length}:${symbol.value}`;
      } else {
        key = JSON.stringify(symbol);
      }
    } else {
      key = String(symbol);
    }

    frequencies[key] = (frequencies[key] || 0) + 1;
  }

  const totalSymbols = allRLE.length;

  if (Object.keys(frequencies).length === 0) {
    console.warn("No frequencies calculated, returning entropy 0");
    return "0.000";
  }

  const entropy = Object.values(frequencies).reduce((acc, frequency) => {
    const probability = frequency / totalSymbols;
    if (probability > 0) {
      return acc - probability * Math.log2(probability);
    }
    return acc;
  }, 0);

  return entropy.toFixed(3);
}

function getTopHuffmanCodes(codeMap) {
  return Object.entries(codeMap)
    .sort((a, b) => a[1].length - b[1].length)
    .slice(0, 5)
    .map(([key, value]) => `${key}:${value}`)
    .join(", ");
}

function updateReportUI(stats) {
  const updates = {
    compressionRatio: `${stats.compressionRatio}x`,
    spaceSaved: `${stats.spaceSaved}%`,
    compressionSize: `${stats.compressedSizeKB} KB`,
    processingTime: `${stats.processingTime} ms`,
    originalSize: `${stats.originalSizeKB} KB`,
    imageDimensions: stats.dimensions,
    totalBlocks: `${stats.totalBlocks} blocks`,
    yBlocks: `${stats.blockCounts.Y} blocks`,
    chrominanceBlocks: `${stats.blockCounts.Cb} Cb + ${stats.blockCounts.Cr} Cr blocks`,
    totalCoefficients: `${stats.totalCoefficients} values`,
    totalQuantizedCoefficients: `${stats.totalQuantized} values`,
    totalZigZagCoefficients: `${stats.totalRLE} values`,
    totalRunLengthEncodedCoefficients: `${stats.totalRLE} symbols`,
    encodedBitstreamSize: `${stats.encodedBytes} bytes`,
    totalHuffmanEncodedCoefficients: `${stats.totalHuffman} bits`,
    totalBitrate: `${stats.bitrate} bits/pixel`,
    entropyEstimate: `${stats.entropy} bits/symbol`,
    huffmanCodes: stats.topCodes,
  };

  Object.entries(updates).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });
}

// Initialize event listener when DOM is loaded
function initializeEncoder() {
  if (upload) {
    upload.addEventListener("change", handleFileUpload);
  }
}

// Initialize the encoder when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeEncoder);