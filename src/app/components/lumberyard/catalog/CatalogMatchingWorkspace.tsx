import React, { useEffect, useMemo, useState } from "react";
import {
  Search, Zap, Check, X, Ban, Undo2, AlertTriangle, FileWarning, Loader2,
  RefreshCw, Save, CheckCircle2, Send, DollarSign, Shuffle, Target, ListChecks,
} from "lucide-react";
import {
  MasterItem, humanize, loadMasterCatalog, SUBSTITUTABLE_POLICIES,
} from "../../../data/masterCatalog";
import { MatchRow, ImportException, computeCoverage } from "../../../lib/catalogMatching";
import { useSupplierSetup } from "../../../context/SupplierSetupContext";
import { ImportPanel } from "./ImportPanel";
import { CoveragePanel } from "./CoveragePanel";
import { MatchRowItem, RowAction } from "./MatchRowItem";
import { FilterChip, FreshnessBadge } from "./indicators";
import { Checkbox } from "../Checkbox";

type View = "review" | "gaps" | "subs" | "pricing" | "confirmed" | "exceptions";
type ReviewFilter = "all" | "high" | "needs_review" | "no_match" | "substitutes";

const PAGE_SIZE = 25;

export function CatalogMatchingWorkspace({ onOpenReadiness }: { onOpenReadiness?: () => void }) {
  const { catalogImport, setCatalogImport, updateCatalogRows } = useSupplierSetup();

  const [master, setMaster] = useState<MasterItem[]>([]);
  const [masterError, setMasterError] = useState("");
  const [view, setView] = useState<View>("review");
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [undoStack, setUndoStack] = useState<{ label: string; rows: MatchRow[] }[]>([]);
  const [reviewRequested, setReviewRequested] = useState(false);

  // The master catalog is needed for search, reassign and the row detail.
  useEffect(() => {
    if (!catalogImport) return;
    let cancelled = false;
    loadMasterCatalog()
      .then(items => { if (!cancelled) setMaster(items); })
      .catch(err => { if (!cancelled) setMasterError(err.message); });
    return () => { cancelled = true; };
  }, [catalogImport]);

  const masterBySku = useMemo(() => new Map(master.map(m => [m.sku, m])), [master]);
  const rows = catalogImport?.rows ?? [];
  const stats = useMemo(() => computeCoverage(rows), [rows]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    rows.forEach(r => {
      const item = r.masterSku ? masterBySku.get(r.masterSku) : null;
      if (item?.itemClass) set.add(item.itemClass);
    });
    return [...set].sort();
  }, [rows, masterBySku]);

  // ── Row mutation ───────────────────────────────────────────────────────────

  const pushUndo = (label: string) => setUndoStack(prev => [{ label, rows }, ...prev].slice(0, 10));

  const applyToRows = (label: string, ids: Set<string> | null, fn: (row: MatchRow) => MatchRow) => {
    pushUndo(label);
    updateCatalogRows(current => current.map(r => (!ids || ids.has(r.id) ? fn(r) : r)));
  };

  const undo = () => {
    const [last, ...rest] = undoStack;
    if (!last) return;
    updateCatalogRows(() => last.rows);
    setUndoStack(rest);
    setSelected(new Set());
  };

  const handleRowAction = (row: MatchRow, action: RowAction) => {
    const one = new Set([row.id]);
    switch (action.type) {
      case "confirm":
        applyToRows("Confirm match", one, r => ({ ...r, status: "confirmed" }));
        break;
      case "reject":
        applyToRows("Reject match", one, r => ({
          ...r, status: "pending", masterSku: null, confidence: "none",
          isSubstitute: false, approvalRequired: false, substituteApproved: false, reasons: [],
        }));
        break;
      case "approve_substitute":
        applyToRows("Approve substitute", one, r => ({ ...r, substituteApproved: true }));
        break;
      case "assign": {
        const item = masterBySku.get(action.sku);
        applyToRows("Assign master item", one, r => {
          const exact = !!item && r.supplier.description.trim().toLowerCase() === item.name.trim().toLowerCase();
          const substitutable = !!item && SUBSTITUTABLE_POLICIES.includes(item.substitutionPolicy);
          const isSubstitute = !!item && !exact && substitutable;
          return {
            ...r,
            masterSku: action.sku,
            confidence: "high",
            score: 1,
            status: "pending",
            manuallyAssigned: true,
            isSubstitute,
            approvalRequired: isSubstitute,
            substituteApproved: false,
            unitMismatch: !!item && !!r.supplier.unit
              && r.supplier.unit.toUpperCase() !== item.uomPurchase.toUpperCase()
              && r.supplier.unit.toUpperCase() !== item.uomTakeoff.toUpperCase(),
            reasons: ["You assigned this match by hand"],
          };
        });
        break;
      }
      case "not_carried":
        applyToRows("Mark not carried", one, r => ({ ...r, status: "not_carried" }));
        break;
      case "request_addition":
        applyToRows("Request master addition", one, r => ({ ...r, status: "requested" }));
        break;
      case "undo":
        applyToRows("Reopen item", one, r => ({ ...r, status: "pending" }));
        break;
    }
  };

  // ── Bulk actions ───────────────────────────────────────────────────────────

  const acceptAllHighConfidence = () => {
    const ids = new Set(
      rows.filter(r => r.status === "pending" && r.confidence === "high" && !r.approvalRequired).map(r => r.id),
    );
    if (ids.size === 0) return;
    applyToRows(`Accept ${ids.size} high-confidence matches`, ids, r => ({ ...r, status: "confirmed" }));
    setSelected(new Set());
  };

  const bulkConfirm = () => {
    const ids = new Set([...selected].filter(id => {
      const row = rows.find(r => r.id === id);
      return row && row.masterSku && !(row.approvalRequired && !row.substituteApproved);
    }));
    if (ids.size === 0) return;
    applyToRows(`Confirm ${ids.size} matches`, ids, r => ({ ...r, status: "confirmed" }));
    setSelected(new Set());
  };

  // Selection is kept so the same batch can be confirmed straight afterwards.
  const bulkApproveSubstitutes = () => {
    const ids = new Set([...selected]);
    applyToRows(`Approve ${ids.size} substitutes`, ids, r => (r.approvalRequired ? { ...r, substituteApproved: true } : r));
  };

  const bulkNotCarried = () => {
    const ids = new Set([...selected]);
    applyToRows(`Mark ${ids.size} not carried`, ids, r => ({ ...r, status: "not_carried" }));
    setSelected(new Set());
  };

  const bulkRequestAddition = () => {
    const ids = new Set([...selected]);
    applyToRows(`Request ${ids.size} master additions`, ids, r => ({ ...r, status: "requested" }));
    setSelected(new Set());
  };

  const confirmAllCurrentPrices = () => {
    const ids = new Set(rows.filter(r => r.freshness === "current" && !r.priceConfirmed).map(r => r.id));
    if (ids.size === 0) return;
    applyToRows(`Confirm ${ids.size} current prices`, ids, r => ({ ...r, priceConfirmed: true }));
  };

  const confirmPrices = (ids: Set<string>) =>
    applyToRows(`Confirm ${ids.size} prices`, ids, r => ({ ...r, priceConfirmed: true }));

  // ── Filtering ──────────────────────────────────────────────────────────────

  const visible = useMemo(() => {
    let list = rows;

    if (view === "review") {
      list = list.filter(r => r.status === "pending");
      if (filter === "high") list = list.filter(r => r.confidence === "high" && !r.approvalRequired);
      if (filter === "needs_review") list = list.filter(r => r.confidence === "medium" || r.confidence === "low");
      if (filter === "no_match") list = list.filter(r => r.confidence === "none");
      if (filter === "substitutes") list = list.filter(r => r.isSubstitute);
    }
    if (view === "gaps") {
      list = list.filter(r => r.status === "pending" && (r.confidence === "none" || r.confidence === "low"));
    }
    // Confirmed substitutes move to Done so this list visibly shrinks as you work.
    if (view === "subs") {
      list = list.filter(r => r.isSubstitute && r.status === "pending");
    }
    if (view === "confirmed") {
      list = list.filter(r => r.status === "confirmed" || r.status === "not_carried" || r.status === "requested");
    }
    if (view === "pricing") {
      list = list.filter(r => r.freshness !== "current" || !r.priceConfirmed);
    }

    if (category) {
      list = list.filter(r => {
        const item = r.masterSku ? masterBySku.get(r.masterSku) : null;
        return item?.itemClass === category;
      });
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(r =>
        r.supplier.description.toLowerCase().includes(q) ||
        r.supplier.sku.toLowerCase().includes(q) ||
        (r.masterSku ?? "").toLowerCase().includes(q));
    }

    return list;
  }, [rows, view, filter, category, query, masterBySku]);

  useEffect(() => { setPage(0); }, [view, filter, category, query]);

  const pageRows = visible.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pageCount = Math.ceil(visible.length / PAGE_SIZE);

  const toggleSelectAllOnPage = (checked: boolean) => {
    setSelected(prev => {
      const next = new Set(prev);
      pageRows.forEach(r => (checked ? next.add(r.id) : next.delete(r.id)));
      return next;
    });
  };

  // ── Import ─────────────────────────────────────────────────────────────────

  if (!catalogImport) {
    return (
      <ImportPanel
        onImported={({ fileName, rows: imported, exceptions, looksLikeMasterCatalog }) => {
          setCatalogImport({
            fileName,
            importedAt: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
            rowCount: imported.length,
            exceptions,
            rows: imported,
            looksLikeMasterCatalog,
          });
          setView("review");
        }}
      />
    );
  }

  const priceStats = {
    current: rows.filter(r => r.freshness === "current").length,
    stale: rows.filter(r => r.freshness === "stale").length,
    needs: rows.filter(r => r.freshness === "needs_confirmation").length,
    confirmed: rows.filter(r => r.priceConfirmed).length,
    unconfirmedCurrent: rows.filter(r => r.freshness === "current" && !r.priceConfirmed).length,
  };

  const TABS: { id: View; label: string; count: number; icon: React.ReactNode }[] = [
    { id: "review",     label: "Match review",   count: rows.filter(r => r.status === "pending").length, icon: <ListChecks size={12} /> },
    { id: "gaps",       label: "Gap analysis",   count: rows.filter(r => r.status === "pending" && (r.confidence === "none" || r.confidence === "low")).length, icon: <Target size={12} /> },
    { id: "subs",       label: "Substitutions",  count: rows.filter(r => r.isSubstitute && r.status === "pending").length, icon: <Shuffle size={12} /> },
    { id: "pricing",    label: "Price freshness", count: priceStats.stale + priceStats.needs, icon: <DollarSign size={12} /> },
    { id: "confirmed",  label: "Done",           count: stats.confirmed + stats.notCarried + stats.requested, icon: <CheckCircle2 size={12} /> },
    { id: "exceptions", label: "Import errors",  count: catalogImport.exceptions.length, icon: <FileWarning size={12} /> },
  ];

  return (
    <div className="space-y-4">
      {/* Save/resume banner */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl flex-wrap">
        <Save size={13} className="text-slate-400 flex-shrink-0" />
        <span className="text-[11px] text-slate-600">
          <span className="font-semibold">{catalogImport.fileName}</span> · imported {catalogImport.importedAt} ·{" "}
          {catalogImport.rowCount.toLocaleString()} rows. Progress is saved — you can leave and come back.
        </span>
        <div className="flex-1" />
        {undoStack.length > 0 && (
          <button onClick={undo} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900">
            <Undo2 size={11} /> Undo “{undoStack[0].label}”
          </button>
        )}
        <button
          onClick={() => { setCatalogImport(null); setUndoStack([]); setSelected(new Set()); }}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-600"
        >
          <RefreshCw size={11} /> Re-import
        </button>
      </div>

      <CoveragePanel
        stats={stats}
        onResolve={() => {
          if (stats.highConfidencePending > 0) { setView("review"); setFilter("high"); }
          else { setView("gaps"); }
        }}
        onRequestReview={() => setReviewRequested(true)}
        onOpenReadiness={onOpenReadiness}
      />

      {reviewRequested && (
        <div className="flex items-start gap-2 px-4 py-3 bg-violet-50 border border-violet-200 rounded-xl">
          <Send size={13} className="text-violet-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-violet-800">
            <span className="font-semibold">Coverage review requested.</span> A LocalLumberyard
            reviewer will look at your unmatched items and either add them to the master catalog
            or clear the catalog step manually. You can keep working in the meantime.
          </div>
        </div>
      )}

      {catalogImport.exceptions.length > 0 && view !== "exceptions" && (
        <div className="flex items-start gap-2 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl">
          <AlertTriangle size={13} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-orange-800 leading-relaxed flex-1">
            <span className="font-semibold">
              {catalogImport.exceptions.length} row{catalogImport.exceptions.length === 1 ? "" : "s"} could not be imported.
            </span>{" "}
            They never reached matching and do not count against your coverage — everything else
            is ready to review below.
          </div>
          <button
            onClick={() => setView("exceptions")}
            className="text-[11px] font-semibold text-orange-800 hover:underline flex-shrink-0"
          >
            See the report
          </button>
        </div>
      )}

      {catalogImport.looksLikeMasterCatalog && (
        <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <FileWarning size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800 leading-relaxed">
            <span className="font-semibold">That file was the LocalLumberyard master catalog, not a supplier export.</span>{" "}
            Every row matched itself at high confidence, so gap analysis, substitutions and
            manual review are all empty. Re-import with the sample POS export to work through
            the full review flow.
          </div>
        </div>
      )}

      {masterError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />
          <span className="text-xs text-red-700">{masterError}</span>
        </div>
      )}

      {/* View tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setView(tab.id); setFilter("all"); setSelected(new Set()); }}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              view === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.icon} {tab.label}
            <span className={`text-[10px] font-bold ${view === tab.id ? "text-slate-400" : "text-slate-400"}`}>
              {tab.count.toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      {view === "exceptions"
        ? <ExceptionReport exceptions={catalogImport.exceptions} imported={catalogImport.rowCount} />
        : (
          <>
            {/* View-specific header */}
            {view === "gaps" && (
              <GapHeader count={visible.length} stats={stats} />
            )}
            {view === "subs" && (
              <SectionNote
                icon={<Shuffle size={13} className="text-violet-500" />}
                tone="violet"
                title="Substitution management"
                body="These items were matched to an equivalent rather than an identical master item. Each one needs explicit approval before it counts toward coverage — structural items are never substitutable."
              />
            )}
            {view === "pricing" && (
              <PricingHeader stats={priceStats} onConfirmAllCurrent={confirmAllCurrentPrices} />
            )}

            {/* Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[220px]">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search your items or master SKUs"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-amber-400 max-w-[190px]"
                >
                  <option value="">All categories</option>
                  {categories.map(c => <option key={c} value={c}>{humanize(c)}</option>)}
                </select>

                {view === "review" && stats.highConfidencePending > 0 && (
                  <button
                    onClick={acceptAllHighConfidence}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Zap size={12} /> Accept all {stats.highConfidencePending.toLocaleString()} high-confidence
                  </button>
                )}
              </div>

              {view === "review" && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <FilterChip label="All open" count={rows.filter(r => r.status === "pending").length} active={filter === "all"} onClick={() => setFilter("all")} />
                  <FilterChip label="High confidence" count={stats.highConfidencePending} active={filter === "high"} onClick={() => setFilter("high")} />
                  <FilterChip label="Needs review" count={stats.needsReview} active={filter === "needs_review"} onClick={() => setFilter("needs_review")} />
                  <FilterChip label="No match" count={rows.filter(r => r.status === "pending" && r.confidence === "none").length} active={filter === "no_match"} onClick={() => setFilter("no_match")} />
                  <FilterChip label="Substitutes" count={rows.filter(r => r.status === "pending" && r.isSubstitute).length} active={filter === "substitutes"} onClick={() => setFilter("substitutes")} />
                </div>
              )}

              {/* Selection + bulk bar */}
              {visible.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox
                      checked={pageRows.length > 0 && pageRows.every(r => selected.has(r.id))}
                      onChange={toggleSelectAllOnPage}
                      ariaLabel="Select every row on this page"
                    />
                    <span className="text-[11px] text-slate-500">
                      Select the {pageRows.length} on this page
                    </span>
                  </label>

                  {selected.size > 0 && (
                    <>
                      <span className="text-[11px] font-semibold text-slate-700">{selected.size} selected</span>
                      {view === "pricing" ? (
                        <button onClick={() => { confirmPrices(new Set(selected)); setSelected(new Set()); }} className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700">
                          Confirm prices
                        </button>
                      ) : (
                        <>
                          <button onClick={bulkConfirm} className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700">
                            <Check size={11} /> Confirm
                          </button>
                          {view === "subs" && (
                            <button onClick={bulkApproveSubstitutes} className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100">
                              <Shuffle size={11} /> Approve substitutes
                            </button>
                          )}
                          <button onClick={bulkNotCarried} className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                            <Ban size={11} /> Not carried
                          </button>
                          <button onClick={bulkRequestAddition} className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-violet-200 text-violet-700 hover:bg-violet-50">
                            <Send size={11} /> Request addition
                          </button>
                        </>
                      )}
                      <button onClick={() => setSelected(new Set())} className="text-[11px] text-slate-400 hover:text-slate-600 inline-flex items-center gap-1">
                        <X size={11} /> Clear
                      </button>
                    </>
                  )}

                  <div className="flex-1" />
                  <span className="text-[11px] text-slate-400">
                    {visible.length.toLocaleString()} item{visible.length === 1 ? "" : "s"}
                  </span>
                </div>
              )}
            </div>

            {/* Rows */}
            {master.length === 0 && !masterError ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
                <Loader2 size={20} className="text-amber-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading the master catalog…</p>
              </div>
            ) : visible.length === 0 ? (
              <EmptyState
                view={view}
                filter={filter}
                stats={stats}
                priceStats={priceStats}
                onGo={(nextView, nextFilter) => {
                  setView(nextView);
                  setFilter(nextFilter ?? "all");
                  setSelected(new Set());
                }}
              />
            ) : (
              <>
                <div className="space-y-2">
                  {pageRows.map(row => (
                    <MatchRowItem
                      key={row.id}
                      row={row}
                      master={master}
                      masterBySku={masterBySku}
                      selected={selected.has(row.id)}
                      onSelect={checked => setSelected(prev => {
                        const next = new Set(prev);
                        checked ? next.add(row.id) : next.delete(row.id);
                        return next;
                      })}
                      onAction={action => handleRowAction(row, action)}
                      compact={view === "confirmed"}
                    />
                  ))}
                </div>

                {pageCount > 1 && (
                  <div className="flex items-center justify-between gap-4 px-1">
                    <span className="text-[11px] text-slate-400">
                      Showing {(page * PAGE_SIZE + 1).toLocaleString()}–{Math.min((page + 1) * PAGE_SIZE, visible.length).toLocaleString()} of {visible.length.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="text-[11px] font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                      >
                        Previous
                      </button>
                      <span className="text-[11px] text-slate-500 px-2">Page {page + 1} of {pageCount}</span>
                      <button
                        onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
                        disabled={page >= pageCount - 1}
                        className="text-[11px] font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
    </div>
  );
}

// ─── Supporting blocks ────────────────────────────────────────────────────────

function SectionNote({ icon, title, body, tone }: { icon: React.ReactNode; title: string; body: string; tone: "violet" | "blue" | "amber" }) {
  const cls = {
    violet: "bg-violet-50 border-violet-200 text-violet-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
  }[tone];
  return (
    <div className={`flex items-start gap-2.5 px-4 py-3 border rounded-xl ${cls}`}>
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div className="text-xs leading-relaxed">
        <span className="font-semibold">{title}.</span> {body}
      </div>
    </div>
  );
}

function GapHeader({ count, stats }: { count: number; stats: ReturnType<typeof computeCoverage> }) {
  const impact = stats.total === 0 ? 0 : Math.round((count / stats.total) * 100);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Target size={14} className="text-slate-400" /> Gap analysis
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xl">
            Only the items that did not match, or matched too weakly to trust. Every one you
            resolve moves coverage. Assign a master item, pick an alternate, mark it not carried,
            or request it be added to the master catalog.
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-slate-900">{count.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">left to resolve</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">worth {impact}% coverage</div>
        </div>
      </div>
      {count === 0 && (
        <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 size={13} className="text-green-600 flex-shrink-0" />
          <span className="text-xs text-green-800 font-semibold">Nothing left here — every item has a match or a decision.</span>
        </div>
      )}
    </div>
  );
}

function PricingHeader({
  stats, onConfirmAllCurrent,
}: {
  stats: { current: number; stale: number; needs: number; confirmed: number; unconfirmedCurrent: number };
  onConfirmAllCurrent: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <DollarSign size={14} className="text-slate-400" /> Price freshness
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Stale and unpriced items are not sellable until you confirm them. Buyers never see a
            price you have not stood behind.
          </p>
        </div>
        {stats.unconfirmedCurrent > 0 && (
          <button
            onClick={onConfirmAllCurrent}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            <Check size={13} /> Confirm all {stats.unconfirmedCurrent.toLocaleString()} current prices
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Current", value: stats.current, badge: <FreshnessBadge value="current" /> },
          { label: "Stale", value: stats.stale, badge: <FreshnessBadge value="stale" /> },
          { label: "Needs confirmation", value: stats.needs, badge: <FreshnessBadge value="needs_confirmation" /> },
          { label: "Confirmed by you", value: stats.confirmed, badge: <FreshnessBadge value="current" confirmed /> },
        ].map(card => (
          <div key={card.label} className="border border-slate-100 rounded-xl p-3">
            <div className="text-xl font-bold text-slate-900">{card.value.toLocaleString()}</div>
            <div className="mt-1.5">{card.badge}</div>
          </div>
        ))}
      </div>

      {stats.needs > 0 && (
        <div className="flex items-start gap-2 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl">
          <AlertTriangle size={13} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-orange-800 leading-relaxed">
            <span className="font-semibold">{stats.needs.toLocaleString()} items require supplier confirmation.</span>{" "}
            They imported without a usable price or effective date. They stay unsellable — and
            invisible to buyers — until you set and confirm a price.
          </div>
        </div>
      )}
    </div>
  );
}

function ExceptionReport({ exceptions, imported }: { exceptions: ImportException[]; imported: number }) {
  const grouped = exceptions.reduce<Record<string, ImportException[]>>((acc, e) => {
    (acc[e.reason] ||= []).push(e);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileWarning size={14} className="text-slate-400" /> Import exception report
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {imported.toLocaleString()} rows imported ·{" "}
          {exceptions.length.toLocaleString()} could not be read. These never reached matching —
          fix them in your export and re-import, or leave them out.
        </p>
      </div>

      {exceptions.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <CheckCircle2 size={20} className="text-green-500 mx-auto mb-2" />
          <p className="text-xs text-slate-600 font-semibold">Every row imported cleanly.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {Object.entries(grouped).map(([reason, items]) => (
            <div key={reason} className="px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={12} className="text-orange-500" />
                <span className="text-xs font-bold text-slate-800">{reason}</span>
                <span className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {items.slice(0, 50).map(e => (
                  <div key={e.line} className="flex items-start gap-3 text-[11px]">
                    <span className="text-slate-400 font-mono flex-shrink-0 w-16">Line {e.line}</span>
                    <span className="text-slate-600">{e.detail}</span>
                  </div>
                ))}
                {items.length > 50 && (
                  <div className="text-[11px] text-slate-400 pt-1">+ {items.length - 50} more</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  view, filter, stats, priceStats, onGo,
}: {
  view: View;
  filter: ReviewFilter;
  stats: ReturnType<typeof computeCoverage>;
  priceStats: { current: number; stale: number; needs: number; confirmed: number; unconfirmedCurrent: number };
  onGo: (view: View, filter?: ReviewFilter) => void;
}) {
  const { total, confirmed, notCarried, requested, pending } = stats;

  // Where the remaining work actually is, so an empty tab still tells you something.
  const elsewhere: { label: string; count: number; view: View; filter?: ReviewFilter }[] = [
    { label: "Open in match review", count: pending, view: "review" },
    { label: "Unmatched or low confidence", count: stats.noMatch + stats.needsReview, view: "gaps" },
    { label: "Substitutes to approve", count: stats.substitutes, view: "subs" },
    { label: "Prices to confirm", count: priceStats.stale + priceStats.needs, view: "pricing" },
  ].filter(item => item.count > 0 && item.view !== view);

  const copy: Record<View, { title: string; body: string }> = {
    review: filter === "high"
      ? { title: "No high-confidence items left", body: `Every confident match has been accepted. ${stats.needsReview.toLocaleString()} items still need a human decision.` }
      : filter === "needs_review"
      ? { title: "Nothing needs a manual decision", body: "Every remaining item matched confidently enough to accept in bulk, or has already been decided." }
      : filter === "no_match"
      ? { title: "Everything found a match", body: `All ${total.toLocaleString()} imported items were paired with a master catalog item.` }
      : filter === "substitutes"
      ? { title: "No substitutes proposed", body: "Every match is an exact equivalent, so nothing needs substitution approval." }
      : { title: "Nothing left to review", body: `All ${total.toLocaleString()} items have a decision — ${confirmed.toLocaleString()} confirmed, ${notCarried.toLocaleString()} not carried, ${requested.toLocaleString()} requested for the master catalog.` },
    gaps:       { title: "No gaps to resolve", body: `Every item matched confidently. Nothing is unmatched and nothing scored low enough to need a second look.` },
    subs:       { title: "No substitutions to approve", body: "Nothing was matched to an equivalent rather than an exact master item, so there is nothing to approve here." },
    pricing:    { title: "Every price is confirmed", body: `All ${priceStats.confirmed.toLocaleString()} prices are current and confirmed — nothing is stale or awaiting confirmation.` },
    confirmed:  { title: "Nothing decided yet", body: "Confirmed matches, not-carried items and master-catalog requests collect here as you work through the review." },
    exceptions: { title: "No import errors", body: "Every row in your file was readable and reached matching." },
  };
  const { title, body } = copy[view];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10">
      <div className="max-w-md mx-auto text-center">
        <CheckCircle2 size={22} className="text-green-500 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{body}</p>

        {total === 0 && (
          <p className="text-[11px] text-slate-400 mt-3">
            Your file imported zero usable rows — check the import errors tab.
          </p>
        )}
      </div>

      {/* Always say where the work is, so no tab is a dead end */}
      {elsewhere.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2.5 text-center">
            Where the remaining work is
          </div>
          <div className="grid sm:grid-cols-2 gap-2 max-w-lg mx-auto">
            {elsewhere.map(item => (
              <button
                key={item.label}
                onClick={() => onGo(item.view, item.filter)}
                className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-colors text-left group"
              >
                <span className="text-[11px] text-slate-600 group-hover:text-slate-800">{item.label}</span>
                <span className="text-xs font-bold text-slate-900 flex-shrink-0">{item.count.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {elsewhere.length === 0 && total > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-3 gap-3 max-w-md mx-auto text-center">
          {[
            { label: "Confirmed", value: confirmed },
            { label: "Not carried", value: notCarried },
            { label: "Requested", value: requested },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-lg font-bold text-slate-900">{stat.value.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
