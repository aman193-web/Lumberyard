import React, { useState } from "react";
import {
  Check, X, Shuffle, ChevronDown, ChevronRight, ArrowRight, Ban, Send, Undo2, Info,
} from "lucide-react";
import { MasterItem, humanize } from "../../../data/masterCatalog";
import type { MatchRow } from "../../../lib/catalogMatching";
import {
  ConfidenceBadge, StatusBadge, FreshnessBadge, SubstituteBadge, UnitMismatchBadge,
} from "./indicators";
import { MasterSearch } from "./MasterSearch";
import { Checkbox } from "../Checkbox";

export type RowAction =
  | { type: "confirm" }
  | { type: "reject" }
  | { type: "approve_substitute" }
  | { type: "assign"; sku: string }
  | { type: "not_carried" }
  | { type: "request_addition" }
  | { type: "undo" };

type Props = {
  row: MatchRow;
  master: MasterItem[];
  masterBySku: Map<string, MasterItem>;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onAction: (action: RowAction) => void;
  /** Hides the checkbox and confirm button in read-only views. */
  compact?: boolean;
};

const ACTION_BTN = "inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors whitespace-nowrap";

export function MatchRowItem({ row, master, masterBySku, selected, onSelect, onAction, compact }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [searching, setSearching] = useState(false);

  const matched = row.masterSku ? masterBySku.get(row.masterSku) ?? null : null;
  const decided = row.status !== "pending";
  const blockedBySubstitute = row.approvalRequired && !row.substituteApproved;

  return (
    <div className={`border rounded-xl transition-all ${
      row.status === "confirmed" ? "border-green-200 bg-green-50/40"
      : row.status === "not_carried" ? "border-slate-200 bg-slate-50"
      : row.status === "requested" ? "border-violet-200 bg-violet-50/40"
      : row.confidence === "none" ? "border-red-100 bg-white"
      : "border-slate-100 bg-white hover:border-slate-200"
    }`}>
      <div className="flex items-start gap-3 p-3.5">
        {!compact && (
          <Checkbox
            checked={selected}
            onChange={onSelect}
            ariaLabel={`Select ${row.supplier.description}`}
            className="mt-1"
          />
        )}

        {/* Supplier item vs proposed master item, side by side */}
        <div className="flex-1 min-w-0 grid md:grid-cols-2 gap-3">
          <div className="min-w-0">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Your item</div>
            <div className="text-xs font-semibold text-slate-900 truncate" title={row.supplier.description}>
              {row.supplier.description}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {row.supplier.sku}
              {row.supplier.size && ` · ${row.supplier.size}`}
              {row.supplier.species && ` · ${row.supplier.species}`}
              {row.supplier.grade && ` · ${row.supplier.grade}`}
              {row.supplier.unit && ` · per ${row.supplier.unit}`}
            </div>
          </div>

          <div className="min-w-0 md:border-l md:border-slate-100 md:pl-3">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
              <ArrowRight size={9} /> Master catalog
            </div>
            {matched ? (
              <>
                <div className="text-xs font-semibold text-slate-900 truncate" title={matched.name}>
                  {matched.name}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {matched.sku} · {humanize(matched.itemClass)}
                  {matched.nominalSize && ` · ${matched.nominalSize}`}
                  {` · per ${matched.uomPurchase}`}
                </div>
              </>
            ) : (
              <div className="text-xs text-red-600 font-medium">
                No master item proposed
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                  Search and assign one, or mark it not carried
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0 w-[168px]">
          {decided ? <StatusBadge value={row.status} /> : <ConfidenceBadge value={row.confidence} score={row.score} />}
          {row.isSubstitute && <SubstituteBadge approved={row.substituteApproved} />}
          {row.unitMismatch && matched && (
            <UnitMismatchBadge supplierUnit={row.supplier.unit} masterUnit={matched.uomPurchase} />
          )}
          {row.manuallyAssigned && (
            <span className="text-[9px] text-slate-400 font-medium">Assigned by you</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-3.5 pb-3 flex-wrap">
        <button
          onClick={() => setExpanded(v => !v)}
          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 font-medium"
        >
          {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />} Why this match
        </button>

        <div className="flex-1" />

        {decided ? (
          <button onClick={() => onAction({ type: "undo" })} className={`${ACTION_BTN} border-slate-200 text-slate-500 hover:bg-slate-50`}>
            <Undo2 size={11} /> Undo
          </button>
        ) : (
          <>
            {blockedBySubstitute && (
              <button
                onClick={() => onAction({ type: "approve_substitute" })}
                className={`${ACTION_BTN} border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100`}
              >
                <Shuffle size={11} /> Approve substitute
              </button>
            )}
            <button
              onClick={() => setSearching(v => !v)}
              className={`${ACTION_BTN} border-slate-200 text-slate-600 hover:bg-slate-50`}
            >
              {matched ? "Reassign" : "Search master"}
            </button>
            {matched && (
              <button onClick={() => onAction({ type: "reject" })} className={`${ACTION_BTN} border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200`}>
                <X size={11} /> Reject
              </button>
            )}
            <button
              onClick={() => onAction({ type: "confirm" })}
              disabled={!matched || blockedBySubstitute}
              title={blockedBySubstitute ? "Approve the substitute first" : undefined}
              className={`${ACTION_BTN} ${
                matched && !blockedBySubstitute
                  ? "border-green-600 bg-green-600 text-white hover:bg-green-700"
                  : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Check size={11} /> Confirm
            </button>
          </>
        )}
      </div>

      {/* Match reason */}
      {expanded && (
        <div className="px-3.5 pb-3.5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-start gap-2">
              <Info size={12} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-600 leading-relaxed">
                {row.reasons.length > 0 ? (
                  <ul className="space-y-0.5">
                    {row.reasons.map((reason, i) => <li key={i}>· {reason}</li>)}
                  </ul>
                ) : (
                  <span>Nothing in the master catalog came close enough to propose.</span>
                )}
                {matched && (
                  <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      ["Class", humanize(matched.itemClass)],
                      ["Species", matched.species || "—"],
                      ["Nominal", matched.nominalSize || "—"],
                      ["Substitution", matched.substitutionPolicy],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div className="text-[9px] text-slate-400 uppercase tracking-wide">{label}</div>
                        <div className="text-[11px] font-semibold text-slate-700">{value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {row.alternates.length > 0 && !decided && (
              <div className="pt-2 border-t border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Other candidates
                </div>
                <div className="space-y-1">
                  {row.alternates.map(alt => {
                    const item = masterBySku.get(alt.sku);
                    if (!item) return null;
                    return (
                      <button
                        key={alt.sku}
                        onClick={() => onAction({ type: "assign", sku: alt.sku })}
                        className="w-full flex items-center gap-2 text-left px-2.5 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors group"
                      >
                        <span className="text-[11px] text-slate-700 truncate flex-1">{item.name}</span>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">{Math.round(alt.score * 100)}%</span>
                        <span className="text-[10px] font-bold text-amber-600 opacity-0 group-hover:opacity-100 flex-shrink-0">Use this</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!decided && (
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2 flex-wrap">
                <button onClick={() => onAction({ type: "not_carried" })} className={`${ACTION_BTN} border-slate-200 text-slate-500 hover:bg-white`}>
                  <Ban size={11} /> We do not carry this
                </button>
                <button onClick={() => onAction({ type: "request_addition" })} className={`${ACTION_BTN} border-violet-200 text-violet-700 hover:bg-violet-50`}>
                  <Send size={11} /> Request it be added to master
                </button>
                <span className="text-[10px] text-slate-400">
                  Neither counts toward coverage — “not carried” items are not sellable.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Master search */}
      {searching && (
        <div className="px-3.5 pb-3.5">
          <MasterSearch
            master={master}
            initialQuery={row.supplier.description}
            onAssign={sku => { onAction({ type: "assign", sku }); setSearching(false); }}
            onCancel={() => setSearching(false)}
          />
        </div>
      )}

      {/* Price line */}
      <div className="flex items-center gap-2 px-3.5 py-2 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
        <span className="text-[10px] text-slate-400">Price</span>
        <span className="text-[11px] font-semibold text-slate-700">
          {row.supplier.price ? `$${row.supplier.price}` : "Not supplied"}
          {row.supplier.unit && row.supplier.price && <span className="text-slate-400 font-normal"> / {row.supplier.unit}</span>}
        </span>
        {row.supplier.priceDate && (
          <span className="text-[10px] text-slate-400">as of {row.supplier.priceDate}</span>
        )}
        <div className="flex-1" />
        <FreshnessBadge value={row.freshness} confirmed={row.priceConfirmed} />
      </div>
    </div>
  );
}
