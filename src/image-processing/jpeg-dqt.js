const luminanceQuantTable = new Uint8Array([
  16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16,
  24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109,
  103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121, 120, 101,
  72, 92, 95, 98, 112, 100, 103, 99,
]);

const chrominanceQuantTable = new Uint8Array([
  17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56,
  99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99,
]);

/**
 * Writes a DQT segment to the JPEG buffer
 * @param {DataView} view
 * @param {number} offset
 * @param {"luminance"|"chrominance"} type
 * @returns {number} new offset
 */
export function writeDQT(view, offset, type = "luminance") {
  const table =
    type === "luminance" ? luminanceQuantTable : chrominanceQuantTable;
  const tableId = type === "luminance" ? 0 : 1;

  // Marker
  view.setUint8(offset++, 0xff);
  view.setUint8(offset++, 0xdb);

  // Length: 2 (length field) + 1 (table info) + 64 (table data) = 67 bytes
  view.setUint16(offset, 67, false); // Big endian
  offset += 2;

  // Table info byte: 0 (8-bit precision) + tableId in low nibble
  view.setUint8(offset++, tableId);

  // Table data (64 bytes)
  for (let i = 0; i < 64; i++) {
    view.setUint8(offset++, table[i]);
  }

  return offset;
}
