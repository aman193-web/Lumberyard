/**
 * Minimal RFC-4180 CSV reader — handles quoted fields, embedded commas,
 * embedded newlines, escaped quotes ("") and both CRLF and LF line endings.
 */

export type CsvTable = {
  headers: string[];
  /** One entry per data row, aligned to `headers`. Short rows are padded. */
  rows: string[][];
};

export function parseCsv(text: string): CsvTable {
  const records = parseRecords(text);
  if (records.length === 0) return { headers: [], rows: [] };

  const headers = records[0].map(h => h.trim().replace(/^﻿/, ""));
  const rows = records
    .slice(1)
    // Drop the trailing blank record a file ending in a newline produces.
    .filter(r => r.length > 1 || (r[0] ?? "").trim() !== "")
    .map(r => {
      const padded = r.slice(0, headers.length);
      while (padded.length < headers.length) padded.push("");
      return padded;
    });

  return { headers, rows };
}

function parseRecords(text: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') { inQuotes = true; continue; }
    if (char === ",") { record.push(field); field = ""; continue; }
    if (char === "\r") { if (text[i + 1] === "\n") i++; record.push(field); records.push(record); record = []; field = ""; continue; }
    if (char === "\n") { record.push(field); records.push(record); record = []; field = ""; continue; }
    field += char;
  }

  if (field !== "" || record.length > 0) { record.push(field); records.push(record); }
  return records;
}

/** Turn a table back into row objects keyed by header. */
export function toObjects(table: CsvTable): Record<string, string>[] {
  return table.rows.map(row => {
    const obj: Record<string, string> = {};
    table.headers.forEach((h, i) => { obj[h] = row[i] ?? ""; });
    return obj;
  });
}

/** Quote a value only when it needs it. */
export function toCsv(headers: string[], rows: string[][]): string {
  const cell = (v: string) =>
    /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  return [headers, ...rows].map(r => r.map(cell).join(",")).join("\n");
}
