const C = (u) => (u === 0 ? 1 / Math.sqrt(2) : 1);

/**
 * Applies 2D DCT to an 8×8 block.
 * The input block should be a 2D array of 8×8 pixel or YCbCr values.
 * @param {number[][]} block - 8×8 input block
 * @returns {number[][]} - 8×8 DCT-transformed block
 */
export function applyDCT(block) {
  const result = [];

  for (let u = 0; u < 8; u++) {
    result[u] = [];
    for (let v = 0; v < 8; v++) {
      let sum = 0;

      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          sum +=
            block[x][y] *
            Math.cos(((2 * x + 1) * u * Math.PI) / 16) *
            Math.cos(((2 * y + 1) * v * Math.PI) / 16);
        }
      }

      sum *= (1 / 4) * C(u) * C(v);
      result[u][v] = sum;
    }
  }

  return result;
}
