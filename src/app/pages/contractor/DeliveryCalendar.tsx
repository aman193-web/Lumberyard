import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Calendar, BarChart2, Layers, Plus, Pencil, Trash2,
  ChevronLeft, ChevronRight, CheckCircle, Clock, Truck, Package,
  AlertTriangle, Lock, X, GitMerge, Scissors, ChevronDown,
  ChevronUp, MapPin, Info, BadgeCheck, ClipboardCheck, Star,
  Send, RefreshCw, ZoomIn, ZoomOut, GripVertical,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PhaseStatus =
  | "planned"
  | "quoted"
  | "locked"
  | "ordered"
  | "scheduled"
  | "delivered"
  | "reviewed";

type ViewMode = "phases" | "calendar" | "gantt";

interface DeliveryPhase {
  id: string;
  name: string;
  status: PhaseStatus;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  startDate: string;   // "YYYY-MM-DD"
  endDate: string;
  deliveryDate: string | null;
  deliveryWindow: string | null;
  supplier: string | null;
  itemCount: number;
  notes: string;
  merged?: string[];   // ids of phases merged into this one
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FLOW: PhaseStatus[] = [
  "planned", "quoted", "locked", "ordered", "scheduled", "delivered", "reviewed",
];

const STATUS_CFG: Record<PhaseStatus, {
  label: string; color: string; bg: string; border: string;
  dot: string; icon: React.ReactNode; desc: string;
}> = {
  planned:   { label: "Planned",   color: "text-slate-600",   bg: "bg-slate-100",   border: "border-slate-200",   dot: "bg-slate-400",   icon: <Clock size={10} />,        desc: "Phase created, awaiting quote" },
  quoted:    { label: "Quoted",    color: "text-blue-600",    bg: "bg-blue-50",     border: "border-blue-200",    dot: "bg-blue-500",    icon: <Send size={10} />,         desc: "Quote received from supplier" },
  locked:    { label: "Locked",    color: "text-violet-600",  bg: "bg-violet-50",   border: "border-violet-200",  dot: "bg-violet-500",  icon: <Lock size={10} />,         desc: "Price locked, pending order" },
  ordered:   { label: "Ordered",   color: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200",   dot: "bg-amber-500",   icon: <Package size={10} />,      desc: "Order placed with supplier" },
  scheduled: { label: "Scheduled", color: "text-cyan-700",    bg: "bg-cyan-50",     border: "border-cyan-200",    dot: "bg-cyan-500",    icon: <Calendar size={10} />,     desc: "Delivery date confirmed" },
  delivered: { label: "Delivered", color: "text-green-700",   bg: "bg-green-50",    border: "border-green-200",   dot: "bg-green-600",   icon: <Truck size={10} />,        desc: "Materials on site" },
  reviewed:  { label: "Reviewed",  color: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-200", dot: "bg-emerald-600", icon: <CheckCircle size={10} />,  desc: "Delivery reviewed & signed off" },
};

const PHASE_PALETTE = [
  { color: "text-amber-700",  bgColor: "bg-amber-50",  borderColor: "border-amber-200",  dotColor: "bg-amber-500"  },
  { color: "text-blue-700",   bgColor: "bg-blue-50",   borderColor: "border-blue-200",   dotColor: "bg-blue-500"   },
  { color: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200", dotColor: "bg-violet-500" },
  { color: "text-green-700",  bgColor: "bg-green-50",  borderColor: "border-green-200",  dotColor: "bg-green-500"  },
  { color: "text-rose-700",   bgColor: "bg-rose-50",   borderColor: "border-rose-200",   dotColor: "bg-rose-500"   },
  { color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200", dotColor: "bg-orange-500" },
  { color: "text-slate-700",  bgColor: "bg-slate-100", borderColor: "border-slate-200",  dotColor: "bg-slate-500"  },
];

// ─── Initial Phase Data ───────────────────────────────────────────────────────

const INITIAL_PHASES: DeliveryPhase[] = [
  {
    id: "foundation", name: "Foundation",
    status: "delivered", ...PHASE_PALETTE[0],
    startDate: "2026-04-07", endDate: "2026-04-21",
    deliveryDate: "2026-04-10", deliveryWindow: "7:00–9:00 AM",
    supplier: "Austin Timber Supply", itemCount: 8, notes: "Concrete, rebar, form boards",
  },
  {
    id: "framing", name: "Framing",
    status: "ordered", ...PHASE_PALETTE[1],
    startDate: "2026-04-14", endDate: "2026-05-05",
    deliveryDate: "2026-04-28", deliveryWindow: "8:00–10:00 AM",
    supplier: "Hill Country Lumber", itemCount: 14, notes: "LVL beams, dimensional lumber, joist hangers",
  },
  {
    id: "dryin", name: "Dry-In",
    status: "scheduled", ...PHASE_PALETTE[2],
    startDate: "2026-05-05", endDate: "2026-05-19",
    deliveryDate: "2026-05-06", deliveryWindow: "7:00–9:00 AM",
    supplier: "Central Texas Lumber Co", itemCount: 9, notes: "Roof sheathing, felt paper, ridge caps",
  },
  {
    id: "interior", name: "Interior",
    status: "quoted", ...PHASE_PALETTE[3],
    startDate: "2026-05-19", endDate: "2026-06-09",
    deliveryDate: null, deliveryWindow: null,
    supplier: "Austin Timber Supply", itemCount: 18, notes: "Drywall, insulation, interior doors",
  },
  {
    id: "finish", name: "Finish",
    status: "planned", ...PHASE_PALETTE[4],
    startDate: "2026-06-09", endDate: "2026-06-30",
    deliveryDate: null, deliveryWindow: null,
    supplier: null, itemCount: 11, notes: "Trim, paint, fixtures",
  },
  {
    id: "exterior", name: "Exterior",
    status: "locked", ...PHASE_PALETTE[5],
    startDate: "2026-05-26", endDate: "2026-06-16",
    deliveryDate: null, deliveryWindow: null,
    supplier: "Hill Country Lumber", itemCount: 7, notes: "Siding, fascia, soffit, gutters",
  },
  {
    id: "misc", name: "Misc",
    status: "planned", ...PHASE_PALETTE[6],
    startDate: "2026-06-30", endDate: "2026-07-14",
    deliveryDate: null, deliveryWindow: null,
    supplier: null, itemCount: 4, notes: "Hardware, touch-ups, punch list items",
  },
];

// ─── Gantt helpers ────────────────────────────────────────────────────────────

const GANTT_START = new Date("2026-04-06"); // week start
const GANTT_WEEKS = 16;

function dayOffset(dateStr: string): number {
  const d = new Date(dateStr);
  return Math.floor((d.getTime() - GANTT_START.getTime()) / (1000 * 60 * 60 * 24));
}

function ganttPct(dateStr: string): number {
  return Math.max(0, Math.min(100, (dayOffset(dateStr) / (GANTT_WEEKS * 7)) * 100));
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────

const DAYS  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number)    { return new Date(y, m, 1).getDay(); }

function fmtDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, size = "sm" }: { status: PhaseStatus; size?: "xs" | "sm" }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border} ${
      size === "xs" ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"
    }`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Status Pipeline ──────────────────────────────────────────────────────────

function StatusPipeline({ status, onAdvance }: { status: PhaseStatus; onAdvance: (s: PhaseStatus) => void }) {
  const currentIdx = STATUS_FLOW.indexOf(status);
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
      {STATUS_FLOW.map((s, i) => {
        const cfg = STATUS_CFG[s];
        const done = i < currentIdx;
        const active = i === currentIdx;
        const next = i === currentIdx + 1;
        return (
          <React.Fragment key={s}>
            <button
              onClick={() => next && onAdvance(s)}
              title={next ? `Advance to ${cfg.label}` : cfg.desc}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold flex-shrink-0 transition-all ${
                done   ? `${cfg.bg} ${cfg.color} opacity-70` :
                active ? `${cfg.bg} ${cfg.color} ring-2 ring-offset-1 ${cfg.border}` :
                next   ? "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 cursor-pointer" :
                         "bg-slate-50 text-slate-300 border border-slate-100 cursor-default"
              }`}
            >
              {done && <CheckCircle size={9} />}
              {cfg.label}
            </button>
            {i < STATUS_FLOW.length - 1 && (
              <div className={`w-3 h-px flex-shrink-0 ${i < currentIdx ? "bg-green-400" : "bg-slate-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Merge Modal ──────────────────────────────────────────────────────────────

function MergeModal({
  phases, onMerge, onClose,
}: { phases: DeliveryPhase[]; onMerge: (ids: string[], name: string) => void; onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const canMerge = selected.length >= 2 && name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
            <GitMerge size={15} className="text-violet-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900">Merge Phases</div>
            <div className="text-[11px] text-slate-500">Select 2 or more phases to combine</div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={15} className="text-slate-400" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {phases.map(p => (
              <label key={p.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                selected.includes(p.id) ? `${p.borderColor} ${p.bgColor}` : "border-slate-100 hover:border-slate-200"
              }`}>
                <input type="checkbox" className="hidden" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
                <div className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 ${
                  selected.includes(p.id) ? "bg-green-600 border-green-600" : "border-slate-300"
                }`}>
                  {selected.includes(p.id) && <CheckCircle size={10} className="text-white" />}
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dotColor}`} />
                <span className="text-sm font-medium text-slate-800 flex-1">{p.name}</span>
                <StatusBadge status={p.status} size="xs" />
              </label>
            ))}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Merged Phase Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Framing + Dry-In"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
            />
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            disabled={!canMerge}
            onClick={() => canMerge && onMerge(selected, name.trim())}
            className="flex-1 py-2.5 text-sm font-semibold bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <GitMerge size={14} /> Merge {selected.length > 0 ? `(${selected.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Split Modal ──────────────────────────────────────────────────────────────

function SplitModal({
  phase, onSplit, onClose,
}: { phase: DeliveryPhase; onSplit: (id: string, nameA: string, nameB: string) => void; onClose: () => void }) {
  const [nameA, setNameA] = useState(phase.name + " A");
  const [nameB, setNameB] = useState(phase.name + " B");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
            <Scissors size={15} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900">Split Phase</div>
            <div className="text-[11px] text-slate-500">Divide "{phase.name}" into two phases</div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={15} className="text-slate-400" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Part A Name</label>
            <input
              type="text" value={nameA} onChange={e => setNameA(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Part B Name</label>
            <input
              type="text" value={nameB} onChange={e => setNameB(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            disabled={!nameA.trim() || !nameB.trim()}
            onClick={() => onSplit(phase.id, nameA.trim(), nameB.trim())}
            className="flex-1 py-2.5 text-sm font-semibold bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Scissors size={14} /> Split
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delivery Confirmation Panel ───────────────────────────────────────────────

function ConfirmationPanel({
  phase, onConfirm, onClose,
}: { phase: DeliveryPhase; onConfirm: () => void; onClose: () => void }) {
  const [checks, setChecks] = useState({
    materialsReceived: false,
    quantitiesCorrect: false,
    noDamage: false,
    siteReady: false,
    signedBol: false,
  });
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);

  const allChecked = Object.values(checks).every(Boolean);

  const toggle = (k: keyof typeof checks) =>
    setChecks(prev => ({ ...prev, [k]: !prev[k] }));

  const items = [
    { key: "materialsReceived" as const, label: "All materials received per order" },
    { key: "quantitiesCorrect" as const, label: "Quantities match PO & delivery note" },
    { key: "noDamage" as const,          label: "No visible damage or defects" },
    { key: "siteReady" as const,         label: "Materials staged at correct location" },
    { key: "signedBol" as const,         label: "Bill of Lading signed by driver" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`flex items-center gap-3 px-5 py-4 border-b border-slate-100 rounded-t-2xl ${phase.bgColor}`}>
          <div className={`w-8 h-8 rounded-xl ${phase.bgColor} border ${phase.borderColor} flex items-center justify-center`}>
            <ClipboardCheck size={15} className={phase.color} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900">Confirm Delivery</div>
            <div className={`text-[11px] ${phase.color} font-medium`}>{phase.name}</div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/60 rounded-lg transition-colors">
            <X size={15} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Delivery Info */}
          <div className={`rounded-xl border ${phase.borderColor} ${phase.bgColor} px-4 py-3 flex items-center gap-4 text-xs`}>
            <div>
              <div className="text-slate-500">Delivery Date</div>
              <div className={`font-semibold ${phase.color}`}>{phase.deliveryDate || "—"}</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <div className="text-slate-500">Supplier</div>
              <div className="font-semibold text-slate-700">{phase.supplier || "—"}</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <div className="text-slate-500">Items</div>
              <div className="font-semibold text-slate-700">{phase.itemCount} line items</div>
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Delivery Checklist</div>
            <div className="space-y-2">
              {items.map(item => (
                <label
                  key={item.key}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                    checks[item.key] ? "border-green-400 bg-green-50" : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <input type="checkbox" className="hidden" checked={checks[item.key]} onChange={() => toggle(item.key)} />
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    checks[item.key] ? "bg-green-600 border-green-600" : "border-slate-300"
                  }`}>
                    {checks[item.key] && <CheckCircle size={11} className="text-white" />}
                  </div>
                  <span className="text-xs font-medium text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Supplier Rating */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rate Supplier</div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className="p-1 transition-colors hover:scale-110"
                >
                  <Star
                    size={22}
                    className={n <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-xs text-slate-500 ml-2">{["","Poor","Fair","Good","Great","Excellent"][rating]}</span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Delivery Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Any issues, damages, or notes about this delivery…"
              className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3 border-t border-slate-100 pt-4">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            disabled={!allChecked}
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <BadgeCheck size={15} />
            {allChecked ? "Confirm Delivery" : `${Object.values(checks).filter(Boolean).length}/5 checks complete`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Booking Panel (Calendar side panel) ─────────────────────────────────────

function BookingPanel({
  date, phases, onBook, onClose,
}: {
  date: string;
  phases: DeliveryPhase[];
  onBook: (phaseId: string, date: string, window: string) => void;
  onClose: () => void;
}) {
  const [selectedPhase, setSelectedPhase] = useState<string>(phases[0]?.id ?? "");
  const [window, setWindow] = useState("7:00–9:00 AM");

  const timeWindows = [
    "6:00–8:00 AM", "7:00–9:00 AM", "8:00–10:00 AM",
    "9:00–11:00 AM", "10:00 AM–12:00 PM", "12:00–2:00 PM",
    "1:00–3:00 PM", "2:00–4:00 PM",
  ];

  const phase = phases.find(p => p.id === selectedPhase);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-slate-900">Book Delivery</div>
          <div className="text-[11px] text-slate-500">{date}</div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <X size={14} className="text-slate-400" />
        </button>
      </div>

      {/* Phase picker */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phase</label>
        <div className="space-y-1.5">
          {phases.map(p => (
            <label key={p.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
              selectedPhase === p.id ? `${p.borderColor} ${p.bgColor}` : "border-slate-100 hover:border-slate-200"
            }`}>
              <input type="radio" className="hidden" checked={selectedPhase === p.id} onChange={() => setSelectedPhase(p.id)} />
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${p.dotColor}`} />
              <span className="text-xs font-medium text-slate-800 flex-1">{p.name}</span>
              <StatusBadge status={p.status} size="xs" />
            </label>
          ))}
        </div>
      </div>

      {/* Time window */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Delivery Window</label>
        <div className="grid grid-cols-2 gap-1.5">
          {timeWindows.map(w => (
            <button
              key={w}
              onClick={() => setWindow(w)}
              className={`text-[11px] px-2.5 py-2 rounded-lg border font-medium transition-all ${
                window === w ? "border-green-500 bg-green-50 text-green-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {phase && (
        <button
          onClick={() => onBook(selectedPhase, date, window)}
          className="w-full py-2.5 text-sm font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Calendar size={14} /> Book Delivery Slot
        </button>
      )}
    </div>
  );
}

// ─── Phase Card ───────────────────────────────────────────────────────────────

function PhaseCard({
  phase, onStatusAdvance, onDelete, onRename, onSplit, onConfirm,
}: {
  phase: DeliveryPhase;
  onStatusAdvance: (status: PhaseStatus) => void;
  onDelete: () => void;
  onRename: (name: string) => void;
  onSplit: () => void;
  onConfirm: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(phase.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRenameSubmit = () => {
    if (editName.trim()) onRename(editName.trim());
    setEditing(false);
  };

  const cfg = STATUS_CFG[phase.status];
  const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(phase.status) + 1];
  const isDelivered = phase.status === "delivered";
  const isReviewed = phase.status === "reviewed";

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all ${phase.borderColor} bg-white`}>
      {/* Header */}
      <div
        className={`flex items-center gap-3 px-5 py-4 cursor-pointer ${phase.bgColor} hover:brightness-[0.97] transition-all`}
        onClick={() => setExpanded(e => !e)}
      >
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${phase.dotColor}`} />

        {editing ? (
          <input
            ref={inputRef}
            autoFocus
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={e => { if (e.key === "Enter") handleRenameSubmit(); if (e.key === "Escape") setEditing(false); }}
            onClick={e => e.stopPropagation()}
            className="flex-1 text-sm font-bold bg-white border border-green-400 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-green-500/30"
          />
        ) : (
          <span className="text-sm font-bold text-slate-900 flex-1 truncate">{phase.name}</span>
        )}

        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <StatusBadge status={phase.status} />
          {/* Actions */}
          <button onClick={() => { setEditing(true); }} title="Rename" className="p-1.5 hover:bg-white/60 rounded-lg transition-colors">
            <Pencil size={12} className="text-slate-400" />
          </button>
          <button onClick={onSplit} title="Split phase" className="p-1.5 hover:bg-white/60 rounded-lg transition-colors">
            <Scissors size={12} className="text-slate-400" />
          </button>
          <button onClick={onDelete} title="Delete" className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={12} className="text-red-400" />
          </button>
          {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="px-5 py-4 space-y-4 border-t border-slate-100 bg-white">
          {/* Status pipeline */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phase Status</div>
            <StatusPipeline status={phase.status} onAdvance={onStatusAdvance} />
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Start", value: phase.startDate.slice(5).replace("-", "/") },
              { label: "End",   value: phase.endDate.slice(5).replace("-", "/") },
              { label: "Items", value: `${phase.itemCount} line items` },
              { label: "Supplier", value: phase.supplier ?? "Not assigned" },
            ].map(m => (
              <div key={m.label} className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-medium">{m.label}</div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5 truncate">{m.value}</div>
              </div>
            ))}
          </div>

          {/* Delivery slot */}
          {phase.deliveryDate ? (
            <div className="flex items-center gap-3 bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3">
              <Calendar size={14} className="text-cyan-600 flex-shrink-0" />
              <div className="flex-1 text-xs">
                <span className="font-semibold text-cyan-800">{phase.deliveryDate}</span>
                {phase.deliveryWindow && <span className="text-cyan-600"> · {phase.deliveryWindow}</span>}
              </div>
              {!isDelivered && !isReviewed && (
                <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-full">Scheduled</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
              <Calendar size={13} className="flex-shrink-0" /> No delivery date scheduled — use Calendar view to book
            </div>
          )}

          {/* Notes */}
          {phase.notes && (
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <Info size={12} className="flex-shrink-0 mt-0.5 text-slate-400" />
              {phase.notes}
            </div>
          )}

          {/* Action row */}
          <div className="flex gap-2 pt-1">
            {nextStatus && !isDelivered && (
              <button
                onClick={() => onStatusAdvance(nextStatus)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${STATUS_CFG[nextStatus].bg} ${STATUS_CFG[nextStatus].color} ${STATUS_CFG[nextStatus].border} hover:brightness-95`}
              >
                <ChevronRight size={12} /> Mark as {STATUS_CFG[nextStatus].label}
              </button>
            )}
            {phase.status === "scheduled" && (
              <button
                onClick={onConfirm}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                <ClipboardCheck size={12} /> Confirm Delivery
              </button>
            )}
            {isDelivered && !isReviewed && (
              <button
                onClick={onConfirm}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <BadgeCheck size={12} /> Review & Sign Off
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Gantt View ───────────────────────────────────────────────────────────────

function GanttView({ phases }: { phases: DeliveryPhase[] }) {
  const [zoom, setZoom] = useState(1);
  const weeks = Math.round(GANTT_WEEKS / zoom);

  // Generate week headers
  const weekHeaders = Array.from({ length: Math.min(GANTT_WEEKS, weeks + 4) }, (_, i) => {
    const d = new Date(GANTT_START);
    d.setDate(d.getDate() + i * 7);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  const today = "2026-04-23";
  const todayPct = ganttPct(today);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Timeline: Apr 2026 – Jul 2026 · {GANTT_WEEKS} weeks
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="Zoom out">
            <ZoomOut size={14} className="text-slate-500" />
          </button>
          <span className="text-xs text-slate-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.25))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="Zoom in">
            <ZoomIn size={14} className="text-slate-500" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {/* Week header row */}
          <div className="flex border-b border-slate-100 bg-slate-50 min-w-max">
            {/* Label column */}
            <div className="w-36 flex-shrink-0 px-4 py-2.5 border-r border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phase</span>
            </div>
            {/* Week columns */}
            <div className="flex-1 relative" style={{ minWidth: `${weeks * 56}px` }}>
              <div className="flex">
                {weekHeaders.slice(0, weeks).map((w, i) => (
                  <div key={i} className="flex-1 text-center py-2 border-r border-slate-100 text-[10px] text-slate-400 font-medium" style={{ minWidth: "56px" }}>
                    {w}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phase rows */}
          {phases.map((phase, idx) => {
            const startPct = ganttPct(phase.startDate);
            const endPct = ganttPct(phase.endDate);
            const widthPct = Math.max(1, endPct - startPct);
            const cfg = STATUS_CFG[phase.status];
            const hasDelivery = !!phase.deliveryDate;
            const deliveryPct = hasDelivery ? ganttPct(phase.deliveryDate!) : null;

            return (
              <div key={phase.id} className={`flex border-b border-slate-50 ${idx % 2 === 0 ? "" : "bg-slate-50/40"}`} style={{ minHeight: "52px" }}>
                {/* Label */}
                <div className="w-36 flex-shrink-0 px-4 flex items-center gap-2 border-r border-slate-100">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${phase.dotColor}`} />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate">{phase.name}</div>
                    <div className={`text-[9px] font-semibold ${cfg.color}`}>{cfg.label}</div>
                  </div>
                </div>
                {/* Bar area */}
                <div className="flex-1 relative py-3" style={{ minWidth: `${weeks * 56}px` }}>
                  {/* Week grid lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {Array.from({ length: weeks }).map((_, i) => (
                      <div key={i} className="flex-1 border-r border-slate-100" />
                    ))}
                  </div>

                  {/* Today line */}
                  {todayPct > 0 && todayPct < 100 && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-green-500 z-10 pointer-events-none"
                      style={{ left: `${todayPct}%` }}
                    >
                      <div className="absolute -top-0 left-0.5 text-[8px] font-bold text-green-600 whitespace-nowrap">Today</div>
                    </div>
                  )}

                  {/* Phase bar */}
                  <div
                    className={`absolute top-3 bottom-3 rounded-lg flex items-center px-2 overflow-hidden shadow-sm ${cfg.bg} border ${cfg.border}`}
                    style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                  >
                    <span className={`text-[10px] font-semibold truncate ${cfg.color}`}>{phase.name}</span>
                  </div>

                  {/* Delivery diamond */}
                  {deliveryPct !== null && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 z-20"
                      style={{ left: `calc(${deliveryPct}% - 6px)` }}
                      title={`Delivery: ${phase.deliveryDate}`}
                    >
                      <div className={`w-3 h-3 rotate-45 ${phase.dotColor} border-2 border-white shadow-md`} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 px-5 py-3 border-t border-slate-100 bg-slate-50 flex-wrap">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <div className="w-8 h-3 rounded bg-slate-200" /> Phase duration
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <div className="w-3 h-3 rotate-45 bg-slate-500 border-2 border-white" /> Delivery date
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <div className="w-0.5 h-4 bg-green-500" /> Today
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar View ────────────────────────────────────────────────────────────

function CalendarView({
  phases, onBook,
}: { phases: DeliveryPhase[]; onBook: (phaseId: string, date: string, window: string) => void }) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3); // April
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  // Build delivery dot map
  const dotMap: Record<string, DeliveryPhase[]> = {};
  phases.forEach(p => {
    if (p.deliveryDate) {
      if (!dotMap[p.deliveryDate]) dotMap[p.deliveryDate] = [];
      dotMap[p.deliveryDate].push(p);
    }
  });

  const today = "2026-04-23";

  const selectedPhases = selectedDate ? (dotMap[selectedDate] || []) : [];

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
              <ChevronLeft size={16} className="text-slate-600" />
            </button>
            <div className="text-sm font-bold text-slate-900">{MONTHS[month]} {year}</div>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} className="h-24 border-r border-b border-slate-50 bg-slate-50/40" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = fmtDate(year, month, day);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === today;
              const isPast = dateStr < today;
              const dots = dotMap[dateStr] || [];
              const isBooking = bookingDate === dateStr;

              return (
                <div
                  key={day}
                  className={`h-24 border-r border-b border-slate-50 p-1.5 cursor-pointer transition-colors relative ${
                    isSelected || isBooking ? "bg-green-50 border-green-200" :
                    isPast ? "bg-slate-50/40" : "hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    setSelectedDate(prev => prev === dateStr ? null : dateStr);
                    setBookingDate(null);
                  }}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                    isToday ? "bg-green-600 text-white" :
                    isSelected ? "bg-green-100 text-green-700" :
                    isPast ? "text-slate-300" : "text-slate-700"
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dots.slice(0, 2).map((p, di) => (
                      <div key={di} className={`flex items-center gap-1 rounded px-1 ${p.bgColor}`}>
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.dotColor}`} />
                        <span className={`text-[9px] font-medium truncate ${p.color}`}>{p.name}</span>
                      </div>
                    ))}
                    {dots.length > 2 && <span className="text-[9px] text-slate-400">+{dots.length - 2}</span>}
                  </div>
                  {/* Book button on hover */}
                  {!isPast && dots.length === 0 && (
                    <button
                      onClick={e => { e.stopPropagation(); setBookingDate(dateStr); setSelectedDate(null); }}
                      className="absolute bottom-1 right-1 p-0.5 rounded bg-green-100 text-green-600 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                      title="Book delivery"
                    >
                      <Plus size={10} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase legend */}
        <div className="flex flex-wrap gap-3 mt-3">
          {phases.map(p => (
            <div key={p.id} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${p.dotColor}`} />
              <span className="text-[11px] text-slate-500">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Side panel */}
      <div className="space-y-4">
        {bookingDate ? (
          <BookingPanel
            date={bookingDate}
            phases={phases.filter(p => !p.deliveryDate)}
            onBook={(phaseId, date, window) => { onBook(phaseId, date, window); setBookingDate(null); }}
            onClose={() => setBookingDate(null)}
          />
        ) : selectedDate ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-900">{selectedDate}</span>
              <button onClick={() => setBookingDate(selectedDate)} className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold text-green-600 hover:text-green-700 transition-colors">
                <Plus size={11} /> Book delivery
              </button>
            </div>
            {selectedPhases.length > 0 ? selectedPhases.map(p => (
              <div key={p.id} className={`p-5 border-b border-slate-50 last:border-0`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${p.dotColor}`} />
                  <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                  <StatusBadge status={p.status} size="xs" />
                </div>
                <div className="space-y-1.5 text-xs text-slate-500">
                  {p.supplier && (
                    <div className="flex items-center gap-2">
                      <Truck size={11} className="text-slate-400" />
                      {p.supplier}
                    </div>
                  )}
                  {p.deliveryWindow && (
                    <div className="flex items-center gap-2">
                      <Clock size={11} className="text-slate-400" />
                      {p.deliveryWindow}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Package size={11} className="text-slate-400" />
                    {p.itemCount} line items
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-5 text-center">
                <Calendar size={24} className="text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No deliveries on this date</p>
                <button
                  onClick={() => setBookingDate(selectedDate)}
                  className="mt-3 text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 mx-auto"
                >
                  <Plus size={11} /> Book a delivery
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 text-center">
            <Calendar size={28} className="text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Select a date to view or book deliveries</p>
          </div>
        )}

        {/* Upcoming deliveries */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-900">Upcoming Deliveries</span>
          </div>
          <div className="divide-y divide-slate-50">
            {phases.filter(p => p.deliveryDate).sort((a, b) => a.deliveryDate!.localeCompare(b.deliveryDate!)).map(p => (
              <div
                key={p.id}
                onClick={() => { setSelectedDate(p.deliveryDate); setBookingDate(null); }}
                className="px-5 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dotColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-800 truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400">{p.deliveryDate} · {p.deliveryWindow}</div>
                  </div>
                  <StatusBadge status={p.status} size="xs" />
                </div>
              </div>
            ))}
            {phases.every(p => !p.deliveryDate) && (
              <div className="px-5 py-4 text-center text-xs text-slate-400">No deliveries booked yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DeliveryCalendar() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>("phases");
  const [phases, setPhases] = useState<DeliveryPhase[]>(INITIAL_PHASES);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [splitPhase, setSplitPhase] = useState<DeliveryPhase | null>(null);
  const [confirmPhase, setConfirmPhase] = useState<DeliveryPhase | null>(null);
  const [addingPhase, setAddingPhase] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");

  // ── Derived ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = phases.length;
    const delivered = phases.filter(p => p.status === "delivered" || p.status === "reviewed").length;
    const scheduled = phases.filter(p => p.status === "scheduled").length;
    const pending = phases.filter(p => ["planned", "quoted", "locked", "ordered"].includes(p.status)).length;
    return { total, delivered, scheduled, pending };
  }, [phases]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const advanceStatus = (phaseId: string, newStatus: PhaseStatus) => {
    setPhases(prev => prev.map(p => p.id === phaseId ? { ...p, status: newStatus } : p));
  };

  const deletePhase = (phaseId: string) => {
    setPhases(prev => prev.filter(p => p.id !== phaseId));
  };

  const renamePhase = (phaseId: string, name: string) => {
    setPhases(prev => prev.map(p => p.id === phaseId ? { ...p, name } : p));
  };

  const mergePhases = (ids: string[], name: string) => {
    const toMerge = phases.filter(p => ids.includes(p.id));
    const base = toMerge[0];
    const maxEnd = toMerge.reduce((max, p) => p.endDate > max ? p.endDate : max, base.endDate);
    const minStart = toMerge.reduce((min, p) => p.startDate < min ? p.startDate : min, base.startDate);
    const totalItems = toMerge.reduce((sum, p) => sum + p.itemCount, 0);

    const merged: DeliveryPhase = {
      ...base,
      id: `merged-${Date.now()}`,
      name,
      startDate: minStart,
      endDate: maxEnd,
      itemCount: totalItems,
      merged: ids,
    };
    setPhases(prev => [...prev.filter(p => !ids.includes(p.id)), merged]);
    setMergeOpen(false);
  };

  const splitPhaseHandler = (phaseId: string, nameA: string, nameB: string) => {
    const original = phases.find(p => p.id === phaseId);
    if (!original) return;

    const midDate = new Date(original.startDate);
    const endDate = new Date(original.endDate);
    const mid = new Date((midDate.getTime() + endDate.getTime()) / 2);
    const midStr = mid.toISOString().slice(0, 10);

    const palA = PHASE_PALETTE[phases.length % PHASE_PALETTE.length];
    const palB = PHASE_PALETTE[(phases.length + 1) % PHASE_PALETTE.length];

    const phaseA: DeliveryPhase = {
      ...original, ...palA,
      id: `split-a-${Date.now()}`,
      name: nameA,
      endDate: midStr,
      itemCount: Math.ceil(original.itemCount / 2),
      deliveryDate: null, deliveryWindow: null,
    };
    const phaseB: DeliveryPhase = {
      ...original, ...palB,
      id: `split-b-${Date.now()}`,
      name: nameB,
      startDate: midStr,
      itemCount: Math.floor(original.itemCount / 2),
      deliveryDate: null, deliveryWindow: null,
    };

    setPhases(prev => {
      const idx = prev.findIndex(p => p.id === phaseId);
      const next = [...prev];
      next.splice(idx, 1, phaseA, phaseB);
      return next;
    });
    setSplitPhase(null);
  };

  const bookDelivery = (phaseId: string, date: string, deliveryWindow: string) => {
    setPhases(prev => prev.map(p =>
      p.id === phaseId
        ? { ...p, deliveryDate: date, deliveryWindow, status: "scheduled" as PhaseStatus }
        : p
    ));
  };

  const confirmDelivery = (phaseId: string) => {
    setPhases(prev => prev.map(p =>
      p.id === phaseId ? { ...p, status: "reviewed" as PhaseStatus } : p
    ));
    setConfirmPhase(null);
  };

  const addPhase = () => {
    if (!newPhaseName.trim()) return;
    const pal = PHASE_PALETTE[phases.length % PHASE_PALETTE.length];
    const newPhase: DeliveryPhase = {
      id: `phase-${Date.now()}`,
      name: newPhaseName.trim(),
      status: "planned",
      ...pal,
      startDate: "2026-07-14",
      endDate: "2026-07-28",
      deliveryDate: null,
      deliveryWindow: null,
      supplier: null,
      itemCount: 0,
      notes: "",
    };
    setPhases(prev => [...prev, newPhase]);
    setNewPhaseName("");
    setAddingPhase(false);
  };

  const viewLabels: Record<ViewMode, { label: string; icon: React.ReactNode }> = {
    phases:   { label: "Phases",   icon: <Layers size={13} /> },
    calendar: { label: "Calendar", icon: <Calendar size={13} /> },
    gantt:    { label: "Gantt",    icon: <BarChart2 size={13} /> },
  };

  return (
    <div className="min-h-full bg-slate-50">

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 px-5 py-3 flex-wrap gap-y-2">
          <button
            onClick={() => navigate("/contractor")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline text-xs">Dashboard</span>
          </button>
          <span className="text-slate-200 hidden sm:block">|</span>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center">
              <Truck size={15} className="text-cyan-600" />
            </div>
            <div>
              <div className="text-xs text-slate-400">2847 Oak Ridge Dr · proj-001 · BOM v1.3</div>
              <div className="text-sm font-bold text-slate-900 leading-tight">Delivery Planning</div>
            </div>
          </div>

          {/* View tabs */}
          <div className="ml-auto flex items-center gap-1 bg-slate-100 rounded-xl p-1 flex-shrink-0">
            {(Object.keys(viewLabels) as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  view === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {viewLabels[v].icon} {viewLabels[v].label}
              </button>
            ))}
          </div>
        </div>

        {/* Status summary strip */}
        <div className="flex items-center gap-5 px-5 pb-3 flex-wrap">
          {[
            { label: "Total Phases", value: stats.total, color: "text-slate-700", bg: "bg-slate-100" },
            { label: "Delivered",    value: stats.delivered, color: "text-green-700", bg: "bg-green-100" },
            { label: "Scheduled",   value: stats.scheduled, color: "text-cyan-700", bg: "bg-cyan-100" },
            { label: "Pending",     value: stats.pending, color: "text-amber-700", bg: "bg-amber-100" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>{s.value}</span>
              <span className="text-[11px] text-slate-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 max-w-7xl mx-auto space-y-5">

        {/* ── Phases View ──────────────────────────────────────────────────── */}
        {view === "phases" && (
          <>
            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-xs text-slate-500 flex-1">{phases.length} phases · drag to reorder</div>
              <button
                onClick={() => setMergeOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors"
              >
                <GitMerge size={12} /> Merge
              </button>
              <button
                onClick={() => setAddingPhase(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
              >
                <Plus size={12} /> Add Phase
              </button>
            </div>

            {/* Add phase inline */}
            {addingPhase && (
              <div className="flex items-center gap-3 bg-white rounded-2xl border-2 border-green-400 px-5 py-4 shadow-sm">
                <Plus size={16} className="text-green-500 flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={newPhaseName}
                  onChange={e => setNewPhaseName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addPhase(); if (e.key === "Escape") { setAddingPhase(false); setNewPhaseName(""); } }}
                  placeholder="New phase name…"
                  className="flex-1 text-sm font-medium border-none outline-none bg-transparent"
                />
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={addPhase} className="text-xs font-semibold px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Add
                  </button>
                  <button onClick={() => { setAddingPhase(false); setNewPhaseName(""); }} className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1.5">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Phase status pipeline guide */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Status Flow</div>
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {STATUS_FLOW.map((s, i) => {
                  const cfg = STATUS_CFG[s];
                  return (
                    <React.Fragment key={s}>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold flex-shrink-0 ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                        {cfg.icon} {cfg.label}
                      </div>
                      {i < STATUS_FLOW.length - 1 && (
                        <ChevronRight size={12} className="text-slate-300 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Phase cards */}
            <div className="space-y-3">
              {phases.map(phase => (
                <PhaseCard
                  key={phase.id}
                  phase={phase}
                  onStatusAdvance={s => advanceStatus(phase.id, s)}
                  onDelete={() => deletePhase(phase.id)}
                  onRename={name => renamePhase(phase.id, name)}
                  onSplit={() => setSplitPhase(phase)}
                  onConfirm={() => setConfirmPhase(phase)}
                />
              ))}
              {phases.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Layers size={32} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-medium">No phases yet</p>
                  <button onClick={() => setAddingPhase(true)} className="mt-2 text-xs font-semibold text-green-600 hover:text-green-700">
                    Add your first phase
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Calendar View ─────────────────────────────────────────────────── */}
        {view === "calendar" && (
          <CalendarView phases={phases} onBook={bookDelivery} />
        )}

        {/* ── Gantt View ─────────────────────────────────────────────────────── */}
        {view === "gantt" && (
          <GanttView phases={phases} />
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}

      {mergeOpen && (
        <MergeModal phases={phases} onMerge={mergePhases} onClose={() => setMergeOpen(false)} />
      )}

      {splitPhase && (
        <SplitModal phase={splitPhase} onSplit={splitPhaseHandler} onClose={() => setSplitPhase(null)} />
      )}

      {confirmPhase && (
        <ConfirmationPanel
          phase={confirmPhase}
          onConfirm={() => confirmDelivery(confirmPhase.id)}
          onClose={() => setConfirmPhase(null)}
        />
      )}
    </div>
  );
}
