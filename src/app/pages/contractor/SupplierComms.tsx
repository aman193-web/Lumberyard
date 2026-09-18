import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Search, Send, Mail, Zap, Shield, ShieldCheck, FileText,
  Plus, ChevronRight, ChevronDown, Check, CheckCheck, MoreHorizontal,
  Truck, Package, Calendar, Star, MapPin, Clock, AlertTriangle,
  X, Printer, Download, RefreshCw, Info, Lock, Eye, EyeOff,
  Paperclip, Smile, Phone, ExternalLink, Building2, ClipboardList,
  GitPullRequest, ArrowRightLeft, BadgeCheck, ChevronLeft,
  Layers, Hash, AlertCircle, CheckCircle, DollarSign,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type RightPanel = "none" | "supplier-info" | "po-generator" | "change-request";

interface SupplierThread {
  id: string;
  supplierId: string;
  subject: string;
  projectRef: string;
  phaseRef: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  poNumber: string | null;
  status: "active" | "quoted" | "ordered" | "closed";
  messages: SupplierMessage[];
}

interface SupplierMessage {
  id: string;
  senderId: "me" | "supplier" | "platform";
  senderInitials: string;
  content: string;
  timestamp: string;
  via: "in-app" | "email" | "platform";
  read: boolean;
  attachments?: { name: string; type: "pdf" | "csv" | "img" }[];
  systemEvent?: string; // e.g., "PO Issued", "Change Request #CR-002 submitted"
}

interface Supplier {
  id: string;
  name: string;
  relayId: string;        // platform relay ID (never expose real email)
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  specialties: string[];
  avatarColor: string;
  avatarInitials: string;
  totalOrderValue: number;
  activePOs: number;
  threads: SupplierThread[];
}

interface POLineItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
  phase: string;
}

interface ChangeRequestForm {
  type: "quantity" | "spec" | "delivery-date" | "cancellation" | "new-item";
  lineItemRef: string;
  description: string;
  urgency: "low" | "medium" | "high";
  proposedValue: string;
  reason: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SUPPLIERS: Supplier[] = [
  {
    id: "sup-001",
    name: "Austin Timber Supply",
    relayId: "relay-ats-4821",
    city: "Austin", state: "TX",
    rating: 4.8, reviewCount: 124,
    responseTime: "< 2 hrs",
    specialties: ["Framing Lumber", "Engineered Wood", "Plywood"],
    avatarColor: "bg-amber-500",
    avatarInitials: "AT",
    totalOrderValue: 47890,
    activePOs: 1,
    threads: [
      {
        id: "t-001",
        supplierId: "sup-001",
        subject: "RFQ-001 · Framing Package",
        projectRef: "2847 Oak Ridge Dr",
        phaseRef: "Framing",
        lastMessage: "Quote updated with 3% engineered lumber discount applied.",
        lastTime: "10:44 AM",
        unread: 2,
        poNumber: null,
        status: "quoted",
        messages: [
          {
            id: "m1", senderId: "supplier", senderInitials: "AT",
            content: "Hi Mike, we've reviewed your RFQ-001 for 2847 Oak Ridge Dr. We can fulfill all 142 line items. Our quote is $47,890 including phased delivery across 2 phases.",
            timestamp: "Yesterday, 2:18 PM", via: "in-app", read: true,
          },
          {
            id: "m2", senderId: "me", senderInitials: "MT",
            content: "Thanks! Can you confirm the Framing Package delivery for April 28th? We'll have crews ready to receive from 7–10 AM.",
            timestamp: "Yesterday, 3:05 PM", via: "in-app", read: true,
          },
          {
            id: "m3", senderId: "supplier", senderInitials: "AT",
            content: "April 28 works. I'll lock in the 7–10 AM window. The Douglas Fir studs are kiln-dried, #2 BTR grade or better. Confirming now.",
            timestamp: "Yesterday, 3:41 PM", via: "email", read: true,
          },
          {
            id: "m-sys-1", senderId: "platform", senderInitials: "PL",
            content: "", timestamp: "Yesterday, 3:42 PM", via: "platform", read: true,
            systemEvent: "Delivery window locked · Framing Package · April 28, 7:00–10:00 AM",
          },
          {
            id: "m4", senderId: "supplier", senderInitials: "AT",
            content: "Also — we're running a 3% discount on engineered lumber this week. That saves ~$800 on your LVL beams. Want me to apply it before you finalize?",
            timestamp: "10:42 AM", via: "in-app", read: false,
          },
          {
            id: "m5", senderId: "supplier", senderInitials: "AT",
            content: "Quote updated with 3% engineered lumber discount applied. New total: $47,090. Updated quote attached.",
            timestamp: "10:44 AM", via: "email", read: false,
            attachments: [{ name: "ATS-RFQ-001-v2.pdf", type: "pdf" }],
          },
        ],
      },
      {
        id: "t-002",
        supplierId: "sup-001",
        subject: "Foundation Package · Concrete & Formwork",
        projectRef: "2847 Oak Ridge Dr",
        phaseRef: "Foundation",
        lastMessage: "Delivery confirmed and completed. All items signed off.",
        lastTime: "Apr 10",
        unread: 0,
        poNumber: "PO-2026-001",
        status: "closed",
        messages: [
          {
            id: "m1", senderId: "me", senderInitials: "MT",
            content: "Need 8 items for the Foundation phase. PO-2026-001 issued — please confirm receipt.",
            timestamp: "Apr 7, 9:00 AM", via: "in-app", read: true,
          },
          {
            id: "m-sys-1", senderId: "platform", senderInitials: "PL",
            content: "", timestamp: "Apr 7, 9:01 AM", via: "platform", read: true,
            systemEvent: "PO Issued · PO-2026-001 · $4,820",
          },
          {
            id: "m2", senderId: "supplier", senderInitials: "AT",
            content: "PO-2026-001 received and confirmed. Scheduled delivery: April 10, 7:00–9:00 AM.",
            timestamp: "Apr 7, 10:15 AM", via: "email", read: true,
          },
          {
            id: "m3", senderId: "me", senderInitials: "MT",
            content: "Perfect. Gate code is 4821. Please have driver confirm arrival.",
            timestamp: "Apr 7, 10:30 AM", via: "in-app", read: true,
          },
          {
            id: "m-sys-2", senderId: "platform", senderInitials: "PL",
            content: "", timestamp: "Apr 10, 9:14 AM", via: "platform", read: true,
            systemEvent: "Delivery Confirmed · PO-2026-001 · Reviewed & Signed Off",
          },
          {
            id: "m4", senderId: "supplier", senderInitials: "AT",
            content: "Delivery confirmed and completed. All items signed off. Pleasure working with you on Phase 1.",
            timestamp: "Apr 10, 9:30 AM", via: "in-app", read: true,
          },
        ],
      },
    ],
  },
  {
    id: "sup-002",
    name: "Hill Country Lumber",
    relayId: "relay-hcl-3304",
    city: "Round Rock", state: "TX",
    rating: 4.6, reviewCount: 87,
    responseTime: "< 4 hrs",
    specialties: ["Exterior Siding", "Dimensional Lumber", "Roofing"],
    avatarColor: "bg-blue-500",
    avatarInitials: "HC",
    totalOrderValue: 0,
    activePOs: 0,
    threads: [
      {
        id: "t-003",
        supplierId: "sup-002",
        subject: "RFQ-002 · Exterior & Siding Package",
        projectRef: "2847 Oak Ridge Dr",
        phaseRef: "Exterior",
        lastMessage: "We can match your spec. Quote forthcoming — will have it to you by EOD.",
        lastTime: "Yesterday",
        unread: 1,
        poNumber: null,
        status: "active",
        messages: [
          {
            id: "m1", senderId: "me", senderInitials: "MT",
            content: "Hi Hill Country team — requesting a quote on the Exterior & Siding package for 2847 Oak Ridge Dr. 7 line items, target delivery around May 26. Full BOM attached.",
            timestamp: "Yesterday, 10:00 AM", via: "in-app", read: true,
            attachments: [{ name: "BOM-Exterior-v1.csv", type: "csv" }],
          },
          {
            id: "m2", senderId: "supplier", senderInitials: "HC",
            content: "Thanks Mike — we can match your spec on all 7 items. Our estimator is reviewing now. You'll have a full quote by EOD today.",
            timestamp: "Yesterday, 2:15 PM", via: "email", read: false,
          },
        ],
      },
    ],
  },
  {
    id: "sup-003",
    name: "Central Texas Lumber Co",
    relayId: "relay-ctl-7712",
    city: "Cedar Park", state: "TX",
    rating: 4.4, reviewCount: 53,
    responseTime: "< 6 hrs",
    specialties: ["Sheathing", "Roofing", "Insulation"],
    avatarColor: "bg-violet-500",
    avatarInitials: "CT",
    totalOrderValue: 0,
    activePOs: 0,
    threads: [
      {
        id: "t-004",
        supplierId: "sup-003",
        subject: "RFQ-003 · Dry-In Package",
        projectRef: "2847 Oak Ridge Dr",
        phaseRef: "Dry-In",
        lastMessage: "Quote submitted: $12,440 for 9 line items, delivery May 6.",
        lastTime: "2 days ago",
        unread: 0,
        poNumber: null,
        status: "quoted",
        messages: [
          {
            id: "m1", senderId: "me", senderInitials: "MT",
            content: "Requesting quote for Dry-In phase — roof sheathing, felt paper, ridge caps. 9 items total. Need delivery by May 6.",
            timestamp: "Apr 20, 11:00 AM", via: "in-app", read: true,
          },
          {
            id: "m2", senderId: "supplier", senderInitials: "CT",
            content: "Quote submitted: $12,440 for all 9 line items. Delivery May 6 is confirmed. OSB is structural-grade per IBC. Full quote attached.",
            timestamp: "Apr 21, 9:00 AM", via: "email", read: true,
            attachments: [{ name: "CTL-Quote-RFQ-003.pdf", type: "pdf" }],
          },
        ],
      },
    ],
  },
];

// Mock PO line items for PO generator
const PO_LINE_ITEMS: POLineItem[] = [
  { id: "li-1",  description: "2×6 DF #2 KD Studs 8'",              qty: 320,  unit: "EA",   unitPrice: 8.45,  total: 2704.00, phase: "Framing" },
  { id: "li-2",  description: "2×10 DF #2 KD Joists 16'",           qty: 84,   unit: "EA",   unitPrice: 22.50, total: 1890.00, phase: "Framing" },
  { id: "li-3",  description: "LVL 3.5×9.5\" 20' Beam",              qty: 6,    unit: "EA",   unitPrice: 285.00,total: 1710.00, phase: "Framing" },
  { id: "li-4",  description: "LVL 3.5×14\" 20' Ridge Beam",         qty: 2,    unit: "EA",   unitPrice: 410.00,total: 820.00,  phase: "Framing" },
  { id: "li-5",  description: "2×4 SPF Stud 92-5/8\"",              qty: 480,  unit: "EA",   unitPrice: 5.20,  total: 2496.00, phase: "Framing" },
  { id: "li-6",  description: "OSB 7/16\" 4×8 Sheathing",           qty: 96,   unit: "SHT",  unitPrice: 32.00, total: 3072.00, phase: "Framing" },
  { id: "li-7",  description: "HDU Holdowns Simpson Strong-Tie",     qty: 12,   unit: "EA",   unitPrice: 48.50, total: 582.00,  phase: "Framing" },
  { id: "li-8",  description: "Joist Hangers LUS210",                qty: 160,  unit: "EA",   unitPrice: 3.80,  total: 608.00,  phase: "Framing" },
  { id: "li-9",  description: "Hurricane Ties H2.5A",                qty: 240,  unit: "EA",   unitPrice: 2.10,  total: 504.00,  phase: "Framing" },
  { id: "li-10", description: "Structural Screws 3\" (2lb box)",     qty: 24,   unit: "BOX",  unitPrice: 18.00, total: 432.00,  phase: "Framing" },
  { id: "li-11", description: "16d Nails Galv 50lb",                qty: 8,    unit: "BOX",  unitPrice: 95.00, total: 760.00,  phase: "Framing" },
  { id: "li-12", description: "Beam Pockets Douglas Fir 4×6",        qty: 4,    unit: "EA",   unitPrice: 62.00, total: 248.00,  phase: "Framing" },
];

const CHANGE_REQUEST_TYPES = [
  { value: "quantity",      label: "Quantity Adjustment",     icon: <ArrowRightLeft size={13} />, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "spec",          label: "Spec / Grade Change",     icon: <Layers size={13} />,         color: "text-violet-600 bg-violet-50 border-violet-200" },
  { value: "delivery-date", label: "Delivery Date Change",    icon: <Calendar size={13} />,       color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "cancellation",  label: "Item Cancellation",       icon: <X size={13} />,              color: "text-red-600 bg-red-50 border-red-200" },
  { value: "new-item",      label: "Add New Item",            icon: <Plus size={13} />,           color: "text-green-600 bg-green-50 border-green-200" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ViaLabel({ via }: { via: "in-app" | "email" | "platform" }) {
  if (via === "email")
    return <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400"><Mail size={9} /> email relay</span>;
  if (via === "platform")
    return <span className="inline-flex items-center gap-0.5 text-[10px] text-green-600"><Zap size={9} /> system</span>;
  return <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400"><Zap size={9} /> in-app</span>;
}

function StatusBadge({ status }: { status: SupplierThread["status"] }) {
  const cfg = {
    active:  { label: "Active",  color: "bg-blue-50 text-blue-700 border-blue-200" },
    quoted:  { label: "Quoted",  color: "bg-amber-50 text-amber-700 border-amber-200" },
    ordered: { label: "PO Sent", color: "bg-violet-50 text-violet-700 border-violet-200" },
    closed:  { label: "Closed",  color: "bg-green-50 text-green-700 border-green-200" },
  }[status];
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
  );
}

function MaskedContactRow({ icon, label, masked }: { icon: React.ReactNode; label: string; masked: string }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-slate-400 font-medium">{label}</div>
        <div className={`text-xs font-medium mt-0.5 ${revealed ? "text-slate-700" : "text-slate-300 select-none tracking-wider"}`}>
          {revealed ? masked : "••••••••••••••••"}
        </div>
      </div>
      <button
        onClick={() => setRevealed(v => !v)}
        className="flex-shrink-0 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        title={revealed ? "Hide" : "Reveal (protected relay)"}
      >
        {revealed ? <EyeOff size={12} className="text-slate-400" /> : <Eye size={12} className="text-slate-400" />}
      </button>
    </div>
  );
}

// ─── PO Generator Panel ───────────────────────────────────────────────────────

function POGeneratorPanel({ supplier, thread, onClose }: {
  supplier: Supplier; thread: SupplierThread; onClose: () => void;
}) {
  const [selectedItems, setSelectedItems] = useState<string[]>(PO_LINE_ITEMS.map(i => i.id));
  const [deliveryDate, setDeliveryDate] = useState("2026-04-28");
  const [deliveryWindow, setDeliveryWindow] = useState("7:00–10:00 AM");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [poNote, setPoNote] = useState("");
  const [issued, setIssued] = useState(false);

  const toggleItem = (id: string) =>
    setSelectedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const selected = PO_LINE_ITEMS.filter(i => selectedItems.includes(i.id));
  const subtotal = selected.reduce((s, i) => s + i.total, 0);
  const discount = subtotal * 0.03;
  const delivery = 320;
  const tax = (subtotal - discount) * 0.0825;
  const total = subtotal - discount + delivery + tax;

  const poNumber = `PO-2026-${String(Date.now()).slice(-4)}`;

  if (issued) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
          <BadgeCheck size={32} className="text-green-600" />
        </div>
        <div className="text-base font-bold text-slate-900 mb-1">PO Issued!</div>
        <div className="text-xs text-slate-500 mb-4">{poNumber} sent to {supplier.name} via platform relay.</div>
        <div className="bg-slate-50 rounded-xl border border-slate-200 px-5 py-4 w-full text-left space-y-2 mb-6">
          {[
            { label: "PO Number",    value: poNumber },
            { label: "Supplier",     value: supplier.name },
            { label: "Total",        value: `$${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
            { label: "Delivery",     value: `${deliveryDate} · ${deliveryWindow}` },
            { label: "Terms",        value: paymentTerms },
          ].map(r => (
            <div key={r.label} className="flex justify-between text-xs">
              <span className="text-slate-400">{r.label}</span>
              <span className="font-semibold text-slate-700">{r.value}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 w-full">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <Printer size={13} /> Print
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={13} /> PDF
          </button>
          <button onClick={onClose} className="flex-1 py-2 text-xs font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
          <FileText size={15} className="text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-900">Generate PO</div>
          <div className="text-[10px] text-slate-500 truncate">{supplier.name} · {thread.phaseRef}</div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <X size={14} className="text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* PO Meta */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "PO Number", value: poNumber, mono: true },
              { label: "Date", value: "April 23, 2026", mono: false },
              { label: "Project", value: "2847 Oak Ridge Dr", mono: false },
              { label: "Phase", value: thread.phaseRef, mono: false },
            ].map(f => (
              <div key={f.label}>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{f.label}</div>
                <div className={`text-xs font-semibold text-slate-800 mt-0.5 ${f.mono ? "font-mono" : ""}`}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier (Relay Info Only) */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Supplier (Relay Protected)</div>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${supplier.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {supplier.avatarInitials}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">{supplier.name}</div>
              <div className="text-[10px] text-slate-400">{supplier.city}, {supplier.state} · Relay: {supplier.relayId}</div>
            </div>
            <div className="ml-auto flex items-center gap-1 text-[10px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
              <ShieldCheck size={10} /> Protected
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Delivery Details</div>
          <div className="space-y-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Requested Delivery Date</label>
              <input
                type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Time Window</label>
              <select value={deliveryWindow} onChange={e => setDeliveryWindow(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white">
                {["6:00–8:00 AM","7:00–10:00 AM","8:00–11:00 AM","10:00 AM–12:00 PM","12:00–2:00 PM"].map(w => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-[10px] text-blue-700 flex items-start gap-1.5">
              <Info size={10} className="flex-shrink-0 mt-0.5" />
              Delivery address is on file with the platform. Not transmitted directly to supplier.
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Line Items</div>
            <span className="text-[10px] text-slate-400">{selectedItems.length}/{PO_LINE_ITEMS.length} selected</span>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {PO_LINE_ITEMS.map(item => (
              <label
                key={item.id}
                className={`flex items-start gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all border ${
                  selectedItems.includes(item.id) ? "border-green-300 bg-green-50" : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <input type="checkbox" className="hidden" checked={selectedItems.includes(item.id)} onChange={() => toggleItem(item.id)} />
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                  selectedItems.includes(item.id) ? "bg-green-600 border-green-600" : "border-slate-300"
                }`}>
                  {selectedItems.includes(item.id) && <Check size={9} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-slate-700 truncate">{item.description}</div>
                  <div className="text-[10px] text-slate-400">{item.qty} {item.unit} @ ${item.unitPrice.toFixed(2)}</div>
                </div>
                <div className="text-[11px] font-semibold text-slate-700 flex-shrink-0">${item.total.toLocaleString()}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Payment Terms */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Terms</div>
          <div className="flex gap-2 flex-wrap">
            {["Net 15", "Net 30", "Net 45", "COD", "50% upfront"].map(t => (
              <button
                key={t}
                onClick={() => setPaymentTerms(t)}
                className={`text-[11px] px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  paymentTerms === t ? "border-green-500 bg-green-50 text-green-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* PO Note */}
        <div className="px-5 py-4 border-b border-slate-100">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">PO Notes</label>
          <textarea
            value={poNote} onChange={e => setPoNote(e.target.value)}
            rows={2}
            placeholder="Any special instructions or notes for this PO…"
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
          />
        </div>

        {/* Pricing Summary */}
        <div className="px-5 py-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Order Summary</div>
          <div className="space-y-2">
            {[
              { label: "Subtotal", value: subtotal, color: "text-slate-700" },
              { label: "3% Engineered Lumber Discount", value: -discount, color: "text-green-700" },
              { label: "Delivery Fee", value: delivery, color: "text-slate-700" },
              { label: `Tax (8.25%)`, value: tax, color: "text-slate-700" },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-xs">
                <span className="text-slate-500">{r.label}</span>
                <span className={`font-semibold ${r.color}`}>
                  {r.value < 0 ? "-" : ""}${Math.abs(r.value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-slate-200 pt-2 mt-1">
              <span className="text-sm font-bold text-slate-900">Total</span>
              <span className="text-sm font-bold text-green-700">
                ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
          <Download size={12} /> Preview PDF
        </button>
        <button
          onClick={() => setIssued(true)}
          className="flex-1 py-2 text-xs font-bold bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Send size={12} /> Issue PO · ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </button>
      </div>
    </div>
  );
}

// ─── Supplier Info Panel ──────────────────────────────────────────────────────

function SupplierInfoPanel({ supplier, onClose }: { supplier: Supplier; onClose: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
          <Building2 size={15} className="text-slate-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-900">Supplier Profile</div>
          <div className="text-[10px] text-slate-500 truncate">{supplier.name}</div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <X size={14} className="text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Avatar + Name */}
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${supplier.avatarColor} flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}>
            {supplier.avatarInitials}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{supplier.name}</div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <MapPin size={11} className="text-slate-400" />{supplier.city}, {supplier.state}
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              {[1,2,3,4,5].map(n => (
                <Star key={n} size={12} className={n <= Math.round(supplier.rating) ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
              ))}
              <span className="text-[10px] text-slate-400 ml-1">{supplier.rating} · {supplier.reviewCount} reviews</span>
            </div>
          </div>
        </div>

        {/* Protected Contact Block */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-800">Contact Info Protected</span>
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed mb-3">
            Direct supplier contact details are masked to protect both parties. All communication flows through the Lumberyard platform relay. Contact is revealed only after PO finalization per platform terms.
          </p>
          <div className="text-[10px] font-mono bg-amber-100 border border-amber-300 text-amber-800 px-3 py-2 rounded-lg">
            Relay ID: {supplier.relayId}
          </div>
        </div>

        {/* Masked Contact Details */}
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-50 overflow-hidden">
          <MaskedContactRow icon={<Phone size={12} />}   label="Phone"   masked="512-555-0192 (ext. 4)" />
          <MaskedContactRow icon={<Mail size={12} />}    label="Email"   masked={`orders@${supplier.name.toLowerCase().replace(/\s/g,"")}tx.com`} />
          <MaskedContactRow icon={<MapPin size={12} />}  label="Address" masked={`1204 Industrial Blvd, ${supplier.city}, TX 78701`} />
        </div>

        {/* Performance Stats */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Performance</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Delivery Reliability", value: "98%",  color: "text-green-700" },
              { label: "Avg Response Time",    value: supplier.responseTime, color: "text-blue-700" },
              { label: "Material Quality",      value: "4.8★", color: "text-amber-700" },
              { label: "Active POs",            value: supplier.activePOs.toString(), color: "text-slate-700" },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                <div className="text-[10px] text-slate-400 font-medium">{s.label}</div>
                <div className={`text-sm font-bold mt-0.5 ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Specialties */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Specialties</div>
          <div className="flex flex-wrap gap-1.5">
            {supplier.specialties.map(s => (
              <span key={s} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{s}</span>
            ))}
          </div>
        </div>

        {/* Total with supplier */}
        <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <DollarSign size={18} className="text-green-600 flex-shrink-0" />
          <div>
            <div className="text-[10px] text-green-700 font-semibold">Lifetime Order Value</div>
            <div className="text-base font-bold text-green-800">
              ${supplier.totalOrderValue > 0 ? supplier.totalOrderValue.toLocaleString() : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Change Request Panel ─────────────────────────────────────────────────────

function ChangeRequestPanel({ thread, onClose }: { thread: SupplierThread; onClose: () => void }) {
  const [form, setForm] = useState<ChangeRequestForm>({
    type: "quantity",
    lineItemRef: "",
    description: "",
    urgency: "medium",
    proposedValue: "",
    reason: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const crNumber = `CR-${String(Date.now()).slice(-4)}`;

  const handleSubmit = () => {
    if (!form.description.trim()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
          <GitPullRequest size={32} className="text-violet-600" />
        </div>
        <div className="text-base font-bold text-slate-900 mb-1">Change Request Submitted</div>
        <div className="text-xs text-slate-500 mb-2">{crNumber} sent to supplier for review</div>
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-left space-y-2 mb-5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Reference</span>
            <span className="font-mono font-semibold text-slate-700">{crNumber}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Type</span>
            <span className="font-semibold text-slate-700">{CHANGE_REQUEST_TYPES.find(t => t.value === form.type)?.label}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Urgency</span>
            <span className={`font-semibold capitalize ${form.urgency === "high" ? "text-red-600" : form.urgency === "medium" ? "text-amber-600" : "text-green-600"}`}>
              {form.urgency}
            </span>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 mb-5 text-left">
          <strong>Note:</strong> The supplier may accept, reject, or counter-propose. You'll be notified in this thread when they respond.
        </div>
        <button onClick={onClose} className="w-full py-2.5 text-sm font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
          Back to Thread
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
          <GitPullRequest size={15} className="text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-900">Change Request</div>
          <div className="text-[10px] text-slate-500 truncate">{thread.subject}</div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <X size={14} className="text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* CR Number preview */}
        <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-4 py-2.5">
          <Hash size={12} className="text-violet-500" />
          <span className="text-xs font-mono font-semibold text-violet-700">{crNumber}</span>
          <span className="text-[10px] text-violet-500 ml-1">· Draft</span>
        </div>

        {/* Change type */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Change Type</label>
          <div className="space-y-1.5">
            {CHANGE_REQUEST_TYPES.map(t => (
              <label
                key={t.value}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                  form.type === t.value ? `${t.color} border-current` : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <input type="radio" className="hidden" checked={form.type === t.value}
                  onChange={() => setForm(f => ({ ...f, type: t.value as ChangeRequestForm["type"] }))} />
                <span className={form.type === t.value ? "" : "text-slate-400"}>{t.icon}</span>
                <span className="text-xs font-semibold text-slate-800 flex-1">{t.label}</span>
                {form.type === t.value && <CheckCircle size={13} className="text-green-600 flex-shrink-0" />}
              </label>
            ))}
          </div>
        </div>

        {/* Line item reference */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Line Item Reference (optional)</label>
          <select
            value={form.lineItemRef}
            onChange={e => setForm(f => ({ ...f, lineItemRef: e.target.value }))}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white"
          >
            <option value="">Select a line item…</option>
            {PO_LINE_ITEMS.map(i => (
              <option key={i.id} value={i.id}>{i.description}</option>
            ))}
          </select>
        </div>

        {/* Proposed value */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            {form.type === "quantity" ? "New Quantity" :
             form.type === "delivery-date" ? "New Delivery Date" :
             form.type === "spec" ? "New Spec / Grade" :
             "Proposed Value"}
          </label>
          <input
            type={form.type === "delivery-date" ? "date" : "text"}
            value={form.proposedValue}
            onChange={e => setForm(f => ({ ...f, proposedValue: e.target.value }))}
            placeholder={
              form.type === "quantity" ? "e.g. 400 EA" :
              form.type === "spec" ? "e.g. 3.5×14 LVL instead of 3.5×11.25" :
              form.type === "new-item" ? "e.g. 2×4 SPF 96\" studs — 200 EA" :
              "Enter proposed value…"
            }
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description <span className="text-red-400">*</span></label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            placeholder="Describe the change clearly. Include any impacted phases, dimensions, or schedule constraints…"
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none"
          />
        </div>

        {/* Reason */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Reason / Justification</label>
          <textarea
            value={form.reason}
            onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            rows={2}
            placeholder="e.g. Architect updated structural specs per IBC §2308 revision…"
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none"
          />
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Urgency</label>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as const).map(u => (
              <button
                key={u}
                onClick={() => setForm(f => ({ ...f, urgency: u }))}
                className={`flex-1 py-2 text-[11px] font-semibold rounded-xl border-2 capitalize transition-all ${
                  form.urgency === u
                    ? u === "high" ? "border-red-500 bg-red-50 text-red-700"
                    : u === "medium" ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-green-500 bg-green-50 text-green-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Platform masking notice */}
        <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
          <Shield size={11} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-slate-500 leading-relaxed">
            This change request will be sent via platform relay. Your direct contact info will not be shared with the supplier.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0">
        <button
          disabled={!form.description.trim()}
          onClick={handleSubmit}
          className="w-full py-2.5 text-sm font-bold bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <GitPullRequest size={14} /> Submit Change Request
        </button>
      </div>
    </div>
  );
}

// ─── Thread View ──────────────────────────────────────────────────────────────

function ThreadView({ supplier, thread, rightPanel, setRightPanel }: {
  supplier: Supplier;
  thread: SupplierThread;
  rightPanel: RightPanel;
  setRightPanel: (p: RightPanel) => void;
}) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<SupplierMessage[]>(thread.messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thread.id]);

  const handleSend = () => {
    if (!draft.trim()) return;
    const newMsg: SupplierMessage = {
      id: `m-${Date.now()}`,
      senderId: "me",
      senderInitials: "MT",
      content: draft.trim(),
      timestamp: "Just now",
      via: "in-app",
      read: true,
    };
    setMessages(prev => [...prev, newMsg]);
    setDraft("");
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full min-w-0">

      {/* Thread Header */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-5 py-3.5">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl ${supplier.avatarColor} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
            {supplier.avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900">{supplier.name}</span>
              <span className="text-xs text-slate-400">{supplier.city}, {supplier.state}</span>
              <StatusBadge status={thread.status} />
              {thread.poNumber && (
                <span className="text-[10px] font-mono bg-green-50 border border-green-200 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                  {thread.poNumber}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 truncate">{thread.subject}</div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setRightPanel(rightPanel === "supplier-info" ? "none" : "supplier-info")}
              title="Supplier Info"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                rightPanel === "supplier-info" ? "bg-slate-800 text-white border-slate-800" : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <Building2 size={12} /> Info
            </button>
            <button
              onClick={() => setRightPanel(rightPanel === "po-generator" ? "none" : "po-generator")}
              title="Generate PO"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                rightPanel === "po-generator" ? "bg-green-600 text-white border-green-600" : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <FileText size={12} /> PO
            </button>
            <button
              onClick={() => setRightPanel(rightPanel === "change-request" ? "none" : "change-request")}
              title="Change Request"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                rightPanel === "change-request" ? "bg-violet-600 text-white border-violet-600" : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <GitPullRequest size={12} /> CR
            </button>
          </div>
        </div>
      </div>

      {/* Relay Banner */}
      <div className="flex-shrink-0 flex items-center gap-2 px-5 py-2 bg-amber-50 border-b border-amber-100">
        <ShieldCheck size={12} className="text-amber-600 flex-shrink-0" />
        <p className="text-[11px] text-amber-800">
          <span className="font-bold">Contact protected</span> — all messages route through platform relay ID <span className="font-mono">{supplier.relayId}</span>. Supplier cannot see your direct contact.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((msg, idx) => {
          const prevMsg = messages[idx - 1];
          const showDay = idx === 0 || prevMsg?.timestamp.split(",")[0] !== msg.timestamp.split(",")[0];

          if (msg.systemEvent) {
            return (
              <div key={msg.id}>
                {showDay && (
                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[10px] text-slate-400 font-medium px-2">{msg.timestamp.split(",")[0] || "Today"}</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                )}
                <div className="flex items-center gap-2 justify-center my-2">
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5">
                    <Zap size={10} className="text-green-600" />
                    <span className="text-[10px] font-semibold text-green-700">{msg.systemEvent}</span>
                    <span className="text-[10px] text-green-500">· {msg.timestamp.split(", ")[1] || msg.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          }

          const isMe = msg.senderId === "me";
          return (
            <React.Fragment key={msg.id}>
              {showDay && (
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[10px] text-slate-400 font-medium px-2">{msg.timestamp.split(",")[0] || "Today"}</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              )}
              <div className={`flex items-end gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                {!isMe && (
                  <div className={`w-7 h-7 rounded-full ${supplier.avatarColor} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mb-0.5`}>
                    {supplier.avatarInitials}
                  </div>
                )}
                <div className={`max-w-[68%] flex flex-col gap-1.5 ${isMe ? "items-end" : "items-start"}`}>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                      {msg.attachments.map(att => (
                        <div key={att.name} className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            att.type === "pdf" ? "bg-red-100" : att.type === "csv" ? "bg-green-100" : "bg-blue-100"
                          }`}>
                            <FileText size={12} className={att.type === "pdf" ? "text-red-600" : att.type === "csv" ? "text-green-600" : "text-blue-600"} />
                          </div>
                          <span className="text-[11px] font-medium text-slate-700">{att.name}</span>
                          <Download size={11} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-green-600 text-white rounded-br-sm"
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
                  }`}>
                    {msg.content}
                  </div>
                  <div className={`flex items-center gap-1 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                    <span className="text-[10px] text-slate-400">
                      {msg.timestamp.includes(",") ? msg.timestamp.split(", ")[1] : msg.timestamp}
                    </span>
                    <ViaLabel via={msg.via} />
                    {isMe && (
                      <span className="text-[10px] text-slate-400">
                        {msg.read ? <CheckCheck size={12} className="text-green-500" /> : <Check size={12} />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Compose */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200 px-4 py-3">
        {/* Quick actions */}
        <div className="flex gap-2 mb-2.5 overflow-x-auto pb-0.5">
          {["Confirm delivery date", "Request updated quote", "Approve change request", "Need PO number"].map(q => (
            <button
              key={q}
              onClick={() => setDraft(q)}
              className="flex-shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl flex items-end gap-2 px-4 py-2.5 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Message supplier via platform relay…"
              rows={1}
              className="flex-1 text-sm bg-transparent border-none outline-none resize-none max-h-24 text-slate-800 placeholder-slate-400"
            />
            <div className="flex items-center gap-1.5 flex-shrink-0 pb-0.5">
              <button className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
                <Paperclip size={14} />
              </button>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send size={15} />
          </button>
        </div>
        <div className="flex items-center gap-1 mt-1.5 px-1">
          <Lock size={9} className="text-slate-400" />
          <span className="text-[9px] text-slate-400">End-to-end relay · direct contact never exposed to supplier</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SupplierComms() {
  const navigate = useNavigate();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("sup-001");
  const [selectedThreadId, setSelectedThreadId]     = useState<string>("t-001");
  const [rightPanel, setRightPanel] = useState<RightPanel>("none");
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");

  const selectedSupplier = SUPPLIERS.find(s => s.id === selectedSupplierId)!;
  const selectedThread   = selectedSupplier?.threads.find(t => t.id === selectedThreadId)
    ?? selectedSupplier?.threads[0];

  const allThreads = SUPPLIERS.flatMap(s => s.threads.map(t => ({ ...t, supplier: s })));
  const totalUnread = allThreads.reduce((sum, t) => sum + t.unread, 0);

  const filteredSuppliers = SUPPLIERS.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.threads.some(t => t.subject.toLowerCase().includes(search.toLowerCase()))
  );

  const selectThread = (supplierId: string, threadId: string) => {
    setSelectedSupplierId(supplierId);
    setSelectedThreadId(threadId);
    setRightPanel("none");
    setMobileView("thread");
  };

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">

      {/* ── Left Panel: Supplier List ──────────────────────────────────────── */}
      <div className={`w-80 flex-shrink-0 flex flex-col bg-white border-r border-slate-200 ${mobileView === "thread" ? "hidden lg:flex" : "flex"}`}>

        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">Supplier Comms</h1>
                {totalUnread > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{totalUnread}</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{SUPPLIERS.length} suppliers · relay protected</p>
            </div>
            <button
              onClick={() => navigate("/contractor")}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              title="Back to dashboard"
            >
              <ArrowLeft size={15} />
            </button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Search suppliers or threads…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-colors"
            />
          </div>
        </div>

        {/* Supplier + Thread List */}
        <div className="flex-1 overflow-y-auto">
          {filteredSuppliers.map(supplier => {
            const supUnread = supplier.threads.reduce((s, t) => s + t.unread, 0);
            const isSupActive = selectedSupplierId === supplier.id;
            return (
              <div key={supplier.id}>
                {/* Supplier header row */}
                <div className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 ${isSupActive ? "bg-slate-50" : ""}`}>
                  <div className={`w-8 h-8 rounded-xl ${supplier.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {supplier.avatarInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{supplier.name}</div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{supplier.city}, {supplier.state}</span>
                      <span>·</span>
                      <span>{supplier.threads.length} thread{supplier.threads.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {supUnread > 0 && (
                      <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{supUnread}</span>
                    )}
                    <div className="flex items-center gap-0.5 text-[10px] text-amber-600">
                      <Star size={9} className="fill-amber-400 text-amber-400" />
                      <span>{supplier.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Thread rows */}
                {supplier.threads.map(thread => {
                  const isActive = selectedThreadId === thread.id && isSupActive;
                  return (
                    <button
                      key={thread.id}
                      onClick={() => selectThread(supplier.id, thread.id)}
                      className={`w-full text-left pl-11 pr-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors relative ${
                        isActive ? "bg-green-50 hover:bg-green-50" : ""
                      }`}
                    >
                      {isActive && <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-green-500 rounded-r" />}
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs truncate ${thread.unread > 0 ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                            {thread.subject}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <StatusBadge status={thread.status} />
                            <span className="text-[10px] text-slate-400 truncate">{thread.phaseRef}</span>
                          </div>
                          <p className={`text-[11px] mt-1 truncate ${thread.unread > 0 ? "text-slate-600" : "text-slate-400"}`}>
                            {thread.lastMessage}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[10px] text-slate-400">{thread.lastTime}</span>
                          {thread.unread > 0 && (
                            <span className="w-4 h-4 bg-green-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{thread.unread}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Relay notice */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Shield size={11} className="text-slate-400 flex-shrink-0" />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              All supplier contact routed via <span className="font-semibold text-slate-500">platform relay</span>. Direct info never exposed.
            </p>
          </div>
        </div>
      </div>

      {/* ── Center: Thread View ────────────────────────────────────────────── */}
      {selectedSupplier && selectedThread ? (
        <div className={`flex-1 flex min-w-0 overflow-hidden ${mobileView === "list" ? "hidden lg:flex" : "flex"}`}>

          {/* Mobile back */}
          <div className="lg:hidden absolute top-0 left-0 z-10 p-2">
            <button onClick={() => setMobileView("list")} className="flex items-center gap-1 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
              <ChevronLeft size={13} /> All Threads
            </button>
          </div>

          {/* Thread area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <ThreadView
              supplier={selectedSupplier}
              thread={selectedThread}
              rightPanel={rightPanel}
              setRightPanel={setRightPanel}
            />
          </div>

          {/* ── Right Panel ──────────────────────────────────────────────── */}
          {rightPanel !== "none" && (
            <div className="w-80 xl:w-96 flex-shrink-0 flex flex-col bg-white border-l border-slate-200 overflow-hidden">
              {rightPanel === "supplier-info" && (
                <SupplierInfoPanel supplier={selectedSupplier} onClose={() => setRightPanel("none")} />
              )}
              {rightPanel === "po-generator" && (
                <POGeneratorPanel supplier={selectedSupplier} thread={selectedThread} onClose={() => setRightPanel("none")} />
              )}
              {rightPanel === "change-request" && (
                <ChangeRequestPanel thread={selectedThread} onClose={() => setRightPanel("none")} />
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Building2 size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">Select a supplier thread</p>
          </div>
        </div>
      )}
    </div>
  );
}
