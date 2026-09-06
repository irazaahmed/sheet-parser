"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import DataTable from "@/components/DataTable";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import HowItWorks from "@/components/HowItWorks";
import { parseSheetFile, isExcelFile, listExcelSheetNames } from "@/lib/parseSheet";
import { cleanData, CleanResult } from "@/lib/cleanData";
import { analyzeData, AnalysisResult } from "@/lib/analyze";
import { exportAsCsv, exportAsExcel } from "@/lib/exportData";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cleaned, setCleaned] = useState<CleanResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);

  async function processFile(file: File, sheetName?: string) {
    setIsLoading(true);
    setError(null);
    try {
      const parsed = await parseSheetFile(file, sheetName);
      const clean = cleanData(parsed);
      const result = analyzeData(clean.headers, clean.rows);
      setCleaned(clean);
      setAnalysis(result);
      setFileName(file.name);
      setPendingFile(null);
      setSheetNames([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
      setCleaned(null);
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFile(file: File) {
    if (isExcelFile(file)) {
      setIsLoading(true);
      setError(null);
      try {
        const names = await listExcelSheetNames(file);
        if (names.length > 1) {
          setPendingFile(file);
          setSheetNames(names);
          setIsLoading(false);
          return;
        }
      } catch {
        // fall through -- let processFile surface the real parsing error
      }
      setIsLoading(false);
    }
    await processFile(file);
  }

  function handleReset() {
    setCleaned(null);
    setAnalysis(null);
    setFileName("");
    setError(null);
    setPendingFile(null);
    setSheetNames([]);
  }

  function handleExport(format: "csv" | "excel") {
    if (!cleaned) return;
    const baseName = fileName.replace(/\.[^.]+$/, "") || "sheet-parser-export";
    if (format === "csv") exportAsCsv(cleaned.headers, cleaned.rows, baseName);
    else exportAsExcel(cleaned.headers, cleaned.rows, baseName);
  }

  const hasResult = cleaned && analysis;
  const isPickingSheet = pendingFile && sheetNames.length > 1 && !hasResult;

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
              Upload a CSV/Excel file and get instant data cleaning + analytics insights.
            </p>
          </div>
        </div>

        {!hasResult && !isPickingSheet && <HowItWorks />}

        {!hasResult && !isPickingSheet && <FileUpload onFileSelected={handleFile} isLoading={isLoading} />}

        {isPickingSheet && (
          <div className="animate-fade-in-up rounded-2xl border border-indigo-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-zinc-800">
              This Excel file has {sheetNames.length} sheets
            </p>
            <p className="mt-1 text-sm text-zinc-500">Which sheet would you like to parse?</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {sheetNames.map((name) => (
                <button
                  key={name}
                  onClick={() => pendingFile && processFile(pendingFile, name)}
                  className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                >
                  {name}
                </button>
              ))}
            </div>
            <button
              onClick={handleReset}
              className="mt-6 text-xs font-medium text-zinc-400 hover:text-zinc-600"
            >
              ✕ Cancel
            </button>
          </div>
        )}

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
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => handleExport("csv")}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-emerald-300 hover:text-emerald-600"
                >
                  ⬇ CSV
                </button>
                <button
                  onClick={() => handleExport("excel")}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-emerald-300 hover:text-emerald-600"
                >
                  ⬇ Excel
                </button>
                <button
                  onClick={handleReset}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-500 hover:border-red-200 hover:text-red-500"
                >
                  ✕ Remove
                </button>
              </div>
            </div>

            <section>
              <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-zinc-800">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
                Analytics
              </h2>
              <AnalyticsDashboard analysis={analysis} rows={cleaned.rows} />
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
