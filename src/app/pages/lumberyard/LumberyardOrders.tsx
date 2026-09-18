import React, { useState, useEffect } from "react";
import {
  Search, Package, MapPin, Calendar, ChevronRight,
  CheckCircle, Clock, Truck, AlertCircle, X, Flag, Timer,
  Zap, ShieldCheck, AlertTriangle, Info, ChevronDown,
  CheckCheck, Hash, FileText, User, Play, Radio,
  BadgeCheck, CircleDot, ArrowRight, RotateCcw,
  Camera, Upload, PackageX, SplitSquare, Car, Ban,
  CloudRain, CreditCard, Scissors, RefreshCw, ImagePlus,
} from "lucide-react";
import { mockOrders, type OrderStatus, type Order } from "../../data/mockData";

// ─── Flow stages ──────────────────────────────────────────────────────────────
// Maps existing OrderStatus → new display labels + visual config

type FlowStage = "pending" | "confirmed" | "processing" | "shipped" | "delivered";

const FLOW_STAGES: { key: FlowStage; label: string; short: string }[] = [
  { key: "pending",    label: "Exception Window", short: "Exc. Window" },
  { key: "confirmed",  label: "Active",           short: "Active"      },
  { key: "processing", label: "Dispatched",        short: "Dispatched"  },
  { key: "shipped",    label: "In Transit",        short: "In Transit"  },
  { key: "delivered",  label: "Delivered",         short: "Delivered"   },
];

const STAGE_IDX: Record<FlowStage, number> = {
  pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4,
};

const STATUS_VISUAL: Record<FlowStage, {
  label: string; color: string; bg: string; border: string; dot: string; textColor: string;
}> = {
  pending:    { label: "Exception Window", color: "text-red-700",    bg: "bg-red-50",     border: "border-red-200",    dot: "bg-red-500",    textColor: "text-red-700"   },
  confirmed:  { label: "Active",           color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",   dot: "bg-blue-500",   textColor: "text-blue-700"  },
  processing: { label: "Dispatched",       color: "text-violet-700", bg: "bg-violet-50",  border: "border-violet-200", dot: "bg-violet-500", textColor: "text-violet-700"},
  shipped:    { label: "In Transit",       color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200",  dot: "bg-amber-500",  textColor: "text-amber-700" },
  delivered:  { label: "Delivered",        color: "text-green-700",  bg: "bg-green-50",   border: "border-green-200",  dot: "bg-green-600",  textColor: "text-green-700" },
};

const phaseColors: Record<string, string> = {
  foundation: "bg-amber-50 text-amber-700 border-amber-200",
  framing:    "bg-blue-50 text-blue-700 border-blue-200",
  exterior:   "bg-violet-50 text-violet-700 border-violet-200",
  interior:   "bg-green-50 text-green-700 border-green-200",
};

// ─── Simulated "hours since received" for the exception window timer ──────────
// In production this would come from order.createdAt compared to Date.now()

const ORDER_RECEIVED_HRS: Record<string, number> = {
  "ord-001": 48,   // Active — window already elapsed
  "ord-002": 72,   // Dispatched
  "ord-003": 96,   // In Transit
  "ord-004": 120,  // Delivered
  "ord-005": 19.5, // 4h 30m left → still in exception window
};

function getExceptionState(orderId: string, status: FlowStage) {
  if (status !== "pending") return null;
  const hrs = ORDER_RECEIVED_HRS[orderId] ?? 12;
  const remainMins = Math.max(0, Math.round((24 - hrs) * 60));
  const h = Math.floor(remainMins / 60);
  const m = remainMins % 60;
  const pct = Math.min(100, Math.round((hrs / 24) * 100));
  const urgent = remainMins < 6 * 60;
  return { remainMins, h, m, pct, urgent, label: `${h}h ${m}m left` };
}

// ─── Mock drivers ─────────────────────────────────────────────────────────────

const MOCK_DRIVERS = [
  { id: "d1", name: "Carlos Vega",    truck: "T-14 · Flatbed 26'",     available: true  },
  { id: "d2", name: "Ray Morales",    truck: "T-07 · Box 20'",          available: true  },
  { id: "d3", name: "Jess Kim",       truck: "T-22 · Flatbed 40'",     available: false },
  { id: "d4", name: "Tom Briggs",     truck: "T-03 · Flatbed 26'",     available: true  },
  { id: "d5", name: "Dana Sullivan",  truck: "T-11 · Crane Truck",     available: true  },
];

// ─── Mock vehicles ────────────────────────────────────────────────────────────

const MOCK_VEHICLES = [
  { id: "v1", name: "T-14 · Flatbed 26′",  capacity: "26,000 lbs", available: true  },
  { id: "v2", name: "T-07 · Box Truck 20′", capacity: "14,000 lbs", available: true  },
  { id: "v3", name: "T-22 · Flatbed 40′",  capacity: "40,000 lbs", available: false },
  { id: "v4", name: "T-03 · Flatbed 26′",  capacity: "26,000 lbs", available: true  },
  { id: "v5", name: "T-11 · Crane Truck",  capacity: "18,000 lbs", available: true  },
];

// ─── Structured Exception Categories ─────────────────────────────────────────

const EXCEPTION_CATEGORIES = [
  { id: "stock-unavailable",  label: "Stock Unavailable",   icon: <Package size={13} />,     color: "text-red-700 bg-red-50 border-red-200",     desc: "Item(s) not currently in inventory" },
  { id: "substitution",       label: "Substitution Required",icon: <RefreshCw size={13} />,   color: "text-amber-700 bg-amber-50 border-amber-200", desc: "Spec unavailable — alternative product needed" },
  { id: "special-order",      label: "Special Order",        icon: <Zap size={13} />,          color: "text-blue-700 bg-blue-50 border-blue-200",    desc: "Item requires special procurement or longer lead time" },
  { id: "stale-price",        label: "Stale Price",          icon: <Clock size={13} />,        color: "text-orange-700 bg-orange-50 border-orange-200", desc: "Quoted price no longer reflects current market rate" },
  { id: "capacity-conflict",  label: "Capacity Conflict",    icon: <Calendar size={13} />,    color: "text-violet-700 bg-violet-50 border-violet-200", desc: "Cannot fulfill within requested delivery window" },
  { id: "delivery-zone",      label: "Delivery Zone Issue",  icon: <MapPin size={13} />,      color: "text-indigo-700 bg-indigo-50 border-indigo-200", desc: "Job site outside current service area" },
  { id: "weather",            label: "Weather",              icon: <CloudRain size={13} />,   color: "text-slate-700 bg-slate-100 border-slate-200",  desc: "Weather conditions preventing safe delivery" },
  { id: "payment-issue",      label: "Payment Issue",        icon: <CreditCard size={13} />,  color: "text-rose-700 bg-rose-50 border-rose-200",    desc: "Payment authorization or terms not cleared" },
  { id: "discontinued",       label: "Discontinued Item",    icon: <Ban size={13} />,          color: "text-gray-600 bg-gray-50 border-gray-200",    desc: "Product permanently removed from catalog" },
];

// ─── Line items (from previous session) ──────────────────────────────────────

type StockStatus = "in-stock" | "backorder" | "out-of-stock";

interface LineItem {
  category: string; description: string;
  qty: number; unit: string; unitPrice: number; total: number;
  stock: StockStatus; backorderDays?: number; note?: string;
}

const ORDER_LINE_ITEMS: Record<string, LineItem[]> = {
  "ord-001": [
    { category: "Framing Lumber", description: "2×6 DF #2 KD Studs 8'",            qty: 320, unit: "EA",  unitPrice: 8.45,  total: 2704, stock: "in-stock" },
    { category: "Framing Lumber", description: "2×10 DF #2 KD Joists 16'",          qty: 84,  unit: "EA",  unitPrice: 22.50, total: 1890, stock: "in-stock" },
    { category: "Framing Lumber", description: "2×4 SPF Stud 92-5/8\"",            qty: 480, unit: "EA",  unitPrice: 5.20,  total: 2496, stock: "in-stock" },
    { category: "Engineered Wood", description: "LVL 3.5×9.5\" 20' Beam",           qty: 6,   unit: "EA",  unitPrice: 285,   total: 1710, stock: "in-stock" },
    { category: "Engineered Wood", description: "LVL 3.5×14\" 20' Ridge Beam",      qty: 2,   unit: "EA",  unitPrice: 410,   total: 820,  stock: "backorder", backorderDays: 5, note: "Special order — confirm lead time" },
    { category: "Sheathing",       description: "OSB 7/16\" 4×8 Struct. Sheathing", qty: 96,  unit: "SHT", unitPrice: 32.00, total: 3072, stock: "in-stock" },
    { category: "Hardware",        description: "HDU Holdowns Simpson Strong-Tie",   qty: 12,  unit: "EA",  unitPrice: 48.50, total: 582,  stock: "in-stock" },
    { category: "Hardware",        description: "Joist Hangers LUS210",              qty: 160, unit: "EA",  unitPrice: 3.80,  total: 608,  stock: "in-stock" },
    { category: "Hardware",        description: "Hurricane Ties H2.5A",              qty: 240, unit: "EA",  unitPrice: 2.10,  total: 504,  stock: "in-stock" },
    { category: "Hardware",        description: "16d Nails Galv 50lb",              qty: 8,   unit: "BOX", unitPrice: 95.00, total: 760,  stock: "in-stock" },
  ],
  "ord-002": [
    { category: "Exterior",  description: "HardiePlank 5/4×6 ColorPlus 12'",        qty: 480, unit: "LF",   unitPrice: 2.80,  total: 1344, stock: "out-of-stock", note: "Backorder from manufacturer — no ETA" },
    { category: "Exterior",  description: "HardieTrim 1×4 Primed 16'",              qty: 96,  unit: "EA",   unitPrice: 14.50, total: 1392, stock: "out-of-stock", note: "Backorder from manufacturer — no ETA" },
    { category: "Exterior",  description: "Fiber Cement Corner 5/4×5/4 10'",        qty: 32,  unit: "EA",   unitPrice: 18.00, total: 576,  stock: "backorder", backorderDays: 8 },
    { category: "Fascia",    description: "Cedar Fascia 2×8 16' Clear",             qty: 48,  unit: "EA",   unitPrice: 52.00, total: 2496, stock: "in-stock" },
    { category: "Wrap",      description: "Housewrap 9' × 100' Roll",               qty: 4,   unit: "ROLL", unitPrice: 148,   total: 592,  stock: "in-stock" },
    { category: "Trim",      description: "Aluminum Drip Edge 10' White",            qty: 36,  unit: "EA",   unitPrice: 8.50,  total: 306,  stock: "in-stock" },
  ],
  "ord-003": [
    { category: "Decking",   description: "Trex Enhance Composite Decking 1×6×16'", qty: 140, unit: "EA",  unitPrice: 42.00, total: 5880, stock: "in-stock" },
    { category: "Framing",   description: "4×4 PT Post 8'",                          qty: 18,  unit: "EA",  unitPrice: 18.00, total: 324,  stock: "in-stock" },
    { category: "Framing",   description: "2×8 PT Joist 12'",                        qty: 56,  unit: "EA",  unitPrice: 22.00, total: 1232, stock: "in-stock" },
    { category: "Hardware",  description: "Hidden Deck Fasteners (100-pack)",         qty: 12,  unit: "PKG", unitPrice: 48.00, total: 576,  stock: "in-stock" },
  ],
  "ord-004": [
    { category: "Roofing",   description: "Arch Shingles 3-Tab 25yr 1 sq",           qty: 28,  unit: "SQ",  unitPrice: 98.00, total: 2744, stock: "in-stock" },
    { category: "Roofing",   description: "OSB Decking 7/16\" 4×8",                  qty: 48,  unit: "SHT", unitPrice: 32.00, total: 1536, stock: "in-stock" },
    { category: "Roofing",   description: "Ice & Water Shield 36\" × 66.7'",         qty: 4,   unit: "ROLL",unitPrice: 118,   total: 472,  stock: "in-stock" },
  ],
  "ord-005": [
    { category: "Framing Lumber", description: "2×6 DF #2 KD Studs 8'",             qty: 180, unit: "EA",  unitPrice: 8.45,  total: 1521, stock: "in-stock" },
    { category: "Framing Lumber", description: "2×12 DF #2 Rim Board 16'",           qty: 24,  unit: "EA",  unitPrice: 38.00, total: 912,  stock: "in-stock" },
    { category: "Engineered Wood", description: "LVL 3.5×9.5\" 20' Beam",            qty: 4,   unit: "EA",  unitPrice: 285,   total: 1140, stock: "backorder", backorderDays: 3, note: "Lead time may affect delivery window" },
    { category: "Sheathing",       description: "OSB 7/16\" 4×8 Struct. Sheathing",  qty: 64,  unit: "SHT", unitPrice: 32.00, total: 2048, stock: "in-stock" },
    { category: "Hardware",        description: "Joist Hangers LUS210",               qty: 96,  unit: "EA",  unitPrice: 3.80,  total: 365,  stock: "in-stock" },
    { category: "Hardware",        description: "Hurricane Ties H2.5A",               qty: 160, unit: "EA",  unitPrice: 2.10,  total: 336,  stock: "in-stock" },
  ],
};

interface DeliveryBreakdown {
  baseFee: number; distanceSurcharge: number;
  heavyLoadFee: number; liftgateFee: number; fuelSurcharge: number;
  scheduledWindow: string; deliveryDate: string;
}

const DELIVERY_BREAKDOWN: Record<string, DeliveryBreakdown> = {
  "ord-001": { baseFee: 120, distanceSurcharge: 40, heavyLoadFee: 80, liftgateFee: 0,  fuelSurcharge: 28, scheduledWindow: "7:00–10:00 AM", deliveryDate: "Apr 28, 2026" },
  "ord-002": { baseFee: 120, distanceSurcharge: 60, heavyLoadFee: 60, liftgateFee: 40, fuelSurcharge: 22, scheduledWindow: "8:00–11:00 AM", deliveryDate: "May 26, 2026" },
  "ord-003": { baseFee: 80,  distanceSurcharge: 20, heavyLoadFee: 0,  liftgateFee: 0,  fuelSurcharge: 12, scheduledWindow: "7:00–9:00 AM",  deliveryDate: "Apr 10, 2026" },
  "ord-004": { baseFee: 80,  distanceSurcharge: 20, heavyLoadFee: 0,  liftgateFee: 0,  fuelSurcharge: 12, scheduledWindow: "7:00–9:00 AM",  deliveryDate: "Apr 10, 2026" },
  "ord-005": { baseFee: 120, distanceSurcharge: 50, heavyLoadFee: 60, liftgateFee: 0,  fuelSurcharge: 20, scheduledWindow: "9:00 AM–12:00 PM", deliveryDate: "May 19, 2026" },
};

const DEFAULT_DELIVERY: DeliveryBreakdown = {
  baseFee: 120, distanceSurcharge: 30, heavyLoadFee: 40, liftgateFee: 0,
  fuelSurcharge: 16, scheduledWindow: "8:00–10:00 AM", deliveryDate: "TBD",
};

// ─── Stock badge ──────────────────────────────────────────────────────────────

function StockBadge({ item }: { item: LineItem }) {
  if (item.stock === "in-stock")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
        <CheckCircle size={9} /> In Stock
      </span>
    );
  if (item.stock === "out-of-stock")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
        <X size={9} /> Out of Stock
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
      <Clock size={9} /> Backorder · {item.backorderDays}d
    </span>
  );
}

// ─── Delivery Timeline ────────────────────────────────────────────────────────

function DeliveryTimeline({ currentStatus }: { currentStatus: FlowStage }) {
  const currentIdx = STAGE_IDX[currentStatus];
  return (
    <div className="flex items-center w-full px-1 py-3 select-none">
      {FLOW_STAGES.map((stage, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent   = idx === currentIdx;
        const isPending   = idx > currentIdx;
        const sv = STATUS_VISUAL[stage.key];
        return (
          <React.Fragment key={stage.key}>
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                isCompleted
                  ? "bg-green-500 border-green-500"
                  : isCurrent
                    ? `${sv.bg} border-current ${sv.textColor} ring-2 ring-offset-1 ring-current/20`
                    : "bg-white border-slate-200"
              }`}>
                {isCompleted ? (
                  <CheckCheck size={12} className="text-white" />
                ) : isCurrent ? (
                  stage.key === "pending"   ? <Timer size={12} />      :
                  stage.key === "confirmed" ? <Zap size={12} />        :
                  stage.key === "processing"? <Play size={12} />       :
                  stage.key === "shipped"   ? <Truck size={12} />      :
                  <BadgeCheck size={12} />
                ) : (
                  <div className={`w-2 h-2 rounded-full ${isPending ? "bg-slate-200" : "bg-white"}`} />
                )}
              </div>
              <span className={`text-[9px] font-bold whitespace-nowrap leading-none text-center max-w-[52px] ${
                isCompleted ? "text-green-600"
                : isCurrent ? sv.textColor
                : "text-slate-300"
              }`}>
                {stage.short}
              </span>
            </div>
            {/* Connector */}
            {idx < FLOW_STAGES.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded transition-all ${
                idx < currentIdx ? "bg-green-400" : "bg-slate-100"
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Exception Window Timer Bar ───────────────────────────────────────────────

function ExceptionTimerBar({ orderId }: { orderId: string }) {
  const state = getExceptionState(orderId, "pending");
  if (!state) return null;
  const { h, m, pct, urgent } = state;
  return (
    <div className={`rounded-xl border px-4 py-3 ${urgent ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`flex items-center gap-1.5 text-xs font-bold ${urgent ? "text-red-700" : "text-amber-700"}`}>
          <Timer size={12} /> Exception Window Active
        </span>
        <span className={`text-xs font-bold tabular-nums ${urgent ? "text-red-600" : "text-amber-600"}`}>
          {h}h {m}m remaining
        </span>
      </div>
      <div className="w-full bg-white/70 rounded-full h-1.5 overflow-hidden mb-1.5">
        <div
          className={`h-full rounded-full transition-all ${
            urgent ? "bg-red-500" : pct > 60 ? "bg-amber-400" : "bg-green-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-[10px] leading-relaxed ${urgent ? "text-red-600" : "text-amber-600"}`}>
        <span className="font-semibold">Auto-confirmed if no issues raised within 24h.</span>{" "}
        Flag any fulfillment exceptions before the window closes.
      </p>
    </div>
  );
}

// ─── Delivery Execution Card ──────────────────────────────────────────────────

function DeliveryExecutionCard({
  orderId, assignedDriver, assignedVehicle, onAssignDriver, onAssignVehicle, onDispatch, status,
}: {
  orderId: string;
  assignedDriver: string | null;
  assignedVehicle: string | null;
  onAssignDriver: (driverId: string) => void;
  onAssignVehicle: (vehicleId: string) => void;
  onDispatch: () => void;
  status: FlowStage;
}) {
  const [driverOpen, setDriverOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [podPhotos, setPodPhotos] = useState<string[]>([]);
  const [packingSlipUploaded, setPackingSlipUploaded] = useState(false);
  const [showPartial, setShowPartial] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [partialNotes, setPartialNotes] = useState("");
  const [failedReason, setFailedReason] = useState("");

  const driverObj = MOCK_DRIVERS.find(d => d.id === assignedDriver);
  const vehicleObj = MOCK_VEHICLES.find(v => v.id === assignedVehicle);
  const canDispatch = status === "confirmed" && !!assignedDriver && !!assignedVehicle;
  const isDispatched = STAGE_IDX[status] >= STAGE_IDX["processing"];
  const inTransitOrLater = STAGE_IDX[status] >= STAGE_IDX["shipped"];

  function SelectorDropdown<T extends { id: string; name: string; available: boolean }>({
    items, selected, onSelect, open, setOpen, icon, label, subKey,
  }: {
    items: T[]; selected: string | null; onSelect: (id: string) => void;
    open: boolean; setOpen: (v: boolean) => void;
    icon: React.ReactNode; label: string; subKey: keyof T;
  }) {
    const sel = items.find(i => i.id === selected);
    return (
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
        <div className="relative">
          <button
            onClick={() => !isDispatched && setOpen(!open)}
            disabled={isDispatched}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
              isDispatched ? "bg-slate-50 border-slate-100 cursor-default"
              : "bg-white border-slate-200 hover:border-amber-400 cursor-pointer"
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
              {sel ? (
                <>
                  <div className="text-xs font-semibold text-slate-800">{sel.name}</div>
                  <div className="text-[10px] text-slate-400">{String(sel[subKey])}</div>
                </>
              ) : <span className="text-xs text-slate-400">Select {label.toLowerCase()}…</span>}
            </div>
            {!isDispatched && <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />}
          </button>
          {open && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item.id); setOpen(false); }}
                  disabled={!item.available}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    item.available ? "hover:bg-amber-50 cursor-pointer" : "opacity-40 cursor-not-allowed bg-slate-50"
                  } ${selected === item.id ? "bg-amber-50" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-800">{item.name}</div>
                    <div className="text-[10px] text-slate-400">{String(item[subKey])}</div>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                    item.available ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-400"
                  }`}>
                    {item.available ? "Available" : "Unavailable"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
        <Truck size={13} className="text-slate-400" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-1">Delivery Execution</span>
        {isDispatched && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
            <Play size={8} /> Dispatched
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Driver selector */}
        <SelectorDropdown
          items={MOCK_DRIVERS.map(d => ({ id: d.id, name: d.name, available: d.available, truck: d.truck }))}
          selected={assignedDriver}
          onSelect={onAssignDriver}
          open={driverOpen}
          setOpen={setDriverOpen}
          icon={<User size={12} className="text-slate-400" />}
          label="Assign Driver"
          subKey={"truck" as any}
        />

        {/* Vehicle selector */}
        <SelectorDropdown
          items={MOCK_VEHICLES.map(v => ({ id: v.id, name: v.name, available: v.available, capacity: v.capacity }))}
          selected={assignedVehicle}
          onSelect={onAssignVehicle}
          open={vehicleOpen}
          setOpen={setVehicleOpen}
          icon={<Car size={12} className="text-slate-400" />}
          label="Assign Vehicle"
          subKey={"capacity" as any}
        />

        {/* Packing slip upload — visible once driver+vehicle assigned */}
        {(assignedDriver || assignedVehicle) && (
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Packing Slip</label>
            {packingSlipUploaded ? (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <CheckCircle size={12} className="text-green-500" />
                <span className="text-xs text-green-700 font-semibold">Packing slip uploaded</span>
                <button onClick={() => setPackingSlipUploaded(false)} className="ml-auto text-[10px] text-slate-400 hover:text-red-400">Remove</button>
              </div>
            ) : (
              <button
                onClick={() => setPackingSlipUploaded(true)}
                className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 rounded-xl text-xs transition-colors"
              >
                <Upload size={12} /> Upload Packing Slip (PDF/Image)
              </button>
            )}
          </div>
        )}

        {/* Dispatch button */}
        {status === "confirmed" && (
          <button
            disabled={!canDispatch}
            onClick={onDispatch}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <Play size={14} /> Dispatch Order
          </button>
        )}
        {status === "confirmed" && !canDispatch && (
          <p className="text-[10px] text-slate-400 text-center">Assign a driver and vehicle to enable dispatch</p>
        )}

        {/* Dispatched / In-transit status */}
        {status === "processing" && driverObj && (
          <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-3 py-2.5">
            <Play size={12} className="text-violet-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-violet-700">{driverObj.name} dispatched</div>
              <div className="text-[10px] text-violet-500">{vehicleObj?.name ?? driverObj.truck}</div>
            </div>
          </div>
        )}
        {status === "shipped" && driverObj && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <Truck size={12} className="text-amber-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-700">{driverObj.name} · En Route</div>
              <div className="text-[10px] text-amber-500">{vehicleObj?.name ?? driverObj.truck}</div>
            </div>
          </div>
        )}

        {/* Partial / Failed delivery — processing & shipped states */}
        {(status === "processing" || status === "shipped") && (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Outcome</div>

            {/* Partial delivery */}
            {!showPartial && !showFailed && (
              <button
                onClick={() => setShowPartial(true)}
                className="w-full flex items-center justify-center gap-2 py-2 border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl text-xs font-semibold transition-colors"
              >
                <Scissors size={12} /> Record Partial Delivery
              </button>
            )}

            {showPartial && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
                <div className="text-xs font-bold text-amber-800">Partial Delivery</div>
                <textarea
                  rows={2}
                  value={partialNotes}
                  onChange={e => setPartialNotes(e.target.value)}
                  placeholder="Which items were delivered? What was left behind?"
                  className="w-full px-2 py-1.5 text-xs border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowPartial(false)} className="px-3 py-1.5 text-xs border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-100">Cancel</button>
                  <button onClick={() => setShowPartial(false)} className="flex-1 py-1.5 text-xs font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-600">Confirm Partial</button>
                </div>
              </div>
            )}

            {/* Failed delivery */}
            {!showFailed && !showPartial && (
              <button
                onClick={() => setShowFailed(true)}
                className="w-full flex items-center justify-center gap-2 py-2 border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-semibold transition-colors"
              >
                <Ban size={12} /> Report Failed Delivery
              </button>
            )}

            {showFailed && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                <div className="text-xs font-bold text-red-800">Failed Delivery</div>
                <select
                  value={failedReason}
                  onChange={e => setFailedReason(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-red-200 rounded-lg focus:outline-none bg-white"
                >
                  <option value="">Select reason…</option>
                  {["No contact at job site", "Access blocked / gate locked", "Weather conditions", "Vehicle breakdown", "Wrong address", "Materials damaged in transit", "Customer refused delivery"].map(r => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => setShowFailed(false)} className="px-3 py-1.5 text-xs border border-red-200 text-red-700 rounded-lg hover:bg-red-100">Cancel</button>
                  <button onClick={() => setShowFailed(false)} className="flex-1 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700">Report Failed</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* POD Photos — in transit and delivered */}
        {inTransitOrLater && (
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Camera size={11} /> POD Photos
              {podPhotos.length > 0 && <span className="text-green-600 font-bold">{podPhotos.length} uploaded</span>}
            </div>
            {podPhotos.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {podPhotos.map((p, i) => (
                  <div key={i} className="relative w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <ImagePlus size={14} className="text-slate-400" />
                    <button
                      onClick={() => setPodPhotos(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <X size={8} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setPodPhotos(prev => [...prev, `photo-${prev.length + 1}`])}
              className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 rounded-xl text-xs transition-colors"
            >
              <Camera size={12} /> Upload POD Photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Flag Modal — Structured Exceptions ──────────────────────────────────────

function FlagModal({ orderId, onFlag, onClose }: {
  orderId: string;
  onFlag: (reason: string) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState("");
  const [notes, setNotes] = useState("");
  const cat = EXCEPTION_CATEGORIES.find(c => c.id === selected);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-red-50 rounded-t-2xl flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
            <Flag size={15} className="text-red-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900">Flag Structured Exception</div>
            <div className="text-[10px] text-slate-500">Order {orderId.toUpperCase()} · Select the exception category</div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-red-100 rounded-lg">
            <X size={14} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Category grid */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Exception Category</label>
            <div className="grid grid-cols-1 gap-2">
              {EXCEPTION_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelected(cat.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    selected === cat.id
                      ? `border-red-400 bg-red-50`
                      : "border-slate-100 hover:border-slate-200 bg-white"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${cat.color}`}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900">{cat.label}</div>
                    <div className="text-[10px] text-slate-400">{cat.desc}</div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    selected === cat.id ? "border-red-500" : "border-slate-300"
                  }`}>
                    {selected === cat.id && <div className="w-2 h-2 rounded-full bg-red-500" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Additional Notes {selected === "substitution" ? "(specify sub product if known)" : "(optional)"}
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder={
                selected === "substitution" ? "e.g. Substitute with 2×4×10 DF KD at same price…"
                : selected === "stale-price" ? "e.g. Current market price is $X — please confirm…"
                : "Describe the issue in detail…"
              }
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none"
            />
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <Info size={11} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-amber-700">Contractor notified via platform relay. Exception logged to Case File. No direct contact info shared.</p>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-slate-100 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">Cancel</button>
          <button
            disabled={!selected}
            onClick={() => { onFlag(cat!.label + (notes ? `: ${notes}` : "")); onClose(); }}
            className="flex-1 py-2.5 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Flag size={12} /> Submit Exception
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order Detail ──────────────────────────────────────────────────────────────

function OrderDetail({ order, localStatus, assignedDriver, assignedVehicle, onClose, onFlag, onAdvance, onAssignDriver, onAssignVehicle }: {
  order: Order;
  localStatus: FlowStage;
  assignedDriver: string | null;
  assignedVehicle: string | null;
  onClose: () => void;
  onFlag: (id: string, reason: string) => void;
  onAdvance: (id: string) => void;
  onAssignDriver: (orderId: string, driverId: string) => void;
  onAssignVehicle: (orderId: string, vehicleId: string) => void;
}) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [flagReason, setFlagReason] = useState("");

  const sv = STATUS_VISUAL[localStatus];
  const items = ORDER_LINE_ITEMS[order.id] ?? ORDER_LINE_ITEMS["ord-001"];
  const delivery = DELIVERY_BREAKDOWN[order.id] ?? DEFAULT_DELIVERY;
  const excState = getExceptionState(order.id, localStatus);

  const totalDeliveryFee = delivery.baseFee + delivery.distanceSurcharge +
    delivery.heavyLoadFee + delivery.liftgateFee + delivery.fuelSurcharge;
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const tax = Math.round(subtotal * 0.0825);
  const orderTotal = subtotal + totalDeliveryFee + tax;

  const problematicItems = items.filter(i => i.stock !== "in-stock");
  const hasProblems = problematicItems.length > 0;

  const grouped = items.reduce<Record<string, LineItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item); return acc;
  }, {});

  const toggleCat = (cat: string) =>
    setExpandedCats(prev => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });

  const handleFlag = (reason: string) => {
    setFlagged(true); setFlagReason(reason);
    onFlag(order.id, reason);
  };

  // Advance label per current stage
  const advanceLabel: Partial<Record<FlowStage, { label: string; icon: React.ReactNode; color: string }>> = {
    shipped:   { label: "Mark as Delivered",   icon: <BadgeCheck size={14} />, color: "bg-green-600 hover:bg-green-700" },
  };
  const adv = advanceLabel[localStatus];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[94vh] flex flex-col overflow-hidden">

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Pill row */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    <FileText size={9} /> Read-Only Review
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                    <Zap size={9} /> Auto-confirmed · no quoting required
                  </span>
                  {flagged && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                      <Flag size={9} /> Flagged
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900">{order.projectName}</h3>
                  <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold border ${sv.bg} ${sv.textColor} ${sv.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sv.dot}`} />
                    {sv.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <Hash size={11} /> {order.id.toUpperCase()}
                  <span>·</span>
                  <span className={`capitalize text-xs font-medium px-1.5 py-0.5 rounded border ${phaseColors[order.phase] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {order.phase}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <div className="text-xl font-bold text-slate-900">${orderTotal.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">incl. delivery + tax</div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── Delivery Timeline ──────────────────────────────────────── */}
            <div className="mt-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 pb-1 pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Order Flow</span>
                {localStatus === "pending" && (
                  <span className="text-[9px] font-bold text-amber-600">
                    Auto-confirmed if no issues raised within 24h
                  </span>
                )}
              </div>
              <DeliveryTimeline currentStatus={localStatus} />
            </div>
          </div>

          {/* ── Alert banners ──────────────────────────────────────────────── */}
          {hasProblems && !flagged && localStatus !== "delivered" && (
            <div className="flex-shrink-0 flex items-start gap-3 px-6 py-3 bg-red-50 border-b border-red-200">
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-red-700">
                  {problematicItems.length} item{problematicItems.length !== 1 ? "s" : ""} require attention
                </p>
                <p className="text-[10px] text-red-600 mt-0.5">
                  {problematicItems.some(i => i.stock === "out-of-stock") && "Out-of-stock items detected. "}
                  {problematicItems.some(i => i.stock === "backorder") && "Backorder delays may affect delivery. "}
                  Use "Flag Exception" to notify the contractor.
                </p>
              </div>
              {localStatus === "pending" && (
                <button onClick={() => setShowFlagModal(true)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-red-700 bg-red-100 hover:bg-red-200 border border-red-300 px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors">
                  <Flag size={11} /> Flag
                </button>
              )}
            </div>
          )}
          {flagged && (
            <div className="flex-shrink-0 flex items-center gap-2 px-6 py-2.5 bg-red-50 border-b border-red-200">
              <Flag size={12} className="text-red-500" />
              <p className="text-xs font-semibold text-red-700">Exception flagged: {flagReason}</p>
            </div>
          )}

          {/* ── Body ──────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

              {/* Left: Details + Line Items (2/3) */}
              <div className="lg:col-span-2 p-5 space-y-5">

                {/* Exception timer (pending only) */}
                {localStatus === "pending" && <ExceptionTimerBar orderId={order.id} />}

                {/* Summary tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Delivery Date",   value: delivery.deliveryDate,    icon: <Calendar size={12} className="text-slate-400" /> },
                    { label: "Time Window",     value: delivery.scheduledWindow, icon: <Clock size={12} className="text-slate-400" />    },
                    { label: "Total Items",     value: `${items.length} items`,  icon: <Package size={12} className="text-slate-400" />  },
                    { label: "Jobsite",         value: order.address.split(",")[0], icon: <MapPin size={12} className="text-slate-400" /> },
                  ].map(m => (
                    <div key={m.label} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-1 mb-1">{m.icon}<span className="text-[10px] text-slate-400 font-medium">{m.label}</span></div>
                      <div className="text-xs font-semibold text-slate-800 truncate">{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* Address + notes */}
                <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <MapPin size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-800">{order.address}</div>
                    {order.notes && (
                      <div className="flex items-start gap-1.5 mt-2 text-[11px] text-amber-700">
                        <Info size={10} className="mt-0.5 flex-shrink-0 text-amber-500" />
                        {order.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                    <ShieldCheck size={9} /> Relay protected
                  </div>
                </div>

                {/* Line items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Line Items</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      {hasProblems && (
                        <span className="flex items-center gap-1 text-red-600 font-semibold">
                          <AlertTriangle size={9} /> {problematicItems.length} flagged
                        </span>
                      )}
                      <span>{items.length} total</span>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                    <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200">
                      <div className="col-span-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item</div>
                      <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Qty</div>
                      <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Unit $</div>
                      <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Stock</div>
                    </div>
                    {Object.entries(grouped).map(([cat, catItems]) => {
                      const isExp = expandedCats.has(cat);
                      const catTotal = catItems.reduce((s, i) => s + i.total, 0);
                      const catProbs = catItems.filter(i => i.stock !== "in-stock").length;
                      return (
                        <div key={cat}>
                          <button onClick={() => toggleCat(cat)}
                            className="w-full grid grid-cols-12 gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left items-center">
                            <div className="col-span-5 flex items-center gap-2">
                              <ChevronDown size={12} className={`text-slate-400 flex-shrink-0 transition-transform ${isExp ? "rotate-180" : ""}`} />
                              <span className="text-xs font-semibold text-slate-800">{cat}</span>
                              {catProbs > 0 && (
                                <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-200">
                                  <AlertTriangle size={8} /> {catProbs}
                                </span>
                              )}
                            </div>
                            <div className="col-span-2 text-[10px] text-slate-400 text-right">{catItems.length} items</div>
                            <div className="col-span-2" />
                            <div className="col-span-3 text-xs font-bold text-slate-700 text-right">${catTotal.toLocaleString()}</div>
                          </button>
                          {isExp && (
                            <div className="bg-slate-50 border-t border-slate-100 divide-y divide-slate-100">
                              {catItems.map((item, idx) => {
                                const isProblem = item.stock !== "in-stock";
                                return (
                                  <div key={idx} className={`grid grid-cols-12 gap-2 px-4 py-3 items-start transition-colors ${isProblem ? "bg-red-50/40" : "hover:bg-white"}`}>
                                    <div className="col-span-5 pl-4">
                                      <div className={`text-xs font-medium ${isProblem ? "text-red-800" : "text-slate-800"}`}>
                                        {item.description}
                                        {isProblem && <span className="ml-1.5 text-[9px] font-bold text-red-600 align-middle">!</span>}
                                      </div>
                                      {item.note && (
                                        <div className="text-[10px] text-amber-600 mt-0.5 flex items-center gap-1">
                                          <AlertCircle size={9} className="flex-shrink-0" /> {item.note}
                                        </div>
                                      )}
                                    </div>
                                    <div className="col-span-2 text-xs text-slate-600 text-right font-medium">{item.qty} {item.unit}</div>
                                    <div className="col-span-2 text-xs text-slate-600 text-right">${item.unitPrice.toFixed(2)}</div>
                                    <div className="col-span-3 flex flex-col items-end gap-1">
                                      <StockBadge item={item} />
                                      <span className="text-xs font-bold text-slate-700">${item.total.toLocaleString()}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Summary + Actions (1/3) */}
              <div className="p-5 space-y-5">

                {/* Delivery execution */}
                <DeliveryExecutionCard
                  orderId={order.id}
                  assignedDriver={assignedDriver}
                  assignedVehicle={assignedVehicle}
                  onAssignDriver={(dId) => onAssignDriver(order.id, dId)}
                  onAssignVehicle={(vId) => onAssignVehicle(order.id, vId)}
                  onDispatch={() => onAdvance(order.id)}
                  status={localStatus}
                />

                {/* Delivery breakdown */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Delivery Breakdown</div>
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                      <Calendar size={12} className="text-slate-400" />
                      <div>
                        <div className="text-[10px] text-slate-400">Scheduled</div>
                        <div className="text-xs font-semibold text-slate-800">{delivery.deliveryDate} · {delivery.scheduledWindow}</div>
                      </div>
                    </div>
                    <div className="px-4 py-3 space-y-1.5">
                      {[
                        { label: "Base delivery fee",  value: delivery.baseFee,           show: true },
                        { label: "Distance surcharge", value: delivery.distanceSurcharge,  show: delivery.distanceSurcharge > 0 },
                        { label: "Heavy load fee",     value: delivery.heavyLoadFee,       show: delivery.heavyLoadFee > 0 },
                        { label: "Liftgate fee",       value: delivery.liftgateFee,        show: delivery.liftgateFee > 0 },
                        { label: "Fuel surcharge",     value: delivery.fuelSurcharge,      show: delivery.fuelSurcharge > 0 },
                      ].filter(r => r.show).map(r => (
                        <div key={r.label} className="flex justify-between text-xs">
                          <span className="text-slate-500">{r.label}</span>
                          <span className="font-medium text-slate-700">${r.value}</span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1">
                        <span className="text-xs font-bold text-slate-900">Total Delivery</span>
                        <span className="text-xs font-bold text-amber-600">${totalDeliveryFee}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order total */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Order Summary</div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 space-y-1.5">
                    {[
                      { label: "Materials subtotal", value: subtotal },
                      { label: "Delivery",           value: totalDeliveryFee },
                      { label: "Tax (8.25%)",        value: tax },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between text-xs">
                        <span className="text-slate-500">{r.label}</span>
                        <span className="font-semibold text-slate-700">${r.value.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1">
                      <span className="text-sm font-bold text-slate-900">Order Total</span>
                      <span className="text-sm font-bold text-amber-600">${orderTotal.toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 pt-0.5">Pricing is platform-set and read-only.</p>
                  </div>
                </div>

                {/* Primary actions */}
                <div className="space-y-2">
                  {/* Flag Exception — only during exception window AND active */}
                  {(localStatus === "pending" || localStatus === "confirmed") && !flagged && (
                    <button onClick={() => setShowFlagModal(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors shadow-sm">
                      <Flag size={14} /> Flag Exception
                    </button>
                  )}
                  {flagged && (
                    <div className="w-full flex items-center gap-2 py-2.5 px-4 bg-red-50 border border-red-200 rounded-xl">
                      <Flag size={14} className="text-red-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-red-700">Exception Flagged</div>
                        <div className="text-[10px] text-red-500 truncate">{flagReason}</div>
                      </div>
                    </div>
                  )}

                  {/* Advance status (In Transit → Delivered only) */}
                  {adv && (
                    <button onClick={() => onAdvance(order.id)}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors ${adv.color}`}>
                      {adv.icon} {adv.label}
                    </button>
                  )}

                  {/* Completed state */}
                  {localStatus === "delivered" && (
                    <div className="w-full flex items-center gap-2 py-2.5 px-4 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCheck size={15} className="text-green-600" />
                      <span className="text-xs font-semibold text-green-700">Order Completed & Delivered</span>
                    </div>
                  )}

                  <button onClick={onClose}
                    className="w-full py-2.5 text-xs font-medium border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                    Close
                  </button>
                </div>

                {/* Privacy note */}
                <div className="flex items-start gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                  <ShieldCheck size={11} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Contractor contact details hidden. All communication via platform relay only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFlagModal && (
        <FlagModal orderId={order.id} onFlag={handleFlag} onClose={() => setShowFlagModal(false)} />
      )}
    </>
  );
}

// ─── Status Badge (table + card) ──────────────────────────────────────────────

function StatusBadge({ status }: { status: FlowStage }) {
  const sv = STATUS_VISUAL[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold border ${sv.bg} ${sv.textColor} ${sv.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sv.dot}`} />
      {sv.label}
    </span>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function LumberyardOrders() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FlowStage | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Local overrides for status (so dispatch / deliver buttons work in demo)
  const [localStatuses, setLocalStatuses] = useState<Record<string, FlowStage>>(() =>
    Object.fromEntries(mockOrders.map(o => [o.id, o.status as FlowStage]))
  );

  // Flagged orders
  const [flaggedOrders, setFlaggedOrders] = useState<Record<string, string>>({});

  // Assigned drivers
  const [assignedDrivers, setAssignedDrivers] = useState<Record<string, string>>({
    "ord-003": "d1",  // pre-assign for In Transit demo
    "ord-004": "d2",
  });

  // Assigned vehicles
  const [assignedVehicles, setAssignedVehicles] = useState<Record<string, string>>({
    "ord-003": "v1",
    "ord-004": "v2",
  });

  const STATUS_ADVANCE: Partial<Record<FlowStage, FlowStage>> = {
    confirmed: "processing",
    processing: "shipped",
    shipped:    "delivered",
  };

  const handleAdvance = (id: string) => {
    setLocalStatuses(prev => {
      const cur = prev[id];
      const next = STATUS_ADVANCE[cur];
      if (!next) return prev;
      return { ...prev, [id]: next };
    });
  };

  const handleFlag = (id: string, reason: string) =>
    setFlaggedOrders(prev => ({ ...prev, [id]: reason }));

  const handleAssignDriver = (orderId: string, driverId: string) =>
    setAssignedDrivers(prev => ({ ...prev, [orderId]: driverId }));

  const handleAssignVehicle = (orderId: string, vehicleId: string) =>
    setAssignedVehicles(prev => ({ ...prev, [orderId]: vehicleId }));

  const filtered = mockOrders.filter(o => {
    const status = localStatuses[o.id] ?? (o.status as FlowStage);
    const matchSearch =
      o.projectName.toLowerCase().includes(search.toLowerCase()) ||
      o.address?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingCount = Object.values(localStatuses).filter(s => s === "pending").length;
  const exceptionWindowOrders = mockOrders.filter(o => localStatuses[o.id] === "pending");

  return (
    <div className="p-6 lg:p-8">
      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          localStatus={localStatuses[selectedOrder.id] ?? (selectedOrder.status as FlowStage)}
          assignedDriver={assignedDrivers[selectedOrder.id] ?? null}
          assignedVehicle={assignedVehicles[selectedOrder.id] ?? null}
          onClose={() => setSelectedOrder(null)}
          onFlag={handleFlag}
          onAdvance={handleAdvance}
          onAssignDriver={handleAssignDriver}
          onAssignVehicle={handleAssignVehicle}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <Zap size={12} className="text-green-500" />
            {mockOrders.length} auto-confirmed orders · no quoting required
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.keys(flaggedOrders).length > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
              <Flag size={12} /> {Object.keys(flaggedOrders).length} exception{Object.keys(flaggedOrders).length !== 1 ? "s" : ""} flagged
            </div>
          )}
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
              <Timer size={12} /> {pendingCount} exception window{pendingCount !== 1 ? "s" : ""} open
            </div>
          )}
        </div>
      </div>

      {/* ── Exception window notice bar ───────────────────────────────────── */}
      {exceptionWindowOrders.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <div className="flex items-start gap-3">
            <Timer size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-800">
                {exceptionWindowOrders.length} order{exceptionWindowOrders.length !== 1 ? "s" : ""} in exception window
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                <span className="font-semibold">Auto-confirmed if no issues raised within 24h.</span>{" "}
                Review these orders and flag any fulfillment issues before the window closes.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {exceptionWindowOrders.map(o => {
                  const exc = getExceptionState(o.id, "pending");
                  return (
                    <button key={o.id} onClick={() => setSelectedOrder(o)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
                        exc?.urgent
                          ? "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                          : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                      }`}>
                      <Timer size={10} /> {o.id.toUpperCase()} · {exc?.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search orders…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", ...FLOW_STAGES.map(s => s.key)] as (FlowStage | "all")[]).map(s => {
            const count = s === "all"
              ? mockOrders.length
              : mockOrders.filter(o => localStatuses[o.id] === s).length;
            const sv = s !== "all" ? STATUS_VISUAL[s] : null;
            return (
              <button key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-xs px-3 py-2 rounded-lg font-semibold transition-all border ${
                  filterStatus === s
                    ? s === "all"
                      ? "bg-amber-500 border-amber-500 text-white"
                      : `${sv?.bg} ${sv?.border} ${sv?.textColor}`
                    : "bg-white border-slate-200 text-slate-600 hover:border-amber-400"
                }`}>
                {s === "all" ? "All" : STATUS_VISUAL[s].label}
                {count > 0 && (
                  <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    filterStatus === s ? "bg-white/40" : "bg-slate-100 text-slate-500"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Orders Table ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Project</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3 hidden md:table-cell">Phase</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3 hidden lg:table-cell">Delivery</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3">Value</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3">Status</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(order => {
                const status = localStatuses[order.id] ?? (order.status as FlowStage);
                const isFlagged = !!flaggedOrders[order.id];
                const items = ORDER_LINE_ITEMS[order.id] ?? [];
                const hasProblems = items.some(i => i.stock !== "in-stock");
                const excState = status === "pending" ? getExceptionState(order.id, "pending") : null;
                return (
                  <tr key={order.id}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${isFlagged ? "bg-red-50/20" : status === "pending" ? "bg-amber-50/20" : ""}`}
                    onClick={() => setSelectedOrder(order)}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-slate-900 truncate max-w-[160px]">{order.projectName}</div>
                        {isFlagged && <Flag size={11} className="text-red-500 flex-shrink-0" />}
                        {!isFlagged && hasProblems && <AlertTriangle size={11} className="text-amber-500 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">{order.items} items · {order.id.toUpperCase()}</span>
                        {/* Inline timer chip for exception window rows */}
                        {excState && (
                          <span className={`flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            excState.urgent
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-amber-100 text-amber-700 border border-amber-200"
                          }`}>
                            <Timer size={8} /> {excState.label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize border ${phaseColors[order.phase] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                        {order.phase}
                      </span>
                    </td>
                    <td className="px-3 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Calendar size={11} className="text-slate-400" />
                        {order.deliveryDate}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <span className="text-sm font-bold text-slate-900">${order.totalValue.toLocaleString()}</span>
                    </td>
                    <td className="px-3 py-4">
                      <StatusBadge status={status} />
                      {/* Auto-confirm sub-label */}
                      {status === "pending" && (
                        <div className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-0.5">
                          <Zap size={8} className="text-green-500" /> Auto-confirms in {excState?.label ?? "—"}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <ChevronRight size={14} className="text-slate-300" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">No orders found</div>
          )}
        </div>
      </div>
    </div>
  );
}
