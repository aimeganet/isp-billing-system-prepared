import { parsePdfBuffer } from "@/lib/importers/pdf-parser";
import { parseDocxBuffer } from "@/lib/importers/docx-parser";
import { parseImageBuffer } from "@/lib/importers/image-ocr";
import { normalizeImportedText } from "@/lib/importers/normalize";

export async function parseUploadedDocument(fileName: string, buffer: Buffer, mimeType: string) {
  const lower = fileName.toLowerCase();
  let text = "";

  if (mimeType.includes("pdf") || lower.endsWith(".pdf")) {
    text = await parsePdfBuffer(buffer);
  } else if (
    mimeType.includes("word") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".doc")
  ) {
    text = await parseDocxBuffer(buffer);
  } else if (mimeType.startsWith("image/")) {
    text = await parseImageBuffer(buffer);
  } else {
    text = buffer.toString("utf-8");
  }

  return {
    text,
    rows: normalizeImportedText(text)
  };
}
