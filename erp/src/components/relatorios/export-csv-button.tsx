"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type CsvValue = string | number | boolean | null | undefined;
type CsvRow = Record<string, CsvValue>;

function toCsvField(value: CsvValue) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(rows: CsvRow[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(toCsvField).join(","),
    ...rows.map((row) => headers.map((h) => toCsvField(row[h])).join(",")),
  ];
  return lines.join("\n");
}

export function ExportCsvButton({ filename, rows }: { filename: string; rows: CsvRow[] }) {
  function handleExport() {
    const csv = buildCsv(rows);
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={rows.length === 0}>
      <Download />
      Exportar CSV
    </Button>
  );
}
