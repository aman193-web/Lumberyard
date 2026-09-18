import React, { useEffect, useMemo, useState } from "react";
import { Search, Package, Target, ArrowRight, Loader2, Info } from "lucide-react";
import { MasterItem, humanize, loadMasterCatalog } from "../../../data/masterCatalog";
import type { CatalogImport } from "../../../context/SupplierSetupContext";
import { CoverageStats, GO_LIVE_COVERAGE_FLOOR } from "../../../lib/catalogMatching";
import { FreshnessBadge, SubstituteBadge } from "./indicators";
import { mockCatalog } from "../../../data/mockData";

const PAGE_SIZE = 20;

type Props = {
  catalogImport: CatalogImport | null;
  coverage: CoverageStats | null;
  onOpenSetup: () => void;
};

/**
 * Read-only view of the catalog a supplier has actually had approved — the
 * confirmed matches from Supplier Setup → Catalog, as a table. The review flow
 * itself stays in the setup wizard.
 */
export function ApprovedCatalog({ catalogImport, coverage, onOpenSetup }: Props) {
  const [master, setMaster] = useState<MasterItem[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!catalogImport) return;
    let cancelled = false;
    loadMasterCatalog().then(items => { if (!cancelled) setMaster(items); }).catch(() => {});
    return () => { cancelled = true; };
  }, [catalogImport]);

  const masterBySku = useMemo(() => new Map(master.map(m => [m.sku, m])), [master]);

  const approved = useMemo(
    () => (catalogImport?.rows ?? []).filter(r => r.status === "confirmed"),
    [catalogImport],
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    approved.forEach(r => {
      const item = r.masterSku ? masterBySku.get(r.masterSku) : null;
      if (item?.itemClass) set.add(item.itemClass);
    });
    return [...set].sort();
  }, [approved, masterBySku]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return approved.filter(row => {
      const item = row.masterSku ? masterBySku.get(row.masterSku) : null;
      if (category && item?.itemClass !== category) return false;
      if (!q) return true;
      return row.supplier.description.toLowerCase().includes(q)
        || row.supplier.sku.toLowerCase().includes(q)
        || (item?.name ?? "").toLowerCase().includes(q);
    });
  }, [approved, masterBySku, query, category]);

  useEffect(() => { setPage(0); }, [query, category]);

  const pageRows = visible.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pageCount = Math.ceil(visible.length / PAGE_SIZE);

  // ── Nothing imported yet: show the published product list instead ─────────
  if (!catalogImport) {
    return <PublishedCatalog onOpenSetup={onOpenSetup} />;
  }

  return (
    <div className="space-y-4">
      {/* Coverage — the same panel language as Supplier Setup → Catalog */}
      {coverage && (
        <div className={`rounded-2xl border shadow-sm p-5 ${
          coverage.meetsFloor ? "bg-green-50 border-green-200" : "bg-white border-slate-100"
        }`}>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-start gap-4 min-w-[260px]">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                coverage.meetsFloor ? "bg-green-100 text-green-600" : "bg-amber-50 text-amber-600"
              }`}>
                <Target size={18} />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${coverage.meetsFloor ? "text-green-700" : "text-slate-900"}`}>
                    {coverage.coverage}%
                  </span>
                  <span className="text-xs text-slate-500">confirmed-match coverage</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {coverage.confirmed.toLocaleString()} of {coverage.total.toLocaleString()} imported items ·
                  go-live floor {GO_LIVE_COVERAGE_FLOOR}%
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-[240px]">
              <div className="relative h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${coverage.meetsFloor ? "bg-green-500" : "bg-amber-500"}`}
                  style={{ width: `${Math.max(coverage.coverage, 1)}%` }}
                />
                <div className="absolute top-0 bottom-0 w-0.5 bg-slate-900" style={{ left: `${GO_LIVE_COVERAGE_FLOOR}%` }} />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                <span>0%</span>
                <span className="font-semibold text-slate-600">floor {GO_LIVE_COVERAGE_FLOOR}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200/70 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-slate-700">
              {coverage.meetsFloor ? (
                <><span className="font-semibold text-green-800">Catalog step satisfied.</span>{" "}
                  <span className="text-slate-600">These items are live to buyers.</span></>
              ) : (
                <><span className="font-semibold">{coverage.itemsToFloor.toLocaleString()} more items to resolve</span>{" "}
                  <span className="text-slate-500">before this stops blocking go-live.</span></>
              )}
            </p>
            <button
              onClick={onOpenSetup}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
            >
              Review matches <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Counts, matching the review tabs */}
      {coverage && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Approved", value: coverage.confirmed, tone: "text-green-600" },
            { label: "Still open", value: coverage.pending, tone: "text-amber-600" },
            { label: "Not carried", value: coverage.notCarried, tone: "text-slate-400" },
            { label: "Prices to confirm", value: coverage.staleOrUnconfirmedPrices, tone: "text-orange-600" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">{stat.label}</div>
              <div className={`text-2xl font-bold mt-1 ${stat.tone}`}>{stat.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-bold text-slate-900">Approved catalog</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Imported from {catalogImport.fileName} · {approved.length.toLocaleString()} items live to buyers
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search approved items"
                className="w-56 pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-amber-400 max-w-[170px]"
            >
              <option value="">All categories</option>
              {categories.map(c => <option key={c} value={c}>{humanize(c)}</option>)}
            </select>
          </div>
        </div>

        {approved.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Package size={20} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No items approved yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Confirm matches in Supplier Setup &rarr; Catalog and they will be listed here.
            </p>
          </div>
        ) : master.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Loader2 size={18} className="text-amber-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading the master catalog…</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-left">
                    {["Your item", "Your SKU", "Master catalog item", "Category", "Unit", "Price", "Price status"].map(h => (
                      <th key={h} className="px-4 py-2.5 font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pageRows.map(row => {
                    const item = row.masterSku ? masterBySku.get(row.masterSku) : null;
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 max-w-[240px]">
                          <div className="font-semibold text-slate-800 truncate" title={row.supplier.description}>
                            {row.supplier.description}
                          </div>
                          {row.isSubstitute && (
                            <div className="mt-1"><SubstituteBadge approved /></div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.supplier.sku}</td>
                        <td className="px-4 py-3 max-w-[240px]">
                          <div className="text-slate-700 truncate" title={item?.name}>{item?.name ?? "—"}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{item?.sku}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{humanize(item?.itemClass ?? "")}</td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {row.supplier.unit || item?.uomPurchase || "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                          {row.supplier.price ? `$${row.supplier.price}` : <span className="text-slate-300 font-normal">Not set</span>}
                        </td>
                        <td className="px-4 py-3">
                          <FreshnessBadge value={row.freshness} confirmed={row.priceConfirmed} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pageCount > 1 && (
              <div className="flex items-center justify-between gap-4 px-5 py-3 border-t border-slate-100">
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
      </div>
    </div>
  );
}

/**
 * What a supplier has on the marketplace before they have run a catalog import
 * — the products already published against their account.
 */
function PublishedCatalog({ onOpenSetup }: { onOpenSetup: () => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(
    () => [...new Set(mockCatalog.map(p => p.category))].sort(),
    [],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mockCatalog.filter(product => {
      if (category && product.category !== category) return false;
      if (!q) return true;
      return product.name.toLowerCase().includes(q) || product.sku.toLowerCase().includes(q);
    });
  }, [query, category]);

  const inStock = mockCatalog.filter(p => p.inStock).length;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
        <Info size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 leading-relaxed flex-1">
          <span className="font-semibold">These are your published products.</span>{" "}
          Import your full catalog in Supplier Setup to match every item against the master
          catalog — matched items get found by more buyers.
        </div>
        <button
          onClick={onOpenSetup}
          className="text-[11px] font-semibold text-blue-800 hover:underline inline-flex items-center gap-1 flex-shrink-0"
        >
          Import catalog <ArrowRight size={11} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Products",    value: mockCatalog.length,               tone: "text-slate-900" },
          { label: "Categories",  value: categories.length,                tone: "text-slate-900" },
          { label: "In stock",    value: inStock,                          tone: "text-green-600" },
          { label: "Out of stock",value: mockCatalog.length - inStock,     tone: "text-red-500" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">{stat.label}</div>
            <div className={`text-2xl font-bold mt-1 ${stat.tone}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-bold text-slate-900">Published products</div>
            <div className="text-xs text-slate-400 mt-0.5">
              {mockCatalog.length} items live to buyers · managed on the Catalog page
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products"
                className="w-56 pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-amber-400 max-w-[170px]"
            >
              <option value="">All categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left">
                {["Product", "SKU", "Category", "Unit", "Price", "Stock"].map(h => (
                  <th key={h} className="px-4 py-2.5 font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visible.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 max-w-[280px]">
                    <div className="font-semibold text-slate-800 truncate" title={product.name}>{product.name}</div>
                    {product.dimensions && (
                      <div className="text-[10px] text-slate-400 mt-0.5">{product.dimensions}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{product.sku}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{product.category}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{product.unitOfMeasure}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${
                      product.inStock
                        ? "text-green-700 bg-green-50 border-green-200"
                        : "text-red-700 bg-red-50 border-red-200"
                    }`}>
                      {product.inStock ? `${product.stock.toLocaleString()} on hand` : "Out of stock"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visible.length === 0 && (
          <div className="px-5 py-10 text-center text-xs text-slate-500">
            No published products match that search.
          </div>
        )}
      </div>
    </div>
  );
}
