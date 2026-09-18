import React, { useState } from "react";
import {
  Search, Plus, Package, Edit2, X, AlertCircle, CheckCircle,
  Upload, Clock, AlertTriangle, ArrowRight, RefreshCw, ShieldAlert,
  TrendingUp, ChevronRight, Layers, GitMerge,
} from "lucide-react";
import { mockCatalog, type CatalogProduct } from "../../data/mockData";

const categories = [...new Set(mockCatalog.map(p => p.category))];

// ─── Extended product attributes ─────────────────────────────────────────────

interface ExtendedAttrs {
  species?: string;
  grade?: string;
  treatment?: string;
  nominalSize?: string;
  length?: string;
  moisture?: string;
  packaging?: string;
  leadTime?: string;
  branch?: string;
  priceUpdated: string;     // ISO-like label
  inventoryUpdated: string;
  priceStale: boolean;
  requiresConfirmation: boolean;
  substitutions?: { type: "exact" | "equal" | "better" | "species-swap"; sku: string; name: string; note?: string }[];
}

const EXTENDED: Record<string, ExtendedAttrs> = {
  "p-001": {
    treatment: "KD (Kiln Dried)", nominalSize: "2×4", length: "8′",
    moisture: "≤19% MC", packaging: "Unit/Bundle", leadTime: "Same day", branch: "North Austin",
    priceUpdated: "2 days ago", inventoryUpdated: "Today", priceStale: false, requiresConfirmation: false,
    substitutions: [
      { type: "equal",   sku: "p-002", name: "2x4x10 Douglas Fir KD",   note: "Same species, longer length — cut to size" },
      { type: "better",  sku: "p-003", name: "2x4x16 Douglas Fir PT",    note: "Pressure treated for ground-contact applications" },
    ],
  },
  "p-002": {
    treatment: "KD (Kiln Dried)", nominalSize: "2×4", length: "10′",
    moisture: "≤19% MC", packaging: "Unit/Bundle", leadTime: "Same day", branch: "North Austin",
    priceUpdated: "21 days ago", inventoryUpdated: "3 days ago", priceStale: true, requiresConfirmation: true,
    substitutions: [
      { type: "equal", sku: "p-001", name: "2x4x8 Douglas Fir Stud KD", note: "Shorter — splice if needed" },
    ],
  },
  "p-003": {
    treatment: "ACQ Pressure Treated", nominalSize: "2×4", length: "16′",
    moisture: "S-GRN", packaging: "Unit/Bundle", leadTime: "1 day", branch: "North Austin",
    priceUpdated: "5 days ago", inventoryUpdated: "Today", priceStale: false, requiresConfirmation: false,
  },
  "p-004": {
    treatment: "KD (Kiln Dried)", nominalSize: "2×8", length: "16′",
    moisture: "≤19% MC", packaging: "Unit/Bundle", leadTime: "Same day", branch: "North Austin",
    priceUpdated: "14 days ago", inventoryUpdated: "Yesterday", priceStale: true, requiresConfirmation: false,
    substitutions: [
      { type: "equal", sku: "p-005", name: "2x10x16 Douglas Fir", note: "Over-engineered but structurally valid substitute" },
    ],
  },
  "p-005": {
    treatment: "KD (Kiln Dried)", nominalSize: "2×10", length: "16′",
    moisture: "≤19% MC", packaging: "Unit/Bundle", leadTime: "Same day", branch: "North Austin",
    priceUpdated: "Today", inventoryUpdated: "Today", priceStale: false, requiresConfirmation: false,
  },
  "p-006": {
    species: "Mixed Species OSB", grade: "OSB/3", treatment: "Untreated",
    nominalSize: "7/16″", length: "4×8 Sheet", moisture: "Dry",
    packaging: "Unit/Pallet", leadTime: "Same day", branch: "North Austin",
    priceUpdated: "11 days ago", inventoryUpdated: "Yesterday", priceStale: true, requiresConfirmation: false,
    substitutions: [
      { type: "better", sku: "p-007", name: '3/4" T&G Plywood Subfloor', note: "Higher strength — use for subfloor, not wall sheathing" },
    ],
  },
  "p-007": {
    species: "Southern Yellow Pine", grade: "#1", treatment: "Untreated",
    nominalSize: "3/4″ T&G", length: "4×8 Sheet", moisture: "S-DRY",
    packaging: "Unit/Pallet", leadTime: "1 day", branch: "South Yard",
    priceUpdated: "Today", inventoryUpdated: "Today", priceStale: false, requiresConfirmation: false,
  },
  "p-008": {
    species: "Engineered Wood", grade: "E1.3/E2.0", treatment: "Laminated",
    nominalSize: '3.5"×11-7/8"', length: "20′", moisture: "Dry",
    packaging: "Individual", leadTime: "2–3 days", branch: "South Yard",
    priceUpdated: "1 day ago", inventoryUpdated: "Today", priceStale: false, requiresConfirmation: false,
    substitutions: [
      { type: "species-swap", sku: "p-009", name: "TJI 360 Floor Joist 9.5\"×20′", note: "I-joist vs LVL — verify span table and loading before substituting" },
    ],
  },
  "p-009": {
    species: "Engineered Wood", grade: "TJI 360", treatment: "Laminated",
    nominalSize: "9.5″", length: "20′", moisture: "Dry",
    packaging: "Individual", leadTime: "2–3 days", branch: "South Yard",
    priceUpdated: "3 days ago", inventoryUpdated: "Today", priceStale: false, requiresConfirmation: false,
  },
  "p-013": {
    treatment: "Fiber Cement", nominalSize: '7.25"', length: "12′ lap",
    moisture: "N/A", packaging: "Carton/Square", leadTime: "3–5 days", branch: "South Yard",
    priceUpdated: "30 days ago", inventoryUpdated: "Today", priceStale: true, requiresConfirmation: true,
  },
  "p-014": {
    treatment: "Asphalt Fiberglass", nominalSize: "3-tab/arch", length: "Per square",
    moisture: "N/A", packaging: "Bundle/Square", leadTime: "1–2 days", branch: "North Austin",
    priceUpdated: "Today", inventoryUpdated: "Today", priceStale: false, requiresConfirmation: false,
  },
};

const DEFAULT_EXTENDED: ExtendedAttrs = {
  priceUpdated: "Unknown", inventoryUpdated: "Unknown",
  priceStale: false, requiresConfirmation: false,
};

// ─── Catalog Gap Analysis data ────────────────────────────────────────────────

const GAP_ITEMS = [
  { rank: 1, name: "Roof Trusses (28′ span)",     category: "Engineered Wood", orders: 14, revenue: 38400, status: "not-stocked" },
  { rank: 2, name: "ZIP System Tape 3.75″",       category: "Sheathing",       orders: 11, revenue: 1870, status: "not-stocked" },
  { rank: 3, name: "Peel-and-Stick Underlayment", category: "Roofing",         orders: 9,  revenue: 3240, status: "not-stocked" },
  { rank: 4, name: "I-Joist 11-7/8″ × 20′",      category: "Engineered Wood", orders: 8,  revenue: 9600, status: "not-stocked" },
  { rank: 5, name: "HardieBacker 3×5 Sheet",      category: "Exterior",        orders: 7,  revenue: 2100, status: "partial" },
];

// ─── Substitution type config ─────────────────────────────────────────────────

const SUB_CONFIG = {
  "exact":       { label: "Exact Match",        cls: "text-green-700 bg-green-50 border-green-200"   },
  "equal":       { label: "Equal Alternative",  cls: "text-blue-700 bg-blue-50 border-blue-200"      },
  "better":      { label: "Better Alternative", cls: "text-violet-700 bg-violet-50 border-violet-200"},
  "species-swap":{ label: "Species Swap ⚠",    cls: "text-amber-700 bg-amber-50 border-amber-200"   },
};

// ─── Price Freshness badges ───────────────────────────────────────────────────

function PriceFreshness({ attrs }: { attrs: ExtendedAttrs }) {
  return (
    <div className="flex flex-col gap-1">
      {attrs.priceStale && (
        <span className="flex items-center gap-1 text-[9px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full w-fit">
          <Clock size={8} /> Stale Price
        </span>
      )}
      {attrs.requiresConfirmation && (
        <span className="flex items-center gap-1 text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full w-fit">
          <ShieldAlert size={8} /> Needs Confirmation
        </span>
      )}
      {!attrs.priceStale && !attrs.requiresConfirmation && (
        <span className="flex items-center gap-1 text-[9px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full w-fit">
          <CheckCircle size={8} /> Current
        </span>
      )}
    </div>
  );
}

// ─── Field helper ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white";

// ─── Add Product Drawer ───────────────────────────────────────────────────────

function AddProductDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-sm font-bold text-slate-900">Add New Product</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Basic Info */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Basic Information</div>
            <div className="space-y-3">
              <Field label="Product Name *">
                <input placeholder="e.g. 2x4x8 Douglas Fir Stud KD" className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="SKU *">
                  <input placeholder="e.g. LBR-2408-DF" className={inputCls} />
                </Field>
                <Field label="Category *">
                  <select className={inputCls}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Unit of Measure *">
                  <select className={inputCls}>
                    {["EA", "SHT", "BX", "RL", "SQ", "BG", "LF", "MBF"].map(u => <option key={u}>{u}</option>)}
                  </select>
                </Field>
                <Field label="Min Order Qty *">
                  <input type="number" defaultValue={1} className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price ($) *">
                  <input type="number" step="0.01" placeholder="0.00" className={inputCls} />
                </Field>
                <Field label="Stock Qty *">
                  <input type="number" defaultValue={0} className={inputCls} />
                </Field>
              </div>
              <Field label="Dimensions">
                <input placeholder='e.g. 1.5" × 3.5" × 96"' className={inputCls} />
              </Field>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="instock" defaultChecked className="accent-amber-500 w-4 h-4" />
                <label htmlFor="instock" className="text-sm text-slate-700 cursor-pointer">In Stock</label>
              </div>
            </div>
          </div>

          {/* Lumber Attributes */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Lumber Attributes</div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Species">
                  <select className={inputCls}>
                    {["", "Douglas Fir", "Southern Yellow Pine", "Spruce-Pine-Fir", "Hem-Fir", "Western Red Cedar", "Engineered Wood", "Mixed Species OSB"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Grade">
                  <select className={inputCls}>
                    {["", "#1", "#2 & Better", "#2 PT", "Stud Grade", "Select Structural", "OSB/3", "E1.3/E2.0", "TJI 360"].map(g => <option key={g}>{g}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Treatment">
                  <select className={inputCls}>
                    {["", "KD (Kiln Dried)", "ACQ Pressure Treated", "Untreated", "Laminated", "Fiber Cement", "Asphalt Fiberglass"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Moisture Condition">
                  <select className={inputCls}>
                    {["", "≤19% MC", "S-DRY", "S-GRN", "Dry", "N/A"].map(m => <option key={m}>{m}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nominal Size">
                  <input placeholder='e.g. 2×4 or 7/16″' className={inputCls} />
                </Field>
                <Field label="Length">
                  <input placeholder="e.g. 8′ or 4×8 Sheet" className={inputCls} />
                </Field>
              </div>
            </div>
          </div>

          {/* Logistics */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Logistics</div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Packaging">
                  <select className={inputCls}>
                    {["", "Unit/Bundle", "Unit/Pallet", "Individual", "Carton/Square", "Bundle/Square"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Lead Time">
                  <select className={inputCls}>
                    {["", "Same day", "1 day", "1–2 days", "2–3 days", "3–5 days", "1 week+"].map(l => <option key={l}>{l}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Branch Location">
                <select className={inputCls}>
                  {["", "North Austin", "South Yard", "Cedar Park", "Round Rock"].map(b => <option key={b}>{b}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Price Meta */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Price Information</div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Last Price Updated">
                  <input type="date" className={inputCls} />
                </Field>
                <Field label="Last Inventory Updated">
                  <input type="date" className={inputCls} />
                </Field>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="reqconfirm" className="accent-amber-500 w-4 h-4" />
                <label htmlFor="reqconfirm" className="text-sm text-slate-700 cursor-pointer">Requires Supplier Confirmation before quote</label>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium">Cancel</button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors">Save Product</button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Detail Drawer ────────────────────────────────────────────────────

function ProductDrawer({ product, onClose }: { product: CatalogProduct; onClose: () => void }) {
  const attrs = EXTENDED[product.id] ?? DEFAULT_EXTENDED;
  const species = product.species ?? attrs.species;
  const grade   = product.grade   ?? attrs.grade;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{product.name}</h3>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{product.sku}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <div className="text-xs text-slate-500 mb-1">Unit Price</div>
              <div className="text-xl font-bold text-slate-900">${product.price.toFixed(2)}</div>
              <div className="text-[10px] text-slate-400">per {product.unitOfMeasure}</div>
            </div>
            <div className={`rounded-2xl p-4 border ${product.stock < 50 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
              <div className="text-xs text-slate-500 mb-1">Stock</div>
              <div className={`text-xl font-bold ${product.stock < 50 ? "text-red-700" : "text-green-700"}`}>{product.stock.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">{product.unitOfMeasure} · Min {product.minOrder}</div>
            </div>
          </div>

          {/* Price Freshness */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <div className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5"><RefreshCw size={12} /> Price Freshness</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Last Price Updated</span>
                <span className={`font-semibold ${attrs.priceStale ? "text-orange-600" : "text-slate-800"}`}>{attrs.priceUpdated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Inventory Updated</span>
                <span className="font-semibold text-slate-800">{attrs.inventoryUpdated}</span>
              </div>
              <div className="pt-1"><PriceFreshness attrs={attrs} /></div>
            </div>
          </div>

          {/* Lumber Attributes */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <div className="text-xs font-bold text-slate-700 mb-3">Lumber Attributes</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Species",         value: species },
                { label: "Grade",           value: grade },
                { label: "Treatment",       value: attrs.treatment },
                { label: "Nominal Size",    value: attrs.nominalSize },
                { label: "Length",          value: attrs.length },
                { label: "Moisture",        value: attrs.moisture },
                { label: "Packaging",       value: attrs.packaging },
                { label: "Lead Time",       value: attrs.leadTime },
                { label: "Branch Location", value: attrs.branch },
                { label: "Dimensions",      value: product.dimensions },
              ].filter(f => f.value).map(f => (
                <div key={f.label} className="bg-slate-50 rounded-xl px-3 py-2">
                  <div className="text-[10px] text-slate-400">{f.label}</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Substitutions */}
          {attrs.substitutions && attrs.substitutions.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <div className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5"><GitMerge size={12} /> Substitutions</div>
              <div className="space-y-2">
                {attrs.substitutions.map(sub => {
                  const cfg = SUB_CONFIG[sub.type];
                  return (
                    <div key={sub.sku} className={`border rounded-xl px-3 py-2.5 ${cfg.cls}`}>
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-semibold">{sub.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.cls}`}>{cfg.label}</span>
                      </div>
                      {sub.note && <div className="text-[10px] opacity-80">{sub.note}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium">Close</button>
          <button className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5">
            <Edit2 size={13} /> Edit Product
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Gap Analysis section ─────────────────────────────────────────────────────

function GapAnalysis() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-50 rounded-xl flex items-center justify-center">
            <TrendingUp size={14} className="text-violet-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Catalog Gap Analysis</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Items contractors ordered that you don't stock — ranked by demand</div>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5">
          ${GAP_ITEMS.reduce((s, i) => s + i.revenue, 0).toLocaleString()} potential revenue
        </span>
      </div>
      <div className="divide-y divide-slate-50">
        {GAP_ITEMS.map(item => (
          <div key={item.rank} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-bold text-slate-500">#{item.rank}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900">{item.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{item.category} · {item.orders} contractor orders missed</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs font-bold text-violet-700">${item.revenue.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">est. revenue</div>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
              item.status === "not-stocked"
                ? "text-red-600 bg-red-50 border-red-200"
                : "text-amber-600 bg-amber-50 border-amber-200"
            }`}>
              {item.status === "not-stocked" ? "Not Stocked" : "Partial"}
            </span>
            <button className="text-[10px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 flex-shrink-0">
              Add <ArrowRight size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Substitution Management section ─────────────────────────────────────────

const ALL_SUBS = Object.entries(EXTENDED).flatMap(([pid, attrs]) =>
  (attrs.substitutions ?? []).map(sub => ({
    productId: pid,
    productName: mockCatalog.find(p => p.id === pid)?.name ?? pid,
    ...sub,
  }))
);

function SubstitutionManagement() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <div className="w-7 h-7 bg-blue-50 rounded-xl flex items-center justify-center">
          <GitMerge size={14} className="text-blue-600" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900">Substitution Management</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Manage alternatives shown to contractors when items are out of stock or unavailable</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-2.5 border-b border-slate-50 bg-slate-50/60 flex-wrap">
        {Object.entries(SUB_CONFIG).map(([type, cfg]) => (
          <span key={type} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>{cfg.label}</span>
        ))}
      </div>

      <div className="divide-y divide-slate-50">
        {ALL_SUBS.map((sub, idx) => {
          const cfg = SUB_CONFIG[sub.type];
          return (
            <div key={idx} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-slate-900 truncate">{sub.productName}</span>
                  <ChevronRight size={11} className="text-slate-300 flex-shrink-0" />
                  <span className="text-xs text-slate-700 truncate">{sub.name}</span>
                </div>
                {sub.note && <div className="text-[10px] text-slate-400">{sub.note}</div>}
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.cls}`}>{cfg.label}</span>
              <button className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-300 hover:text-slate-500 flex-shrink-0">
                <Edit2 size={11} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-4 border-t border-slate-100">
        <button className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-medium transition-colors">
          <Plus size={12} /> Add Substitution Rule
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type CatalogView = "catalog" | "gap-analysis" | "substitutions";

const CATALOG_TABS: { id: CatalogView; label: string; icon: React.ReactNode }[] = [
  { id: "catalog",        label: "Catalog",               icon: <Package size={14} /> },
  { id: "gap-analysis",   label: "Gap Analysis",          icon: <TrendingUp size={14} /> },
  { id: "substitutions",  label: "Substitution Management", icon: <GitMerge size={14} /> },
];

export function ProductCatalog() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [drawerProduct, setDrawerProduct] = useState<CatalogProduct | null>(null);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [catalogView, setCatalogView] = useState<CatalogView>("catalog");

  const filtered = mockCatalog.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    const matchStock = !showOutOfStock || !p.inStock;
    return matchSearch && matchCat && matchStock;
  });

  const staleCount = Object.values(EXTENDED).filter(a => a.priceStale || a.requiresConfirmation).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {drawerProduct && <ProductDrawer product={drawerProduct} onClose={() => setDrawerProduct(null)} />}
      {showAddDrawer && <AddProductDrawer onClose={() => setShowAddDrawer(false)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">{mockCatalog.length} products · {mockCatalog.filter(p => !p.inStock).length} out of stock</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700">
            <Upload size={15} /> Import CSV
          </button>
          <button
            onClick={() => setShowAddDrawer(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={15} /> Add Product
          </button>
        </div>
      </div>

      {/* Top-level tab navigation */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {CATALOG_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setCatalogView(tab.id)}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all ${
              catalogView === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gap Analysis tab */}
      {catalogView === "gap-analysis" && <GapAnalysis />}

      {/* Substitutions tab */}
      {catalogView === "substitutions" && <SubstitutionManagement />}

      {/* Catalog tab */}
      {catalogView === "catalog" && (
        <>
          {/* Alert banners */}
          {mockCatalog.filter(p => !p.inStock).length > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{mockCatalog.filter(p => !p.inStock).length} product(s) are out of stock and won't appear in contractor searches until restocked.</p>
            </div>
          )}
          {staleCount > 0 && (
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
              <Clock size={14} className="text-orange-500 flex-shrink-0" />
              <p className="text-xs text-orange-700">{staleCount} product(s) have stale or unconfirmed pricing — review before next contractor quote is generated.</p>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={showOutOfStock} onChange={e => setShowOutOfStock(e.target.checked)} className="accent-amber-500" />
              Out of Stock Only
            </label>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => {
              const count = mockCatalog.filter(p => p.category === cat).length;
              const oos   = mockCatalog.filter(p => p.category === cat && !p.inStock).length;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(prev => prev === cat ? "all" : cat)}
                  className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                    filterCategory === cat ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-amber-400"
                  }`}
                >
                  {cat}
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${filterCategory === cat ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-500"}`}>{count}</span>
                  {oos > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                </button>
              );
            })}
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Product</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3 hidden md:table-cell">SKU</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3 hidden lg:table-cell">Species / Grade</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3 hidden xl:table-cell">Treatment</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3 hidden xl:table-cell">Lead Time</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3">Price</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3 hidden sm:table-cell">Stock</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3 hidden sm:table-cell">Status</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(product => {
                    const attrs = EXTENDED[product.id] ?? DEFAULT_EXTENDED;
                    return (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <button
                            onClick={() => setDrawerProduct(product)}
                            className="text-left hover:underline"
                          >
                            <div className="text-sm font-semibold text-slate-900">{product.name}</div>
                            <div className="text-xs text-slate-400">{product.category} · Min {product.minOrder} {product.unitOfMeasure}</div>
                          </button>
                        </td>
                        <td className="px-3 py-3 hidden md:table-cell">
                          <span className="text-xs font-mono text-slate-500">{product.sku}</span>
                        </td>
                        <td className="px-3 py-3 hidden lg:table-cell">
                          <div className="text-xs text-slate-700">{product.species ?? attrs.species ?? "—"}</div>
                          <div className="text-[10px] text-slate-400">{product.grade ?? attrs.grade ?? ""}</div>
                        </td>
                        <td className="px-3 py-3 hidden xl:table-cell">
                          <span className="text-xs text-slate-500">{attrs.treatment ?? "—"}</span>
                        </td>
                        <td className="px-3 py-3 hidden xl:table-cell">
                          <span className="text-xs text-slate-600">{attrs.leadTime ?? "—"}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-sm font-bold text-slate-900">${product.price.toFixed(2)}</div>
                          <div className="text-[10px] text-slate-400 mb-1">per {product.unitOfMeasure}</div>
                          <PriceFreshness attrs={attrs} />
                        </td>
                        <td className="px-3 py-3 hidden sm:table-cell">
                          <div className={`text-sm font-semibold ${product.stock < 50 ? "text-red-600" : "text-slate-900"}`}>
                            {product.stock.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">{product.unitOfMeasure}</div>
                        </td>
                        <td className="px-3 py-3 hidden sm:table-cell">
                          {product.inStock ? (
                            <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full w-fit">
                              <CheckCircle size={11} /> In Stock
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full w-fit">
                              <AlertCircle size={11} /> Out of Stock
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => setDrawerProduct(product)}
                            className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors whitespace-nowrap"
                          >
                            <Layers size={12} /> Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-400">No products found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
