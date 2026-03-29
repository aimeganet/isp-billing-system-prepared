import { normalizePhone } from "@/lib/utils";

export type ParsedImportRow = {
  rowIndex: number;
  rawText: string;
  parsedName?: string;
  parsedPhone?: string;
  usedGigabytes?: number;
  remainingGigabytes?: number;
};

function parseGigabytes(text: string) {
  const numbers = text.match(/\d+(?:\.\d+)?/g) ?? [];
  return numbers.map(Number);
}

export function normalizeImportedText(text: string): ParsedImportRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    const phoneMatch = line.match(/(\+?\d{10,15})/);
    const nums = parseGigabytes(line);
    const name = line
      .replace(/(\+?\d{10,15})/g, "")
      .replace(/\d+(?:\.\d+)?/g, "")
      .replace(/[,:;|-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return {
      rowIndex: index + 1,
      rawText: line,
      parsedName: name || undefined,
      parsedPhone: normalizePhone(phoneMatch?.[1]),
      usedGigabytes: nums[0],
      remainingGigabytes: nums[1]
    };
  });
}
