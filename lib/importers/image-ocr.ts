export async function parseImageBuffer(buffer: Buffer) {
  const Tesseract = await import("tesseract.js");
  const result = await Tesseract.recognize(buffer, "eng+ara");
  return result.data.text ?? "";
}
