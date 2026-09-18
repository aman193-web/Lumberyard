import React, { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { MasterItem, humanize } from "../../../data/masterCatalog";
import { searchMaster } from "../../../lib/catalogMatching";

type Props = {
  master: MasterItem[];
  /** Pre-fills the query — usually the supplier's own description. */
  initialQuery?: string;
  onAssign: (sku: string) => void;
  onCancel?: () => void;
};

/**
 * Master-catalog search with real filters — the component a supplier uses to
 * assign a match by hand, not a plain text box.
 */
export function MasterSearch({ master, initialQuery = "", onAssign, onCancel }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [itemClass, setItemClass] = useState("");
  const [species, setSpecies] = useState("");

  const classes = useMemo(
    () => [...new Set(master.map(m => m.itemClass))].filter(Boolean).sort(),
    [master],
  );
  const speciesList = useMemo(
    () => [...new Set(master.map(m => m.species))].filter(Boolean).sort(),
    [master],
  );

  const results = useMemo(
    () => searchMaster(master, { query, itemClass, species }, 30),
    [master, query, itemClass, species],
  );

  const selectCls = "text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-amber-400 max-w-[190px]";

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-3 border-b border-slate-100 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search the master catalog — name, size, species, manufacturer"
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          {onCancel && (
            <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-1.5 flex-shrink-0">
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select value={itemClass} onChange={e => setItemClass(e.target.value)} className={selectCls}>
            <option value="">All categories</option>
            {classes.map(c => <option key={c} value={c}>{humanize(c)}</option>)}
          </select>
          <select value={species} onChange={e => setSpecies(e.target.value)} className={selectCls}>
            <option value="">All species</option>
            {speciesList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {(itemClass || species || query) && (
            <button
              onClick={() => { setItemClass(""); setSpecies(""); setQuery(""); }}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline"
            >
              Clear filters
            </button>
          )}
          <span className="text-[10px] text-slate-400 ml-auto">
            {results.length === 30 ? "30+" : results.length} match{results.length === 1 ? "" : "es"}
          </span>
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
        {results.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-slate-500">Nothing in the master catalog matches that.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              If you genuinely stock it, request it be added to the master instead.
            </p>
          </div>
        ) : results.map(item => (
          <button
            key={item.sku}
            onClick={() => onAssign(item.sku)}
            className="w-full text-left px-4 py-2.5 hover:bg-amber-50 transition-colors flex items-center gap-3 group"
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-800 truncate">{item.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                {item.sku} · {humanize(item.itemClass)}
                {item.species && ` · ${item.species}`}
                {item.nominalSize && ` · ${item.nominalSize}`}
                {` · per ${item.uomPurchase}`}
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              Assign
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
