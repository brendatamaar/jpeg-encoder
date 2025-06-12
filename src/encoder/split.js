/**
 * Splits a 2D channel array (e.g., Y, Cb, or Cr) into 8×8 blocks.
 * Pads with zeros if width or height is not a multiple of 8.
 *
 * @param {number[][]} channel - 2D array of Y, Cb, or Cr values
 * @returns {number[][][]} Array of 8×8 blocks
 */
export function splitChannel(channel) {
  const height = channel.length;
  const width = channel[0].length;

  const paddedHeight = Math.ceil(height / 8) * 8;
  const paddedWidth = Math.ceil(width / 8) * 8;

  const blocks = [];

  for (let y = 0; y < paddedHeight; y += 8) {
    for (let x = 0; x < paddedWidth; x += 8) {
      const block = [];

      for (let i = 0; i < 8; i++) {
        const row = [];
        for (let j = 0; j < 8; j++) {
          const val =
            channel[y + i]?.[x + j] !== undefined ? channel[y + i][x + j] : 0;
          row.push(val);
        }
        block.push(row);
      }

      blocks.push(block);
    }
  }

  return blocks;
}
