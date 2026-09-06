import { SheetRow } from "@/lib/parseSheet";

interface DataTableProps {
  headers: string[];
  rows: SheetRow[];
  maxRows?: number;
}

export default function DataTable({ headers, rows, maxRows = 20 }: DataTableProps) {
  const visibleRows = rows.slice(0, maxRows);

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-100">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left font-semibold text-zinc-700 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, i) => (
            <tr key={i} className="border-t border-zinc-100 even:bg-zinc-50">
              {headers.map((h) => (
                <td key={h} className="px-3 py-2 whitespace-nowrap">
                  {row[h] === null || row[h] === undefined ? "—" : String(row[h])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <p className="px-3 py-2 text-xs text-zinc-400">
          Showing {maxRows} of {rows.length} rows
        </p>
      )}
    </div>
  );
}
