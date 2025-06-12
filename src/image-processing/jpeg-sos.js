/**
 * Writes the Start of Scan (SOS) segment to the DataView.
 *
 * @param {DataView} view - The DataView of the JPEG buffer
 * @param {number} offset - The byte offset to start writing the segment
 * @returns {number} - The new offset after writing the SOS segment
 */ export function writeSOS(view, offset) {
  // Marker
  view.setUint8(offset++, 0xff);
  view.setUint8(offset++, 0xda); // SOS

  const numComponents = 3; // Y, Cb, Cr
  const length = 6 + 2 * numComponents;
  view.setUint16(offset, length, false);
  offset += 2;

  // Y component
  view.setUint8(offset++, 0x01); // Component ID = 1 (Y)
  view.setUint8(offset++, 0x00); // Huffman table: DC 0, AC 0

  // Cb component
  view.setUint8(offset++, 0x02); // Component ID = 2 (Cb)
  view.setUint8(offset++, 0x11); // Huffman table: DC 1, AC 1

  // Cr component
  view.setUint8(offset++, 0x03); // Component ID = 3 (Cr)
  view.setUint8(offset++, 0x11); // Huffman table: DC 1, AC 1

  // Spectral selection + approximation
  view.setUint8(offset++, 0x00); // Ss: Spectral selection start
  view.setUint8(offset++, 0x3f); // Se: Spectral selection end
  view.setUint8(offset++, 0x00); // Ah/Al: Successive approximation

  return offset;
}
