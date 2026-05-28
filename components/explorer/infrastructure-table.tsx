"use client";

import { ArrowDownUp, Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DetailDrawer, type ExplorerRow } from "./detail-drawer";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { statusLabels } from "@/lib/data";

type SortKey = keyof Pick<ExplorerRow, "name" | "type" | "country" | "rating" | "operator" | "status">;

export function InfrastructureTable({ rows }: { rows: ExplorerRow[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [country, setCountry] = useState("all");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [selectedRow, setSelectedRow] = useState<ExplorerRow | null>(null);
  const pageSize = 10;

  const types = Array.from(new Set(rows.map((row) => row.type))).sort();
  const countries = Array.from(new Set(rows.map((row) => row.country))).sort();

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...rows]
      .filter((row) => (type === "all" ? true : row.type === type))
      .filter((row) => (country === "all" ? true : row.country === country))
      .filter((row) =>
        normalized
          ? [row.name, row.type, row.country, row.location, row.operator, row.status].some((value) =>
              value.toLowerCase().includes(normalized)
            )
          : true
      )
      .sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey])));
  }, [country, query, rows, sortKey, type]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const exportCsv = () => {
    const header = ["id", "type", "name", "country", "location", "coordinates", "rating", "operator", "status", "source", "notes"];
    const csv = [
      header.join(","),
      ...filteredRows.map((row) =>
        header
          .map((key) => `"${String(row[key as keyof ExplorerRow]).replaceAll('"', '""')}"`)
          .join(",")
      )
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "terragrid-atlas-infrastructure.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-lg p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search name, operator, country, city, status..."
              className="pl-9"
            />
          </label>
          <Select
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">All types</option>
            {types.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select
            value={country}
            onChange={(event) => {
              setCountry(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">All countries</option>
            {countries.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Button onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/52">
        {visibleRows.length ? (
          <div className="atlas-scrollbar overflow-x-auto">
            <table className="min-w-[980px] w-full border-collapse text-sm">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  {[
                    ["name", "Name"],
                    ["type", "Type"],
                    ["country", "Country"],
                    ["rating", "Capacity / rating"],
                    ["operator", "Operator"],
                    ["status", "Status"]
                  ].map(([key, label]) => (
                    <th key={key} className="px-4 py-3 text-left font-medium">
                      <button
                        className="inline-flex items-center gap-2 text-left transition hover:text-slate-200"
                        onClick={() => setSortKey(key as SortKey)}
                      >
                        {label}
                        <ArrowDownUp className="h-3.5 w-3.5" />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-t border-slate-800/80 transition hover:bg-cyan-300/5"
                    onClick={() => setSelectedRow(row)}
                  >
                    <td className="px-4 py-3 font-medium text-slate-100">{row.name}</td>
                    <td className="px-4 py-3 text-slate-300">{row.type}</td>
                    <td className="px-4 py-3 text-slate-300">{row.country}</td>
                    <td className="px-4 py-3 text-slate-300">{row.rating}</td>
                    <td className="max-w-[240px] truncate px-4 py-3 text-slate-300">{row.operator}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300">
                        {statusLabels[row.status as keyof typeof statusLabels] ?? row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState description="Try widening the type, country, or text filters." />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
        <span>
          Showing {visibleRows.length} of {filteredRows.length} records
        </span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
            Previous
          </Button>
          <span className="text-slate-300">
            {page} / {totalPages}
          </span>
          <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
            Next
          </Button>
        </div>
      </div>

      <DetailDrawer row={selectedRow} onClose={() => setSelectedRow(null)} />
    </div>
  );
}
