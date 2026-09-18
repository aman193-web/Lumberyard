import React from "react";
import {
  CheckCircle2, AlertTriangle, HelpCircle, XCircle, Shuffle, Ruler,
  Clock, CircleDashed, Send, Ban,
} from "lucide-react";
import type { Confidence, Freshness, RowStatus } from "../../../lib/catalogMatching";

/**
 * Every state carries an icon and a word as well as a colour, so none of it
 * depends on colour perception alone.
 */

const PILL = "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap";

export function ConfidenceBadge({ value, score }: { value: Confidence; score?: number }) {
  const map: Record<Confidence, { label: string; cls: string; icon: React.ReactNode }> = {
    high:   { label: "High",   cls: "text-green-700 bg-green-50 border-green-200",   icon: <CheckCircle2 size={10} /> },
    medium: { label: "Medium", cls: "text-amber-700 bg-amber-50 border-amber-200",   icon: <AlertTriangle size={10} /> },
    low:    { label: "Low",    cls: "text-orange-700 bg-orange-50 border-orange-200", icon: <HelpCircle size={10} /> },
    none:   { label: "No match", cls: "text-red-700 bg-red-50 border-red-200",       icon: <XCircle size={10} /> },
  };
  const m = map[value];
  return (
    <span className={`${PILL} ${m.cls}`} title={score !== undefined ? `Match score ${Math.round(score * 100)}%` : undefined}>
      {m.icon} {m.label}
      {score !== undefined && value !== "none" && (
        <span className="font-semibold opacity-60">{Math.round(score * 100)}%</span>
      )}
    </span>
  );
}

export function StatusBadge({ value }: { value: RowStatus }) {
  const map: Record<RowStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    pending:     { label: "Needs review", cls: "text-slate-600 bg-slate-50 border-slate-200", icon: <CircleDashed size={10} /> },
    confirmed:   { label: "Confirmed",    cls: "text-green-700 bg-green-50 border-green-200", icon: <CheckCircle2 size={10} /> },
    rejected:    { label: "Rejected",     cls: "text-red-700 bg-red-50 border-red-200",       icon: <XCircle size={10} /> },
    not_carried: { label: "Not carried",  cls: "text-slate-500 bg-slate-100 border-slate-300", icon: <Ban size={10} /> },
    requested:   { label: "Addition requested", cls: "text-violet-700 bg-violet-50 border-violet-200", icon: <Send size={10} /> },
  };
  const m = map[value];
  return <span className={`${PILL} ${m.cls}`}>{m.icon} {m.label}</span>;
}

export function FreshnessBadge({ value, confirmed }: { value: Freshness; confirmed?: boolean }) {
  if (confirmed) {
    return <span className={`${PILL} text-green-700 bg-green-50 border-green-200`}><CheckCircle2 size={10} /> Confirmed</span>;
  }
  const map: Record<Freshness, { label: string; cls: string; icon: React.ReactNode }> = {
    current:            { label: "Current", cls: "text-green-700 bg-green-50 border-green-200", icon: <CheckCircle2 size={10} /> },
    stale:              { label: "Stale",   cls: "text-orange-700 bg-orange-50 border-orange-200", icon: <Clock size={10} /> },
    needs_confirmation: { label: "Needs confirmation", cls: "text-red-700 bg-red-50 border-red-200", icon: <AlertTriangle size={10} /> },
  };
  const m = map[value];
  return <span className={`${PILL} ${m.cls}`}>{m.icon} {m.label}</span>;
}

export function SubstituteBadge({ approved }: { approved: boolean }) {
  return approved
    ? <span className={`${PILL} text-green-700 bg-green-50 border-green-200`}><CheckCircle2 size={10} /> Substitute approved</span>
    : <span className={`${PILL} text-violet-700 bg-violet-50 border-violet-200`}><Shuffle size={10} /> Substitute · approval required</span>;
}

export function UnitMismatchBadge({ supplierUnit, masterUnit }: { supplierUnit: string; masterUnit: string }) {
  return (
    <span
      className={`${PILL} text-blue-700 bg-blue-50 border-blue-200`}
      title={`You price per ${supplierUnit}; master purchases per ${masterUnit}. Informational — it does not block confirming.`}
    >
      <Ruler size={10} /> Unit: {supplierUnit || "—"} vs {masterUnit || "—"}
    </span>
  );
}

/** A labelled count used across the filter bars. */
export function FilterChip({
  label, count, active, onClick, tone = "slate",
}: {
  label: string; count?: number; active: boolean; onClick: () => void; tone?: "slate" | "amber";
}) {
  const activeCls = tone === "amber"
    ? "bg-amber-500 border-amber-500 text-white"
    : "bg-slate-900 border-slate-900 text-white";
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
        active ? activeCls : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`text-[10px] font-bold ${active ? "opacity-80" : "text-slate-400"}`}>{count}</span>
      )}
    </button>
  );
}
