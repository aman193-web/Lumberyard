import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  FileText, Clock, CheckCircle, AlertTriangle, ChevronRight,
  Search, Filter, MapPin, Calendar, Package, DollarSign,
  ChevronDown, Timer, Zap, BadgeCheck, ShieldCheck, Flag,
  Layers, Truck, Info, X, CircleDot, Hash, ArrowRight,
  CheckCheck, AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "exception-window" | "active" | "completed";

interface OrderLineItem {
  category: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface IncomingOrder {
  id: string;
  jobsiteAddress: string;
  city: string;
  state: string;
  projectType: string;
  phaseName: string;
  phaseNumber: number;
  totalPhases: number;
  itemCount: number;
  deliveryDate: string;         // "YYYY-MM-DD"
  deliveryDateDisplay: string;  // "Apr 28, 2026"
  deliveryWindow: string;       // "7:00–10:00 AM"
  subtotal: number;
  deliveryFee: number;
  status: OrderStatus;
  receivedMins: number;         // minutes since order was received
  autoConfirmed: boolean;
  notes?: string;
  flagged?: boolean;
  flagReason?: string;
  items: OrderLineItem[];
}

// ─── Mock incoming orders ─────────────────────────────────────────────────────

const INCOMING_ORDERS: IncomingOrder[] = [
  {
    id: "ORD-2026-0041",
    jobsiteAddress: "2847 Oak Ridge Dr",
    city: "Austin", state: "TX 78701",
    projectType: "Single Family Residence",
    phaseName: "Framing",
    phaseNumber: 2, totalPhases: 7,
    itemCount: 14,
    deliveryDate: "2026-04-28",
    deliveryDateDisplay: "Apr 28, 2026",
    deliveryWindow: "7:00–10:00 AM",
    subtotal: 47090, deliveryFee: 320,
    status: "exception-window",
    receivedMins: 1170,
    autoConfirmed: true,
    notes: "Kiln-dried #2 BTR or better required on all dimensional lumber. LVL beams must meet IBC §2308 span tables. Confirm ridge beam is 3.5×14 per updated takeoff.",
    items: [
      { category: "Framing Lumber", description: "2×6 DF #2 KD Studs 8'",         qty: 320, unit: "EA",  unitPrice: 8.45,  total: 2704 },
      { category: "Framing Lumber", description: "2×10 DF #2 KD Joists 16'",       qty: 84,  unit: "EA",  unitPrice: 22.50, total: 1890 },
      { category: "Framing Lumber", description: "2×4 SPF Stud 92-5/8\"",         qty: 480, unit: "EA",  unitPrice: 5.20,  total: 2496 },
      { category: "Framing Lumber", description: "2×12 DF #2 Rim Board 16'",       qty: 28,  unit: "EA",  unitPrice: 38.00, total: 1064 },
      { category: "Engineered Wood", description: "LVL 3.5×9.5\" 20' Beam",        qty: 6,   unit: "EA",  unitPrice: 285,   total: 1710 },
      { category: "Engineered Wood", description: "LVL 3.5×14\" 20' Ridge Beam",   qty: 2,   unit: "EA",  unitPrice: 410,   total: 820  },
      { category: "Engineered Wood", description: "PSL 3.5×9.5\" 10' Post",        qty: 4,   unit: "EA",  unitPrice: 195,   total: 780  },
      { category: "Sheathing",       description: "OSB 7/16\" 4×8 Struct. Sheathing", qty: 96,  unit: "SHT", unitPrice: 32.00, total: 3072 },
      { category: "Hardware",        description: "HDU Holdowns Simpson Strong-Tie", qty: 12,  unit: "EA",  unitPrice: 48.50, total: 582  },
      { category: "Hardware",        description: "Joist Hangers LUS210",           qty: 160, unit: "EA",  unitPrice: 3.80,  total: 608  },
      { category: "Hardware",        description: "Hurricane Ties H2.5A",           qty: 240, unit: "EA",  unitPrice: 2.10,  total: 504  },
      { category: "Hardware",        description: "Structural Screws 3\" 2lb Box",  qty: 24,  unit: "BOX", unitPrice: 18.00, total: 432  },
      { category: "Hardware",        description: "16d Nails Galv 50lb",           qty: 8,   unit: "BOX", unitPrice: 95.00, total: 760  },
      { category: "Hardware",        description: "Post Bases ABA66",               qty: 4,   unit: "EA",  unitPrice: 42.00, total: 168  },
    ],
  },
  {
    id: "ORD-2026-0040",
    jobsiteAddress: "9102 Cedar Bluff Ct",
    city: "Round Rock", state: "TX 78681",
    projectType: "ADU Addition",
    phaseName: "Exterior & Siding",
    phaseNumber: 5, totalPhases: 7,
    itemCount: 7,
    deliveryDate: "2026-05-26",
    deliveryDateDisplay: "May 26, 2026",
    deliveryWindow: "8:00–11:00 AM",
    subtotal: 22100, deliveryFee: 280,
    status: "exception-window",
    receivedMins: 210,
    autoConfirmed: true,
    notes: "Please confirm HardiePlank availability — last order had 3-week lead time. Coordinate with site super.",
    items: [
      { category: "Siding",     description: "HardiePlank 5/4×6 ColorPlus 12'",   qty: 480, unit: "LF",  unitPrice: 2.80, total: 1344 },
      { category: "Siding",     description: "HardieTrim 1×4 Primed 16'",         qty: 96,  unit: "EA",  unitPrice: 14.50, total: 1392 },
      { category: "Siding",     description: "Fiber Cement Corner 5/4×5/4 10'",   qty: 32,  unit: "EA",  unitPrice: 18.00, total: 576  },
      { category: "Fascia",     description: "Cedar Fascia 2×8 16' Clear",        qty: 48,  unit: "EA",  unitPrice: 52.00, total: 2496 },
      { category: "Soffit",     description: "Vented Soffit Panel 12\" × 12'",    qty: 84,  unit: "EA",  unitPrice: 28.00, total: 2352 },
      { category: "Trim",       description: "Aluminum Drip Edge 10' White",       qty: 36,  unit: "EA",  unitPrice: 8.50,  total: 306  },
      { category: "Wrap",       description: "Housewrap 9' × 100' Roll",          qty: 4,   unit: "ROLL",unitPrice: 148,   total: 592  },
    ],
  },
  {
    id: "ORD-2026-0038",
    jobsiteAddress: "14 Lakewood Trail",
    city: "Austin", state: "TX 78734",
    projectType: "Single Family Residence",
    phaseName: "Interior",
    phaseNumber: 4, totalPhases: 7,
    itemCount: 18,
    deliveryDate: "2026-05-19",
    deliveryDateDisplay: "May 19, 2026",
    deliveryWindow: "9:00 AM–12:00 PM",
    subtotal: 14800, deliveryFee: 260,
    status: "active",
    receivedMins: 2880,
    autoConfirmed: true,
    notes: "Deliver to side entrance only — narrow driveway. Flatbed preferred.",
    items: [
      { category: "Drywall",    description: "5/8\" Type X Drywall 4×8",           qty: 120, unit: "SHT", unitPrice: 18.00, total: 2160 },
      { category: "Drywall",    description: "1/2\" Standard Drywall 4×12",        qty: 64,  unit: "SHT", unitPrice: 14.50, total: 928  },
      { category: "Insulation", description: "R-19 Kraft-Faced Batt 15\" × 39'",  qty: 32,  unit: "BAG", unitPrice: 48.00, total: 1536 },
      { category: "Insulation", description: "R-38 Blown-In Fiberglass 25lb",      qty: 18,  unit: "BAG", unitPrice: 28.00, total: 504  },
      { category: "Interior",   description: "Interior Door Slab 2-8×6-8 Hollow", qty: 14,  unit: "EA",  unitPrice: 95.00, total: 1330 },
      { category: "Interior",   description: "Prehung Interior Door 2-6×6-8",     qty: 4,   unit: "EA",  unitPrice: 185,   total: 740  },
    ],
  },
  {
    id: "ORD-2026-0034",
    jobsiteAddress: "418 Willow Creek Ln",
    city: "Cedar Park", state: "TX 78613",
    projectType: "Outdoor Structure",
    phaseName: "Foundation",
    phaseNumber: 1, totalPhases: 5,
    itemCount: 8,
    deliveryDate: "2026-04-10",
    deliveryDateDisplay: "Apr 10, 2026",
    deliveryWindow: "7:00–9:00 AM",
    subtotal: 4820, deliveryFee: 180,
    status: "completed",
    receivedMins: 5760,
    autoConfirmed: true,
    items: [
      { category: "Concrete", description: "Concrete Mix 80lb Bags",         qty: 48,  unit: "BAG", unitPrice: 8.50,  total: 408  },
      { category: "Concrete", description: "Rebar #4 20' Stick",             qty: 24,  unit: "EA",  unitPrice: 14.00, total: 336  },
      { category: "Concrete", description: "Form Board 2×10×12' KD",        qty: 36,  unit: "EA",  unitPrice: 26.00, total: 936  },
      { category: "Hardware", description: "J-Bolts 1/2\" × 10\"",           qty: 32,  unit: "EA",  unitPrice: 3.20,  total: 102  },
      { category: "Hardware", description: "Post Bases ABA66",               qty: 8,   unit: "EA",  unitPrice: 42.00, total: 336  },
    ],
  },
];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<OrderStatus, {
  label: string; color: string; bg: string; border: string;
  dot: string; icon: React.ReactNode;
}> = {
  "exception-window": {
    label: "Exception Window",
    color: "text-red-700", bg: "bg-red-50", border: "border-red-200",
    dot: "bg-red-500",
    icon: <Timer size={11} />,
  },
  active: {
    label: "Active",
    color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200",
    dot: "bg-blue-500",
    icon: <CircleDot size={11} />,
  },
  completed: {
    label: "Completed",
    color: "text-green-700", bg: "bg-green-50", border: "border-green-200",
    dot: "bg-green-600",
    icon: <CheckCheck size={11} />,
  },
};

// ─── Exception timer ──────────────────────────────────────────────────────────

function getExceptionCountdown(receivedMins: number) {
  const remaining = 24 * 60 - receivedMins;
  if (remaining <= 0) return { label: "Expired", urgent: true, pct: 100 };
  const h = Math.floor(remaining / 60);
  const m = remaining % 60;
  const pct = Math.round((receivedMins / (24 * 60)) * 100);
  return { label: `${h}h ${m}m left`, urgent: remaining < 6 * 60, pct };
}

// ─── Flag Exception Modal ─────────────────────────────────────────────────────

function FlagExceptionModal({ order, onFlag, onClose }: {
  order: IncomingOrder;
  onFlag: (id: string, reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [type, setType] = useState<string>("");

  const exceptionTypes = [
    "Item out of stock",
    "Delivery date not achievable",
    "Spec not available — substitute required",
    "Quantity exceeds current inventory",
    "Lead time extension needed",
    "Other",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-red-50 rounded-t-2xl">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
            <Flag size={15} className="text-red-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900">Flag Exception</div>
            <div className="text-[10px] text-slate-500">{order.id} · {order.phaseName}</div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors">
            <X size={14} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Countdown reminder */}
          {order.status === "exception-window" && (() => {
            const t = getExceptionCountdown(order.receivedMins);
            return (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${
                t.urgent ? "bg-red-50 border-red-200 text-red-700" : "bg-amber-50 border-amber-200 text-amber-700"
              }`}>
                <Timer size={12} /> Exception window closes in {t.label}
              </div>
            );
          })()}

          {/* Exception type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Exception Type</label>
            <div className="space-y-1.5">
              {exceptionTypes.map(t => (
                <label key={t} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                  type === t ? "border-red-400 bg-red-50" : "border-slate-100 hover:border-slate-200"
                }`}>
                  <input type="radio" className="hidden" checked={type === t} onChange={() => setType(t)} />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    type === t ? "border-red-500" : "border-slate-300"
                  }`}>
                    {type === t && <div className="w-2 h-2 rounded-full bg-red-500" />}
                  </div>
                  <span className="text-xs font-medium text-slate-700">{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Additional Notes</label>
            <textarea
              value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder="Describe the exception clearly for the contractor…"
              className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-[10px] text-amber-700 leading-relaxed flex items-start gap-2">
            <Info size={11} className="flex-shrink-0 mt-0.5" />
            The contractor will be notified immediately via platform relay. No direct contact info is shared.
          </div>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            disabled={!type}
            onClick={() => { onFlag(order.id, type + (reason ? `: ${reason}` : "")); onClose(); }}
            className="flex-1 py-2.5 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Flag size={13} /> Submit Exception Flag
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order List Card ──────────────────────────────────────────────────────────

function OrderListCard({ order, isActive, onClick }: {
  order: IncomingOrder;
  isActive: boolean;
  onClick: () => void;
}) {
  const sc = STATUS_CFG[order.status];
  const timer = order.status === "exception-window" ? getExceptionCountdown(order.receivedMins) : null;
  const total = order.subtotal + order.deliveryFee;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-slate-100 cursor-pointer transition-colors relative ${
        isActive ? "bg-white border-l-2 border-l-amber-500" : "bg-slate-50 hover:bg-white"
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          {/* Phase + number */}
          <div className="flex items-center gap-1.5 mb-1">
            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color} ${sc.border}`}>
              {sc.icon} {order.phaseName}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Phase {order.phaseNumber} of {order.totalPhases}</span>
          </div>
          {/* Address */}
          <div className="flex items-center gap-1 text-xs text-slate-700 font-semibold">
            <MapPin size={10} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{order.jobsiteAddress}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 ml-3.5">{order.city}, {order.state}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm font-bold text-slate-900">${(total / 1000).toFixed(1)}K</div>
          <div className="text-[10px] text-slate-400">{order.itemCount} items</div>
        </div>
      </div>

      {/* Delivery window */}
      <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-2">
        <span className="flex items-center gap-1"><Calendar size={10} /> {order.deliveryDateDisplay}</span>
        <span>·</span>
        <span className="flex items-center gap-1"><Clock size={10} /> {order.deliveryWindow}</span>
      </div>

      {/* Exception timer or status */}
      {timer ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
              <Timer size={9} /> Exception Window Active
            </span>
            <span className={`text-[10px] font-bold ${timer.urgent ? "text-red-600" : "text-amber-600"}`}>
              {timer.label}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
            <div
              className={`h-full rounded-full ${timer.urgent ? "bg-red-500" : timer.pct > 60 ? "bg-amber-400" : "bg-green-500"}`}
              style={{ width: `${timer.pct}%` }}
            />
          </div>
        </div>
      ) : (
        <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color} ${sc.border}`}>
          {sc.icon} {sc.label}
          {order.flagged && <span className="ml-1 text-[9px] text-red-600 font-bold">· Flagged</span>}
        </div>
      )}

      {/* Auto-confirmed micro badge */}
      {order.autoConfirmed && (
        <div className="mt-2 flex items-center gap-1 text-[9px] text-green-700 font-semibold">
          <Zap size={8} className="text-green-500" /> Auto-confirmed
        </div>
      )}
    </button>
  );
}

// ─── Order Detail Panel ───────────────────────────────────────────────────────

function OrderDetailPanel({ order, onFlagClick }: {
  order: IncomingOrder;
  onFlagClick: () => void;
}) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(["Framing Lumber", "Engineered Wood"]));
  const sc = STATUS_CFG[order.status];
  const timer = order.status === "exception-window" ? getExceptionCountdown(order.receivedMins) : null;

  const total = order.subtotal + order.deliveryFee;
  const tax = order.subtotal * 0.0825;

  const toggleCat = (cat: string) =>
    setExpandedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  const grouped = order.items.reduce<Record<string, OrderLineItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">

      {/* Detail Header */}
      <div className="flex-shrink-0 border-b border-slate-100 px-6 py-4 space-y-3">

        {/* Auto-confirmed banner */}
        {order.autoConfirmed && (
          <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
            <Zap size={14} className="text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-green-800">Auto-confirmed order</span>
              <span className="text-xs text-green-700"> · no quoting required</span>
            </div>
            <ShieldCheck size={14} className="text-green-500 flex-shrink-0" />
          </div>
        )}

        {/* Order ID + Status */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-slate-400">{order.id}</span>
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color} ${sc.border}`}>
                {sc.icon} {sc.label}
              </span>
              {order.flagged && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  <Flag size={9} /> Flagged
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              {order.phaseName} · Phase {order.phaseNumber} of {order.totalPhases}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <MapPin size={11} className="text-slate-400" />
              {order.jobsiteAddress}, {order.city}, {order.state}
            </div>
          </div>
        </div>

        {/* Exception timer bar */}
        {timer && (
          <div className={`rounded-xl border px-4 py-3 ${timer.urgent ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`flex items-center gap-1.5 text-xs font-bold ${timer.urgent ? "text-red-700" : "text-amber-700"}`}>
                <Timer size={12} /> Exception Window Active
              </span>
              <span className={`text-xs font-bold ${timer.urgent ? "text-red-600" : "text-amber-600"}`}>{timer.label}</span>
            </div>
            <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${timer.urgent ? "bg-red-500" : timer.pct > 60 ? "bg-amber-400" : "bg-green-500"}`}
                style={{ width: `${timer.pct}%` }}
              />
            </div>
            <p className={`text-[10px] mt-1.5 ${timer.urgent ? "text-red-600" : "text-amber-600"}`}>
              Flag any fulfillment issues before the window closes. After {timer.label}, the order locks automatically.
            </p>
          </div>
        )}

        {/* Primary Action Row */}
        <div className="flex gap-2">
          {order.status === "exception-window" && !order.flagged && (
            <button
              onClick={onFlagClick}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <Flag size={14} /> Flag Exception
            </button>
          )}
          {order.status === "exception-window" && order.flagged && (
            <div className="flex-1 flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">
              <Flag size={14} className="text-red-500" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-red-700">Exception Flagged</div>
                {order.flagReason && <div className="text-[10px] text-red-600 truncate">{order.flagReason}</div>}
              </div>
            </div>
          )}
          {order.status === "active" && (
            <>
              <button className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                <Truck size={14} /> Mark Dispatched
              </button>
              <button
                onClick={onFlagClick}
                className="flex items-center gap-2 text-sm px-4 py-2.5 border border-red-200 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                <Flag size={14} /> Flag Issue
              </button>
            </>
          )}
          {order.status === "completed" && (
            <div className="flex-1 flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl">
              <CheckCheck size={15} className="text-green-600" />
              <span className="text-sm font-semibold text-green-700">Order Completed & Signed Off</span>
            </div>
          )}
        </div>
      </div>

      {/* Detail Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Jobsite Info — address only, no personal details */}
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jobsite Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <MapPin size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Delivery Address</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{order.jobsiteAddress}</div>
                <div className="text-xs text-slate-500">{order.city}, {order.state}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Delivery Window</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{order.deliveryDateDisplay}</div>
                <div className="text-xs text-slate-500">{order.deliveryWindow}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Layers size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Phase</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{order.phaseName}</div>
                <div className="text-xs text-slate-500">Phase {order.phaseNumber} of {order.totalPhases}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Project Type</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{order.projectType}</div>
                <div className="text-xs text-slate-500">{order.itemCount} line items</div>
              </div>
            </div>
          </div>

          {/* Privacy notice */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
            <ShieldCheck size={11} className="text-slate-400 flex-shrink-0" />
            <p className="text-[10px] text-slate-400">
              Contractor contact details are hidden until order is completed. All communication via platform relay.
            </p>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info size={12} className="text-blue-500" />
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Special Instructions</span>
            </div>
            <p className="text-xs text-blue-900 leading-relaxed">{order.notes}</p>
          </div>
        )}

        {/* Pricing Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
            <DollarSign size={13} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pricing Summary</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {[
              { label: "Subtotal",      value: order.subtotal,  color: "text-slate-700" },
              { label: "Delivery Fee",  value: order.deliveryFee, color: "text-slate-700" },
              { label: "Tax (8.25%)",   value: Math.round(order.subtotal * 0.0825), color: "text-slate-700" },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-xs">
                <span className="text-slate-500">{r.label}</span>
                <span className={`font-semibold ${r.color}`}>${r.value.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-slate-200 pt-2 mt-1">
              <span className="text-sm font-bold text-slate-900">Order Total</span>
              <span className="text-sm font-bold text-amber-600">
                ${(order.subtotal + order.deliveryFee + Math.round(order.subtotal * 0.0825)).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Line Items by Category */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Material Line Items · {order.itemCount} items
          </h3>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {Object.entries(grouped).map(([cat, items]) => {
              const isExp = expandedCats.has(cat);
              const catTotal = items.reduce((s, i) => s + i.total, 0);
              return (
                <div key={cat}>
                  <button
                    onClick={() => toggleCat(cat)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${isExp ? "rotate-180" : ""}`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-slate-800">{cat}</span>
                      <span className="text-[10px] text-slate-400 ml-2">{items.length} item{items.length !== 1 ? "s" : ""}</span>
                    </div>
                    <span className="text-xs font-bold text-amber-600">${catTotal.toLocaleString()}</span>
                  </button>
                  {isExp && (
                    <div className="bg-slate-50 border-t border-slate-100">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 px-4 py-2.5 border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-slate-800">{item.description}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {item.qty} {item.unit} @ ${item.unitPrice.toFixed(2)}/{item.unit}
                            </div>
                          </div>
                          <div className="text-xs font-bold text-slate-700 flex-shrink-0">${item.total.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LumberyardQuotations() {
  const [selectedId, setSelectedId] = useState<string>(INCOMING_ORDERS[0].id);
  const [filterStatus, setFilterStatus] = useState<"all" | OrderStatus>("all");
  const [search, setSearch] = useState("");
  const [flagModalOrder, setFlagModalOrder] = useState<IncomingOrder | null>(null);
  const [orders, setOrders] = useState<IncomingOrder[]>(INCOMING_ORDERS);

  const handleFlag = (id: string, reason: string) => {
    setOrders(prev =>
      prev.map(o => o.id === id ? { ...o, flagged: true, flagReason: reason } : o)
    );
  };

  const filtered = orders.filter(o => {
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    if (search && !o.jobsiteAddress.toLowerCase().includes(search.toLowerCase()) &&
        !o.id.toLowerCase().includes(search.toLowerCase()) &&
        !o.phaseName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const currentOrder = orders.find(o => o.id === selectedId) ?? orders[0];

  const counts = {
    all: orders.length,
    "exception-window": orders.filter(o => o.status === "exception-window").length,
    active: orders.filter(o => o.status === "active").length,
    completed: orders.filter(o => o.status === "completed").length,
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Incoming Orders</h1>
              {counts["exception-window"] > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                  <Timer size={11} /> {counts["exception-window"]} exception {counts["exception-window"] === 1 ? "window" : "windows"} open
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Zap size={12} className="text-green-500" />
              Auto-confirmed orders · no quoting required
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 w-56 transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 text-sm px-3 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter size={14} /> Filter
            </button>
          </div>
        </div>
      </div>

      {/* ── Two-panel layout ───────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left: Order List ─────────────────────────────────────────────── */}
        <div className="w-full lg:w-[400px] flex-shrink-0 border-r border-slate-100 flex flex-col overflow-hidden bg-slate-50">

          {/* Status filter tabs */}
          <div className="flex-shrink-0 bg-white border-b border-slate-100 px-4 py-2.5 overflow-x-auto">
            <div className="flex gap-1">
              {([
                { key: "all",               label: "All",             count: counts.all               },
                { key: "exception-window",  label: "Exception",       count: counts["exception-window"] },
                { key: "active",            label: "Active",          count: counts.active            },
                { key: "completed",         label: "Completed",       count: counts.completed         },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    filterStatus === tab.key
                      ? tab.key === "exception-window" ? "bg-red-100 text-red-700"
                      : tab.key === "active" ? "bg-blue-100 text-blue-700"
                      : tab.key === "completed" ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.key === "exception-window" && <Timer size={10} />}
                  {tab.label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    filterStatus === tab.key ? "bg-white/60" : "bg-slate-200 text-slate-500"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Auto-confirmed label */}
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-green-50 border-b border-green-100">
            <Zap size={11} className="text-green-600 flex-shrink-0" />
            <p className="text-[10px] text-green-700 font-semibold">
              Auto-confirmed order (no quoting required)
            </p>
          </div>

          {/* Order list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <Package size={28} className="text-slate-300 mb-2" />
                <p className="text-xs text-slate-400">No orders match your filter</p>
              </div>
            ) : (
              filtered.map(order => (
                <OrderListCard
                  key={order.id}
                  order={order}
                  isActive={selectedId === order.id}
                  onClick={() => setSelectedId(order.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right: Order Detail ──────────────────────────────────────────── */}
        {currentOrder ? (
          <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
            <OrderDetailPanel
              order={currentOrder}
              onFlagClick={() => setFlagModalOrder(currentOrder)}
            />
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center text-slate-400">
            <div className="text-center">
              <Package size={48} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Select an order to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Flag Exception Modal ─────────────────────────────────────────────── */}
      {flagModalOrder && (
        <FlagExceptionModal
          order={flagModalOrder}
          onFlag={handleFlag}
          onClose={() => setFlagModalOrder(null)}
        />
      )}
    </div>
  );
}
