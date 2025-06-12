/**
 * Converts RGBA image data into YCbCr color space.
 *
 * @param {ImageData} imageData - The raw image data from canvas context (RGBA format)
 * @returns {{Y: number[][], Cb: number[][], Cr: number[][]}}
 *          Separate 2D arrays for Y, Cb, and Cr channels
 */
export function rgbToYCbCr(imageData) {
  const { width, height, data } = imageData;

  // Initialize empty 2D arrays for each channel
  const Y = [];
  const Cb = [];
  const Cr = [];

  for (let y = 0; y < height; y++) {
    Y[y] = [];
    Cb[y] = [];
    Cr[y] = [];

    for (let x = 0; x < width; x++) {
      // Calculate the index in the flat RGBA array
      const idx = (y * width + x) * 4;
      const r = data[idx]; // Red component
      const g = data[idx + 1]; // Green component
      const b = data[idx + 2]; // Blue component

      // Convert RGB to YCbCr using ITU-R BT.601 conversion formula
      const yVal = 0.299 * r + 0.587 * g + 0.114 * b;
      const cbVal = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
      const crVal = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;

      // Store results in their respective channels
      Y[y][x] = yVal;
      Cb[y][x] = cbVal;
      Cr[y][x] = crVal;
    }
  }

  return { Y, Cb, Cr };
}
