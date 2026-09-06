"use client";

import { useRef, useState } from "react";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
}

export default function FileUpload({ onFileSelected, isLoading }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (file) onFileSelected(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      onClick={() => !isLoading && inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
        isLoading
          ? "cursor-wait border-zinc-200 bg-zinc-50"
          : isDragging
            ? "cursor-pointer border-indigo-500 bg-indigo-50 scale-[1.01]"
            : "cursor-pointer border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/60 hover:border-indigo-400 hover:from-indigo-50 hover:to-violet-50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        disabled={isLoading}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {isLoading ? (
        <span
          className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-500"
          aria-label="Loading"
        />
      ) : (
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl shadow-md shadow-indigo-200">
          📄
        </span>
      )}
      <p className="font-medium text-zinc-700">
        {isLoading ? "Processing..." : "Drag & drop CSV/Excel file, ya click karke select karein"}
      </p>
      <p className="text-sm text-zinc-400">Supported: .csv, .xlsx, .xls (max 10MB)</p>
    </div>
  );
}
