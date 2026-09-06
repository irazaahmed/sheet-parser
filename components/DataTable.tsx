"use client";

import { useMemo, useState } from "react";
import { SheetRow } from "@/lib/parseSheet";

interface DataTableProps {
  headers: string[];
  rows: SheetRow[];
  maxRows?: number;
}

type SortDirection = "asc" | "desc" | null;

export default function DataTable({ headers, rows, maxRows = 20 }: DataTableProps) {
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const needle = search.toLowerCase();
    return rows.filter((row) =>
      headers.some((h) => String(row[h] ?? "").toLowerCase().includes(needle))
    );
  }, [rows, headers, search]);

  const sortedRows = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredRows;
    const sorted = [...filteredRows].sort((a, b) => {
      const av = a[sortColumn];
      const bv = b[sortColumn];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
    return sortDirection === "desc" ? sorted.reverse() : sorted;
  }, [filteredRows, sortColumn, sortDirection]);

  function handleSort(header: string) {
    if (sortColumn !== header) {
      setSortColumn(header);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else {
      setSortColumn(null);
      setSortDirection(null);
    }
  }

  const visibleRows = sortedRows.slice(0, maxRows);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-zinc-100 p-3">
        <span className="text-zinc-400">🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search the data..."
          className="w-full bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
        />
        {search && (
          <span className="whitespace-nowrap text-xs text-zinc-400">
            {filteredRows.length} / {rows.length}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              {headers.map((h) => {
                const isActive = sortColumn === h;
                return (
                  <th
                    key={h}
                    onClick={() => handleSort(h)}
                    className="cursor-pointer select-none whitespace-nowrap px-3 py-2 text-left font-semibold text-zinc-700 hover:bg-indigo-50"
                  >
                    <span className="flex items-center gap-1">
                      {h}
                      <span className={`text-xs ${isActive ? "text-indigo-500" : "text-zinc-300"}`}>
                        {isActive && sortDirection === "asc" ? "▲" : isActive && sortDirection === "desc" ? "▼" : "⇅"}
                      </span>
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => (
              <tr key={i} className="border-t border-zinc-100 even:bg-zinc-50/60 hover:bg-blue-50/40">
                {headers.map((h) => (
                  <td key={h} className="px-3 py-2 whitespace-nowrap text-zinc-700">
                    {row[h] === null || row[h] === undefined ? "—" : String(row[h])}
                  </td>
                ))}
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="px-3 py-6 text-center text-zinc-400">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {sortedRows.length > maxRows && (
        <p className="border-t border-zinc-100 px-3 py-2 text-xs text-zinc-400">
          Showing {maxRows} of {sortedRows.length} rows
        </p>
      )}
    </div>
  );
}
