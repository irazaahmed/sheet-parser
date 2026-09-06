"use client";

import { useState } from "react";
import { AnalysisResult, computeTopValues } from "@/lib/analyze";
import { SheetRow } from "@/lib/parseSheet";
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

interface AnalyticsDashboardProps {
  analysis: AnalysisResult;
  rows: SheetRow[];
}

export default function AnalyticsDashboard({ analysis, rows }: AnalyticsDashboardProps) {
  const numberColumns = analysis.columns.filter((c) => c.type === "number");
  const categoryColumns = analysis.columns.filter((c) => c.type === "text" && c.topValues?.length);
  const autoChartedHeaders = new Set(categoryColumns.map((c) => c.header));

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
          <StatCard
            key={card.label}
            accent={CARD_ACCENTS[i % CARD_ACCENTS.length]}
            delay={i * 60}
            {...card}
          />
        ))}
      </div>

      {numberColumns.length > 0 && (
        <div className="animate-fade-in-up rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md">
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
        <ChartCard key={c.header} title={c.header} data={c.topValues ?? []} />
      ))}

      <CustomChartPicker headers={analysis.columns.map((c) => c.header)} rows={rows} exclude={autoChartedHeaders} />
    </div>
  );
}

function CustomChartPicker({
  headers,
  rows,
  exclude,
}: {
  headers: string[];
  rows: SheetRow[];
  exclude: Set<string>;
}) {
  const pickableHeaders = headers.filter((h) => !exclude.has(h));
  const [selected, setSelected] = useState<string>("");

  const data = selected ? computeTopValues(rows, selected) : [];

  return (
    <div className="animate-fade-in-up rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-lg">🎨</span>
        <label className="text-sm font-medium text-zinc-700">Build a custom chart:</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm outline-none focus:border-indigo-400"
        >
          <option value="">Select a column...</option>
          {pickableHeaders.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>

      {selected && data.length > 0 && (
        <div className="mt-4">
          <ChartCard title={selected} data={data} plain />
        </div>
      )}
      {selected && data.length === 0 && (
        <p className="mt-4 text-sm text-zinc-400">No chartable data found in this column.</p>
      )}
    </div>
  );
}

function ChartCard({
  title,
  data,
  plain = false,
}: {
  title: string;
  data: { label: string; count: number }[];
  plain?: boolean;
}) {
  const content = (
    <>
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-zinc-700">
        <span className="h-4 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-pink-500" />
        Top {title}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="label" width={120} />
          <Tooltip cursor={{ fill: "rgba(99,102,241,0.06)" }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} animationDuration={600}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  );

  if (plain) return <div>{content}</div>;

  return (
    <div className="animate-fade-in-up rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {content}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
  delay = 0,
}: {
  icon: string;
  label: string;
  value: string;
  accent: string;
  delay?: number;
}) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="animate-fade-in-up overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
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
