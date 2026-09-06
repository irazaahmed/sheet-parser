"use client";

import { AnalysisResult } from "@/lib/analyze";
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

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Rows" value={analysis.rowCount.toLocaleString()} />
        <StatCard label="Total Columns" value={analysis.columnCount.toString()} />
        {numberColumns.slice(0, 2).map((c) => (
          <StatCard
            key={c.header}
            label={`Total ${c.header}`}
            value={(c.total ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          />
        ))}
      </div>

      {numberColumns.map((c) => (
        <div key={c.header} className="rounded-lg border border-zinc-200 p-4">
          <h3 className="mb-2 font-semibold text-zinc-700">{c.header} — Summary</h3>
          <div className="flex gap-6 text-sm text-zinc-600">
            <span>Total: {c.total?.toLocaleString()}</span>
            <span>Average: {c.average?.toFixed(2)}</span>
            <span>Min: {c.min}</span>
            <span>Max: {c.max}</span>
          </div>
        </div>
      ))}

      {categoryColumns.map((c) => (
        <div key={c.header} className="rounded-lg border border-zinc-200 p-4">
          <h3 className="mb-4 font-semibold text-zinc-700">Top {c.header}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={c.topValues} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="label" width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="text-xl font-bold text-zinc-800">{value}</p>
    </div>
  );
}
