import { rgbToYCbCr } from "./encoder/ycbcr.js";
import { splitChannel } from "./encoder/split.js";
import { applyDCT } from "./encoder/dct.js";
import { quantizeLuminance, quantizeChrominance } from "./encoder/quantize.js";
import { zigZagOrderBlock, runLengthEncode } from "./encoder/zigzag.js";
import { huffmanEncodeRLE } from "./encoder/huffman.js";

import { createJPEGBuffer } from "./image-processing/jpeg-init.js";
import { writeDQT } from "./image-processing/jpeg-dqt.js";
import { writeSOF0 } from "./image-processing/jpeg-sof0.js";
import { writeDHT } from "./image-processing/jpeg-dht.js";
import { writeSOS } from "./image-processing/jpeg-sos.js";
import { writeScanDataAndEOI } from "./image-processing/jpeg-scan-eoi.js";

const upload = document.getElementById("upload");
const output = document.getElementById("compressed-output");
const reportOutput = document.getElementById("report-output");

upload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    // Step 1: RGB → YCbCr
    const { Y, Cb, Cr } = rgbToYCbCr(imageData);

    // Step 2: Splitting Y, Cb, Cr channels into 8×8 blocks
    const yBlocks = splitChannel(Y);
    const cbBlocks = splitChannel(Cb);
    const crBlocks = splitChannel(Cr);

    // Step 3: Applying 2D DCT to each block
    const yDCTBlocks = yBlocks.map(applyDCT);
    const cbDCTBlocks = cbBlocks.map(applyDCT);
    const crDCTBlocks = crBlocks.map(applyDCT);

    // Step 4: Quantizing DCT coefficients
    const yQuantized = yDCTBlocks.map(quantizeLuminance);
    const cbQuantized = cbDCTBlocks.map(quantizeChrominance);
    const crQuantized = crDCTBlocks.map(quantizeChrominance);

    // Step 5: Applying Zig-zag reordering and Run-Length Encoding
    const yZigZagRLE = yQuantized.map((block) =>
      runLengthEncode(zigZagOrderBlock(block))
    );
    const cbZigZagRLE = cbQuantized.map((block) =>
      runLengthEncode(zigZagOrderBlock(block))
    );
    const crZigZagRLE = crQuantized.map((block) =>
      runLengthEncode(zigZagOrderBlock(block))
    );

    // Step 6: Applying Huffman encoding
    // Flatten RLE output from Y, Cb, Cr
    const allRLE = [...yZigZagRLE, ...cbZigZagRLE, ...crZigZagRLE].flat();
    const { encodedBitString, codeMap } = huffmanEncodeRLE(allRLE);

    // For now, just show the original image as a placeholder
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8); // Simulated compression
    output.src = dataUrl;

    // Generate a basic report including pipeline status
    reportOutput.textContent = JSON.stringify(
      {
        width: img.width,
        height: img.height,
        originalSize: file.size,
        huffmanBitLength: encodedBitString.length,
        estimatedCompressedSizeBytes: Math.floor(encodedBitString.length / 8),
        pipeline: "Step 6: All blocks Huffman encoded",
        codeMapPreview: Object.entries(codeMap).slice(0, 5),
      },
      null,
      2
    );

    /** Generating JPEG image file */

    // Step 1: Initialize JPEG buffer and DataView
    const { buffer, view, offset: offsetSOI } = createJPEGBuffer();
    let offset = offsetSOI;

    // Step 2: Write DQT (Define Quantization Tables)
    offset = writeDQT(view, offset, "luminance");
    offset = writeDQT(view, offset, "chrominance");

    // Step 3: Write SOF0 (Start of Frame)
    offset = writeSOF0(view, offset, img.width, img.height);

    // Step 4: Write DHT
    offset = writeDHT(view, offset);

    // Step 5: Write SOS (Start of Scan)
    offset = writeSOS(view, offset);

    // Step 6: Write scan data and EOI
    offset = writeScanDataAndEOI(view, offset);
    // ✅ Convert buffer into Blob and create image URL
    const jpegBlob = new Blob([buffer.slice(0, offset)], {
      type: "image/jpeg",
    });
    const jpegUrl = URL.createObjectURL(jpegBlob);
    output.src = jpegUrl;
  };

  img.src = URL.createObjectURL(file);
});
