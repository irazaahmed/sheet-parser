import { SheetRow } from "./parseSheet";
import { inferColumnType } from "./cleanData";

export interface ColumnSummary {
  header: string;
  type: "number" | "date" | "text";
  total?: number;
  average?: number;
  min?: number;
  max?: number;
  uniqueValues?: number;
  topValues?: { label: string; count: number }[];
}

export interface AnalysisResult {
  rowCount: number;
  columnCount: number;
  columns: ColumnSummary[];
}

export function analyzeData(headers: string[], rows: SheetRow[]): AnalysisResult {
  const columns: ColumnSummary[] = headers.map((header) => {
    const type = inferColumnType(rows, header);
    const values = rows.map((r) => r[header]).filter((v) => v !== null && v !== undefined && v !== "");

    if (type === "number") {
      const nums = values.map((v) => Number(v)).filter((n) => !isNaN(n));
      const total = nums.reduce((a, b) => a + b, 0);
      return {
        header,
        type,
        total,
        average: nums.length ? total / nums.length : 0,
        min: nums.length ? Math.min(...nums) : 0,
        max: nums.length ? Math.max(...nums) : 0,
      };
    }

    const counts = new Map<string, number>();
    for (const v of values) {
      const key = String(v);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const topValues = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count }));

    return {
      header,
      type,
      uniqueValues: counts.size,
      topValues,
    };
  });

  return { rowCount: rows.length, columnCount: headers.length, columns };
}
