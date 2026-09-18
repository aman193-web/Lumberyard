import React, { useRef, useState } from "react";
import {
  Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, Loader2, Bell,
} from "lucide-react";
import { parseCsv } from "../../../lib/csv";
import { loadMasterCatalog } from "../../../data/masterCatalog";
import { buildSampleSupplierCsv } from "../../../data/sampleSupplierCatalog";
import {
  detectColumnMapping, buildSupplierRows, matchAll,
  SUPPLIER_FIELDS, SupplierField, ImportException,
} from "../../../lib/catalogMatching";
import type { MatchRow } from "../../../lib/catalogMatching";
import { CheckboxField } from "../Checkbox";

type Stage = "choose" | "importing" | "failed";

export type ImportResult = {
  fileName: string;
  rows: MatchRow[];
  exceptions: ImportException[];
  /** True when the file was the master catalog rather than a supplier export. */
  looksLikeMasterCatalog: boolean;
};

type Props = {
  onImported: (result: ImportResult) => void;
};

/**
 * Upload → auto-map against the published template → import run. Columns are
 * matched to the template automatically; a file we cannot read is reported
 * rather than handed to the supplier to map by hand.
 */
export function ImportPanel({ onImported }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>("choose");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState({ done: 0, total: 0, phase: "" });
  const [error, setError] = useState("");
  const [notifyWhenReady, setNotifyWhenReady] = useState(false);

  const handleFile = (file: File | null) => {
    if (!file) return;
    load(file.name, () => file.text());
  };

  const loadSample = () =>
    load("austin-timber-pos-export.csv", async () => {
      const master = await loadMasterCatalog();
      return buildSampleSupplierCsv(master);
    });

  const load = async (name: string, read: () => Promise<string>) => {
    setError("");
    setFileName(name);
    setStage("importing");
    setProgress({ done: 0, total: 0, phase: "Reading your file" });

    try {
      const table = parseCsv(await read());

      if (table.headers.length === 0 || table.rows.length === 0) {
        setStage("failed");
        setError("That file has no data rows. Export again against the published template and retry.");
        return;
      }

      const mapping = detectColumnMapping(table.headers);
      const missing = SUPPLIER_FIELDS
        .filter(field => field.required && !mapping[field.id])
        .map(field => field.label);

      if (missing.length > 0) {
        setStage("failed");
        setError(
          `We could not find ${missing.join(" or ")} in this file. Columns we read: ` +
          `${table.headers.slice(0, 12).join(", ")}${table.headers.length > 12 ? "…" : ""}.`,
        );
        return;
      }

      await runImport(name, table.headers, table.rows, mapping);
    } catch {
      setStage("failed");
      setError("That file could not be read as CSV.");
    }
  };

  const runImport = async (
    name: string,
    headers: string[],
    dataRows: string[][],
    mapping: Record<SupplierField, string>,
  ) => {
    const { rows, exceptions } = buildSupplierRows(headers, dataRows, mapping);

    setProgress({ done: 0, total: rows.length, phase: "Loading the master catalog" });
    const master = await loadMasterCatalog();

    setProgress({ done: 0, total: rows.length, phase: "Matching against the master catalog" });
    const matched = await matchAll(rows, master, (done, total) =>
      setProgress({ done, total, phase: "Matching against the master catalog" }));

    onImported({
      fileName: name,
      rows: matched,
      exceptions,
      // The master catalog has a distinctive schema; importing it matches every
      // row to itself, which is worth saying out loud.
      looksLikeMasterCatalog: ["item_class", "substitution_policy", "uom_takeoff"]
        .every(col => headers.includes(col)),
    });
  };

  // ── Import running ─────────────────────────────────────────────────────────
  if (stage === "importing") {
    const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-5">
        <div className="flex items-center gap-3">
          <Loader2 size={18} className="text-amber-500 animate-spin" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Importing {fileName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{progress.phase}…</p>
          </div>
        </div>

        <div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-200" style={{ width: `${Math.max(pct, 3)}%` }} />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
            <span>
              {progress.total
                ? `${progress.done.toLocaleString()} of ${progress.total.toLocaleString()} rows`
                : "Reading rows…"}
            </span>
            <span>{pct}%</span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <CheckboxField
            checked={notifyWhenReady}
            onChange={setNotifyWhenReady}
            label={<span className="flex items-center gap-1.5"><Bell size={11} /> Email me when this is ready</span>}
            description="Large catalogs keep importing if you close this page. We will email you when the match review is ready to work through."
          />
        </div>
      </div>
    );
  }

  // ── Choose a file ──────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Import your catalog</h3>
        <p className="text-sm text-slate-500 leading-relaxed mt-1">
          Upload your POS or inventory export as CSV. We read your columns, match every item
          against the LocalLumberyard master catalog, and hand you a review list — you confirm
          the matches in bulk.
        </p>
      </div>

      <div
        className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-amber-300 hover:bg-amber-50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0] ?? null); }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0] ?? null)}
        />
        <Upload size={26} className="text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-800">Choose a CSV file</span> or drop it here
        </p>
        <p className="text-xs text-slate-400 mt-1">Hundreds or thousands of rows is normal</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={loadSample}
          className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
        >
          <FileSpreadsheet size={12} /> Use a sample POS export
        </button>
        <span className="text-[11px] text-slate-400">
          A realistic 250-row yard export — abbreviated names, odd units, mixed price ages and
          items not in the master catalog, so you can see every review state.
        </span>
      </div>

      {stage === "failed" && error && (
        <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-700">
            <div className="font-semibold">{fileName || "Import failed"}</div>
            <div className="mt-0.5 leading-relaxed">{error}</div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
        <CheckCircle2 size={12} className="flex-shrink-0 mt-0.5" />
        <span>
          A SKU column and a description column are all it needs — we map the rest to the
          published template automatically. Prices are optional; anything without a price
          imports as “needs confirmation” and you can fix them in bulk later.
        </span>
      </div>
    </div>
  );
}
