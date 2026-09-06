"use client";

import { AnalysisResult, ColumnSummary } from "@/lib/analyze";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const CARD_ACCENTS = [
  "from-blue-500 to-indigo-500",
  "from-violet-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
];

const CHART_PALETTE = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export default function AnalyticsDashboard({ analysis }: { analysis: AnalysisResult }) {
  const numberColumns = analysis.columns.filter((c) => c.type === "number");
  const categoryColumns = analysis.columns.filter((c) => c.type === "text" && c.topValues?.length);

  // Headline cards favor count-like metrics (Volume, Traffic) over
  // score/rate columns (Difficulty, CPC) -- a "Total" of the latter isn't
  // a meaningful thing to lead with.
  const headlineColumns = [...numberColumns]
    .sort((a, b) => Number(b.aggregatable) - Number(a.aggregatable))
    .slice(0, 2);

  const headlineCards = [
    { icon: "📋", label: "Total Rows", value: analysis.rowCount.toLocaleString() },
    { icon: "📐", label: "Total Columns", value: analysis.columnCount.toString() },
    ...headlineColumns.map((c) => ({
      icon: c.aggregatable ? "📈" : "🎯",
      label: c.aggregatable ? `Total ${c.header}` : `Avg ${c.header}`,
      value: (c.aggregatable ? c.total ?? 0 : c.average ?? 0).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      }),
    })),
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {headlineCards.map((card, i) => (
          <StatCard key={card.label} accent={CARD_ACCENTS[i % CARD_ACCENTS.length]} {...card} />
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
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-zinc-700">
        <span className="h-4 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-pink-500" />
        Top {column.header}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={column.topValues} layout="vertical" margin={{ left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="label" width={120} />
          <Tooltip cursor={{ fill: "rgba(99,102,241,0.06)" }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {column.topValues?.map((_, i) => (
              <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />
      <div className="p-4">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${accent} text-sm`}
          >
            {icon}
          </span>
          <p className="text-xs text-zinc-400">{label}</p>
        </div>
        <p className="mt-2 text-xl font-bold text-zinc-800">{value}</p>
      </div>
    </div>
  );
}
