const zigZagOrder = [
  [0, 0],
  [0, 1],
  [1, 0],
  [2, 0],
  [1, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [2, 1],
  [3, 0],
  [4, 0],
  [3, 1],
  [2, 2],
  [1, 3],
  [0, 4],
  [0, 5],
  [1, 4],
  [2, 3],
  [3, 2],
  [4, 1],
  [5, 0],
  [6, 0],
  [5, 1],
  [4, 2],
  [3, 3],
  [2, 4],
  [1, 5],
  [0, 6],
  [0, 7],
  [1, 6],
  [2, 5],
  [3, 4],
  [4, 3],
  [5, 2],
  [6, 1],
  [7, 0],
  [7, 1],
  [6, 2],
  [5, 3],
  [4, 4],
  [3, 5],
  [2, 6],
  [1, 7],
  [2, 7],
  [3, 6],
  [4, 5],
  [5, 4],
  [6, 3],
  [7, 2],
  [7, 3],
  [6, 4],
  [5, 5],
  [4, 6],
  [3, 7],
  [4, 7],
  [5, 6],
  [6, 5],
  [7, 4],
  [7, 5],
  [6, 6],
  [5, 7],
  [6, 7],
  [7, 6],
  [7, 7],
];

/**
 * Converts an 8×8 block into a 1D array using zig-zag ordering
 * @param {number[][]} block
 * @returns {number[]} linear array
 */
export function zigZagOrderBlock(block) {
  return zigZagOrder.map(([i, j]) => block[i][j]);
}

/**
 * Applies Run-Length Encoding to a zig-zag ordered block
 * Skips trailing zeros and compresses sequences of zeros.
 * @param {number[]} zigzagArray
 * @returns {Array<[number, number]>} list of [zeroRunLength, value] tuples
 */
export function runLengthEncode(zigzagArray) {
  const result = [];
  let zeroCount = 0;

  for (let i = 1; i < zigzagArray.length; i++) {
    const val = zigzagArray[i];
    if (val === 0) {
      zeroCount++;
    } else {
      result.push([zeroCount, val]);
      zeroCount = 0;
    }
  }

  // End-of-block marker
  result.push([0, 0]); // JPEG uses EOB here

  return result;
}
