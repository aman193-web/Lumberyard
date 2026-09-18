import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, ChevronDown, ChevronRight, Edit2, Download,
  CheckCircle, MessageSquare, Share2, ShoppingCart, Search,
  Plus, Minus, User, Send, Clock, AlertTriangle, BadgeCheck,
  FileSearch, BookOpen, Layers, ClipboardCheck,
  Lock, Info, ChevronUp, Tag, Droplets, Ruler,
} from "lucide-react";
import { mockTakeoffItems } from "../../data/mockData";
import { QuoteBanner } from "../../components/contractor/QuoteBanner";
import { useQuoteContext } from "../../context/QuoteContext";

// ─── Static data ──────────────────────────────────────────────────────────────

const categories = [...new Set(mockTakeoffItems.map(i => i.category))];

interface Comment {
  id: string; author: string; role: string; time: string;
  text: string; resolved?: boolean;
}

const mockComments: Comment[] = [
  { id: "c1", author: "James Chen, PE", role: "Structural Engineer", time: "2h ago", text: "Please verify the LVL beam sizing — the span table shows 3.5\" x 14\" for this span. Update quantity accordingly.", resolved: false },
  { id: "c2", author: "Mike Torres", role: "Contractor", time: "1h ago", text: "Updated the beam spec to match your recommendation. Also added 2 additional hurricane ties per IBC 2021 table.", resolved: false },
  { id: "c3", author: "James Chen, PE", role: "Structural Engineer", time: "45m ago", text: "Framing lumber quantities look correct. Ready to approve once beam is updated.", resolved: true },
];

// ─── Approval Pipeline ────────────────────────────────────────────────────────

type ApprovalStage = "ai-generated" | "rules-checked" | "ready" | "approved";
const APPROVAL_STAGES: { id: ApprovalStage; label: string }[] = [
  { id: "ai-generated",  label: "AI Generated"          },
  { id: "rules-checked", label: "Rules Checked"         },
  { id: "ready",         label: "Ready for Approval"    },
  { id: "approved",      label: "Approved"              },
];

function ApprovalPipeline({ current }: { current: ApprovalStage }) {
  const currentIdx = APPROVAL_STAGES.findIndex(s => s.id === current);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {APPROVAL_STAGES.map((stage, i) => {
        const done   = i < currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={stage.id}>
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
              done   ? "bg-green-100 text-green-700 border-green-200" :
              active ? "bg-amber-100 text-amber-800 border-amber-300 ring-1 ring-amber-200" :
                       "bg-slate-100 text-slate-400 border-slate-200"
            }`}>
              {done   ? <CheckCircle size={9} /> :
               active ? <Clock size={9} className="text-amber-500" /> :
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />}
              {stage.label}
            </span>
            {i < APPROVAL_STAGES.length - 1 && (
              <span className={`w-4 h-px ${i < currentIdx ? "bg-green-300" : "bg-slate-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── BOM supplemental data ────────────────────────────────────────────────────

interface BOMSupp { grade: string; treatment: string; length: string; wastePct: number; drilldown: string; }

const BOM_SUPP: Record<string, BOMSupp> = {
  "t-001": { grade: "Stud",     treatment: "KD-19",    length: "8′",        wastePct: 15, drilldown: "Wall SF: 2,040 · @16″ OC → 297 pc net + 15% waste = 342 pc · Rounded per IRC §R602.3" },
  "t-002": { grade: "#2",       treatment: "KD-19",    length: "10′",       wastePct: 15, drilldown: "Tall-wall zones: 6 bays · 8 pc/bay = 48 pc net. No additional waste (cut-to-length)." },
  "t-003": { grade: "#1",       treatment: "None",     length: "12′",       wastePct: 5,  drilldown: "Header schedule: 8 openings ≥ 4′, 4 openings ≥ 6′ → 12 headers per IRC §R602.7 table." },
  "t-004": { grade: "#2",       treatment: "ACQ-C",    length: "16′",       wastePct: 10, drilldown: "Sill & top plates: 480 LF ÷ 16′ = 30 pc × 2 (double top plate) + 10% waste = 64 pc." },
  "t-005": { grade: "#2",       treatment: "None",     length: "16′",       wastePct: 12, drilldown: "Floor area: 1,840 SF · @16″ OC → 138 joists / 2 (16′ span) + 12% waste = 86 pc." },
  "t-006": { grade: "#2",       treatment: "None",     length: "16′",       wastePct: 12, drilldown: "Roof: 1,960 SF · 6/12 pitch · @16″ OC → 64 rafters + 12% waste = 72 pc." },
  "t-007": { grade: "OSB/2",   treatment: "None",     length: "4×8 SHT",   wastePct: 12, drilldown: "Wall area: 2,720 SF ÷ 32 SF/sht = 85 sht net + 12% waste + edge offcuts = 96 sht." },
  "t-008": { grade: "OSB/2",   treatment: "None",     length: "4×8 SHT",   wastePct: 12, drilldown: "Roof deck: 2,240 SF ÷ 32 SF/sht = 70 sht + 12% waste + hip/valley cuts = 96 sht." },
  "t-009": { grade: "4-ply T&G",treatment: "None",    length: "4×8 SHT",   wastePct: 8,  drilldown: "Subfloor: 1,840 SF ÷ 32 SF/sht = 57 sht + 8% waste = 62 sht → rounded to 68 sht." },
  "t-010": { grade: "2850Fb",  treatment: "None",     length: "20′",       wastePct: 0,  drilldown: "Header schedule: (3) 3½×11⅞ LVL at garage + (1) ridge beam. 0% waste — cut-to-length engineered." },
  "t-011": { grade: "TJI 360", treatment: "None",     length: "20′",       wastePct: 5,  drilldown: "Upper floor: 720 SF · @16″ OC = 36 joists + 5% engineered allowance = 38 pc." },
  "t-012": { grade: "HZ10",    treatment: "None",     length: "12′ bd",    wastePct: 10, drilldown: "Siding area: 2,560 SF ÷ 100 SF/sq = 25.6 SQ + 10% waste at corners/openings = 28 SQ." },
  "t-013": { grade: "N/A",     treatment: "None",     length: "16′",       wastePct: 8,  drilldown: "Trim LF: 610 LF ÷ 16′ = 38 pc + 8% waste at miters = 42 pc." },
  "t-014": { grade: "Commercial",treatment: "None",   length: "Roll/10 SQ",wastePct: 10, drilldown: "Roof area: 2,240 SF / 100 = 22.4 SQ + 10% overlap waste = 25 SQ → 8 rolls @10 SQ." },
  "t-015": { grade: "Class A", treatment: "None",     length: "Bundle",    wastePct: 10, drilldown: "Roof area: 2,240 SF / 100 = 22.4 SQ + 10% ridge/hip waste = 24.6 → 26 SQ." },
  "t-016": { grade: "Bright",  treatment: "None",     length: "3½″ 16d",  wastePct: 10, drilldown: "~28,000 nails ÷ 3,600/50lb box + 10% = 8 bx." },
  "t-017": { grade: "ZMAX",    treatment: "ZMAX G185",length: "N/A",      wastePct: 0,  drilldown: "Per IBC 2021 §2308: hurricane tie at each rafter-to-plate. 144 connections — counted by type, no waste." },
  "t-018": { grade: "R-21",    treatment: "Kraft",    length: "93″",      wastePct: 10, drilldown: "Wall batt: 2,040 SF × 0.90 net factor = 1,836 SF ÷ 65 SF/bag + 10% = 32 bags." },
  "t-019": { grade: "R-38",    treatment: "None",     length: "N/A",      wastePct: 5,  drilldown: "Attic: 1,960 SF · Austin §N1102.1.2 R-38 min · 27 bags/1,000 SF = 52.9 → 48 bags (settled density)." },
};

// ─── Right panel content data ─────────────────────────────────────────────────

const FINDINGS = [
  { ref: "IRC §R602.3",   flag: "ok",   text: "Wall stud spacing 16″ OC confirmed throughout. Quantity validated against plan dimensions." },
  { ref: "IRC §R802.4",   flag: "ok",   text: "Rafter span within allowable range for 2×8 DF #2 at 16″ OC per span table R802.4.2." },
  { ref: "IBC §2308",     flag: "warn", text: "LVL beam depth flagged: calc shows 11⅞″ required; drawings show 9½″ — quantity updated, structural review recommended." },
  { ref: "IECC §N1102.1", flag: "ok",   text: "Wall insulation R-21 meets IECC 2021 minimum for Climate Zone 2A (Austin)." },
  { ref: "Austin §N1102.1.2", flag: "ok", text: "Attic insulation upgraded to R-38 per Austin local amendment." },
  { ref: "IRC §R312",     flag: "info", text: "No guardrails required — no deck surface exceeds 30 in. above grade per Q&A clarification." },
];

const ASSUMPTIONS = [
  { id: "a1", label: "Lumber species",      value: "Douglas Fir throughout",       confidence: 95, source: "Default for Austin/TX region; confirm with supplier" },
  { id: "a2", label: "Stud OC spacing",     value: "16 in. OC",                    confidence: 98, source: "Plan note on sheet A1: typ. unless noted" },
  { id: "a3", label: "Roof pitch",          value: "6:12 throughout",              confidence: 92, source: "Derived from elevation sheet A3; not explicitly dimensioned" },
  { id: "a4", label: "Floor live load",     value: "40 psf residential",           confidence: 99, source: "IRC Table R301.5" },
  { id: "a5", label: "Snow load",           value: "Not applicable",               confidence: 99, source: "Austin ASCE 7-22 ground snow load = 0 psf" },
  { id: "a6", label: "Treated lumber scope",value: "Sill plates & deck framing only", confidence: 90, source: "Assumed per IRC §R317.1; confirm foundation type" },
];

const SOURCES = [
  { sheet: "Floor Plan A1.pdf",         pages: 2, elements: 68, contribution: "Wall lengths, opening schedule, stud counts" },
  { sheet: "Structural S1.pdf",         pages: 4, elements: 42, contribution: "Beam schedule, joist layout, point loads, hold-downs" },
  { sheet: "Elevations A3.pdf",         pages: 3, elements: 31, contribution: "Roof pitch, rake lengths, siding area, trim lengths" },
  { sheet: "IRC 2021 Span Tables",      pages: 0, elements: 18, contribution: "Allowable spans for joists, rafters, headers" },
  { sheet: "IECC 2021 CZ2A Table",      pages: 0, elements: 4,  contribution: "Minimum R-values: walls R-13, attic R-30 (overridden by local amend)" },
  { sheet: "Austin Local Amendments 2023", pages: 0, elements: 3, contribution: "R-38 attic, EV conduit, wind exposure amendment" },
];

const RULES_REPORT = [
  { rule: "IRC 2021",      status: "pass", items: 14, notes: "All framing members within allowable spans" },
  { rule: "IECC 2021",     status: "pass", items: 4,  notes: "CZ2A insulation values met or exceeded" },
  { rule: "NEC 2020",      status: "na",   items: 0,  notes: "Electrical scope not in this takeoff" },
  { rule: "IBC 2021 §2308",status: "warn", items: 2,  notes: "LVL beam flagged for structural review before approval" },
  { rule: "Austin Amends", status: "pass", items: 3,  notes: "R-38 attic applied, EV conduit noted" },
];

// ─── Role type ────────────────────────────────────────────────────────────────

type Role = "Contractor" | "Designer";

// ─── Component ────────────────────────────────────────────────────────────────

export function TakeoffResults() {
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Framing Lumber"]);
  const [expandedRows, setExpandedRows]             = useState<string[]>([]);
  const [editMode, setEditMode]                     = useState(false);
  const [comment, setComment]                       = useState("");
  const [rightTab, setRightTab]                     = useState("findings");
  const [quantities, setQuantities]                 = useState<Record<string, number>>(
    Object.fromEntries(mockTakeoffItems.map(i => [i.id, i.quantity]))
  );
  const [quoteExpanded, setQuoteExpanded] = useState(false);
  const [approvalStage]                   = useState<ApprovalStage>("ready");
  const [role, setRole]                   = useState<Role>("Contractor");
  const { getQuote } = useQuoteContext();
  const quote = getQuote("rfq-001");

  const toggleCategory = (cat: string) =>
    setExpandedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  const toggleRow = (id: string) =>
    setExpandedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);

  const total = mockTakeoffItems.reduce((sum, item) => sum + item.unitPrice * quantities[item.id], 0);
  const categoryTotals = categories.reduce<Record<string, { count: number; total: number }>>((acc, cat) => {
    const items = mockTakeoffItems.filter(i => i.category === cat);
    acc[cat] = { count: items.length, total: items.reduce((s, i) => s + i.unitPrice * quantities[i.id], 0) };
    return acc;
  }, {});

  const isDesigner = role === "Designer";

  const RIGHT_TABS = [
    { id: "findings",    label: "Findings",    icon: <FileSearch size={12} />,    badge: FINDINGS.filter(f => f.flag === "warn").length },
    { id: "assumptions", label: "Assumptions", icon: <Layers size={12} />,        badge: 0 },
    { id: "sources",     label: "Sources",     icon: <BookOpen size={12} />,      badge: 0 },
    { id: "rules",       label: "Rules",       icon: <ClipboardCheck size={12} />,badge: RULES_REPORT.filter(r => r.status === "warn").length },
    { id: "collab",      label: "Collab",      icon: <MessageSquare size={12} />, badge: mockComments.filter(c => !c.resolved).length },
    { id: "blueprint",   label: "Blueprint",   icon: <Ruler size={12} />,         badge: 0 },
  ];

  return (
    // ── Outer wrapper: no h-full, no overflow-hidden → page scrolls naturally via AppLayout main ──
    <div className="flex flex-col bg-slate-50 min-h-full">

      {/* ═══════════════════════════════════════════════════════════════════
          STICKY TOP BAR — sticks within the AppLayout <main> scroll context
      ════════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        {/* Row 1: breadcrumb + pipeline */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-2 border-b border-slate-100">
          <button
            onClick={() => navigate("/contractor/projects")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={15} /> <span className="hidden sm:inline">Projects</span>
          </button>
          <span className="text-slate-300 text-sm">/</span>
          <div className="min-w-0 flex-shrink-0">
            <span className="text-xs text-slate-500">2847 Oak Ridge Dr · SFR</span>
            <span className="ml-2 text-sm font-bold text-slate-900">Smart Takeoff</span>
          </div>
          {/* Pipeline — full width, prominent */}
          <div className="flex-1 flex justify-center">
            <ApprovalPipeline current={approvalStage} />
          </div>
          {/* Role toggle */}
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 flex-shrink-0">
            {(["Contractor", "Designer"] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                  role === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: actions */}
        <div className="flex items-center gap-2 px-4 py-2 flex-wrap">
          {isDesigner && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700 truncate">
                <strong>Designer role:</strong> Review only — use Request Review to notify the contractor.
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-medium">
              <Share2 size={12} /> Share
            </button>
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-medium">
              <Download size={12} /> Export
            </button>
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-medium">
              <User size={12} /> Request Review
            </button>
            {isDesigner ? (
              <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg font-medium cursor-not-allowed select-none">
                <Lock size={12} /> Procurement Locked
              </div>
            ) : (
              <button
                onClick={() => navigate("/contractor/responsibility")}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-sm"
              >
                <ShoppingCart size={12} /> Proceed to Procurement
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          QUOTE BANNER — collapsible, below sticky bar
      ════════════════════════════════════════════════════════════════════ */}
      {quote && (
        <div className="bg-white border-b border-slate-200">
          <button
            onClick={() => setQuoteExpanded(v => !v)}
            className="w-full flex items-center justify-between px-5 py-2.5 bg-green-50 hover:bg-green-100/70 transition-colors"
          >
            <span className="flex items-center gap-2 text-xs font-semibold text-green-800">
              <BadgeCheck size={13} className="text-green-600" />
              Quote received · {quote.lumberyardName} · ${quote.total.toLocaleString("en-US", { maximumFractionDigits: 0 })} total
            </span>
            {quoteExpanded
              ? <ChevronDown size={14} className="text-green-600" />
              : <ChevronRight size={14} className="text-green-600" />
            }
          </button>
          {quoteExpanded && <QuoteBanner inline />}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SUMMARY STATS BAR
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-6 flex-wrap">
        {[
          { label: "Total Items",       value: String(mockTakeoffItems.length), color: "text-slate-900" },
          { label: "Categories",        value: String(categories.length),       color: "text-slate-900" },
          { label: "Est. Material Cost",value: `$${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "text-green-700" },
          { label: "w/ Commission (2.5%)", value: `$${(total * 1.025).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "text-slate-700" },
        ].map(s => (
          <div key={s.label}>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{s.label}</div>
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
        {/* Search + Edit — pushed right */}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search materials..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-green-500 bg-slate-50 w-40"
            />
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${
              editMode ? "bg-green-600 border-green-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50 bg-white"
            }`}
          >
            <Edit2 size={12} /> {editMode ? "Done" : "Edit Quantities"}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN TWO-COLUMN CONTENT
          Left: BOM (natural flow, page scrolls)
          Right: sticky sidebar with tabs (fixed height, internal scroll)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row flex-1 items-start gap-0">

        {/* ── LEFT: Bill of Materials ──────────────────────────────────── */}
        <div className="w-full lg:w-[58%] flex flex-col border-r border-slate-200">

          {/* BOM column headers — sticky below summary bar */}
          <div className="sticky top-[116px] z-20 bg-slate-50 border-b border-slate-200 px-5 py-2 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <div className="flex-1">Description · Grade · Treatment</div>
            <div className="w-16 text-right hidden sm:block">Length</div>
            <div className="w-24 text-right">Qty</div>
            <div className="w-14 text-right hidden md:block">Waste</div>
            <div className="w-24 text-right">Price</div>
          </div>

          {/* Category rows — natural flow */}
          {categories.map(category => {
            const items      = mockTakeoffItems.filter(i => i.category === category);
            const isExpanded = expandedCategories.includes(category);
            const catData    = categoryTotals[category];

            return (
              <div key={category} className="bg-white border-b border-slate-100">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${isExpanded ? "bg-green-100" : "bg-slate-100"}`}>
                    {isExpanded
                      ? <ChevronDown size={12} className="text-green-600" />
                      : <ChevronRight size={12} className="text-slate-500" />
                    }
                  </div>
                  <span className="flex-1 text-sm font-semibold text-slate-900 text-left">{category}</span>
                  <span className="text-xs text-slate-400 mr-2">{catData.count} items</span>
                  <span className="text-xs font-bold text-slate-700 min-w-[64px] text-right">
                    ${catData.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </button>

                {/* Item rows */}
                {isExpanded && (
                  <div>
                    {items.map(item => {
                      const supp      = BOM_SUPP[item.id];
                      const isOpen    = expandedRows.includes(item.id);
                      const wasteQty  = supp ? Math.round(quantities[item.id] * (supp.wastePct / 100)) : 0;

                      return (
                        <div key={item.id} className="border-t border-slate-50">
                          {/* Row */}
                          <div className="flex items-center gap-2 px-5 py-3 hover:bg-slate-50/80 transition-colors group">
                            {/* Description + badges */}
                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                              <span className="text-xs font-medium text-slate-800 leading-snug">{item.description}</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] text-slate-400">{item.subcategory}</span>
                                {supp?.grade && supp.grade !== "N/A" && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                    <Tag size={7} /> {supp.grade}
                                  </span>
                                )}
                                {supp?.treatment && supp.treatment !== "None" && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                    <Droplets size={7} /> {supp.treatment}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Length */}
                            <div className="w-16 text-right hidden sm:block flex-shrink-0">
                              <span className="text-[11px] text-slate-500">{supp?.length ?? "—"}</span>
                            </div>

                            {/* Qty / edit controls */}
                            {editMode ? (
                              <div className="flex items-center gap-1 flex-shrink-0 w-24 justify-end">
                                <button
                                  onClick={() => setQuantities(prev => ({ ...prev, [item.id]: Math.max(0, prev[item.id] - 1) }))}
                                  className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center"
                                >
                                  <Minus size={9} />
                                </button>
                                <input
                                  type="number"
                                  value={quantities[item.id]}
                                  onChange={e => setQuantities(prev => ({ ...prev, [item.id]: parseInt(e.target.value) || 0 }))}
                                  className="w-10 text-center text-xs border border-slate-200 rounded py-0.5 focus:outline-none focus:border-green-500"
                                />
                                <button
                                  onClick={() => setQuantities(prev => ({ ...prev, [item.id]: prev[item.id] + 1 }))}
                                  className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center"
                                >
                                  <Plus size={9} />
                                </button>
                              </div>
                            ) : (
                              <div className="w-24 text-right flex-shrink-0">
                                <span className="text-xs font-semibold text-slate-800">{quantities[item.id]} {item.unit}</span>
                              </div>
                            )}

                            {/* Waste factor */}
                            <div className="w-14 text-right flex-shrink-0 hidden md:block">
                              {supp && supp.wastePct > 0 ? (
                                <button
                                  onClick={() => toggleRow(item.id)}
                                  className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 hover:text-amber-800 transition-colors"
                                >
                                  +{supp.wastePct}%
                                  {isOpen ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-300">—</span>
                              )}
                            </div>

                            {/* Price */}
                            <div className="w-24 text-right flex-shrink-0">
                              <div className="text-[10px] text-slate-400">${item.unitPrice.toFixed(2)}/{item.unit}</div>
                              <div className="text-xs font-bold text-slate-700">
                                ${(item.unitPrice * quantities[item.id]).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </div>
                            </div>
                          </div>

                          {/* Waste drilldown */}
                          {isOpen && supp && (
                            <div className="mx-5 mb-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-3">
                              <Info size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <div className="flex items-center gap-3 flex-wrap mb-1">
                                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Waste Calculation</span>
                                  <span className="text-[10px] text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded font-semibold">
                                    +{supp.wastePct}% = +{wasteQty} {item.unit}
                                  </span>
                                  <span className="text-[10px] text-amber-600">
                                    Net: {quantities[item.id] - wasteQty} · Billed: {quantities[item.id]} {item.unit}
                                  </span>
                                </div>
                                <p className="text-[11px] text-amber-800 leading-relaxed">{supp.drilldown}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* BOM footer */}
          <div className="bg-white border-t-2 border-slate-200 px-5 py-4 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Platform commission <span className="font-semibold text-slate-700">2.5%</span>
              <span className="ml-2 text-slate-400">+${(total * 0.025).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="text-base font-bold text-slate-900">
              Total ${(total * 1.025).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Sticky analysis panel ────────────────────────────── */}
        {/* sticky top-[116px] = top bar (≈116px) so it hugs below the sticky bars */}
        <div className="hidden lg:flex flex-col w-[42%] sticky top-[116px] bg-white border-l border-slate-200 self-start"
          style={{ height: "calc(100vh - 172px)", maxHeight: "calc(100vh - 172px)" }}
        >
          {/* Tab nav */}
          <div className="flex-shrink-0 flex border-b border-slate-100 bg-white overflow-x-auto">
            {RIGHT_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setRightTab(tab.id)}
                className={`relative flex items-center gap-1.5 flex-shrink-0 px-3 py-3 text-[11px] font-semibold transition-colors border-b-2 ${
                  rightTab === tab.id
                    ? "border-green-600 text-green-700 bg-green-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content — scrolls inside the sticky panel */}
          <div className="flex-1 overflow-y-auto">

            {/* ── Findings ── */}
            {rightTab === "findings" && (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileSearch size={14} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">AI Findings & Code Flags</span>
                  <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                    {FINDINGS.filter(f => f.flag === "warn").length} flagged
                  </span>
                </div>
                {FINDINGS.map((f, i) => (
                  <div key={i} className={`rounded-xl border px-4 py-3 ${
                    f.flag === "warn" ? "border-amber-200 bg-amber-50" :
                    f.flag === "info" ? "border-blue-100 bg-blue-50" :
                    "border-green-100 bg-green-50"
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {f.flag === "warn" ? <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" /> :
                       f.flag === "info" ? <Info size={12} className="text-blue-400 flex-shrink-0" /> :
                                           <CheckCircle size={12} className="text-green-500 flex-shrink-0" />}
                      <span className="text-[10px] font-mono font-bold text-slate-500">{f.ref}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{f.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Assumptions ── */}
            {rightTab === "assumptions" && (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">AI Assumptions</span>
                  <span className="ml-auto text-xs text-slate-400">{ASSUMPTIONS.length} applied</span>
                </div>
                {ASSUMPTIONS.map(a => (
                  <div key={a.id} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="text-xs font-semibold text-slate-800">{a.label}</div>
                        <div className="text-xs text-green-700 font-medium mt-0.5">{a.value}</div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-[10px] text-slate-400">Confidence</div>
                        <div className={`text-xs font-bold ${a.confidence >= 95 ? "text-green-600" : "text-amber-600"}`}>{a.confidence}%</div>
                      </div>
                    </div>
                    <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${a.confidence >= 95 ? "bg-green-500" : "bg-amber-400"}`}
                        style={{ width: `${a.confidence}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{a.source}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Sources ── */}
            {rightTab === "sources" && (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">Source Documents & References</span>
                </div>
                {SOURCES.map((s, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate">{s.sheet}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{s.contribution}</div>
                      </div>
                      {s.elements > 0 && (
                        <div className="flex-shrink-0 text-right">
                          <div className="text-[10px] text-slate-400">Elements</div>
                          <div className="text-xs font-bold text-slate-700">{s.elements}</div>
                        </div>
                      )}
                    </div>
                    {s.pages > 0 && (
                      <div className="text-[10px] text-slate-400 mt-1">{s.pages} pages processed</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Rules Report ── */}
            {rightTab === "rules" && (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck size={14} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">Applied Rules Report</span>
                </div>
                {RULES_REPORT.map((r, i) => (
                  <div key={i} className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${
                    r.status === "warn" ? "border-amber-200 bg-amber-50" :
                    r.status === "na"   ? "border-slate-100 bg-slate-50" :
                    "border-green-100 bg-green-50"
                  }`}>
                    <div className="flex-shrink-0 mt-0.5">
                      {r.status === "pass" ? <CheckCircle size={14} className="text-green-500" /> :
                       r.status === "warn" ? <AlertTriangle size={14} className="text-amber-500" /> :
                       <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 inline-block" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800">{r.rule}</span>
                        {r.items > 0 && <span className="text-[10px] text-slate-400">{r.items} items</span>}
                        <span className={`text-[10px] font-bold uppercase ml-auto ${
                          r.status === "pass" ? "text-green-600" :
                          r.status === "warn" ? "text-amber-600" : "text-slate-400"
                        }`}>
                          {r.status === "na" ? "N/A" : r.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{r.notes}</p>
                    </div>
                  </div>
                ))}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {["IRC 2021","IECC 2021","NEC 2020","IBC 2021","Austin"].map(code => (
                    <span key={code} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <Lock size={8} /> {code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Collab ── */}
            {rightTab === "collab" && (
              <div className="flex flex-col h-full">
                {/* Project meta */}
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-slate-400">Address:</span> <span className="font-medium text-slate-700">2847 Oak Ridge Dr</span></div>
                    <div><span className="text-slate-400">Jurisdiction:</span> <span className="font-medium text-slate-700">City of Austin</span></div>
                    <div><span className="text-slate-400">Building Code:</span> <span className="font-medium text-slate-700">IBC 2021</span></div>
                    <div><span className="text-slate-400">AHJ:</span> <span className="font-medium text-slate-700">Austin Building Svcs</span></div>
                  </div>
                </div>
                {/* Comments */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={13} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">Collaboration Notes</span>
                    <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                      {mockComments.filter(c => !c.resolved).length} open
                    </span>
                  </div>
                  {mockComments.map(c => (
                    <div key={c.id} className={`rounded-xl p-3 border ${c.resolved ? "border-green-100 bg-green-50" : "border-slate-100 bg-white"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {c.author.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-slate-800">{c.author}</span>
                          <span className="text-xs text-slate-400 ml-1">· {c.role}</span>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">{c.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{c.text}</p>
                      {c.resolved && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                          <CheckCircle size={10} /> Resolved
                        </div>
                      )}
                      {!c.resolved && (
                        <div className="flex gap-3 mt-2">
                          <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Reply</button>
                          <button className="text-xs text-green-600 hover:text-green-700 transition-colors">Mark Resolved</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Comment input */}
                <div className="flex-shrink-0 p-4 border-t border-slate-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment or note..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
                    />
                    <button className="w-8 h-8 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center text-white transition-colors flex-shrink-0">
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Blueprint ── */}
            {rightTab === "blueprint" && (
              <div className="p-4">
                <div className="bg-slate-100 rounded-2xl overflow-hidden aspect-[3/4] mb-3 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M9 21V9" />
                      </svg>
                    </div>
                    <p className="text-xs">Blueprint preview</p>
                    <p className="text-xs opacity-60">Floor_Plan_A1.pdf</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {["Floor Plan A1", "Structural S1", "Elevations A3"].map(plan => (
                    <button key={plan} className="flex-1 text-xs py-2 border border-slate-200 rounded-lg text-slate-600 hover:border-green-400 hover:text-green-700 transition-colors bg-white">
                      {plan}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}