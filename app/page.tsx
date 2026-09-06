"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import DataTable from "@/components/DataTable";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import HowItWorks from "@/components/HowItWorks";
import { parseSheetFile } from "@/lib/parseSheet";
import { cleanData, CleanResult } from "@/lib/cleanData";
import { analyzeData, AnalysisResult } from "@/lib/analyze";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cleaned, setCleaned] = useState<CleanResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string>("");

  async function handleFile(file: File) {
    setIsLoading(true);
    setError(null);
    try {
      const parsed = await parseSheetFile(file);
      const clean = cleanData(parsed);
      const result = analyzeData(clean.headers, clean.rows);
      setCleaned(clean);
      setAnalysis(result);
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
      setCleaned(null);
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setCleaned(null);
    setAnalysis(null);
    setFileName("");
    setError(null);
  }

  const hasResult = cleaned && analysis;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white px-6 py-12">
      <main className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl shadow-md shadow-indigo-200">
            📄
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-3xl font-extrabold text-transparent">
              Sheet Parser
            </h1>
            <p className="text-zinc-500">
              CSV/Excel file upload karein aur turant data cleaning + analytics insights payein.
            </p>
          </div>
        </div>

        {!hasResult && <HowItWorks />}

        {!hasResult && <FileUpload onFileSelected={handleFile} isLoading={isLoading} />}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        )}

        {hasResult && (
          <>
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-4 text-sm text-zinc-600 shadow-sm">
              <span className="flex items-center gap-2 font-medium text-zinc-800">
                <span className="text-base">✅</span> {fileName}
              </span>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-indigo-600 shadow-sm">
                {cleaned.rows.length} rows
              </span>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-indigo-600 shadow-sm">
                {cleaned.headers.length} columns
              </span>
              {cleaned.removedEmptyRows > 0 && (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
                  {cleaned.removedEmptyRows} empty rows removed
                </span>
              )}
              {cleaned.removedDuplicates > 0 && (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
                  {cleaned.removedDuplicates} duplicates removed
                </span>
              )}
              <button
                onClick={handleReset}
                className="ml-auto rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-500 hover:border-red-200 hover:text-red-500"
              >
                ✕ Remove &amp; upload another
              </button>
            </div>

            <section>
              <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-zinc-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
                Analytics
              </h2>
              <AnalyticsDashboard analysis={analysis} />
            </section>

            <section>
              <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-zinc-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-fuchsia-500 to-pink-500" />
                Data Preview
              </h2>
              <DataTable headers={cleaned.headers} rows={cleaned.rows} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
