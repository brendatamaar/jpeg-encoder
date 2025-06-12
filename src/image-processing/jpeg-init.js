/**
 * Creates a Uint8Array buffer and writes the SOI marker (Start of Image)
 * @returns {{ buffer: Uint8Array, view: DataView, offset: number }}
 */
export function createJPEGBuffer() {
	const buffer = new Uint8Array(1024 * 1024); // 1MB buffer (adjust as needed)
	const view = new DataView(buffer.buffer);
	let offset = 0;
  
	// Write SOI marker (0xFFD8)
	view.setUint8(offset++, 0xFF);
	view.setUint8(offset++, 0xD8);
  
	return { buffer, view, offset };
  }
  