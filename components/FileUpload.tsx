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
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
        isLoading
          ? "cursor-wait border-zinc-200 bg-zinc-50"
          : isDragging
            ? "cursor-pointer border-blue-500 bg-blue-50"
            : "cursor-pointer border-zinc-300 hover:border-zinc-400"
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
          className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-500"
          aria-label="Loading"
        />
      ) : (
        <span className="text-3xl">📄</span>
      )}
      <p className="font-medium text-zinc-700">
        {isLoading ? "Processing..." : "Drag & drop CSV/Excel file, ya click karke select karein"}
      </p>
      <p className="text-sm text-zinc-400">Supported: .csv, .xlsx, .xls (max 10MB)</p>
    </div>
  );
}
