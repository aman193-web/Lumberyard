import React, { useState } from "react";
import {
  Download, FileText, ShoppingCart, MessageSquare, Truck, Star,
  CheckCircle, Clock, Package, Shield, AlertTriangle, ChevronDown,
  ChevronUp, Lock, Hash, User, Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CaseTab = "overview" | "bom" | "orders" | "messages" | "deliveries" | "reviews";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const BOM_ITEMS = [
  { sku: "LBR-2×4-16", desc: "2×4 KD Lumber 16′",          phase: "Framing",             qty: 120, unit: "EA",  unit_cost: 8.40,  total: 1008 },
  { sku: "LBR-2×6-8",  desc: "2×6 KD Lumber 8′",           phase: "Framing",             qty: 60,  unit: "EA",  unit_cost: 7.20,  total: 432  },
  { sku: "EWP-LVL",    desc: "LVL Beam 3.5″×14″",          phase: "Framing",             qty: 4,   unit: "EA",  unit_cost: 284,   total: 1136 },
  { sku: "PLY-OSB",    desc: "OSB 7/16″ 4×8",              phase: "Sheathing",           qty: 48,  unit: "SHT", unit_cost: 22.50, total: 1080 },
  { sku: "PLY-CDX",    desc: "CDX Plywood 3/4″ 4×8",       phase: "Sheathing",           qty: 60,  unit: "SHT", unit_cost: 38.00, total: 2280 },
  { sku: "HBD-ZIP",    desc: "ZIP System Sheathing 4×8",   phase: "Sheathing",           qty: 30,  unit: "SHT", unit_cost: 44.00, total: 1320 },
  { sku: "CMT-3000",   desc: "Ready-Mix Concrete 3000 PSI",phase: "Foundation",          qty: 6,   unit: "CY",  unit_cost: 148,   total: 888  },
  { sku: "RBR-#4",     desc: "Rebar #4 20′",               phase: "Foundation",          qty: 48,  unit: "EA",  unit_cost: 12.50, total: 600  },
  { sku: "RF-SHNG",    desc: "Arch Shingles 30yr",         phase: "Roofing",             qty: 18,  unit: "SQ",  unit_cost: 112,   total: 2016 },
  { sku: "SID-HBK",    desc: "HardiePlank Siding 5/4×6",  phase: "Exterior",            qty: 80,  unit: "EA",  unit_cost: 18.80, total: 1504 },
  { sku: "INS-R19",    desc: "R-19 Batt Insulation 15″",  phase: "Insulation",          qty: 20,  unit: "BG",  unit_cost: 32.00, total: 640  },
  { sku: "FTN-16D",    desc: "16d Common Nails 50lb",      phase: "Insulation",          qty: 4,   unit: "BX",  unit_cost: 48.00, total: 192  },
];

const PURCHASE_ORDERS = [
  { id: "PO-2026-0041", date: "Mar 28, 2026", supplier: "Austin Timber Supply",  phase: "Foundation",  items: 3,  value: 6200,  status: "invoiced",  invoice: "INV-8812" },
  { id: "PO-2026-0052", date: "Apr 08, 2026", supplier: "Austin Timber Supply",  phase: "Framing",     items: 5,  value: 14800, status: "invoiced",  invoice: "INV-8847" },
  { id: "PO-2026-0063", date: "Apr 14, 2026", supplier: "Hill Country Lumber",   phase: "Sheathing",   items: 3,  value: 9200,  status: "confirmed", invoice: null },
  { id: "PO-2026-0071", date: "Apr 18, 2026", supplier: "Central TX Lumber Co",  phase: "Exterior",    items: 3,  value: 7400,  status: "pending",   invoice: null },
  { id: "PO-2026-0085", date: "Apr 20, 2026", supplier: "Austin Timber Supply",  phase: "Roofing",     items: 3,  value: 5800,  status: "pending",   invoice: null },
  { id: "PO-2026-0092", date: "Apr 24, 2026", supplier: "Hill Country Lumber",   phase: "Insulation",  items: 3,  value: 4200,  status: "pending",   invoice: null },
];

const MESSAGES = [
  { id: "m1", from: "Austin Timber Supply", role: "lumberyard", ts: "Apr 8, 2026 · 9:14 AM",  body: "PO-2026-0052 confirmed. Framing package ready for dispatch Mon Apr 14." },
  { id: "m2", from: "Mike Torres",          role: "contractor", ts: "Apr 8, 2026 · 9:31 AM",  body: "Perfect. Please have driver call site super 30 min before arrival." },
  { id: "m3", from: "Austin Timber Supply", role: "lumberyard", ts: "Apr 8, 2026 · 9:45 AM",  body: "Noted — driver Carlos will call ahead. Tracking link will be sent morning of delivery." },
  { id: "m4", from: "Hill Country Lumber",  role: "lumberyard", ts: "Apr 14, 2026 · 2:02 PM", body: "Sheathing order PO-2026-0063 confirmed. Scheduled Apr 17, 10 AM–12 PM." },
  { id: "m5", from: "Mike Torres",          role: "contractor", ts: "Apr 14, 2026 · 2:18 PM", body: "Thanks. Gate code is 4821. Stack panels on the north side of the lot." },
  { id: "m6", from: "Austin Timber Supply", role: "lumberyard", ts: "Apr 14, 2026 · 4:05 PM", body: "Your framing delivery is en route. ETA ~35 min. Driver: Carlos Vega · TRK-8842." },
];

const DELIVERY_LOGS = [
  { id: "del-001", phase: "Foundation",  date: "Apr 10, 2026", supplier: "Austin Timber Supply", driver: "Ray Morales",  stage: "delivered", value: 6200,  rating: 9.2, pod: true  },
  { id: "del-002", phase: "Framing",     date: "Apr 14, 2026", supplier: "Austin Timber Supply", driver: "Carlos Vega",  stage: "in-transit",value: 14800, rating: null,pod: false },
  { id: "del-003", phase: "Sheathing",   date: "Apr 17, 2026", supplier: "Hill Country Lumber",  driver: null,           stage: "confirmed", value: 9200,  rating: null,pod: false },
  { id: "del-004", phase: "Exterior",    date: "Apr 22, 2026", supplier: "Central TX Lumber Co", driver: null,           stage: "created",   value: 7400,  rating: null,pod: false },
  { id: "del-005", phase: "Roofing",     date: "Apr 25, 2026", supplier: "Austin Timber Supply", driver: null,           stage: "created",   value: 5800,  rating: null,pod: false },
  { id: "del-006", phase: "Insulation",  date: "Apr 30, 2026", supplier: "Hill Country Lumber",  driver: null,           stage: "created",   value: 4200,  rating: null,pod: false },
];

const REVIEWS = [
  {
    id: "rev-001", deliveryId: "del-001", phase: "Foundation", supplier: "Austin Timber Supply",
    date: "Apr 10, 2026", score: 9.2, recommend: true,
    breakdown: [
      { cat: "Materials Protection", score: 9, weight: 2 },
      { cat: "Placement Accuracy",   score: 10, weight: 1 },
      { cat: "Punctuality",          score: 9,  weight: 1 },
      { cat: "Communication",        score: 9,  weight: 1 },
      { cat: "Order Accuracy",       score: 10, weight: 1 },
      { cat: "Material Quality",     score: 9,  weight: 1 },
      { cat: "Driver Professionalism",score: 9, weight: 1 },
      { cat: "Documentation",        score: 9,  weight: 1 },
      { cat: "Site Condition",        score: 8,  weight: 1 },
    ],
    comment: "Ray and crew were excellent. Concrete and rebar placed exactly where marked. No damage.",
  },
];

const AUDIT_EVENTS = [
  { id: "a01", ts: "Apr 10, 2026 · 4:42 PM", actor: "Mike Torres",          type: "review",    icon: <Star size={13} />,         color: "text-amber-600 bg-amber-50 border-amber-200",    label: "Review submitted",         detail: "Foundation delivery · Score 9.2/10" },
  { id: "a02", ts: "Apr 10, 2026 · 11:08 AM",actor: "System",               type: "pod",       icon: <CheckCircle size={13} />,  color: "text-green-600 bg-green-50 border-green-200",    label: "POD signed off",           detail: "3 photos captured · del-001" },
  { id: "a03", ts: "Apr 10, 2026 · 7:53 AM", actor: "Ray Morales",          type: "delivery",  icon: <Truck size={13} />,        color: "text-blue-600 bg-blue-50 border-blue-200",       label: "Delivery marked complete",  detail: "Foundation · PO-2026-0041" },
  { id: "a04", ts: "Apr 8, 2026 · 9:14 AM",  actor: "Austin Timber Supply", type: "po",        icon: <FileText size={13} />,     color: "text-slate-600 bg-slate-50 border-slate-200",    label: "PO confirmed by supplier",  detail: "PO-2026-0052 · $14,800" },
  { id: "a05", ts: "Apr 8, 2026 · 8:02 AM",  actor: "Mike Torres",          type: "po",        icon: <ShoppingCart size={13} />, color: "text-slate-600 bg-slate-50 border-slate-200",    label: "Purchase order created",    detail: "PO-2026-0052 · Framing package" },
  { id: "a06", ts: "Apr 1, 2026 · 3:17 PM",  actor: "System",               type: "bom",       icon: <Package size={13} />,      color: "text-violet-600 bg-violet-50 border-violet-200", label: "BOM generated from takeoff", detail: "12 line items · $47,076 total" },
  { id: "a07", ts: "Mar 28, 2026 · 10:00 AM",actor: "James Chen, PE",       type: "approved",  icon: <Shield size={13} />,       color: "text-green-600 bg-green-50 border-green-200",    label: "Takeoff approved",          detail: "Architect sign-off · v2.1" },
  { id: "a08", ts: "Mar 28, 2026 · 8:55 AM", actor: "Mike Torres",          type: "project",   icon: <Zap size={13} />,          color: "text-slate-600 bg-slate-50 border-slate-200",    label: "Project case file opened",  detail: "418 Willow Creek Ln" },
];

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS: { id: CaseTab; label: string; icon: React.ReactNode; count?: number }[] = [
  { id: "overview",   label: "Overview",   icon: <Hash size={14} /> },
  { id: "bom",        label: "BOM",        icon: <Package size={14} />,      count: BOM_ITEMS.length },
  { id: "orders",     label: "Orders",     icon: <ShoppingCart size={14} />, count: PURCHASE_ORDERS.length },
  { id: "messages",   label: "Messages",   icon: <MessageSquare size={14} />,count: MESSAGES.length },
  { id: "deliveries", label: "Deliveries", icon: <Truck size={14} />,        count: DELIVERY_LOGS.length },
  { id: "reviews",    label: "Reviews",    icon: <Star size={14} />,         count: REVIEWS.length },
];

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    invoiced:   "bg-green-50 text-green-700 border-green-200",
    confirmed:  "bg-blue-50 text-blue-700 border-blue-200",
    pending:    "bg-slate-50 text-slate-600 border-slate-200",
    delivered:  "bg-green-50 text-green-700 border-green-200",
    "in-transit": "bg-amber-50 text-amber-700 border-amber-200",
    created:    "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${map[status] ?? "bg-slate-50 text-slate-500 border-slate-200"}`}>
      {status.replace("-", " ")}
    </span>
  );
}

// ─── BOM Tab ──────────────────────────────────────────────────────────────────

function BOMTab() {
  const phases = Array.from(new Set(BOM_ITEMS.map(i => i.phase)));
  const grandTotal = BOM_ITEMS.reduce((s, i) => s + i.total, 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs text-slate-500">Grand Total</div>
          <div className="text-xl font-bold text-slate-900">${grandTotal.toLocaleString()}</div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Lock size={11} /> Immutable after architect sign-off
        </div>
      </div>

      {phases.map(phase => {
        const items = BOM_ITEMS.filter(i => i.phase === phase);
        const phaseTotal = items.reduce((s, i) => s + i.total, 0);
        return (
          <div key={phase} className="border border-slate-100 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">{phase}</span>
              <span className="text-xs font-semibold text-slate-500">${phaseTotal.toLocaleString()}</span>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wide">
                  <th className="text-left px-4 py-2">SKU</th>
                  <th className="text-left px-4 py-2">Description</th>
                  <th className="text-right px-4 py-2">Qty</th>
                  <th className="text-right px-4 py-2">Unit</th>
                  <th className="text-right px-4 py-2">Unit $</th>
                  <th className="text-right px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.sku} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-slate-500">{item.sku}</td>
                    <td className="px-4 py-2.5 text-slate-800">{item.desc}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{item.qty}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500">{item.unit}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">${item.unit_cost.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-900">${item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab() {
  const total = PURCHASE_ORDERS.reduce((s, p) => s + p.value, 0);
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-500">Total committed: <span className="font-bold text-slate-900">${total.toLocaleString()}</span></div>
      </div>
      {PURCHASE_ORDERS.map(po => (
        <div key={po.id} className="border border-slate-100 rounded-2xl p-4 bg-white">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 font-mono">{po.id}</span>
                <StatusBadge status={po.status} />
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{po.supplier} · {po.phase}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900">${po.value.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">{po.items} items</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>{po.date}</span>
            {po.invoice && (
              <span className="flex items-center gap-1 text-green-700 font-semibold">
                <CheckCircle size={10} /> {po.invoice}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Messages Tab ─────────────────────────────────────────────────────────────

function MessagesTab() {
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-4 w-fit">
        <Lock size={11} /> Messages are archived and cannot be edited
      </div>
      {MESSAGES.map(msg => (
        <div key={msg.id} className={`flex gap-3 ${msg.role === "contractor" ? "flex-row-reverse" : ""}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${msg.role === "contractor" ? "bg-blue-500" : "bg-amber-500"}`}>
            {msg.from.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className={`max-w-sm ${msg.role === "contractor" ? "items-end" : "items-start"} flex flex-col`}>
            <div className="text-[10px] text-slate-400 mb-1">{msg.from} · {msg.ts}</div>
            <div className={`text-xs px-4 py-2.5 rounded-2xl ${msg.role === "contractor" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-800"}`}>
              {msg.body}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Deliveries Tab ───────────────────────────────────────────────────────────

function DeliveriesTab() {
  return (
    <div className="p-6 space-y-3">
      {DELIVERY_LOGS.map(dl => (
        <div key={dl.id} className="border border-slate-100 rounded-2xl p-4 bg-white flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dl.stage === "delivered" ? "bg-green-500" : dl.stage === "in-transit" ? "bg-amber-400 animate-pulse" : "bg-slate-300"}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold text-slate-900">{dl.phase}</span>
              <StatusBadge status={dl.stage} />
              {dl.pod && <span className="text-[10px] text-green-700 font-semibold bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">POD</span>}
            </div>
            <div className="text-[10px] text-slate-400">{dl.supplier} {dl.driver ? `· ${dl.driver}` : ""} · {dl.date}</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-semibold text-slate-900">${dl.value.toLocaleString()}</div>
            {dl.rating !== null && (
              <div className="text-[10px] text-amber-600 font-semibold">{dl.rating}/10</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────

function ReviewsTab() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="p-6 space-y-4">
      {REVIEWS.map(rev => (
        <div key={rev.id} className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
          <button
            onClick={() => setOpen(open === rev.id ? null : rev.id)}
            className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-bold text-slate-900">{rev.phase} Delivery</span>
                <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">{rev.score}/10</span>
                {rev.recommend && <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">Recommended</span>}
              </div>
              <div className="text-[10px] text-slate-400">{rev.supplier} · {rev.date}</div>
            </div>
            {open === rev.id ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
          </button>
          {open === rev.id && (
            <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {rev.breakdown.map(b => (
                  <div key={b.cat} className="bg-slate-50 rounded-xl p-3">
                    <div className="text-[10px] text-slate-500 mb-1">{b.cat} {b.weight === 2 && <span className="text-amber-600 font-bold">×2</span>}</div>
                    <div className="text-lg font-bold text-slate-900">{b.score}<span className="text-xs text-slate-400 font-normal">/10</span></div>
                  </div>
                ))}
              </div>
              {rev.comment && (
                <div className="bg-slate-50 rounded-xl px-4 py-3 text-xs text-slate-600 italic">"{rev.comment}"</div>
              )}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <Lock size={10} /> Submitted Apr 10, 2026 · immutable record
              </div>
            </div>
          )}
        </div>
      ))}
      {REVIEWS.length < DELIVERY_LOGS.filter(d => d.stage === "delivered").length && (
        <div className="border border-amber-200 bg-amber-50 rounded-2xl px-5 py-4 flex items-center gap-3">
          <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-amber-800">{DELIVERY_LOGS.filter(d => d.stage === "delivered").length - REVIEWS.length} delivered shipment(s) still awaiting review</span>
        </div>
      )}
    </div>
  );
}

// ─── Audit Timeline ───────────────────────────────────────────────────────────

function AuditTimeline() {
  return (
    <div className="px-6 pb-6 pt-2">
      <div className="flex items-center gap-2 mb-4">
        <Lock size={13} className="text-slate-400" />
        <span className="text-xs font-semibold text-slate-500">Immutable audit log — tamper-evident, append-only</span>
      </div>
      <div className="relative">
        <div className="absolute left-[17px] top-0 bottom-0 w-px bg-slate-100" />
        <div className="space-y-3">
          {AUDIT_EVENTS.map(ev => (
            <div key={ev.id} className="flex gap-3 relative">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 z-10 ${ev.color}`}>
                {ev.icon}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-900">{ev.label}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{ev.detail}</div>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                  <User size={9} />{ev.actor}
                  <span>·</span>
                  <Clock size={9} />{ev.ts}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const totalValue   = PURCHASE_ORDERS.reduce((s, p) => s + p.value, 0);
  const deliveredVal = DELIVERY_LOGS.filter(d => d.stage === "delivered").reduce((s, d) => s + d.value, 0);
  const avgScore     = REVIEWS.length ? (REVIEWS.reduce((s, r) => s + r.score, 0) / REVIEWS.length).toFixed(1) : "—";

  const STATS = [
    { label: "Total BOM",      value: `$${totalValue.toLocaleString()}`,        sub: `${BOM_ITEMS.length} line items` },
    { label: "Value Delivered",value: `$${deliveredVal.toLocaleString()}`,       sub: `${DELIVERY_LOGS.filter(d => d.stage === "delivered").length} of ${DELIVERY_LOGS.length} deliveries` },
    { label: "Avg Review",     value: `${avgScore}/10`,                          sub: `${REVIEWS.length} review${REVIEWS.length !== 1 ? "s" : ""} submitted` },
    { label: "Open POs",       value: `${PURCHASE_ORDERS.filter(p => p.status === "pending").length}`, sub: "awaiting confirmation" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-slate-500 mb-1">{s.label}</div>
            <div className="text-xl font-bold text-slate-900">{s.value}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Delivery phase progress */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <div className="text-xs font-bold text-slate-700 mb-4">Phase Delivery Progress</div>
        <div className="space-y-3">
          {DELIVERY_LOGS.map((dl, idx) => (
            <div key={dl.id} className="flex items-center gap-3">
              <div className="w-28 text-[10px] text-slate-500 truncate">{dl.phase}</div>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    dl.stage === "delivered"  ? "bg-green-500 w-full"
                    : dl.stage === "in-transit" ? "bg-amber-400 w-2/3"
                    : dl.stage === "confirmed"  ? "bg-blue-400 w-1/3"
                    : "w-0"
                  }`}
                />
              </div>
              <StatusBadge status={dl.stage} />
              <div className="w-16 text-right text-[10px] font-semibold text-slate-600">${(dl.value / 1000).toFixed(1)}K</div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit timeline */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="text-xs font-bold text-slate-700">Audit Timeline</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Complete immutable history of all project actions</div>
        </div>
        <AuditTimeline />
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function CaseFile() {
  const [tab, setTab] = useState<CaseTab>("overview");
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 1800);
  };

  const content: Record<CaseTab, React.ReactNode> = {
    overview:   <OverviewTab />,
    bom:        <BOMTab />,
    orders:     <OrdersTab />,
    messages:   <MessagesTab />,
    deliveries: <DeliveriesTab />,
    reviews:    <ReviewsTab />,
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-white flex-shrink-0">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Case File</h1>
            <p className="text-sm text-slate-500 mt-0.5">418 Willow Creek Ln · Cedar Park, TX · Complete project record</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-60"
          >
            <Download size={14} />
            {exporting ? "Exporting…" : "Export Bundle"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                tab === t.id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {t.icon}
              {t.label}
              {t.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {content[tab]}
      </div>
    </div>
  );
}
