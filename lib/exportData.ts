import Papa from "papaparse";
import * as XLSX from "xlsx";
import { SheetRow } from "./parseSheet";

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportAsCsv(headers: string[], rows: SheetRow[], baseName: string) {
  const csv = Papa.unparse({ fields: headers, data: rows.map((r) => headers.map((h) => r[h])) });
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${baseName}.csv`);
}

export function exportAsExcel(headers: string[], rows: SheetRow[], baseName: string) {
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${baseName}.xlsx`);
}
