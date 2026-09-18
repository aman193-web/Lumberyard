import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Truck, CheckCircle, Clock, Package, MapPin, Camera, Upload,
  BadgeCheck, Phone, FileText, Shield, ChevronDown, ChevronUp,
  Star, User, Navigation, ClipboardCheck, Sparkles, MessageSquare,
  AlertTriangle, X, Send, ChevronRight, Image, Filter,
  Circle, CalendarClock, RotateCcw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DeliveryStage = "created" | "confirmed" | "in-transit" | "delivered";
type FilterTab = "all" | "in-transit" | "delivered" | "upcoming";

interface DeliveryItem {
  id: string;
  project: string;
  address: string;
  city: string;
  phase: string;
  phaseColor: string;
  phaseBg: string;
  supplier: string;
  date: string;
  window: string;
  stage: DeliveryStage;
  driver: string | null;
  driverInitials: string | null;
  vehicle: string | null;
  trackingId: string | null;
  items: number;
  value: number;
  reviewed: boolean;
  eta: string | null;
}

// ─── Mock Deliveries ──────────────────────────────────────────────────────────

const ALL_DELIVERIES: DeliveryItem[] = [
  {
    id: "del-001",
    project: "418 Willow Creek Ln",
    address: "418 Willow Creek Ln",
    city: "Cedar Park, TX",
    phase: "Foundation",
    phaseColor: "text-amber-700",
    phaseBg: "bg-amber-50 border-amber-200",
    supplier: "Austin Timber Supply",
    date: "Apr 10, 2026",
    window: "7:00 – 9:00 AM",
    stage: "delivered",
    driver: "Ray Morales",
    driverInitials: "RM",
    vehicle: "Ford F-750 · TX KLB-4482",
    trackingId: "TRK-8841",
    items: 8,
    value: 6200,
    reviewed: true,
    eta: null,
  },
  {
    id: "del-002",
    project: "531 Riverside Ave",
    address: "531 Riverside Ave",
    city: "Austin, TX",
    phase: "Framing",
    phaseColor: "text-blue-700",
    phaseBg: "bg-blue-50 border-blue-200",
    supplier: "Austin Timber Supply",
    date: "Apr 14, 2026",
    window: "7:00 – 9:00 AM",
    stage: "in-transit",
    driver: "Carlos Vega",
    driverInitials: "CV",
    vehicle: "Ford F-750 · TX KLB-4483",
    trackingId: "TRK-8842",
    items: 14,
    value: 14800,
    reviewed: false,
    eta: "~35 min",
  },
  {
    id: "del-003",
    project: "2847 Oak Ridge Dr",
    address: "2847 Oak Ridge Dr",
    city: "Austin, TX",
    phase: "Sheathing & Panels",
    phaseColor: "text-violet-700",
    phaseBg: "bg-violet-50 border-violet-200",
    supplier: "Hill Country Lumber",
    date: "Apr 17, 2026",
    window: "10:00 AM – 12:00 PM",
    stage: "confirmed",
    driver: null,
    driverInitials: null,
    vehicle: null,
    trackingId: null,
    items: 12,
    value: 9200,
    reviewed: false,
    eta: null,
  },
  {
    id: "del-004",
    project: "2847 Oak Ridge Dr",
    address: "2847 Oak Ridge Dr",
    city: "Austin, TX",
    phase: "Exterior & Siding",
    phaseColor: "text-green-700",
    phaseBg: "bg-green-50 border-green-200",
    supplier: "Central TX Lumber Co",
    date: "Apr 22, 2026",
    window: "7:00 – 9:00 AM",
    stage: "created",
    driver: null,
    driverInitials: null,
    vehicle: null,
    trackingId: null,
    items: 9,
    value: 7400,
    reviewed: false,
    eta: null,
  },
  {
    id: "del-005",
    project: "9102 Cedar Bluff Ct",
    address: "9102 Cedar Bluff Ct",
    city: "Round Rock, TX",
    phase: "Roofing",
    phaseColor: "text-rose-700",
    phaseBg: "bg-rose-50 border-rose-200",
    supplier: "Austin Timber Supply",
    date: "Apr 25, 2026",
    window: "7:00 – 9:00 AM",
    stage: "created",
    driver: null,
    driverInitials: null,
    vehicle: null,
    trackingId: null,
    items: 6,
    value: 5800,
    reviewed: false,
    eta: null,
  },
  {
    id: "del-006",
    project: "14 Lakewood Trail",
    address: "14 Lakewood Trail",
    city: "Lakeway, TX",
    phase: "Insulation & Fasteners",
    phaseColor: "text-slate-700",
    phaseBg: "bg-slate-50 border-slate-200",
    supplier: "Hill Country Lumber",
    date: "Apr 30, 2026",
    window: "9:00 – 11:00 AM",
    stage: "created",
    driver: null,
    driverInitials: null,
    vehicle: null,
    trackingId: null,
    items: 11,
    value: 4200,
    reviewed: false,
    eta: null,
  },
];

// ─── Stage config ─────────────────────────────────────────────────────────────

const STAGE_STEPS: { id: DeliveryStage; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: "created",    label: "Created",    desc: "Order placed & logged",           icon: <FileText size={14} /> },
  { id: "confirmed",  label: "Confirmed",  desc: "Supplier confirmed",              icon: <BadgeCheck size={14} /> },
  { id: "in-transit", label: "In Transit", desc: "Driver en route",                 icon: <Truck size={14} /> },
  { id: "delivered",  label: "Delivered",  desc: "Materials signed off",            icon: <CheckCircle size={14} /> },
];

const STAGE_IDX: Record<DeliveryStage, number> = {
  created: 0, confirmed: 1, "in-transit": 2, delivered: 3,
};

const STAGE_BADGE: Record<DeliveryStage, { label: string; cls: string; pulse: boolean }> = {
  "created":    { label: "Created",    cls: "bg-slate-100 text-slate-600 border-slate-200",     pulse: false },
  "confirmed":  { label: "Confirmed",  cls: "bg-blue-50 text-blue-700 border-blue-200",         pulse: false },
  "in-transit": { label: "In Transit", cls: "bg-amber-50 text-amber-700 border-amber-200",      pulse: true  },
  "delivered":  { label: "Delivered",  cls: "bg-green-50 text-green-700 border-green-200",      pulse: false },
};

// ─── Mock manifest ─────────────────────────────────────────────────────────────

const MANIFEST_ITEMS: Record<string, { sku: string; name: string; qty: number; unit: string }[]> = {
  "del-001": [
    { sku: "CMT-3000", name: "Ready-Mix Concrete 3000 PSI", qty: 6,  unit: "CY"  },
    { sku: "RBR-#4",   name: "Rebar #4 20′",               qty: 48, unit: "EA"  },
    { sku: "FBD-2×8",  name: "Form Boards 2×8×12′",        qty: 20, unit: "EA"  },
  ],
  "del-002": [
    { sku: "LBR-2×4-16", name: "2×4 KD Lumber 16′",       qty: 120, unit: "EA"  },
    { sku: "LBR-2×6-8",  name: "2×6 KD Lumber 8′",        qty: 60,  unit: "EA"  },
    { sku: "EWP-LVL",    name: "LVL Beam 3.5″×14″",       qty: 4,   unit: "EA"  },
    { sku: "PLY-OSB",    name: "OSB 7/16″ 4×8",           qty: 48,  unit: "SHT" },
    { sku: "HDW-JHG",    name: "Joist Hanger 4×",         qty: 36,  unit: "EA"  },
  ],
  "del-003": [
    { sku: "PLY-CDX",   name: "CDX Plywood 3/4″ 4×8",     qty: 60,  unit: "SHT" },
    { sku: "HBD-ZIP",   name: "ZIP System Sheathing 4×8",  qty: 30,  unit: "SHT" },
    { sku: "HBD-TAPE",  name: "ZIP System Tape 3.75″",    qty: 6,   unit: "RL"  },
  ],
  "del-004": [
    { sku: "SID-HBK",   name: "HardiePlank Siding 5/4×6 16′", qty: 80, unit: "EA" },
    { sku: "SID-WRP",   name: "HouseWrap 9×150′",             qty: 2,  unit: "RL" },
    { sku: "SID-TRM",   name: "Corner Trim 5/4×4 16′",        qty: 12, unit: "EA" },
  ],
  "del-005": [
    { sku: "RF-FELT",   name: "Roofing Felt 15# 4sq",     qty: 4,  unit: "RL" },
    { sku: "RF-SHNG",   name: "Arch Shingles 30yr",       qty: 18, unit: "SQ" },
    { sku: "RF-VENT",   name: "Ridge Vent 4′",            qty: 8,  unit: "EA" },
  ],
  "del-006": [
    { sku: "INS-R19",   name: "R-19 Batt Insulation 15″", qty: 20, unit: "BG" },
    { sku: "INS-R38",   name: "R-38 Blown Insulation",    qty: 8,  unit: "BG" },
    { sku: "FTN-16D",   name: "16d Common Nails 50lb",    qty: 4,  unit: "BX" },
  ],
};

// ─── Review categories ────────────────────────────────────────────────────────

const REVIEW_CATS = [
  { id: "protection",  label: "Materials Protection",  icon: <Shield size={13} />,        weight: 2 },
  { id: "placement",   label: "Placement Accuracy",    icon: <MapPin size={13} />,         weight: 1 },
  { id: "punctuality", label: "Punctuality",           icon: <Clock size={13} />,          weight: 1 },
  { id: "comms",       label: "Communication",         icon: <MessageSquare size={13} />,  weight: 1 },
  { id: "accuracy",    label: "Order Accuracy",        icon: <ClipboardCheck size={13} />, weight: 1 },
  { id: "quality",     label: "Material Quality",      icon: <Package size={13} />,        weight: 1 },
  { id: "driver",      label: "Driver Professionalism",icon: <User size={13} />,           weight: 1 },
  { id: "docs",        label: "Documentation",         icon: <FileText size={13} />,       weight: 1 },
  { id: "site",        label: "Site Condition",        icon: <Sparkles size={13} />,       weight: 1 },
];

function computeScore(ratings: Record<string, number>): number {
  const weighted = REVIEW_CATS.reduce((s, c) => s + (ratings[c.id] ?? 0) * c.weight, 0);
  const maxW     = REVIEW_CATS.reduce((s, c) => s + 5 * c.weight, 0);
  return maxW > 0 ? (weighted / maxW) * 10 : 0;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: DeliveryStage }) {
  const cfg = STAGE_BADGE[stage];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      {cfg.pulse && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
      {cfg.label}
    </span>
  );
}

function MiniStars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hov, setHov] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          onMouseEnter={() => onChange && setHov(i)}
          onMouseLeave={() => onChange && setHov(0)}
          onClick={() => onChange?.(i)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={14}
            className={`transition-colors ${(hov || value) >= i ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
          />
        </button>
      ))}
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  const color = score >= 8.5 ? "text-green-700 bg-green-50 border-green-200"
              : score >= 7   ? "text-amber-700 bg-amber-50 border-amber-200"
                             : "text-red-700 bg-red-50 border-red-200";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${color}`}>
      {score.toFixed(1)} / 10
    </span>
  );
}

// ─── Status Stepper ───────────────────────────────────────────────────────────

function StatusStepper({ stage }: { stage: DeliveryStage }) {
  const currentIdx = STAGE_IDX[stage];
  return (
    <div className="relative">
      <div
        className="absolute top-5 h-px bg-slate-100"
        style={{ left: "calc(10% + 20px)", right: "calc(10% + 20px)" }}
      />
      <div className="grid grid-cols-4 gap-1">
        {STAGE_STEPS.map((s, i) => {
          const done    = i < currentIdx;
          const current = i === currentIdx;
          return (
            <div key={s.id} className="flex flex-col items-center gap-1.5 relative">
              <div className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                done    ? "bg-green-600 border-green-600 text-white" :
                current ? "bg-amber-500 border-amber-500 text-white ring-4 ring-amber-100" :
                          "bg-white border-slate-200 text-slate-300"
              }`}>
                {done ? <CheckCircle size={17} /> : s.icon}
                {current && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-white animate-pulse" />}
              </div>
              <div className="text-center">
                <div className={`text-[11px] font-bold ${current ? "text-amber-600" : done ? "text-green-700" : "text-slate-400"}`}>
                  {s.label}
                </div>
                <div className="text-[9px] text-slate-400 leading-tight hidden sm:block">{s.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Inline Review Form ───────────────────────────────────────────────────────

function InlineReview({ deliveryId, onSubmit }: { deliveryId: string; onSubmit: () => void }) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [note, setNote]       = useState("");
  const [recommend, setRecommend] = useState<boolean | null>(null);

  const ratedCount = Object.values(ratings).filter(v => v > 0).length;
  const allRated   = ratedCount === REVIEW_CATS.length;
  const score      = computeScore(ratings);

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
        <div>
          <div className="text-xs font-bold text-slate-700">10-Point Score</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Materials Protection is 2× weighted</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`text-xl font-bold ${allRated ? (score >= 8.5 ? "text-green-700" : score >= 7 ? "text-amber-600" : "text-red-600") : "text-slate-300"}`}>
              {allRated ? score.toFixed(1) : "—"}
            </div>
            <div className="text-[10px] text-slate-400">out of 10</div>
          </div>
          {/* Mini progress ring */}
          <svg width={44} height={44} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={22} cy={22} r={17} fill="none" stroke="#f1f5f9" strokeWidth={5} />
            {allRated && (
              <circle
                cx={22} cy={22} r={17}
                fill="none"
                stroke={score >= 8.5 ? "#16a34a" : score >= 7 ? "#d97706" : "#dc2626"}
                strokeWidth={5}
                strokeDasharray={2 * Math.PI * 17}
                strokeDashoffset={2 * Math.PI * 17 * (1 - score / 10)}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.4s" }}
              />
            )}
          </svg>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
          <span>{ratedCount} of {REVIEW_CATS.length} rated</span>
          <span>{REVIEW_CATS.length - ratedCount} remaining</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all"
            style={{ width: `${(ratedCount / REVIEW_CATS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Category list */}
      <div className="px-5 space-y-2.5">
        {REVIEW_CATS.map(cat => (
          <div key={cat.id} className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              cat.weight === 2 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400"
            }`}>
              {cat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-700 truncate">{cat.label}</span>
                {cat.weight === 2 && (
                  <span className="text-[8px] font-bold text-amber-700 bg-amber-100 px-1 rounded">2×</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <MiniStars
                value={ratings[cat.id] ?? 0}
                onChange={v => setRatings(prev => ({ ...prev, [cat.id]: v }))}
              />
              {ratings[cat.id] > 0 && (
                <span className="text-[10px] text-slate-400 w-5 text-right">{ratings[cat.id]}/5</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Would recommend */}
      <div className="px-5">
        <div className="text-xs font-semibold text-slate-700 mb-2">Use this supplier again?</div>
        <div className="flex gap-2">
          <button
            onClick={() => setRecommend(true)}
            className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
              recommend === true ? "bg-green-50 border-green-500 text-green-700" : "border-slate-200 text-slate-500 hover:border-green-300"
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => setRecommend(false)}
            className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
              recommend === false ? "bg-red-50 border-red-400 text-red-600" : "border-slate-200 text-slate-500 hover:border-red-300"
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Comment */}
      <div className="px-5">
        <textarea
          rows={2}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Additional comments (optional)..."
          className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
        />
      </div>

      {/* Submit */}
      <div className="px-5 pb-5">
        <button
          disabled={!allRated}
          onClick={onSubmit}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          <Send size={14} />
          {allRated ? `Submit · ${score.toFixed(1)} / 10` : `Rate all ${REVIEW_CATS.length} categories`}
        </button>
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DeliveryDetail({
  delivery,
  reviewedIds,
  onReviewed,
}: {
  delivery: DeliveryItem;
  reviewedIds: Set<string>;
  onReviewed: (id: string) => void;
}) {
  const navigate              = useNavigate();
  const [expanded, setExpanded]   = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [podExpanded, setPodExpanded] = useState(false);
  const isReviewed = delivery.reviewed || reviewedIds.has(delivery.id);
  const isDelivered = delivery.stage === "delivered";
  const items = MANIFEST_ITEMS[delivery.id] ?? [];

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">

      {/* ── Detail header ─────────────────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${delivery.phaseBg} ${delivery.phaseColor}`}>
                {delivery.phase}
              </span>
              <StageBadge stage={delivery.stage} />
              {!isReviewed && isDelivered && (
                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  Review Required
                </span>
              )}
              {isReviewed && (
                <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <BadgeCheck size={9} /> Reviewed
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 truncate">{delivery.project}</h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <MapPin size={11} /> {delivery.city}
              <span>·</span>
              <CalendarClock size={11} /> {delivery.date} · {delivery.window}
              <span>·</span>
              <span className="font-medium text-slate-600">{delivery.supplier}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-base font-bold text-slate-900">${delivery.value.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400">{delivery.items} items</div>
          </div>
        </div>
      </div>

      {/* ── Status stepper ────────────────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Delivery Progress</div>
        <StatusStepper stage={delivery.stage} />
        {delivery.stage === "in-transit" && delivery.eta && (
          <div className="mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
            <div className="flex-1 text-xs text-amber-800 font-medium">
              {delivery.driver} is en route · ETA {delivery.eta}
            </div>
            <button
              onClick={() => navigate("/contractor/tracking")}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex-shrink-0"
            >
              <Navigation size={11} /> Live Track
            </button>
          </div>
        )}
        {delivery.stage === "delivered" && (
          <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
            <ClipboardCheck size={13} className="text-green-600 flex-shrink-0" />
            <span className="text-xs text-green-800 font-medium">
              Signed off — {delivery.date} · Mike Torres
            </span>
            <BadgeCheck size={14} className="text-green-600 ml-auto flex-shrink-0" />
          </div>
        )}
      </div>

      {/* ── Driver card ───────────────────────────────────────────────── */}
      {delivery.driver && (
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Driver</div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {delivery.driverInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900">{delivery.driver}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{delivery.vehicle}</div>
              <div className="flex items-center gap-1 mt-1">
                <MiniStars value={4} />
                <span className="text-[10px] text-slate-400 ml-1">4.0 · CDL-A Licensed</span>
              </div>
            </div>
            {delivery.trackingId && (
              <div className="text-right flex-shrink-0">
                <div className="text-[10px] font-mono text-slate-400">{delivery.trackingId}</div>
                <button
                  onClick={() => navigate("/contractor/tracking")}
                  className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mt-1 hover:text-amber-700"
                >
                  <Phone size={10} /> Contact
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Delivery manifest ─────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manifest</div>
          <span className="text-[10px] text-slate-400">{delivery.items} items</span>
        </div>
        <div className="space-y-2">
          {(expanded ? items : items.slice(0, 3)).map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 py-1.5">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isDelivered ? "bg-green-500" : "bg-slate-300"}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-700 truncate">{item.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
              </div>
              <div className="text-xs font-semibold text-slate-600 flex-shrink-0">
                {item.qty} {item.unit}
              </div>
            </div>
          ))}
        </div>
        {items.length > 3 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-2 flex items-center gap-1 text-[11px] text-amber-600 font-semibold hover:text-amber-700"
          >
            {expanded ? <><ChevronUp size={11} /> Show less</> : <><ChevronDown size={11} /> +{items.length - 3} more items</>}
          </button>
        )}
      </div>

      {/* ── POD ──────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Proof of Delivery</div>
          {isDelivered && (
            <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 flex items-center gap-1">
              <BadgeCheck size={9} /> 3 photos
            </span>
          )}
        </div>
        {isDelivered ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { bg: "bg-amber-100", icon: <Package size={18} className="text-amber-400" />, label: "Stack at driveway" },
                { bg: "bg-blue-100",  icon: <Shield size={18} className="text-blue-400" />,   label: "LVL beams wrapped" },
                { bg: "bg-green-100", icon: <Image size={18} className="text-green-400" />,   label: "Full overview" },
              ].map((p, i) => (
                <div key={i} className={`aspect-square rounded-xl ${p.bg} flex flex-col items-center justify-center border border-slate-200`}>
                  {p.icon}
                  <span className="text-[9px] text-slate-500 mt-1 text-center px-1 leading-tight">{p.label}</span>
                </div>
              ))}
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-xs text-slate-500 hover:text-amber-600 rounded-xl transition-all">
              <Upload size={12} /> Add photo
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <Clock size={13} className="flex-shrink-0" />
            POD upload available once delivery is confirmed on site
          </div>
        )}
      </div>

      {/* ── Review section ────────────────────────────────────────────── */}
      <div className="px-6 py-4">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Delivery Review</div>

        {!isDelivered ? (
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-center">
            <Star size={22} className="text-slate-200 mx-auto mb-1" />
            <div className="text-xs text-slate-400">Available after delivery is completed</div>
          </div>
        ) : isReviewed ? (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-xs font-semibold text-green-800 mb-1.5">Review Submitted</div>
                <MiniStars value={4} />
                <div className="text-[11px] text-green-700 mt-1.5">
                  Rated {delivery.supplier} · {delivery.phase}
                </div>
              </div>
              <ScorePill score={8.4} />
            </div>
          </div>
        ) : showReview ? (
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-900">Rate This Delivery</span>
              <button
                onClick={() => setShowReview(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            </div>
            <InlineReview
              deliveryId={delivery.id}
              onSubmit={() => { onReviewed(delivery.id); setShowReview(false); }}
            />
          </div>
        ) : (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl px-5 py-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Star size={16} className="text-white fill-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-amber-900">Review Required</div>
                <div className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  Rate this delivery before placing your next order. 9 categories · 10-point score.
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowReview(true)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
              >
                <Star size={12} /> Rate Delivery
              </button>
              <button
                onClick={() => navigate("/contractor/review")}
                className="px-3 py-2.5 border border-amber-300 text-amber-700 hover:bg-amber-200 text-xs font-semibold rounded-xl transition-colors"
              >
                Full Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Phase order ──────────────────────────────────────────────────────────────

const PHASE_ORDER = [
  "Foundation", "Framing", "Sheathing & Panels", "Exterior & Siding",
  "Roofing", "Insulation & Fasteners", "Interior", "Mechanical", "Finishes",
];

// ─── Phased View ──────────────────────────────────────────────────────────────

interface PhasedViewProps {
  deliveries: DeliveryItem[];
  reviewedIds: Set<string>;
  onSelect: (id: string) => void;
}

function PhasedView({ deliveries, reviewedIds, onSelect }: PhasedViewProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    () => new Set(Array.from(new Set(deliveries.map(d => d.project))))
  );

  const toggle = (project: string) =>
    setExpandedProjects(prev => {
      const next = new Set(prev);
      next.has(project) ? next.delete(project) : next.add(project);
      return next;
    });

  // Group by project
  const byProject = deliveries.reduce<Record<string, DeliveryItem[]>>((acc, d) => {
    if (!acc[d.project]) acc[d.project] = [];
    acc[d.project].push(d);
    return acc;
  }, {});

  // Sort phases within each project
  Object.values(byProject).forEach(items =>
    items.sort((a, b) => {
      const ai = PHASE_ORDER.indexOf(a.phase);
      const bi = PHASE_ORDER.indexOf(b.phase);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
  );

  const stageIcon = (stage: DeliveryStage) => {
    if (stage === "delivered")  return <CheckCircle size={14} className="text-green-500" />;
    if (stage === "in-transit") return <Truck size={14} className="text-amber-500" />;
    if (stage === "confirmed")  return <BadgeCheck size={14} className="text-blue-500" />;
    return <Circle size={14} className="text-slate-300" />;
  };

  const progressPct = (phases: DeliveryItem[]) => {
    const done = phases.filter(d => d.stage === "delivered").length;
    return Math.round((done / phases.length) * 100);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {Object.entries(byProject).map(([project, phases]) => {
        const isOpen = expandedProjects.has(project);
        const pct    = progressPct(phases);
        const totalVal = phases.reduce((s, d) => s + d.value, 0);
        const inTransit = phases.find(d => d.stage === "in-transit");
        const pendingReview = phases.filter(d => d.stage === "delivered" && !d.reviewed && !reviewedIds.has(d.id)).length;

        return (
          <div key={project} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Project header */}
            <button
              onClick={() => toggle(project)}
              className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{project.slice(0, 2).toUpperCase()}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-900 truncate">{project}</span>
                  {inTransit && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full animate-pulse">
                      Live
                    </span>
                  )}
                  {pendingReview > 0 && (
                    <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                      {pendingReview} Review
                    </span>
                  )}
                </div>
                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">{pct}% complete</span>
                </div>
              </div>

              {/* Meta */}
              <div className="text-right flex-shrink-0 mr-2">
                <div className="text-sm font-bold text-slate-800">${(totalVal / 1000).toFixed(1)}K</div>
                <div className="text-[10px] text-slate-400">{phases.length} deliveries</div>
              </div>

              {isOpen ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
            </button>

            {/* Phase rows */}
            {isOpen && (
              <div className="border-t border-slate-100">
                {phases.map((del, idx) => {
                  const needsReview = del.stage === "delivered" && !del.reviewed && !reviewedIds.has(del.id);
                  const badge = STAGE_BADGE[del.stage];
                  const isLast = idx === phases.length - 1;

                  return (
                    <button
                      key={del.id}
                      onClick={() => onSelect(del.id)}
                      className="w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors flex items-center gap-4 group"
                    >
                      {/* Timeline dot + line */}
                      <div className="flex flex-col items-center flex-shrink-0 self-stretch" style={{ width: 20 }}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                          ${del.stage === "delivered"  ? "bg-green-500 border-green-500"
                          : del.stage === "in-transit" ? "bg-amber-400 border-amber-400 animate-pulse"
                          : del.stage === "confirmed"  ? "bg-blue-400 border-blue-400"
                          : "bg-white border-slate-300"}`}
                        >
                          {del.stage === "delivered" && <CheckCircle size={8} className="text-white" />}
                        </div>
                        {!isLast && <div className="w-px flex-1 bg-slate-100 mt-1" />}
                      </div>

                      {/* Phase info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${del.phaseBg} ${del.phaseColor}`}>
                            {del.phase}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.cls}`}>
                            {badge.label}
                          </span>
                          {needsReview && (
                            <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                              Review
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1"><CalendarClock size={9} />{del.date}</span>
                          <span>{del.window}</span>
                          <span>{del.supplier}</span>
                        </div>
                      </div>

                      {/* Value + items */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-semibold text-slate-700">${(del.value / 1000).toFixed(1)}K</div>
                        <div className="text-[10px] text-slate-400">{del.items} items</div>
                      </div>

                      <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-400 flex-shrink-0 transition-colors" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ContractorDeliveries() {
  const [filter, setFilter]           = useState<FilterTab>("all");
  const [selectedId, setSelectedId]   = useState<string>("del-002");
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const onReviewed = (id: string) => setReviewedIds(prev => new Set([...prev, id]));

  const filtered = ALL_DELIVERIES.filter(d => {
    if (filter === "in-transit") return d.stage === "in-transit";
    if (filter === "delivered")  return d.stage === "delivered";
    if (filter === "upcoming")   return d.stage === "created" || d.stage === "confirmed";
    return true;
  });

  const selected = ALL_DELIVERIES.find(d => d.id === selectedId) ?? ALL_DELIVERIES[0];

  const stats = {
    total:     ALL_DELIVERIES.length,
    inTransit: ALL_DELIVERIES.filter(d => d.stage === "in-transit").length,
    delivered: ALL_DELIVERIES.filter(d => d.stage === "delivered").length,
    pending:   ALL_DELIVERIES.filter(d => (d.stage === "delivered") && !d.reviewed && !reviewedIds.has(d.id)).length,
  };

  const TABS: { id: FilterTab; label: string; count: number }[] = [
    { id: "all",        label: "All",        count: ALL_DELIVERIES.length },
    { id: "in-transit", label: "In Transit", count: stats.inTransit },
    { id: "delivered",  label: "Delivered",  count: stats.delivered },
    { id: "upcoming",   label: "Upcoming",   count: ALL_DELIVERIES.filter(d => d.stage === "created" || d.stage === "confirmed").length },
  ];

  return (
    <div className="flex flex-col h-full">

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-slate-100 bg-white flex-shrink-0">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Deliveries</h1>
            <p className="text-sm text-slate-500 mt-0.5">Track, manage, and review all your material deliveries</p>
          </div>
          {stats.pending > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertTriangle size={13} className="text-red-500" />
              <span className="text-xs font-semibold text-red-700">{stats.pending} review{stats.pending > 1 ? "s" : ""} pending</span>
            </div>
          )}
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { label: "Total",      value: stats.total,     cls: "bg-slate-100 text-slate-700" },
            { label: "In Transit", value: stats.inTransit, cls: "bg-amber-100 text-amber-700", pulse: true },
            { label: "Delivered",  value: stats.delivered, cls: "bg-green-100 text-green-700"  },
            { label: "Pending Review", value: stats.pending, cls: stats.pending > 0 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500" },
          ].map(s => (
            <div key={s.label} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${s.cls}`}>
              {(s as any).pulse && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
              {s.value} {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-panel layout ──────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left — List ─────────────────────────────────────────────────── */}
        <div className="w-80 lg:w-96 flex-shrink-0 border-r border-slate-100 flex flex-col bg-white">

          {/* Filter tabs */}
          <div className="flex gap-1 px-4 py-3 border-b border-slate-100 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  filter === tab.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  filter === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Delivery list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-400">No deliveries in this category</div>
            )}
            {filtered.map(del => {
              const isSelected = del.id === selectedId;
              const needsReview = del.stage === "delivered" && !del.reviewed && !reviewedIds.has(del.id);

              return (
                <button
                  key={del.id}
                  onClick={() => setSelectedId(del.id)}
                  className={`w-full text-left px-4 py-4 transition-all hover:bg-slate-50 ${
                    isSelected ? "bg-amber-50 border-l-4 border-amber-500" : "border-l-4 border-transparent"
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{del.project}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{del.city}</div>
                    </div>
                    <StageBadge stage={del.stage} />
                  </div>

                  {/* Phase + supplier */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${del.phaseBg} ${del.phaseColor}`}>
                      {del.phase}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">{del.supplier}</span>
                  </div>

                  {/* Date + value */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <CalendarClock size={10} />
                      {del.date}
                    </div>
                    <div className="flex items-center gap-2">
                      {needsReview && (
                        <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                          Review
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-slate-700">${(del.value / 1000).toFixed(1)}K</span>
                    </div>
                  </div>

                  {/* In-transit live bar */}
                  {del.stage === "in-transit" && (
                    <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-amber-400 rounded-full animate-pulse" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right — Detail ───────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 overflow-hidden bg-white flex flex-col">
          {selected ? (
            <DeliveryDetail
              key={selected.id}
              delivery={selected}
              reviewedIds={reviewedIds}
              onReviewed={onReviewed}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Truck size={40} className="text-slate-200 mb-3" />
              <div className="text-sm font-semibold text-slate-400">Select a delivery to view details</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
