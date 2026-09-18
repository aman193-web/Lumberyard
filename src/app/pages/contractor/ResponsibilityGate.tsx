import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, CheckCircle, AlertTriangle, Lock, ShieldCheck,
  Clock, User, Hash, FileText, ChevronDown, ChevronRight,
  RefreshCw, Info, ArrowRight, Layers, BookOpen, Shield,
  RotateCcw, CalendarClock, Fingerprint, BadgeCheck,
} from "lucide-react";
import { mockTakeoffItems } from "../../data/mockData";

// ─── Static data ──────────────────────────────────────────────────────────────

const categories = [...new Set(mockTakeoffItems.map(i => i.category))];

type Role = "Contractor" | "Homeowner" | "Designer";

const ROLE_CAN_PROCEED: Record<Role, boolean> = {
  Contractor: true,
  Homeowner:  true,
  Designer:   false,
};

// Simulated acknowledgment store (visual only — no persistence)
const PREV_ACK = {
  ackId:     "ACK-2025-03-02-001",
  version:   "v1.2",
  hash:      "a7f3e2d",
  timestamp: "2025-03-02T14:32:00Z",
  user:      "Mike Torres",
  role:      "Contractor",
  bomTotal:  28450,
  itemCount: 17,
};

const CURRENT_VERSION = {
  version:   "v1.3",
  hash:      "b9c4f1a",
  bomTotal:  29682,
  itemCount: 19,
  changedAt: "2025-04-07T09:14:00Z",
};

// Re-ack triggers
const BOM_CHANGED   = true;   // hash mismatch between prev and current
const DAYS_SINCE_ACK = 8;     // > 7-day threshold

// Code locks
const CODE_LOCKS = [
  { code: "IRC 2021",       items: 14, status: "pass" },
  { code: "IECC 2021",      items: 4,  status: "pass" },
  { code: "NEC 2020",       items: 0,  status: "na"   },
  { code: "IBC 2021",       items: 16, status: "warn" },
  { code: "Austin 2023",    items: 3,  status: "pass" },
];

// AI assumptions
const ASSUMPTIONS = [
  { label: "Lumber species",       value: "Douglas Fir",        confidence: 95 },
  { label: "Stud OC spacing",      value: "16 in. OC",          confidence: 98 },
  { label: "Roof pitch",           value: "6:12",               confidence: 92 },
  { label: "Floor live load",      value: "40 psf residential", confidence: 99 },
  { label: "Snow load",            value: "N/A (Austin CZ 2A)", confidence: 99 },
  { label: "Treated lumber scope", value: "Sill plates + deck", confidence: 90 },
];

// Legal statements — each must be independently checked
const LEGAL_STATEMENTS = [
  {
    id:    "quantities",
    title: "Quantity Accuracy",
    icon:  <Layers size={14} className="text-slate-500" />,
    short: "I confirm I have reviewed and accept responsibility for all quantities in this BOM.",
    full:  "I confirm that I have personally reviewed this Bill of Materials in its entirety and, to the best of my knowledge and professional judgment, the quantities are accurate for the project at 2847 Oak Ridge Dr, Austin TX. I accept full responsibility for any procurement discrepancies arising from inaccurate or incomplete quantities, including costs of returns, restocking, or additional orders.",
  },
  {
    id:    "codes",
    title: "Code Compliance",
    icon:  <Shield size={14} className="text-slate-500" />,
    short: "I acknowledge the applied building codes and accept compliance responsibility.",
    full:  "I acknowledge that IRC 2021, IECC 2021, NEC 2020, IBC 2021, and Austin Local Amendments 2023 have been applied to this takeoff by the AI system. I understand that I am solely responsible for verifying final compliance with all applicable federal, state, and local codes, regulations, and authority having jurisdiction (AHJ) requirements. The Lumberyard App platform accepts no liability for code non-compliance.",
  },
  {
    id:    "assumptions",
    title: "AI Assumptions Accepted",
    icon:  <Info size={14} className="text-slate-500" />,
    short: "I have reviewed all AI assumptions and accept them as applicable to this project.",
    full:  "I have reviewed the AI-generated assumptions underlying this takeoff (lumber species, on-center spacing, roof pitch, structural load values, and treatment scope). I understand that AI-generated takeoffs are based on probability and pattern recognition, may contain errors or omissions, and do not substitute for a licensed engineer's or architect's review. I accept these assumptions as applicable to this project and release the platform from liability for any errors in AI-generated quantities.",
  },
  {
    id:    "authorization",
    title: "Procurement Authorization",
    icon:  <BadgeCheck size={14} className="text-slate-500" />,
    short: "I am authorized to procure on behalf of this project and accept financial responsibility.",
    full:  "I represent and warrant that I am duly authorized to procure materials on behalf of the project owner of record. I accept full financial responsibility for all materials ordered through this platform pursuant to this Bill of Materials, including any applicable taxes, delivery fees, and platform commissions. All orders placed after acknowledgment are final per the platform terms of service.",
  },
];

// ─── Helper: format timestamp ─────────────────────────────────────────────────

function formatTs(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function daysAgo(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReAckBanner({ type }: { type: "bom-changed" | "expired" }) {
  if (type === "bom-changed") return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
      <RefreshCw size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-amber-800">BOM Updated — Re-acknowledgment Required</div>
        <div className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
          The Bill of Materials has changed since your last acknowledgment{" "}
          <span className="font-mono font-semibold">({PREV_ACK.hash})</span>.
          Current version <span className="font-mono font-semibold">{CURRENT_VERSION.version}</span> adds{" "}
          <strong>2 new items</strong> and a cost change of{" "}
          <strong>+${(CURRENT_VERSION.bomTotal - PREV_ACK.bomTotal).toLocaleString()}</strong>.
          You must re-acknowledge before proceeding.
        </div>
      </div>
      <span className="flex-shrink-0 text-[10px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
        STALE
      </span>
    </div>
  );

  return (
    <div className="flex items-start gap-3 bg-orange-50 border border-orange-300 rounded-xl px-4 py-3">
      <CalendarClock size={15} className="text-orange-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-orange-800">Acknowledgment Expired — {DAYS_SINCE_ACK} Days Since Last Review</div>
        <div className="text-[11px] text-orange-700 mt-0.5 leading-relaxed">
          Platform policy requires re-acknowledgment every <strong>7 days</strong> to ensure
          quantities and code references remain current. Last acknowledged{" "}
          <strong>{DAYS_SINCE_ACK} days ago</strong> on{" "}
          {formatTs(PREV_ACK.timestamp)} by {PREV_ACK.user}.
        </div>
      </div>
      <span className="flex-shrink-0 text-[10px] font-bold bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">
        EXPIRED
      </span>
    </div>
  );
}

function LegalCard({
  stmt, checked, onChange, disabled, expanded, onToggle,
}: {
  stmt: typeof LEGAL_STATEMENTS[0];
  checked: boolean;
  onChange: () => void;
  disabled: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`rounded-xl border transition-all ${
      checked
        ? "border-green-300 bg-green-50/60"
        : disabled
        ? "border-slate-100 bg-slate-50 opacity-60"
        : "border-slate-200 bg-white hover:border-slate-300"
    }`}>
      {/* Main row */}
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Checkbox */}
        <button
          type="button"
          disabled={disabled}
          onClick={onChange}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
            disabled
              ? "border-slate-200 bg-slate-100 cursor-not-allowed"
              : checked
              ? "border-green-600 bg-green-600"
              : "border-slate-300 bg-white hover:border-green-500 cursor-pointer"
          }`}
        >
          {checked && <CheckCircle size={12} className="text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {stmt.icon}
            <span className={`text-xs font-semibold ${checked ? "text-green-800" : "text-slate-800"}`}>
              {stmt.title}
            </span>
            {checked && (
              <span className="ml-auto text-[10px] font-bold text-green-600 flex items-center gap-1">
                <CheckCircle size={9} /> Acknowledged
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{stmt.short}</p>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-4 py-2 border-t border-slate-100 text-[10px] text-slate-400 hover:text-slate-600 hover:bg-slate-50/80 transition-colors"
      >
        {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        {expanded ? "Collapse full legal text" : "Read full legal text"}
      </button>

      {/* Full text */}
      {expanded && (
        <div className="px-4 pb-4">
          <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-3 text-[11px] text-slate-600 leading-relaxed">
            {stmt.full}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ResponsibilityGate() {
  const navigate = useNavigate();

  const [role, setRole]             = useState<Role>("Contractor");
  const [checked, setChecked]       = useState<Record<string, boolean>>({});
  const [expanded, setExpanded]     = useState<Record<string, boolean>>({});
  const [catExpanded, setCatExpanded] = useState<string[]>([]);
  const [proceeding, setProceeding] = useState(false);
  const [done, setDone]             = useState(false);

  const canProceed     = ROLE_CAN_PROCEED[role];
  const allChecked     = LEGAL_STATEMENTS.every(s => checked[s.id]);
  const checkedCount   = LEGAL_STATEMENTS.filter(s => checked[s.id]).length;
  const isReady        = canProceed && allChecked;

  const total       = mockTakeoffItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const withComm    = total * 1.025;

  const categoryTotals = categories.reduce<Record<string, { count: number; total: number }>>((acc, cat) => {
    const items = mockTakeoffItems.filter(i => i.category === cat);
    acc[cat] = { count: items.length, total: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) };
    return acc;
  }, {});

  const toggleCheck = (id: string) => {
    if (!canProceed) return;
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const toggleExpanded = (id: string) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleCat = (cat: string) =>
    setCatExpanded(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const handleProceed = () => {
    if (!isReady) return;
    setProceeding(true);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => navigate("/contractor/preflight"), 900);
    }, 1400);
  };

  // ── Success overlay ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <ShieldCheck size={32} className="text-green-600" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">Responsibility Acknowledged</div>
            <div className="text-sm text-slate-500 mt-1">Record saved · Redirecting to Marketplace…</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
            <Fingerprint size={12} className="text-green-500" />
            ACK-{Date.now().toString(36).toUpperCase()} · {CURRENT_VERSION.version} · {CURRENT_VERSION.hash}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-50 min-h-full">

      {/* ═══════════════════════════════════════════════════════════════
          STICKY TOP BAR
      ══════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 flex-wrap gap-y-2">
          {/* Back */}
          <button
            onClick={() => navigate("/contractor/projects/proj-001/takeoff")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline text-xs">Back to Takeoff</span>
          </button>
          <span className="text-slate-200 text-sm hidden sm:block">|</span>

          {/* Title + lock badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={15} className="text-amber-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500">2847 Oak Ridge Dr · SFR · proj-001</div>
              <div className="text-sm font-bold text-slate-900 leading-tight">Responsibility Gate</div>
            </div>
          </div>

          {/* Blocking badge */}
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-full flex-shrink-0">
            <Lock size={9} /> BLOCKING — Must acknowledge before marketplace
          </span>

          {/* Role selector — pushed right */}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-400 hidden md:block">Viewing as:</span>
            <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
              {(["Contractor", "Homeowner", "Designer"] as Role[]).map(r => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setChecked({}); }}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                    role === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          RE-ACK WARNING BANNERS
      ══════════════════════════════════════════════════════════════════ */}
      {(BOM_CHANGED || DAYS_SINCE_ACK > 7) && (
        <div className="bg-white border-b border-slate-200 px-4 py-3 space-y-2">
          {BOM_CHANGED    && <ReAckBanner type="bom-changed" />}
          {DAYS_SINCE_ACK > 7 && <ReAckBanner type="expired" />}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          DESIGNER ROLE NOTICE — shown when Designer selected
      ══════════════════════════════════════════════════════════════════ */}
      {!canProceed && (
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center gap-3">
          <Lock size={15} className="text-slate-400 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-xs font-bold text-white">Designer Role — Read-Only Access</span>
            <span className="text-xs text-slate-400 ml-2">
              Designers may review this gate but cannot acknowledge or proceed to procurement.
              Only <strong className="text-slate-300">Contractor</strong> or <strong className="text-slate-300">Homeowner</strong> roles may authorize procurement.
            </span>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MAIN TWO-COLUMN LAYOUT
      ══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row items-start">

        {/* ── LEFT: BOM Summary + Codes + Assumptions ─────────────────── */}
        <div className="w-full lg:w-[58%] border-r border-slate-200">

          {/* Section header */}
          <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-2">
            <FileText size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Bill of Materials — Read Only</span>
            <span className="ml-auto text-xs text-slate-400">{CURRENT_VERSION.version} · hash <span className="font-mono">{CURRENT_VERSION.hash}</span></span>
          </div>

          {/* BOM category summary */}
          <div className="bg-white border-b border-slate-200">
            {/* Column headers */}
            <div className="flex items-center gap-3 px-5 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex-1">Category</div>
              <div className="w-16 text-right">Items</div>
              <div className="w-24 text-right">Subtotal</div>
            </div>

            {categories.map(cat => {
              const data = categoryTotals[cat];
              const isOpen = catExpanded.includes(cat);
              const items = mockTakeoffItems.filter(i => i.category === cat);
              return (
                <div key={cat} className="border-b border-slate-50 last:border-0">
                  {/* Category row */}
                  <button
                    onClick={() => toggleCat(cat)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group"
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? "bg-green-100" : "bg-slate-100"}`}>
                      {isOpen
                        ? <ChevronDown size={10} className="text-green-600" />
                        : <ChevronRight size={10} className="text-slate-500" />
                      }
                    </div>
                    <span className="flex-1 text-xs font-semibold text-slate-800 text-left">{cat}</span>
                    <span className="w-16 text-right text-xs text-slate-500">{data.count}</span>
                    <span className="w-24 text-right text-xs font-bold text-slate-800">
                      ${data.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </button>

                  {/* Item drilldown (read-only) */}
                  {isOpen && (
                    <div className="bg-slate-50/80 border-t border-slate-100">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center gap-3 px-5 py-2.5 border-t border-slate-100 first:border-0">
                          <div className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0 ml-1" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] text-slate-700 font-medium truncate">{item.description}</div>
                            <div className="text-[10px] text-slate-400">{item.subcategory}</div>
                          </div>
                          <div className="text-[11px] text-slate-500 text-right flex-shrink-0 w-20">
                            {item.quantity} {item.unit}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-700 text-right flex-shrink-0 w-20">
                            ${(item.unitPrice * item.quantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* BOM totals */}
            <div className="border-t-2 border-slate-200 bg-slate-50 px-5 py-3 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                {mockTakeoffItems.length} items · Platform commission 2.5%{" "}
                <span className="text-slate-400">+${(total * 0.025).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                ${withComm.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          {/* ── Code Locks ─────────────────────────────────────────────── */}
          <div className="bg-white border-b border-slate-200">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
              <Shield size={13} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Code Locks Applied</span>
              <span className="ml-auto text-[10px] text-slate-400">Locked to this version — cannot be changed post-acknowledgment</span>
            </div>
            <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CODE_LOCKS.map(c => (
                <div key={c.code} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${
                  c.status === "pass" ? "bg-green-50 border-green-200" :
                  c.status === "warn" ? "bg-amber-50 border-amber-200" :
                  "bg-slate-50 border-slate-200"
                }`}>
                  {c.status === "pass" ? <CheckCircle size={13} className="text-green-500 flex-shrink-0" /> :
                   c.status === "warn" ? <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" /> :
                   <span className="w-3 h-3 rounded-full border-2 border-slate-300 flex-shrink-0" />}
                  <div className="min-w-0">
                    <div className={`text-[11px] font-bold ${
                      c.status === "pass" ? "text-green-800" :
                      c.status === "warn" ? "text-amber-800" : "text-slate-500"
                    }`}>{c.code}</div>
                    {c.items > 0 && <div className="text-[10px] text-slate-400">{c.items} items</div>}
                    {c.items === 0 && <div className="text-[10px] text-slate-400">Not in scope</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── AI Assumptions ─────────────────────────────────────────── */}
          <div className="bg-white border-b border-slate-200">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
              <Layers size={13} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">AI Assumptions Applied</span>
              <span className="ml-auto text-[10px] text-slate-400">{ASSUMPTIONS.length} assumptions · Review before acknowledging</span>
            </div>
            <div className="px-5 py-4 space-y-2">
              {ASSUMPTIONS.map(a => (
                <div key={a.label} className="flex items-center gap-3 py-1.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    a.confidence >= 95 ? "bg-green-500" :
                    a.confidence >= 90 ? "bg-amber-400" : "bg-red-400"
                  }`} />
                  <span className="text-xs text-slate-500 w-36 flex-shrink-0">{a.label}</span>
                  <span className="text-xs font-semibold text-slate-800 flex-1">{a.value}</span>
                  <span className={`text-[10px] font-bold tabular-nums ${
                    a.confidence >= 95 ? "text-green-600" :
                    a.confidence >= 90 ? "text-amber-600" : "text-red-500"
                  }`}>{a.confidence}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Version info (mobile only — duplicated in right panel on desktop) */}
          <div className="lg:hidden bg-white border-b border-slate-200 px-5 py-4">
            <AckStoreCard />
          </div>

        </div>

        {/* ── RIGHT: Sticky acknowledgment panel ──────────────────────── */}
        <div
          className="hidden lg:flex flex-col w-[42%] sticky bg-white border-l border-slate-200 self-start"
          style={{ top: "57px", height: "calc(100vh - 57px)" }}
        >
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-5">

              {/* Ack store card */}
              <AckStoreCard />

              {/* Legal statements */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={13} className="text-slate-500" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Legal Acknowledgment</span>
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    allChecked ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {checkedCount}/{LEGAL_STATEMENTS.length} accepted
                  </span>
                </div>

                <div className="space-y-2.5">
                  {LEGAL_STATEMENTS.map(stmt => (
                    <LegalCard
                      key={stmt.id}
                      stmt={stmt}
                      checked={!!checked[stmt.id]}
                      onChange={() => toggleCheck(stmt.id)}
                      disabled={!canProceed}
                      expanded={!!expanded[stmt.id]}
                      onToggle={() => toggleExpanded(stmt.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Role restriction notice */}
              {!canProceed && (
                <div className="flex items-start gap-3 bg-slate-100 rounded-xl px-4 py-3">
                  <Lock size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-600">Designer Role Cannot Acknowledge</div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Switch to <strong>Contractor</strong> or <strong>Homeowner</strong> role above to enable acknowledgment and proceed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky CTA footer */}
          <div className="flex-shrink-0 border-t-2 border-slate-200 bg-white px-5 py-4">
            {/* Progress bar */}
            {!allChecked && canProceed && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-slate-500">Acknowledgment progress</span>
                  <span className="text-[10px] font-bold text-slate-700">{checkedCount} / {LEGAL_STATEMENTS.length}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${(checkedCount / LEGAL_STATEMENTS.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Proceed button */}
            <button
              onClick={handleProceed}
              disabled={!isReady || proceeding}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                !canProceed
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : isReady && !proceeding
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {proceeding ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  Generating acknowledgment record…
                </>
              ) : !canProceed ? (
                <><Lock size={15} /> Acknowledgment Restricted</>
              ) : !allChecked ? (
                <>Accept all {LEGAL_STATEMENTS.length} statements to continue</>
              ) : (
                <><ShieldCheck size={15} /> Acknowledge &amp; Proceed to Marketplace <ArrowRight size={14} /></>
              )}
            </button>

            {isReady && !proceeding && (
              <p className="text-center text-[10px] text-slate-400 mt-2 leading-relaxed">
                By clicking, a timestamped acknowledgment record will be created for{" "}
                <strong className="text-slate-600">{role} · {CURRENT_VERSION.version} · {CURRENT_VERSION.hash}</strong>.
                This action cannot be undone.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* ── Mobile: Legal + CTA at bottom ───────────────────────────── */}
      <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-5 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen size={13} className="text-slate-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Legal Acknowledgment</span>
          <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
            allChecked ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
          }`}>{checkedCount}/{LEGAL_STATEMENTS.length} accepted</span>
        </div>
        <div className="space-y-3">
          {LEGAL_STATEMENTS.map(stmt => (
            <LegalCard
              key={stmt.id}
              stmt={stmt}
              checked={!!checked[stmt.id]}
              onChange={() => toggleCheck(stmt.id)}
              disabled={!canProceed}
              expanded={!!expanded[stmt.id]}
              onToggle={() => toggleExpanded(stmt.id)}
            />
          ))}
        </div>
        {!canProceed && (
          <div className="flex items-start gap-3 bg-slate-100 rounded-xl px-4 py-3">
            <Lock size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Switch to <strong>Contractor</strong> or <strong>Homeowner</strong> role to proceed.
            </p>
          </div>
        )}
        {!allChecked && canProceed && (
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${(checkedCount / LEGAL_STATEMENTS.length) * 100}%` }}
            />
          </div>
        )}
        <button
          onClick={handleProceed}
          disabled={!isReady || proceeding}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-sm transition-all ${
            isReady && !proceeding
              ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {proceeding ? (
            <><RefreshCw size={15} className="animate-spin" /> Generating record…</>
          ) : !canProceed ? (
            <><Lock size={15} /> Restricted</>
          ) : !allChecked ? (
            <>Accept all {LEGAL_STATEMENTS.length} statements</>
          ) : (
            <><ShieldCheck size={15} /> Acknowledge &amp; Proceed <ArrowRight size={14} /></>
          )}
        </button>
      </div>

    </div>
  );
}

// ─── Acknowledgment Store Card (extracted so it renders in both mobile + desktop) ──

function AckStoreCard() {
  const daysDiff = daysAgo(PREV_ACK.timestamp);
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <Fingerprint size={14} className="text-slate-500" />
        <span className="text-xs font-bold text-slate-700">Acknowledgment Record</span>
      </div>

      {/* Previous ack */}
      <div className={`px-4 py-3 border-b ${BOM_CHANGED || daysDiff > 7 ? "border-amber-100 bg-amber-50/40" : "border-slate-100"}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            BOM_CHANGED || daysDiff > 7
              ? "bg-amber-200 text-amber-800"
              : "bg-green-100 text-green-700"
          }`}>
            {BOM_CHANGED || daysDiff > 7 ? "STALE" : "VALID"}
          </span>
          <span className="text-[10px] text-slate-400">Previous acknowledgment</span>
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <Hash size={10} className="text-slate-300 flex-shrink-0" />
            <span className="text-slate-500 w-20 flex-shrink-0">Ack ID</span>
            <span className="font-mono text-slate-600 text-[10px] truncate">{PREV_ACK.ackId}</span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw size={10} className="text-slate-300 flex-shrink-0" />
            <span className="text-slate-500 w-20 flex-shrink-0">Version</span>
            <span className="font-mono font-bold text-slate-700">{PREV_ACK.version}</span>
            <span className="font-mono text-slate-400 text-[10px]">· hash {PREV_ACK.hash}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={10} className="text-slate-300 flex-shrink-0" />
            <span className="text-slate-500 w-20 flex-shrink-0">Timestamp</span>
            <span className="text-slate-600">{formatTs(PREV_ACK.timestamp)}</span>
          </div>
          <div className="flex items-center gap-2">
            <User size={10} className="text-slate-300 flex-shrink-0" />
            <span className="text-slate-500 w-20 flex-shrink-0">Acknowledged</span>
            <span className="text-slate-600">{PREV_ACK.user}</span>
            <span className="text-slate-400">· {PREV_ACK.role}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText size={10} className="text-slate-300 flex-shrink-0" />
            <span className="text-slate-500 w-20 flex-shrink-0">BOM Total</span>
            <span className="text-slate-600">${PREV_ACK.bomTotal.toLocaleString()} · {PREV_ACK.itemCount} items</span>
          </div>
        </div>
        {(BOM_CHANGED || daysDiff > 7) && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-700">
            <AlertTriangle size={9} />
            {BOM_CHANGED && "BOM hash mismatch"}{BOM_CHANGED && daysDiff > 7 && " · "}{daysDiff > 7 && `${daysDiff} days elapsed`} — re-acknowledgment required
          </div>
        )}
      </div>

      {/* Current version */}
      <div className="px-4 py-3 bg-blue-50/40 border-b border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">CURRENT</span>
          <span className="text-[10px] text-slate-400">Pending acknowledgment</span>
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <RotateCcw size={10} className="text-blue-300 flex-shrink-0" />
            <span className="text-slate-500 w-20 flex-shrink-0">Version</span>
            <span className="font-mono font-bold text-blue-700">{CURRENT_VERSION.version}</span>
            <span className="font-mono text-slate-400 text-[10px]">· hash {CURRENT_VERSION.hash}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText size={10} className="text-blue-300 flex-shrink-0" />
            <span className="text-slate-500 w-20 flex-shrink-0">BOM Total</span>
            <span className="text-slate-600">${CURRENT_VERSION.bomTotal.toLocaleString()} · {CURRENT_VERSION.itemCount} items</span>
            <span className="text-green-600 font-semibold text-[10px]">
              +${(CURRENT_VERSION.bomTotal - PREV_ACK.bomTotal).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={10} className="text-blue-300 flex-shrink-0" />
            <span className="text-slate-500 w-20 flex-shrink-0">Updated</span>
            <span className="text-slate-600">{formatTs(CURRENT_VERSION.changedAt)}</span>
          </div>
        </div>
      </div>

      {/* Footnote */}
      <div className="px-4 py-2.5 bg-slate-50">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Acknowledgment records are immutable. Each version generates a unique ID, timestamp, and BOM hash stored with the project audit trail.
        </p>
      </div>
    </div>
  );
}