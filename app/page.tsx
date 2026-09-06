"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import DataTable from "@/components/DataTable";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
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

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12">
      <main className="mx-auto flex max-w-5xl flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Sheet Parser</h1>
          <p className="text-zinc-500">
            CSV/Excel file upload karein aur turant data cleaning + analytics insights payein.
          </p>
        </div>

        <FileUpload onFileSelected={handleFile} isLoading={isLoading} />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        )}

        {cleaned && analysis && (
          <>
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              <span className="font-medium text-zinc-800">{fileName}</span>
              <span>{cleaned.rows.length} rows</span>
              <span>{cleaned.headers.length} columns</span>
              {cleaned.removedEmptyRows > 0 && (
                <span className="text-amber-600">{cleaned.removedEmptyRows} empty rows removed</span>
              )}
              {cleaned.removedDuplicates > 0 && (
                <span className="text-amber-600">{cleaned.removedDuplicates} duplicates removed</span>
              )}
            </div>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-zinc-800">Analytics</h2>
              <AnalyticsDashboard analysis={analysis} />
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-zinc-800">Data Preview</h2>
              <DataTable headers={cleaned.headers} rows={cleaned.rows} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
