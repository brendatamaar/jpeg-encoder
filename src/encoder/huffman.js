/**
 * Builds a frequency map from an array of symbols
 * @param {Array} symbols - Array of symbols
 * @returns {Map<any, number>} Frequency map
 */
function buildFrequencyMap(symbols) {
  const freqMap = new Map();
  for (const sym of symbols) {
    freqMap.set(sym, (freqMap.get(sym) || 0) + 1);
  }
  return freqMap;
}

/**
 * Builds Huffman tree from a frequency map
 * @param {Map<any, number>} freqMap - Frequency map
 * @returns {Object} Huffman tree 
 */
function buildHuffmanTree(freqMap) {
  const nodes = [...freqMap.entries()].map(([symbol, freq]) => ({
    symbol,
    freq,
  }));

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift();
    const right = nodes.shift();
    nodes.push({
      freq: left.freq + right.freq,
      left,
      right,
    });
  }

  return nodes[0]; // Root
}

/**
 * Recursively assigns Huffman codes to symbols
 * @param {Object} node - Current node in the Huffman tree
 * @param {string} prefix - Current prefix for the code
 * @param {Object} codeMap - Accumulated code map
 * @returns {Object} Completed code map
 */
function generateCodes(node, prefix = "", codeMap = {}) {
  if (node.symbol !== undefined) {
    codeMap[node.symbol] = prefix;
  } else {
    generateCodes(node.left, prefix + "0", codeMap);
    generateCodes(node.right, prefix + "1", codeMap);
  }
  return codeMap;
}

/**
 * Encodes a list of RLE pairs using Huffman codes
 * @param {Array<[number, number]>} rleData - List of RLE pairs
 * @returns {object} { encodedBitString, codeMap }
 */
export function huffmanEncodeRLE(rleData) {
  const symbols = rleData.map(([zeros, value]) => `${zeros}/${value}`);

  const freqMap = buildFrequencyMap(symbols);
  const tree = buildHuffmanTree(freqMap);
  const codeMap = generateCodes(tree);

  const encodedBitString = symbols.map((s) => codeMap[s]).join("");

  return { encodedBitString, codeMap };
}
