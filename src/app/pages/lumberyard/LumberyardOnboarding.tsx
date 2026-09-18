import React, { useState } from "react";
import {
  CheckCircle, ChevronRight, ChevronLeft, Zap, FileText, MapPin,
  Truck, Calendar, Package, ShieldCheck, Target, ArrowRight,
  Plus, Trash2, AlertCircle, Star,
} from "lucide-react";

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { id: "welcome",       label: "Welcome",         icon: <Zap size={15} /> },
  { id: "terms",         label: "Terms",           icon: <FileText size={15} /> },
  { id: "service-area",  label: "Service Area",    icon: <MapPin size={15} /> },
  { id: "delivery",      label: "Delivery Rules",  icon: <Truck size={15} /> },
  { id: "calendar",      label: "Availability",    icon: <Calendar size={15} /> },
  { id: "catalog",       label: "Catalog",         icon: <Package size={15} /> },
  { id: "price-policy",  label: "Price Policy",    icon: <ShieldCheck size={15} /> },
  { id: "complete",      label: "Go Live",         icon: <Star size={15} /> },
];

const inputCls = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white";
const labelCls = "block text-xs font-semibold text-slate-700 mb-1.5";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// ─── Step 0: Welcome ──────────────────────────────────────────────────────────

function WelcomeStep() {
  return (
    <div className="flex flex-col items-center text-center py-8 space-y-6">
      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
        <Zap size={28} className="text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Receive Orders, Not Leads.</h2>
        <p className="text-sm text-slate-500 max-w-md leading-relaxed">
          Welcome to Lumberyard. In the next few steps we'll set up your supplier account so contractors can find you, get quotes, and place structured purchase orders — automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl mt-4">
        {[
          { value: "$4,200", label: "Avg order value", sub: "per fulfilled PO" },
          { value: "320+",   label: "Active contractors", sub: "in your metro" },
          { value: "94%",    label: "On-time target", sub: "top suppliers" },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <div className="text-xl font-bold text-amber-600">{stat.value}</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">{stat.label}</div>
            <div className="text-[10px] text-slate-400">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-left w-full max-w-xl">
        <div className="text-xs font-bold text-amber-800 mb-2">What we'll set up together:</div>
        <ul className="space-y-1.5">
          {["Accept supplier terms & agreements", "Define your delivery service area", "Configure delivery windows & rules", "Set your availability calendar", "Add your first products to the catalog", "Configure your price lock policy"].map(item => (
            <li key={item} className="flex items-center gap-2 text-xs text-amber-700">
              <CheckCircle size={11} className="text-amber-500 flex-shrink-0" /> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Step 1: Terms ────────────────────────────────────────────────────────────

const TERMS_DOCS = [
  {
    id: "marketplace",
    title: "Marketplace Terms of Service",
    version: "v2.1",
    summary: "Governs your participation in the marketplace including order fulfillment obligations, payment processing, and dispute resolution.",
    bullets: [
      "Orders must be confirmed within 4 business hours",
      "Platform fee: 2.9% per fulfilled order",
      "Fulfillment rate below 85% may result in suspension",
    ],
  },
  {
    id: "anti-circ",
    title: "Anti-Circumvention Policy",
    version: "v1.2",
    summary: "Prohibits directing contractors to transact outside the platform for orders that originated through a Lumberyard marketplace interaction.",
    bullets: [
      "On-platform transactions required for all Lumberyard-sourced leads",
      "First violation: 30-day suspension. Second: permanent removal",
      "Applies for 12 months after initial contractor contact",
    ],
  },
  {
    id: "sla",
    title: "24-Hour Exception SLA",
    version: "v1.0",
    summary: "Defines the 24-hour response requirement for order exceptions — stock discrepancies, price corrections, and delivery reschedules.",
    bullets: [
      "All exception notices responded to within 24 hours (business days)",
      "Failure to respond transfers resolution rights to the platform",
      "Each missed SLA is logged in your reliability score",
    ],
  },
  {
    id: "responsibilities",
    title: "Supplier Responsibilities",
    version: "v1.1",
    summary: "Outlines operational requirements including catalog accuracy, delivery documentation, packaging standards, and contractor communication.",
    bullets: [
      "Catalog pricing updated at least every 14 days",
      "Delivery requires signed proof-of-delivery and photo",
      "Damaged shipments reported within 2 hours of driver return",
    ],
  },
];

function TermsStep({ accepted, setAccepted }: { accepted: Set<string>; setAccepted: (s: Set<string>) => void }) {
  const [expanded, setExpanded] = useState<string | null>("marketplace");

  const toggle = (id: string) => {
    const next = new Set(accepted);
    if (next.has(id)) next.delete(id); else next.add(id);
    setAccepted(next);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Accept Supplier Agreements</h2>
        <p className="text-xs text-slate-500 mt-1">Read and accept all four documents to continue. Your acceptance is timestamped and stored as an immutable record.</p>
      </div>

      {accepted.size < TERMS_DOCS.length && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          <AlertCircle size={13} className="text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700">{TERMS_DOCS.length - accepted.size} agreement{TERMS_DOCS.length - accepted.size !== 1 ? "s" : ""} remaining</p>
        </div>
      )}

      <div className="space-y-2">
        {TERMS_DOCS.map(doc => {
          const isOpen = expanded === doc.id;
          const isAccepted = accepted.has(doc.id);
          return (
            <div key={doc.id} className={`rounded-2xl border overflow-hidden ${isAccepted ? "border-green-200 bg-green-50/30" : "border-slate-200 bg-white"}`}>
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : doc.id)}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isAccepted ? "bg-green-100" : "bg-slate-100"}`}>
                  {isAccepted ? <CheckCircle size={14} className="text-green-500" /> : <FileText size={13} className="text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900">{doc.title}</div>
                  <div className="text-[10px] text-slate-400">{doc.version}</div>
                </div>
                <ChevronRight size={14} className={`text-slate-300 transition-transform ${isOpen ? "rotate-90" : ""}`} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">{doc.summary}</p>
                  <ul className="space-y-1">
                    {doc.bullets.map(b => (
                      <li key={b} className="flex items-start gap-2 text-xs text-slate-500">
                        <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => toggle(doc.id)}
                    className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${
                      isAccepted
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-amber-500 hover:bg-amber-600 text-white"
                    }`}
                  >
                    {isAccepted ? <><CheckCircle size={12} /> Accepted</> : "I Accept & Agree"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: Service Area ─────────────────────────────────────────────────────

function ServiceAreaStep() {
  const [radius, setRadius] = useState("20");
  const [zones, setZones] = useState(["Austin Metro", "Cedar Park", "Round Rock"]);
  const [newZone, setNewZone] = useState("");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Define Your Service Area</h2>
        <p className="text-xs text-slate-500 mt-1">Contractors will only see you if your delivery radius covers their project address.</p>
      </div>

      {/* Visual radius card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center gap-5">
        <div className="relative w-24 h-24 flex-shrink-0">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-300 opacity-40" />
          <div className="absolute inset-3 rounded-full border-2 border-dashed border-amber-400 opacity-60" />
          <div className="absolute inset-6 rounded-full bg-amber-500 flex items-center justify-center">
            <MapPin size={14} className="text-white" />
          </div>
        </div>
        <div className="flex-1">
          <Field label="Delivery Radius (miles)">
            <input
              type="range" min={5} max={60} step={5}
              value={radius}
              onChange={e => setRadius(e.target.value)}
              className="w-full accent-amber-500"
            />
          </Field>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>5 mi</span>
            <span className="font-bold text-amber-600 text-sm">{radius} miles</span>
            <span>60 mi</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Home Base City">
          <input defaultValue="Austin, TX" className={inputCls} />
        </Field>
        <Field label="State">
          <select className={inputCls} defaultValue="TX">
            {["TX", "OK", "LA", "NM", "AR"].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <div>
        <label className={labelCls}>Named Zones / Neighborhoods</label>
        <div className="space-y-2 mb-2">
          {zones.map((z, i) => (
            <div key={i} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <MapPin size={12} className="text-amber-500 flex-shrink-0" />
              <span className="flex-1 text-xs text-slate-700">{z}</span>
              <button onClick={() => setZones(zones.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-400 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newZone}
            onChange={e => setNewZone(e.target.value)}
            placeholder="Add a zone (e.g. Georgetown)"
            className={`${inputCls} flex-1`}
            onKeyDown={e => { if (e.key === "Enter" && newZone.trim()) { setZones([...zones, newZone.trim()]); setNewZone(""); } }}
          />
          <button
            onClick={() => { if (newZone.trim()) { setZones([...zones, newZone.trim()]); setNewZone(""); } }}
            className="px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Delivery Rules ───────────────────────────────────────────────────

function DeliveryStep() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [activeDays, setActiveDays] = useState(new Set(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]));

  const toggleDay = (d: string) => {
    const next = new Set(activeDays);
    if (next.has(d)) next.delete(d); else next.add(d);
    setActiveDays(next);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Configure Delivery Rules</h2>
        <p className="text-xs text-slate-500 mt-1">These rules govern when and how you fulfill orders for contractors in your area.</p>
      </div>

      {/* Delivery days */}
      <div>
        <label className={labelCls}>Delivery Days</label>
        <div className="flex gap-2 flex-wrap">
          {days.map(d => (
            <button
              key={d}
              onClick={() => toggleDay(d)}
              className={`w-12 h-12 rounded-xl text-xs font-bold transition-all border ${
                activeDays.has(d)
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "bg-white border-slate-200 text-slate-500 hover:border-amber-400"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Earliest Pickup / Start Time">
          <select className={inputCls} defaultValue="06:30">
            {["06:00", "06:30", "07:00", "07:30", "08:00"].map(t => <option key={t} value={t}>{t} AM</option>)}
          </select>
        </Field>
        <Field label="Latest Delivery Cutoff">
          <select className={inputCls} defaultValue="18:00">
            {["15:00", "16:00", "17:00", "18:00", "19:00"].map(t => <option key={t} value={t}>{parseInt(t) - 12}:00 PM</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Minimum Order Value ($)">
          <input type="number" defaultValue={200} className={inputCls} />
        </Field>
        <Field label="Lead Time (hours notice required)">
          <select className={inputCls} defaultValue="4">
            {["2", "4", "8", "24", "48"].map(h => <option key={h} value={h}>{h} hours</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Delivery Fleet Size">
          <input type="number" defaultValue={3} className={inputCls} />
        </Field>
        <Field label="Max Deliveries Per Day">
          <input type="number" defaultValue={8} className={inputCls} />
        </Field>
      </div>

      <div>
        <label className={labelCls}>Special Instructions (optional)</label>
        <textarea
          rows={2}
          placeholder="e.g. All deliveries require job site contact on-site. No Sunday pickups."
          className={`${inputCls} resize-none`}
        />
      </div>
    </div>
  );
}

// ─── Step 4: Availability Calendar ───────────────────────────────────────────

function CalendarStep() {
  const [blockedDates, setBlockedDates] = useState<string[]>(["2026-07-04", "2026-09-01"]);
  const [newDate, setNewDate] = useState("");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Set Your Availability</h2>
        <p className="text-xs text-slate-500 mt-1">Mark holidays, maintenance days, or any periods when you won't accept deliveries. Contractors see this when scheduling.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Season Open From">
          <input type="date" defaultValue="2026-06-01" className={inputCls} />
        </Field>
        <Field label="Season Open Until">
          <input type="date" defaultValue="2026-12-31" className={inputCls} />
        </Field>
      </div>

      <div>
        <label className={labelCls}>Blocked / Holiday Dates</label>
        <div className="space-y-2 mb-3">
          {blockedDates.length === 0 && (
            <div className="text-xs text-slate-400 py-2">No blocked dates added yet.</div>
          )}
          {blockedDates.map((d, i) => (
            <div key={i} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <Calendar size={12} className="text-red-400 flex-shrink-0" />
              <span className="flex-1 text-xs text-slate-700">{new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</span>
              <button onClick={() => setBlockedDates(blockedDates.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-400 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className={`${inputCls} flex-1`}
          />
          <button
            onClick={() => { if (newDate && !blockedDates.includes(newDate)) { setBlockedDates([...blockedDates, newDate].sort()); setNewDate(""); } }}
            className="px-3 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
        <div className="text-xs font-bold text-slate-700 mb-2">Capacity Settings</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Peak Season (Apr–Aug)">
            <input type="number" defaultValue={10} className={inputCls} placeholder="Max deliveries/day" />
          </Field>
          <Field label="Off-Peak (Sep–Mar)">
            <input type="number" defaultValue={6} className={inputCls} placeholder="Max deliveries/day" />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Catalog ──────────────────────────────────────────────────────────

interface QuickProduct { name: string; category: string; price: string; sku: string; }

function CatalogStep() {
  const [products, setProducts] = useState<QuickProduct[]>([
    { name: "2×4×8 Douglas Fir Stud KD", category: "Framing Lumber", price: "8.49", sku: "LBR-2408-DF" },
    { name: "7/16″ OSB Sheathing 4×8", category: "Sheathing", price: "22.75", sku: "SHT-716-OSB" },
  ]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<QuickProduct>({ name: "", category: "Framing Lumber", price: "", sku: "" });

  const CATEGORIES = ["Framing Lumber", "Engineered Wood", "Sheathing", "Roofing", "Exterior", "Fasteners"];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Add Your First Products</h2>
        <p className="text-xs text-slate-500 mt-1">Add at least 5 products to meet the catalog threshold. You can always add more after going live.</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
            products.length >= 5 ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"
          }`}>
            {products.length >= 5 ? "✓" : products.length}
          </div>
          <span className="text-xs text-slate-500">{products.length} of 5 minimum added</span>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors"
        >
          <Plus size={12} /> Add Product
        </button>
      </div>

      {/* Minimum threshold bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${products.length >= 5 ? "bg-green-500" : "bg-amber-400"}`}
          style={{ width: `${Math.min(100, (products.length / 5) * 100)}%` }}
        />
      </div>

      {/* Product list */}
      <div className="space-y-2">
        {products.map((p, i) => (
          <div key={i} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3">
            <Package size={14} className="text-amber-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">{p.name}</div>
              <div className="text-[10px] text-slate-400">{p.category} · SKU: {p.sku}</div>
            </div>
            <span className="text-sm font-bold text-slate-800 flex-shrink-0">${p.price}</span>
            <button onClick={() => setProducts(products.filter((_, j) => j !== i))} className="text-slate-200 hover:text-red-400 transition-colors flex-shrink-0">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-center py-6 text-xs text-slate-400">No products added yet</div>
        )}
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
          <div className="text-xs font-bold text-slate-700">New Product</div>
          <Field label="Product Name">
            <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. 2×6×16 Douglas Fir KD" className={inputCls} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Category">
              <select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} className={inputCls}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Price ($)">
              <input type="number" step="0.01" value={draft.price} onChange={e => setDraft({ ...draft, price: e.target.value })} placeholder="0.00" className={inputCls} />
            </Field>
            <Field label="SKU">
              <input value={draft.sku} onChange={e => setDraft({ ...draft, sku: e.target.value })} placeholder="LBR-XXXX" className={inputCls} />
            </Field>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { if (draft.name && draft.price) { setProducts([...products, draft]); setDraft({ name: "", category: "Framing Lumber", price: "", sku: "" }); setAdding(false); } }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Save Product
            </button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-[11px] text-slate-400">
        <Package size={11} />
        You can bulk import your full catalog via CSV after completing onboarding.
      </div>
    </div>
  );
}

// ─── Step 6: Price Policy ─────────────────────────────────────────────────────

function PricePolicyStep() {
  const [model, setModel] = useState<"CAP" | "FIXED">("CAP");
  const [lockEnabled, setLockEnabled] = useState(true);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Configure Price Policy</h2>
        <p className="text-xs text-slate-500 mt-1">Your price policy protects you from market fluctuations and sets expectations with contractors on quote validity.</p>
      </div>

      {/* Price lock toggle */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-slate-900">Enable Price Lock</div>
          <div className="text-xs text-slate-400 mt-0.5">Guarantees quoted price for a set window after submission</div>
        </div>
        <button
          onClick={() => setLockEnabled(!lockEnabled)}
          className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${lockEnabled ? "bg-green-500" : "bg-slate-200"}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${lockEnabled ? "left-5" : "left-0.5"}`} />
        </button>
      </div>

      {lockEnabled && (
        <Field label="Price Lock Window (days)">
          <select className={inputCls} defaultValue="7">
            {["1", "3", "5", "7", "14", "30"].map(d => <option key={d} value={d}>{d} day{d !== "1" ? "s" : ""}</option>)}
          </select>
        </Field>
      )}

      <Field label="Required Down Payment (%)">
        <div className="relative">
          <input type="number" defaultValue={25} min={0} max={100} className={inputCls} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
        </div>
      </Field>

      {/* Pricing Model */}
      <div>
        <label className={labelCls}>Pricing Model</label>
        <div className="grid grid-cols-2 gap-3">
          {([
            { id: "CAP", label: "CAP Model", desc: "Price rises with market, but is capped at a maximum increase %" },
            { id: "FIXED", label: "FIXED Model", desc: "Quoted price is locked — you absorb market fluctuations" },
          ] as const).map(opt => (
            <button
              key={opt.id}
              onClick={() => setModel(opt.id)}
              className={`text-left p-4 rounded-2xl border-2 transition-all ${
                model === opt.id ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white hover:border-amber-300"
              }`}
            >
              <div className={`text-sm font-bold mb-1 ${model === opt.id ? "text-amber-700" : "text-slate-700"}`}>{opt.label}</div>
              <div className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {model === "CAP" && (
        <Field label="Maximum Price Increase Cap (%)">
          <div className="relative">
            <input type="number" defaultValue={5} min={0} max={25} className={inputCls} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
          </div>
        </Field>
      )}

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
        <div className="text-xs font-bold text-slate-700">Policy Preview</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: "Price Lock", value: lockEnabled ? "Enabled" : "Disabled" },
            { label: "Lock Window", value: lockEnabled ? "7 days" : "—" },
            { label: "Down Payment", value: "25%" },
            { label: "Model", value: model === "CAP" ? "CAP (+5% max)" : "FIXED" },
          ].map(row => (
            <div key={row.label} className="flex justify-between gap-2">
              <span className="text-slate-500">{row.label}</span>
              <span className="font-semibold text-slate-800">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 7: Complete ─────────────────────────────────────────────────────────

function CompleteStep() {
  return (
    <div className="flex flex-col items-center text-center py-8 space-y-6">
      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl">
        <CheckCircle size={36} className="text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">You're live on Lumberyard!</h2>
        <p className="text-sm text-slate-500 max-w-md leading-relaxed">
          Your supplier account is now active. Contractors in your area can find your catalog, request quotes, and place structured purchase orders.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm">
        {[
          { icon: <ShieldCheck size={15} />, label: "Terms accepted", cls: "text-green-600 bg-green-50" },
          { icon: <MapPin size={15} />,      label: "Service area set", cls: "text-blue-600 bg-blue-50" },
          { icon: <Truck size={15} />,       label: "Delivery configured", cls: "text-amber-600 bg-amber-50" },
          { icon: <Calendar size={15} />,    label: "Calendar active", cls: "text-violet-600 bg-violet-50" },
          { icon: <Package size={15} />,     label: "Catalog uploaded", cls: "text-rose-600 bg-rose-50" },
          { icon: <ShieldCheck size={15} />, label: "Price policy set", cls: "text-slate-600 bg-slate-50" },
        ].map(item => (
          <div key={item.label} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/80 ${item.cls}`}>
            {item.icon}
            <span className="text-xs font-semibold">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 w-full max-w-sm text-left">
        <div className="text-xs font-bold text-amber-800 mb-1.5">Next steps</div>
        <ul className="space-y-1">
          {["Add more products to your catalog", "Set up your team members & roles", "Review your analytics dashboard"].map(item => (
            <li key={item} className="flex items-center gap-2 text-xs text-amber-700">
              <ArrowRight size={10} className="flex-shrink-0" /> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export function LumberyardOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState<Set<string>>(new Set());

  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const isComplete = currentStep >= STEPS.length - 1;

  const canAdvance = () => {
    if (currentStep === 1) return acceptedTerms.size === TERMS_DOCS.length;
    return true;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <WelcomeStep />;
      case 1: return <TermsStep accepted={acceptedTerms} setAccepted={setAcceptedTerms} />;
      case 2: return <ServiceAreaStep />;
      case 3: return <DeliveryStep />;
      case 4: return <CalendarStep />;
      case 5: return <CatalogStep />;
      case 6: return <PricePolicyStep />;
      case 7: return <CompleteStep />;
      default: return null;
    }
  };

  return (
    <div className="min-h-full flex flex-col lg:flex-row">

      {/* Left sidebar — step tracker */}
      <div className="lg:w-64 bg-slate-900 text-white flex-shrink-0 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Supplier Setup</div>
            <div className="text-[10px] text-white/40">Step {currentStep + 1} of {STEPS.length}</div>
          </div>
        </div>

        {/* Step list */}
        <nav className="space-y-1 flex-1">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStep;
            const isActive = idx === currentStep;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive ? "bg-white/10 text-white" : isDone ? "text-white/50" : "text-white/30"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border ${
                  isDone    ? "bg-green-500 border-green-500 text-white"
                  : isActive ? "bg-amber-500 border-amber-500 text-white"
                  : "border-white/20 text-white/30"
                }`}>
                  {isDone ? <CheckCircle size={13} /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                </div>
                <span className="text-xs font-medium">{step.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Progress bar */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex justify-between text-[10px] text-white/40 mb-2">
            <span>Progress</span>
            <span>{Math.round((currentStep / (STEPS.length - 1)) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right content area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-xl mx-auto">
            {renderStep()}
          </div>
        </div>

        {/* Navigation footer */}
        {!isComplete && (
          <div className="flex-shrink-0 border-t border-slate-200 bg-white px-6 lg:px-10 py-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
              disabled={isFirstStep}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>

            <div className="flex gap-1">
              {STEPS.slice(0, -1).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i < currentStep ? "w-4 bg-green-400" : i === currentStep ? "w-4 bg-amber-500" : "w-2 bg-slate-200"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentStep(s => Math.min(STEPS.length - 1, s + 1))}
              disabled={!canAdvance()}
              className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {currentStep === STEPS.length - 2 ? "Finish Setup" : "Continue"}
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {isComplete && (
          <div className="flex-shrink-0 border-t border-slate-200 bg-white px-6 lg:px-10 py-4 flex justify-center">
            <button className="flex items-center gap-2 text-sm font-semibold px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors">
              Go to Dashboard <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
