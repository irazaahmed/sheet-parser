const STEPS = [
  {
    icon: "📤",
    color: "from-blue-500 to-indigo-500",
    title: "Upload",
    description: "Drag & drop a CSV or Excel (.xlsx/.xls) file, or click to select one.",
  },
  {
    icon: "🧹",
    color: "from-emerald-500 to-teal-500",
    title: "Auto-Clean",
    description:
      "Encoding (UTF-8/UTF-16) and delimiter are detected automatically. Empty rows and duplicates are removed.",
  },
  {
    icon: "📊",
    color: "from-amber-500 to-orange-500",
    title: "Analyze",
    description:
      "Each column's type is detected — totals/averages for numbers, breakdowns for categories.",
  },
  {
    icon: "👀",
    color: "from-fuchsia-500 to-pink-500",
    title: "Preview",
    description: "Browse the full cleaned data table alongside charts and stat cards.",
  },
];

export default function HowItWorks() {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-800">What does this tool do?</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Sheet Parser turns your spreadsheet into clean, understandable insights in 4 steps as soon
        as you upload it — it even handles heavy, oddly-encoded exports like Ahrefs/Semrush.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STEPS.map((step, i) => (
          <div key={step.title} className="relative rounded-xl border border-zinc-100 p-4">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${step.color} text-lg shadow-sm`}
            >
              {step.icon}
            </div>
            <p className="mt-3 text-sm font-semibold text-zinc-800">
              {i + 1}. {step.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
