import Papa from "papaparse";
import * as XLSX from "xlsx";

export type SheetRow = Record<string, string | number | null>;

export interface ParsedSheet {
  headers: string[];
  rows: SheetRow[];
  fileName: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
// Mojibake left behind when a UTF-16LE BOM (FF FE) gets misread as UTF-8:
// each invalid byte turns into U+FFFD, which -- if the result is later
// saved and reopened as Latin-1 -- renders as this repeated 3-char sequence.
const MOJIBAKE_BOM_CHAR = "ï¿½";

export async function parseSheetFile(file: File): Promise<ParsedSheet> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large. Max size is 10MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv" || extension === "tsv" || extension === "txt") {
    return parseCsv(file);
  }
  if (extension === "xlsx" || extension === "xls") {
    return parseExcel(file);
  }
  throw new Error("Unsupported file type. Please upload a .csv, .xlsx, or .xls file.");
}

async function parseCsv(file: File): Promise<ParsedSheet> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const { text, delimiterHint } = decodeSheetText(bytes);

  // Ahrefs/Semrush-style exports are often UTF-16 with tab delimiters and
  // every field double-quoted -- plain comma-CSV parsing mangles those, so
  // they get a dedicated splitter. Clean UTF-8 files go through PapaParse,
  // which correctly handles quoted commas/newlines.
  if (delimiterHint) {
    return parseDelimitedText(text, delimiterHint, file.name);
  }

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const headers = results.meta.fields ?? [];
        const rows = results.data as SheetRow[];
        resolve({ headers, rows, fileName: file.name });
      },
      error: (err: Error) => reject(err),
    });
  });
}

/**
 * Detects BOM/encoding and decodes raw bytes to text. Returns a
 * `delimiterHint` when the file needed the UTF-16 repair path, signalling
 * that the caller should use the manual delimited-text parser instead of
 * PapaParse.
 */
function decodeSheetText(bytes: Uint8Array): { text: string; delimiterHint: "\t" | "," | null } {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return { text: new TextDecoder("utf-16le").decode(bytes.slice(2)), delimiterHint: "\t" };
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return { text: new TextDecoder("utf-16be").decode(bytes.slice(2)), delimiterHint: "\t" };
  }

  const utf8Text =
    bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf
      ? new TextDecoder("utf-8").decode(bytes.slice(3))
      : new TextDecoder("utf-8").decode(bytes);

  const sample = utf8Text.slice(0, 500);
  const nullRatio = countOccurrences(sample, "\u0000") / sample.length;
  const replacementRatio = countOccurrences(sample, "�") / sample.length;

  if (nullRatio < 0.1 && replacementRatio < 0.05) {
    return { text: utf8Text, delimiterHint: null };
  }

  // Likely a UTF-16 file with a corrupted/missing BOM: bytes were mangled by
  // an earlier UTF-8 pass. Re-reading raw bytes as Latin-1 preserves every
  // original byte 1:1, so stripping the interleaved NUL bytes recovers the
  // original ASCII/UTF-16LE text.
  let latin1 = "";
  for (let i = 0; i < bytes.length; i++) latin1 += String.fromCharCode(bytes[i]);
  latin1 = latin1
    .replace(new RegExp(`^"?(?:${MOJIBAKE_BOM_CHAR})+`), "")
    .replace(/\u0000/g, "");

  return { text: latin1, delimiterHint: "\t" };
}

function countOccurrences(text: string, char: string): number {
  let count = 0;
  for (const c of text) if (c === char) count++;
  return count;
}

function parseDelimitedText(text: string, delimiter: string, fileName: string): ParsedSheet {
  const lines = text.split(/\r\n|\r|\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [], fileName };

  const actualDelimiter = pickDelimiter(lines[0], delimiter);
  // Ahrefs-style exports wrap every field in doubled quotes and, for
  // multi-value list fields (e.g. Intents), inconsistently quote individual
  // items too. Stripping all quote chars (rather than just leading/trailing)
  // cleanly recovers both plain values and comma-separated lists.
  const splitRow = (line: string) =>
    line.split(actualDelimiter).map((cell) => cell.replace(/"/g, "").trim());

  const headers = splitRow(lines[0]);
  const rows: SheetRow[] = lines.slice(1).map((line) => {
    const cells = splitRow(line);
    const row: SheetRow = {};
    headers.forEach((header, i) => {
      row[header] = coerceValue(cells[i] ?? null);
    });
    return row;
  });

  return { headers, rows, fileName };
}

function pickDelimiter(headerLine: string, fallback: string): string {
  const tabCount = countOccurrences(headerLine, "\t");
  const commaCount = countOccurrences(headerLine, ",");
  if (tabCount === 0 && commaCount === 0) return fallback;
  return tabCount >= commaCount ? "\t" : ",";
}

function coerceValue(value: string | null): string | number | null {
  if (value === null || value === "") return null;
  const num = Number(value);
  return value.trim() !== "" && !isNaN(num) ? num : value;
}

async function parseExcel(file: File): Promise<ParsedSheet> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  const rows = XLSX.utils.sheet_to_json<SheetRow>(sheet, { defval: null });
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  return { headers, rows, fileName: file.name };
}
