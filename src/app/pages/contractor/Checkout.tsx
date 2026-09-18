import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, ArrowRight, CheckCircle, CreditCard, Building2, Shield,
  Package, Truck, Calendar, ChevronRight, Info, Lock, AlertTriangle,
  BadgeCheck, DollarSign, FileText, Clock, Zap, User, ChevronDown,
  ChevronUp, Layers, Ruler, Star, CalendarClock, RefreshCw,
} from "lucide-react";
import { useQuoteContext } from "../../context/QuoteContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "Contractor" | "Homeowner";
type PaymentTerm = "price-lock" | "net30" | "paid-full";
type PaymentMethod = "ach" | "card";
type PhasePaymentStatus = "unpaid" | "deposit-pending" | "deposit-paid" | "paid-full";
type WizardStep = "phases" | "payment" | "confirm";

// ─── Phase data ───────────────────────────────────────────────────────────────

interface CheckoutPhase {
  id: string;
  name: string;
  sequenceLabel: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  supplier: string;
  supplierAddress: string;
  deliveryDate: string;
  deliveryWindow: string;
  materialCost: number;
  deliveryFee: number;
  total: number;
  priceLocked: boolean;
  priceLockExpiry: string;
  invoiceNumber: string;
  itemCount: number;
  depositPct: number; // 30% deposit for Price Lock
}

const CHECKOUT_PHASES: CheckoutPhase[] = [
  {
    id: "framing",
    name: "Framing Package",
    sequenceLabel: "Phase 1 of 5",
    icon: <Layers size={15} />,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    supplier: "Austin Timber Supply",
    supplierAddress: "4210 Industrial Blvd, Austin TX",
    deliveryDate: "Apr 14, 2026",
    deliveryWindow: "7:00–9:00 AM",
    materialCost: 7842,
    deliveryFee: 195,
    total: 8037,
    priceLocked: true,
    priceLockExpiry: "Apr 16",
    invoiceNumber: "INV-ATS-2026-0414-01",
    itemCount: 6,
    depositPct: 30,
  },
  {
    id: "sheathing",
    name: "Sheathing & Panels",
    sequenceLabel: "Phase 2 of 5",
    icon: <Ruler size={15} />,
    color: "text-violet-700",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    supplier: "Hill Country Lumber",
    supplierAddress: "225 Ranch Road 12, Wimberley TX",
    deliveryDate: "Apr 17, 2026",
    deliveryWindow: "10:00 AM–12:00 PM",
    materialCost: 3920,
    deliveryFee: 180,
    total: 4100,
    priceLocked: true,
    priceLockExpiry: "Apr 18",
    invoiceNumber: "INV-HCL-2026-0417-01",
    itemCount: 3,
    depositPct: 30,
  },
  {
    id: "exterior",
    name: "Exterior & Siding",
    sequenceLabel: "Phase 3 of 5",
    icon: <Shield size={15} />,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    supplier: "Central Texas Lumber Co",
    supplierAddress: "8801 N Lamar Blvd, Austin TX",
    deliveryDate: "Apr 17, 2026",
    deliveryWindow: "7:00–9:00 AM",
    materialCost: 3620,
    deliveryFee: 0,
    total: 3620,
    priceLocked: true,
    priceLockExpiry: "Apr 19",
    invoiceNumber: "INV-CTL-2026-0417-01",
    itemCount: 2,
    depositPct: 30,
  },
  {
    id: "roofing",
    name: "Roofing",
    sequenceLabel: "Phase 4 of 5",
    icon: <Shield size={15} />,
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    supplier: "Austin Timber Supply",
    supplierAddress: "4210 Industrial Blvd, Austin TX",
    deliveryDate: "Apr 22, 2026",
    deliveryWindow: "7:00–9:00 AM",
    materialCost: 2940,
    deliveryFee: 110,
    total: 3050,
    priceLocked: true,
    priceLockExpiry: "Apr 24",
    invoiceNumber: "INV-ATS-2026-0422-01",
    itemCount: 2,
    depositPct: 30,
  },
  {
    id: "insulation",
    name: "Insulation & Fasteners",
    sequenceLabel: "Phase 5 of 5",
    icon: <Package size={15} />,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    supplier: "Hill Country Lumber",
    supplierAddress: "225 Ranch Road 12, Wimberley TX",
    deliveryDate: "Apr 30, 2026",
    deliveryWindow: "9:00–11:00 AM",
    materialCost: 2020,
    deliveryFee: 140,
    total: 2160,
    priceLocked: false,
    priceLockExpiry: "",
    invoiceNumber: "INV-HCL-2026-0430-01",
    itemCount: 4,
    depositPct: 30,
  },
];

// ─── Helper components ────────────────────────────────────────────────────────

function StatusPill({ status }: { status: PhasePaymentStatus }) {
  const cfg = {
    "unpaid":          { label: "Unpaid", cls: "bg-slate-100 text-slate-500 border-slate-200" },
    "deposit-pending": { label: "Deposit Pending", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    "deposit-paid":    { label: "Deposit Paid", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    "paid-full":       { label: "Paid in Full", cls: "bg-green-100 text-green-700 border-green-200" },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      {status === "paid-full" && <CheckCircle size={9} />}
      {status === "deposit-paid" && <BadgeCheck size={9} />}
      {status === "deposit-pending" && <RefreshCw size={9} />}
      {cfg.label}
    </span>
  );
}

function TermBadge({ term }: { term: PaymentTerm }) {
  if (term === "price-lock") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
      <Lock size={9} /> Price Lock (30% now)
    </span>
  );
  if (term === "net30") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
      <Clock size={9} /> Net-30 Floating
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
      <DollarSign size={9} /> Pay in Full
    </span>
  );
}

// ─── Phase Invoice Card ───────────────────────────────────────────────────────

function PhaseInvoiceCard({
  phase,
  term,
  status,
  role,
  expanded,
  onToggle,
  onTermChange,
}: {
  phase: CheckoutPhase;
  term: PaymentTerm;
  status: PhasePaymentStatus;
  role: Role;
  expanded: boolean;
  onToggle: () => void;
  onTermChange: (t: PaymentTerm) => void;
}) {
  const depositAmt = Math.round(phase.total * phase.depositPct / 100);
  const balanceDue = phase.total - depositAmt;
  const net30Due = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const nowDue = term === "price-lock" ? depositAmt : term === "paid-full" ? phase.total : 0;
  const laterDue = term === "price-lock" ? balanceDue : term === "net30" ? phase.total : 0;

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all ${phase.borderColor} bg-white`}>
      {/* Header row */}
      <div
        className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer ${phase.bgColor} hover:brightness-[0.97] transition-all`}
        onClick={onToggle}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${phase.borderColor} ${phase.bgColor} ${phase.color} flex-shrink-0`}>
          {phase.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-900">{phase.name}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${phase.bgColor} ${phase.color} ${phase.borderColor}`}>
              {phase.sequenceLabel}
            </span>
            <StatusPill status={status} />
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
            <Building2 size={10} className="flex-shrink-0" />
            {phase.supplier} · {phase.invoiceNumber}
          </div>
        </div>
        <div className="text-right flex-shrink-0 flex items-center gap-3">
          <div>
            <div className="text-sm font-bold text-slate-900">${phase.total.toLocaleString()}</div>
            <TermBadge term={term} />
          </div>
          {expanded ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 py-4 space-y-4 border-t border-slate-100">
          {/* Invoice meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Invoice #", value: phase.invoiceNumber.split("-").slice(-2).join("-") },
              { label: "Delivery", value: phase.deliveryDate },
              { label: "Window", value: phase.deliveryWindow },
              { label: "Items", value: `${phase.itemCount} line items` },
            ].map(m => (
              <div key={m.label} className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-medium">{m.label}</div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">{m.value}</div>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Materials</span>
              <span className="font-medium text-slate-700">${phase.materialCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Delivery</span>
              <span className={`font-medium ${phase.deliveryFee === 0 ? "text-green-600" : "text-slate-700"}`}>
                {phase.deliveryFee === 0 ? "FREE" : `$${phase.deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">Platform fee <Info size={9} className="text-slate-300" /></span>
              <span className="font-medium text-slate-700">${Math.round(phase.materialCost * 0.025).toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-200 pt-1.5 flex justify-between text-sm font-bold text-slate-900">
              <span>Phase Total</span>
              <span>${(phase.total + Math.round(phase.materialCost * 0.025)).toLocaleString()}</span>
            </div>
          </div>

          {/* Payment term selector — Contractor gets full choice, Homeowner pay-in-full only */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Term</div>
            {role === "Homeowner" ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <DollarSign size={14} className="text-slate-500 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-700">Pay in Full</div>
                  <div className="text-[10px] text-slate-400">Homeowner accounts are required to pay in full at time of order.</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Price Lock option */}
                <button
                  onClick={() => onTermChange("price-lock")}
                  className={`flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    term === "price-lock" ? "border-green-500 bg-green-50" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${term === "price-lock" ? "bg-green-600" : "bg-slate-100"}`}>
                    <Lock size={14} className={term === "price-lock" ? "text-white" : "text-slate-400"} />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${term === "price-lock" ? "text-green-800" : "text-slate-700"}`}>
                      Price Lock
                      {phase.priceLocked && (
                        <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-200 text-green-800">Active</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                      {phase.depositPct}% deposit (${depositAmt.toLocaleString()}) now · balance on delivery
                    </div>
                    {phase.priceLocked && (
                      <div className="text-[10px] text-green-700 mt-0.5 font-medium">Price locked until {phase.priceLockExpiry}</div>
                    )}
                  </div>
                </button>

                {/* Net-30 option */}
                <button
                  onClick={() => onTermChange("net30")}
                  className={`flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    term === "net30" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${term === "net30" ? "bg-blue-600" : "bg-slate-100"}`}>
                    <Clock size={14} className={term === "net30" ? "text-white" : "text-slate-400"} />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${term === "net30" ? "text-blue-800" : "text-slate-700"}`}>Net-30 Floating</div>
                    <div className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                      $0 now · full ${phase.total.toLocaleString()} due by {net30Due}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Price may float — no lock guarantee</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Due now / due later summary */}
          {(nowDue > 0 || laterDue > 0) && (
            <div className="flex gap-3">
              {nowDue > 0 && (
                <div className="flex-1 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                  <div className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">Due Now</div>
                  <div className="text-lg font-bold text-green-800">${nowDue.toLocaleString()}</div>
                  <div className="text-[10px] text-green-600">
                    {term === "price-lock" ? `${phase.depositPct}% deposit` : "Full payment"}
                  </div>
                </div>
              )}
              {laterDue > 0 && (
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Due Later</div>
                  <div className="text-lg font-bold text-slate-700">${laterDue.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">
                    {term === "price-lock" ? "Balance on delivery" : `Net-30 · by ${net30Due}`}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ACH Form ─────────────────────────────────────────────────────────────────

function ACHForm() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <Zap size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 leading-relaxed">
          <strong>ACH is the preferred payment method</strong> for contractor accounts — no processing fee, 1–3 business day settlement, and auto-reconciliation with your invoice records.
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Account Holder Name</label>
          <input type="text" defaultValue="Mike Torres Construction LLC" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Routing Number</label>
          <input type="text" placeholder="021000021" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Account Number</label>
          <input type="text" placeholder="•••• •••• 4821" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Account Type</label>
          <div className="flex gap-3">
            {["Checking", "Savings"].map(t => (
              <button key={t} className={`flex-1 py-2.5 text-xs border rounded-xl font-medium transition-all ${t === "Checking" ? "border-green-500 bg-green-50 text-green-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CardForm() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed">
          Card payments include a <strong>2.9% processing fee</strong> added to each phase total. ACH is recommended to avoid this surcharge.
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">Card Number</label>
        <input type="text" placeholder="4242 4242 4242 4242" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Expiry</label>
          <input type="text" placeholder="MM / YY" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">CVC</label>
          <input type="text" placeholder="123" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">Name on Card</label>
        <input type="text" placeholder="Mike Torres" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
      </div>
    </div>
  );
}

// ─── Main Checkout ─────────────────────────────────────────────────────────────

const STEP_ORDER: WizardStep[] = ["phases", "payment", "confirm"];
const STEP_LABELS: Record<WizardStep, string> = {
  phases: "Phase Setup",
  payment: "Payment",
  confirm: "Confirm",
};

export function Checkout() {
  const navigate = useNavigate();
  const { getQuote } = useQuoteContext();
  const quote = getQuote("rfq-001");

  const [role, setRole] = useState<Role>("Contractor");
  const [step, setStep] = useState<WizardStep>("phases");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ach");
  const [expandedPhase, setExpandedPhase] = useState<string>("framing");
  const [placing, setPlacing] = useState(false);

  // ── Review gate ──────────────────────────────────────────────────────────
  const [hasPendingReview, setHasPendingReview] = useState(true);
  const [showReviewGate, setShowReviewGate] = useState(false);

  // Per-phase payment terms — Contractor default: price-lock, Homeowner: paid-full
  const [phaseTerms, setPhaseTerms] = useState<Record<string, PaymentTerm>>(
    Object.fromEntries(CHECKOUT_PHASES.map(p => [p.id, "price-lock"]))
  );
  const [phaseStatuses] = useState<Record<string, PhasePaymentStatus>>(
    Object.fromEntries(CHECKOUT_PHASES.map(p => [p.id, "unpaid"]))
  );

  const effectiveTerm = (phaseId: string): PaymentTerm =>
    role === "Homeowner" ? "paid-full" : phaseTerms[phaseId];

  // Grand totals
  const totals = useMemo(() => {
    let dueNow = 0;
    let dueLater = 0;
    let grandTotal = 0;
    CHECKOUT_PHASES.forEach(p => {
      const commission = Math.round(p.materialCost * 0.025);
      const phaseTotal = p.total + commission;
      const term = effectiveTerm(p.id);
      const deposit = Math.round(phaseTotal * p.depositPct / 100);
      grandTotal += phaseTotal;
      if (term === "price-lock") { dueNow += deposit; dueLater += phaseTotal - deposit; }
      else if (term === "net30")  { dueLater += phaseTotal; }
      else                        { dueNow += phaseTotal; }
    });
    return { dueNow, dueLater, grandTotal };
  }, [phaseTerms, role]);

  const stepIdx = STEP_ORDER.indexOf(step);

  const handlePlaceOrder = () => {
    setPlacing(true);
    setTimeout(() => { setPlacing(false); setStep("confirm"); }, 2000);
  };

  return (
    <div className="min-h-full bg-slate-50">

      {/* ── Sticky header ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 px-5 py-3 flex-wrap gap-y-2">
          <button
            onClick={() => navigate("/contractor/marketplace")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline text-xs">Marketplace</span>
          </button>
          <span className="text-slate-200 hidden sm:block">|</span>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign size={15} className="text-green-600" />
            </div>
            <div>
              <div className="text-xs text-slate-400">2847 Oak Ridge Dr · proj-001 · BOM v1.3</div>
              <div className="text-sm font-bold text-slate-900 leading-tight">Phase-Based Checkout</div>
            </div>
          </div>

          {/* Role toggle */}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
              {(["Contractor", "Homeowner"] as Role[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    role === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <User size={10} /> {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step wizard */}
        <div className="flex items-center gap-0 px-5 pb-3">
          {STEP_ORDER.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => stepIdx > i && setStep(s)}
                className={`flex items-center gap-1.5 transition-colors ${stepIdx > i ? "cursor-pointer" : "cursor-default"}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  step === s ? "bg-green-600 text-white" :
                  stepIdx > i ? "bg-green-100 text-green-700" :
                  "bg-slate-100 text-slate-400"
                }`}>
                  {stepIdx > i ? <CheckCircle size={12} /> : i + 1}
                </div>
                <span className={`text-[11px] font-semibold hidden sm:block ${step === s ? "text-slate-900" : "text-slate-400"}`}>
                  {STEP_LABELS[s]}
                </span>
              </button>
              {i < STEP_ORDER.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${stepIdx > i ? "bg-green-400" : "bg-slate-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Layout ─────────────────────────────────────────────────────── */}
      <div className="p-5 grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">

        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">

          {/* ── STEP 1: Phase Setup ─────────────────────────────────────── */}
          {step === "phases" && (
            <>
              {/* ── Review gate banner ──────────────────────────────────── */}
              {hasPendingReview && (
                <div className="relative bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-4">
                  <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star size={16} className="text-red-500 fill-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Review Required</span>
                      <span className="text-[10px] font-semibold text-red-600 bg-red-100 border border-red-200 rounded-full px-2 py-0.5">
                        1 pending
                      </span>
                    </div>
                    <p className="text-xs text-red-700 leading-relaxed">
                      <strong>531 Riverside Ave — Framing Package (Austin Timber Supply)</strong> was delivered on Apr 12 but hasn't been reviewed.
                      Complete the delivery review before placing new orders.
                    </p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        onClick={() => navigate("/contractor/review")}
                        className="flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Star size={11} /> Complete Review
                      </button>
                      <button
                        onClick={() => setHasPendingReview(false)}
                        className="text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1.5 transition-colors"
                      >
                        Dismiss (demo)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Role note for Homeowner */}
              {role === "Homeowner" && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                  <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 leading-relaxed">
                    <strong>Homeowner account</strong> — all phases are set to <strong>Pay in Full</strong> at time of order. Net-30 and Price Lock terms are available to Contractor accounts only.
                  </div>
                </div>
              )}

              {/* Phase cards */}
              {CHECKOUT_PHASES.map(phase => (
                <PhaseInvoiceCard
                  key={phase.id}
                  phase={phase}
                  term={effectiveTerm(phase.id)}
                  status={phaseStatuses[phase.id]}
                  role={role}
                  expanded={expandedPhase === phase.id}
                  onToggle={() => setExpandedPhase(p => p === phase.id ? "" : phase.id)}
                  onTermChange={t => setPhaseTerms(prev => ({ ...prev, [phase.id]: t }))}
                />
              ))}

              <button
                onClick={() => hasPendingReview ? setShowReviewGate(true) : setStep("payment")}
                className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl transition-colors text-sm shadow-sm ${
                  hasPendingReview
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {hasPendingReview
                  ? <><Star size={15} className="text-slate-400" /> Review Required Before Proceeding</>
                  : <>Continue to Payment <ChevronRight size={15} /></>}
              </button>
            </>
          )}

          {/* ── Review Gate Modal ─────────────────────────────────────────── */}
          {showReviewGate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                <div className="flex flex-col items-center text-center mb-5">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-3">
                    <Star size={26} className="text-red-500 fill-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Review Required</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    You must complete the delivery review for{" "}
                    <strong className="text-slate-700">531 Riverside Ave (Framing Package)</strong>{" "}
                    before placing a new order.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-xs text-red-700 leading-relaxed">
                  This policy ensures all deliveries are accounted for and helps maintain quality standards across the platform. The 10-point review takes less than 2 minutes.
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { setShowReviewGate(false); navigate("/contractor/review"); }}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                  >
                    <Star size={15} /> Go to Delivery Review
                  </button>
                  <button
                    onClick={() => { setShowReviewGate(false); setHasPendingReview(false); setStep("payment"); }}
                    className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-500 hover:bg-slate-50 font-medium py-3 rounded-xl transition-colors text-sm"
                  >
                    Skip for Demo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Payment ──────────────────────────────────────────── */}
          {step === "payment" && (
            <>
              {/* Method selector */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <CreditCard size={15} className="text-slate-400" /> Payment Method
                </h2>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {/* ACH — primary/default */}
                  <button
                    onClick={() => setPaymentMethod("ach")}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === "ach"
                        ? "border-green-500 bg-green-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${paymentMethod === "ach" ? "bg-green-600" : "bg-slate-100"}`}>
                      <Building2 size={16} className={paymentMethod === "ach" ? "text-white" : "text-slate-400"} />
                    </div>
                    <div>
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${paymentMethod === "ach" ? "text-green-800" : "text-slate-700"}`}>
                        ACH Bank Transfer
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-200 text-green-800">Recommended</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">No fees · 1–3 day settlement</div>
                    </div>
                  </button>

                  {/* Card — secondary */}
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === "card"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${paymentMethod === "card" ? "bg-blue-600" : "bg-slate-100"}`}>
                      <CreditCard size={16} className={paymentMethod === "card" ? "text-white" : "text-slate-400"} />
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${paymentMethod === "card" ? "text-blue-800" : "text-slate-700"}`}>
                        Credit / Debit Card
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">+2.9% processing fee</div>
                    </div>
                  </button>
                </div>

                {paymentMethod === "ach" ? <ACHForm /> : <CardForm />}
              </div>

              {/* Billing address */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText size={15} className="text-slate-400" /> Billing Address
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Company</label>
                    <input type="text" defaultValue="Mike Torres Construction LLC" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Street Address</label>
                    <input type="text" defaultValue="2847 Oak Ridge Dr" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">City</label>
                    <input type="text" defaultValue="Austin" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">ZIP</label>
                    <input type="text" defaultValue="78731" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("phases")}
                  className="px-4 py-3 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm disabled:opacity-70"
                >
                  {placing
                    ? <><RefreshCw size={14} className="animate-spin" /> Processing…</>
                    : <><Lock size={14} /> Place Order — ${totals.dueNow.toLocaleString()} Due Now</>
                  }
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: Confirmation ──────────────────────────────────────── */}
          {step === "confirm" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">
                <div className="bg-green-600 px-6 py-6 text-center">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={28} className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1">All Phase Orders Confirmed</h2>
                  <p className="text-sm text-green-100">
                    {CHECKOUT_PHASES.length} phases · {CHECKOUT_PHASES.map(p => p.supplier).filter((v, i, a) => a.indexOf(v) === i).length} suppliers notified
                  </p>
                </div>
                <div className="px-6 py-5 space-y-3">
                  {CHECKOUT_PHASES.map(phase => {
                    const term = effectiveTerm(phase.id);
                    const commission = Math.round(phase.materialCost * 0.025);
                    const phaseTotal = phase.total + commission;
                    const deposit = Math.round(phaseTotal * phase.depositPct / 100);
                    return (
                      <div key={phase.id} className={`flex items-center gap-3 p-3 rounded-xl border ${phase.borderColor} ${phase.bgColor}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${phase.bgColor} border ${phase.borderColor} ${phase.color} flex-shrink-0`}>
                          {phase.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800">{phase.name}</div>
                          <div className="text-[10px] text-slate-500">{phase.supplier} · {phase.invoiceNumber.split("-").slice(-2).join("-")}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-900">${phaseTotal.toLocaleString()}</div>
                          <TermBadge term={term} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next steps */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Next Steps</div>
                <div className="space-y-3">
                  {[
                    { icon: <CalendarClock size={14} className="text-green-500" />, label: "Schedule Deliveries", sub: "Set delivery windows for each phase in the calendar", action: () => navigate("/contractor/deliveries"), cta: "Open Calendar" },
                    { icon: <FileText size={14} className="text-blue-500" />, label: "Download Invoices", sub: "PDF invoices for all 5 phases are ready", action: () => {}, cta: "Download All" },
                    { icon: <Truck size={14} className="text-violet-500" />, label: "Track Orders", sub: "Monitor supplier fulfillment and delivery status", action: () => navigate("/contractor"), cta: "View Dashboard" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-800">{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.sub}</div>
                      </div>
                      <button onClick={item.action} className="text-[11px] font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 flex-shrink-0">
                        {item.cta} <ChevronRight size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar: Order Summary ───────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm sticky top-36 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Order Summary</h3>
              <p className="text-xs text-slate-400 mt-0.5">2847 Oak Ridge Dr · proj-001 · {role}</p>
            </div>

            {/* Per-phase totals */}
            <div className="space-y-2">
              {CHECKOUT_PHASES.map(phase => {
                const commission = Math.round(phase.materialCost * 0.025);
                const phaseTotal = phase.total + commission;
                const term = effectiveTerm(phase.id);
                return (
                  <div key={phase.id} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${phase.bgColor} ${phase.color}`}>
                      {phase.icon}
                    </div>
                    <span className="text-[11px] text-slate-600 flex-1 truncate">{phase.name}</span>
                    <span className="text-[11px] font-semibold text-slate-800">${phaseTotal.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Platform fee (2.5%)</span>
                <span>${Math.round(CHECKOUT_PHASES.reduce((s, p) => s + p.materialCost, 0) * 0.025).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900">
                <span>Grand Total</span>
                <span className="text-green-700">${totals.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Due now / later split */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                <div>
                  <div className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">Due Now</div>
                  <div className="text-sm font-bold text-green-800">${totals.dueNow.toLocaleString()}</div>
                </div>
                {totals.dueNow > 0 && (
                  <div className="text-[10px] text-green-600 text-right">
                    {role === "Contractor" ? "Deposits + full pays" : "Full payment"}
                  </div>
                )}
              </div>
              {totals.dueLater > 0 && (
                <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Due Later</div>
                    <div className="text-sm font-bold text-slate-700">${totals.dueLater.toLocaleString()}</div>
                  </div>
                  <div className="text-[10px] text-slate-400 text-right">Balance on<br />delivery / Net-30</div>
                </div>
              )}
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100">
              <Shield size={13} className="text-green-600 flex-shrink-0" />
              <span>256-bit encrypted · PCI-DSS compliant</span>
            </div>

            {/* Role note */}
            {role === "Homeowner" && (
              <div className="flex items-start gap-2 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <User size={11} className="flex-shrink-0 mt-0.5" />
                <span>Homeowner accounts pay in full. Switch to Contractor for Net-30 and Price Lock terms.</span>
              </div>
            )}

            <p className="text-[10px] text-slate-400 text-center">
              All orders managed through Lumberyard platform. Suppliers fulfill — they do not approve purchases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
