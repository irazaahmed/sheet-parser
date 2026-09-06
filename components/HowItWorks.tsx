const STEPS = [
  {
    icon: "📤",
    color: "from-blue-500 to-indigo-500",
    title: "Upload",
    description: "CSV ya Excel (.xlsx/.xls) file drag-drop karein, ya click karke select karein.",
  },
  {
    icon: "🧹",
    color: "from-emerald-500 to-teal-500",
    title: "Auto-Clean",
    description:
      "Encoding (UTF-8/UTF-16) aur delimiter khud detect hota hai. Empty rows aur duplicates hat jate hain.",
  },
  {
    icon: "📊",
    color: "from-amber-500 to-orange-500",
    title: "Analyze",
    description:
      "Har column ka type pehchana jata hai — numbers ka total/average, categories ka breakdown.",
  },
  {
    icon: "👀",
    color: "from-fuchsia-500 to-pink-500",
    title: "Preview",
    description: "Cleaned data pura table mein dekhein, charts aur stat cards ke sath.",
  },
];

export default function HowItWorks() {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-800">Ye tool kya karta hai?</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Sheet Parser aapki spreadsheet file ko upload hote hi 4 steps mein clean, samajhne-layak
        insights mein badal deta hai — Ahrefs/Semrush jaisi bhari, ajeeb-encoded exports bhi
        support karta hai.
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
