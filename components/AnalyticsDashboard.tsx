"use client";

import { AnalysisResult, ColumnSummary } from "@/lib/analyze";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AnalyticsDashboard({ analysis }: { analysis: AnalysisResult }) {
  const numberColumns = analysis.columns.filter((c) => c.type === "number");
  const categoryColumns = analysis.columns.filter((c) => c.type === "text" && c.topValues?.length);

  // Headline cards favor count-like metrics (Volume, Traffic) over
  // score/rate columns (Difficulty, CPC) -- a "Total" of the latter isn't
  // a meaningful thing to lead with.
  const headlineColumns = [...numberColumns]
    .sort((a, b) => Number(b.aggregatable) - Number(a.aggregatable))
    .slice(0, 2);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon="📋" label="Total Rows" value={analysis.rowCount.toLocaleString()} />
        <StatCard icon="📐" label="Total Columns" value={analysis.columnCount.toString()} />
        {headlineColumns.map((c) => (
          <StatCard
            key={c.header}
            icon={c.aggregatable ? "📈" : "🎯"}
            label={c.aggregatable ? `Total ${c.header}` : `Avg ${c.header}`}
            value={(c.aggregatable ? c.total ?? 0 : c.average ?? 0).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          />
        ))}
      </div>

      {numberColumns.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
          <h3 className="border-b border-zinc-100 px-5 py-3 font-semibold text-zinc-700">
            Numeric Column Summary
          </h3>
          <div className="divide-y divide-zinc-100">
            {numberColumns.map((c) => (
              <div key={c.header} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-3">
                <span className="w-40 shrink-0 truncate font-medium text-zinc-800">{c.header}</span>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-500">
                  {c.aggregatable && <span>Total: {c.total?.toLocaleString()}</span>}
                  <span>Average: {c.average?.toFixed(2)}</span>
                  <span>Min: {c.min}</span>
                  <span>Max: {c.max}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {categoryColumns.map((c) => (
        <ChartCard key={c.header} column={c} />
      ))}
    </div>
  );
}

function ChartCard({ column }: { column: ColumnSummary }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-zinc-700">Top {column.header}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={column.topValues} layout="vertical" margin={{ left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="label" width={120} />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <p className="text-xs text-zinc-400">{label}</p>
      </div>
      <p className="mt-1 text-xl font-bold text-zinc-800">{value}</p>
    </div>
  );
}
