/**
 * Frame decode worker — runs createImageBitmap off the main thread so the
 * scroll handler and canvas draw loop are never blocked by decode cost.
 *
 * Protocol (main → worker):
 *   { type: 'decode', index: number, blob: Blob }
 *
 * Protocol (worker → main):
 *   { type: 'decoded',  index: number, bitmap: ImageBitmap }  — transferable
 *   { type: 'failed',   index: number }
 */
self.onmessage = async ({ data }) => {
  if (data.type !== 'decode') return;
  const { index, blob } = data;
  try {
    const bitmap = await createImageBitmap(blob);
    // Transfer the bitmap — zero-copy, no serialisation cost
    self.postMessage({ type: 'decoded', index, bitmap }, [bitmap]);
  } catch {
    self.postMessage({ type: 'failed', index });
  }
};
