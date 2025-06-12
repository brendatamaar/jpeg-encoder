/**
 * Writes the SOF0 (Start of Frame) marker.
 * @param {DataView} view
 * @param {number} offset
 * @param {number} width
 * @param {number} height
 * @returns {number} new offset
 */
export function writeSOF0(view, offset, width, height) {
  // Marker
  view.setUint8(offset++, 0xff);
  view.setUint8(offset++, 0xc0); // SOF0 marker

  // Length of segment: 17 bytes
  view.setUint16(offset, 17, false);
  offset += 2;

  view.setUint8(offset++, 8); // Precision = 8 bits

  view.setUint16(offset, height, false);
  offset += 2;

  view.setUint16(offset, width, false);
  offset += 2;

  view.setUint8(offset++, 3); // Number of components: Y, Cb, Cr

  // Component: Y
  view.setUint8(offset++, 1); // Component ID: 1 (Y)
  view.setUint8(offset++, 0x11); // Sampling factors: H=1, V=1
  view.setUint8(offset++, 0); // Quant table ID: 0 (luminance)

  // Component: Cb
  view.setUint8(offset++, 2); // Component ID: 2 (Cb)
  view.setUint8(offset++, 0x11); // Sampling factors: H=1, V=1
  view.setUint8(offset++, 1); // Quant table ID: 1 (chrominance)

  // Component: Cr
  view.setUint8(offset++, 3); // Component ID: 3 (Cr)
  view.setUint8(offset++, 0x11); // Sampling factors: H=1, V=1
  view.setUint8(offset++, 1); // Quant table ID: 1 (chrominance)

  return offset;
}
