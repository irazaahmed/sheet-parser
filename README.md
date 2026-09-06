# Sheet Parser

CSV/Excel file upload karein aur turant data cleaning + analytics insights payein.

Handles standard UTF-8 CSV/Excel files as well as UTF-16 Ahrefs/Semrush-style exports (tab-delimited, corrupted BOM, double-quoted fields).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Drag & drop CSV/Excel upload
- Automatic encoding + delimiter detection (UTF-8 comma CSV, UTF-16 tab-delimited exports)
- Data cleaning: empty row removal, deduplication, column type inference
- Analytics dashboard: totals, averages, top category charts (Recharts)

## Deploy on Vercel

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/new).
