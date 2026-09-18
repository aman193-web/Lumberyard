import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, CheckCircle, XCircle, AlertTriangle, Lock,
  ArrowRight, RefreshCw, Rocket, Clock, User, MapPin,
  Ruler, FileSearch, ShieldCheck, Store, ChevronRight,
  BadgeCheck, Info, Zap, ExternalLink, AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role      = "Contractor" | "Homeowner" | "Designer";
type CheckStatus = "idle" | "running" | "pass" | "warn" | "fail";
type Severity    = "critical" | "warn";

interface CheckItem {
  id:          string;
  label:       string;
  category:    string;
  categoryColor: string;
  icon:        React.ReactNode;
  severity:    Severity;
  fixLabel?:   string;
  fixRoute?:   string;
  fixIsAction?: boolean; // inline action instead of navigate
  overrideLabel?: string; // text for warn-override checkbox
  // detail panel content
  description: string;
  source:      string;
  lastChecked: string;
  extra?:      React.ReactNode;
}

// ─── Check definitions ────────────────────────────────────────────────────────

const CHECK_ITEMS: CheckItem[] = [
  {
    id:            "scale",
    label:         "Scale Verified",
    category:      "Blueprint",
    categoryColor: "bg-blue-100 text-blue-700",
    icon:          <Ruler size={16} />,
    severity:      "critical",
    description:   "Auto-detected 1/4\" = 1'-0\" scale on Floor Plan A1.pdf. Manual 2-point calibration confirmed on Apr 7. Scale confidence: 99.2%. All takeoff measurements derived from this calibration.",
    source:        "BlueprintUpload · Scale Calibration Engine",
    lastChecked:   "Apr 7, 2025 · 9:00 AM",
  },
  {
    id:            "findings",
    label:         "No Open Findings",
    category:      "Takeoff",
    categoryColor: "bg-violet-100 text-violet-700",
    icon:          <FileSearch size={16} />,
    severity:      "warn",
    fixLabel:      "Review Finding",
    fixRoute:      "/contractor/projects/proj-001/takeoff",
    overrideLabel: "I have reviewed the open finding and accept responsibility for proceeding without resolution.",
    description:   "1 open AI finding: IBC §2308 — LVL beam depth flagged. Calculation shows 11⅞\" required; drawings show 9½\". Quantity has been updated in BOM but structural review by a licensed engineer is recommended before procurement.",
    source:        "TakeoffResults · Findings Tab (IBC §2308)",
    lastChecked:   "Apr 7, 2025 · 9:14 AM",
    extra: (
      <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <AlertTriangle size={11} className="text-amber-500 flex-shrink-0" />
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Open Finding · IBC §2308</span>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          LVL beam sizing discrepancy. If structural issue is unresolved at time of delivery,
          materials may need to be returned or supplemental orders placed at additional cost.
        </p>
      </div>
    ),
  },
  {
    id:            "responsibility",
    label:         "Responsibility Gate Passed",
    category:      "Compliance",
    categoryColor: "bg-amber-100 text-amber-700",
    icon:          <ShieldCheck size={16} />,
    severity:      "critical",
    fixLabel:      "Re-acknowledge Now",
    fixRoute:      "/contractor/responsibility",
    description:   "Acknowledgment record ACK-2025-03-02-001 is stale. BOM version changed (v1.2 → v1.3, hash a7f3e2d → b9c4f1a, +$1,232) and 8 days have passed since last acknowledgment. Platform policy requires re-acknowledgment within 7 days and on any BOM change.",
    source:        "ResponsibilityGate · Acknowledgment Record",
    lastChecked:   "Mar 2, 2025 · 2:32 PM (stale)",
    extra: (
      <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <AlertCircle size={11} className="text-red-500 flex-shrink-0" />
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Two stale triggers detected</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-red-700">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
          BOM hash mismatch — v1.2 → v1.3, +$1,232 (+2 items)
        </div>
        <div className="flex items-center gap-2 text-[11px] text-red-700">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
          8 days elapsed — exceeds 7-day re-acknowledgment window
        </div>
      </div>
    ),
  },
  {
    id:            "suppliers",
    label:         "Suppliers Available",
    category:      "Marketplace",
    categoryColor: "bg-green-100 text-green-700",
    icon:          <Store size={16} />,
    severity:      "critical",
    description:   "3 verified lumberyards within 35 mi of 2847 Oak Ridge Dr, Austin TX 78731 are active, have responded to the RFQ, and can fulfill the full BOM scope. Quote from Austin Timber Supply is ready.",
    source:        "Marketplace · Supplier Matching · Austin Metro",
    lastChecked:   "Apr 9, 2025 · 8:00 AM",
    extra: (
      <div className="mt-3 space-y-1.5">
        {[
          { name: "Austin Timber Supply",                dist: "4.2 mi",  status: "Quote ready",   color: "text-green-600" },
          { name: "Hill Country Lumber",                 dist: "18.7 mi", status: "Available",      color: "text-green-600" },
          { name: "Travis County Building Materials",    dist: "31.4 mi", status: "Available",      color: "text-slate-500" },
        ].map(s => (
          <div key={s.name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
            <span className="text-[11px] font-medium text-slate-700 flex-1 truncate">{s.name}</span>
            <span className="text-[10px] text-slate-400">{s.dist}</span>
            <span className={`text-[10px] font-semibold ${s.color}`}>{s.status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id:            "address",
    label:         "Delivery Address Locked",
    category:      "Project",
    categoryColor: "bg-slate-100 text-slate-600",
    icon:          <MapPin size={16} />,
    severity:      "critical",
    description:   "2847 Oak Ridge Dr, Austin TX 78731 is confirmed as the primary delivery address for proj-001. Address is geocoded, verified within all 3 lumberyard service radii, and matches the AHJ jurisdiction on file.",
    source:        "Project Settings · Address Verification · Google Maps Geocoding",
    lastChecked:   "Apr 5, 2025 · 11:20 AM",
    extra: (
      <div className="mt-3 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5 space-y-1">
        <div className="flex items-center gap-2 text-[11px]">
          <MapPin size={10} className="text-slate-400 flex-shrink-0" />
          <span className="font-semibold text-slate-700">2847 Oak Ridge Dr</span>
          <span className="text-slate-400">Austin, TX 78731</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <BadgeCheck size={10} className="text-green-500 flex-shrink-0" />
          Geocoded · Within all supplier service radii · AHJ: City of Austin
        </div>
      </div>
    ),
  },
  {
    id:            "rights",
    label:         "Purchasing Rights",
    category:      "Authorization",
    categoryColor: "bg-rose-100 text-rose-700",
    icon:          <User size={16} />,
    severity:      "critical",
    // status and fix are role-dependent — resolved in component
    description:   "",
    source:        "User Account · Role Permissions · Project Authorization",
    lastChecked:   "Session · Apr 9, 2025",
  },
];

// ─── Static check statuses (simulated, before role logic) ────────────────────

const BASE_STATUSES: Record<string, CheckStatus> = {
  scale:          "pass",
  findings:       "warn",
  responsibility: "fail",
  suppliers:      "pass",
  address:        "pass",
  rights:         "pass", // overridden by role
};

// ─── Run sequence delays (ms) ────────────────────────────────────────────────

const RUN_DELAYS = [0, 320, 680, 1050, 1400, 1780];

// ─── Status config ────────────────────────────────────────────────────────────

function statusCfg(s: CheckStatus) {
  switch (s) {
    case "pass":    return { icon: <CheckCircle size={18} className="text-green-500" />,    ring: "border-green-200 bg-green-50",    badge: "bg-green-100 text-green-700",    label: "PASS"    };
    case "warn":    return { icon: <AlertTriangle size={18} className="text-amber-500" />,  ring: "border-amber-200 bg-amber-50/40", badge: "bg-amber-100 text-amber-700",    label: "WARN"    };
    case "fail":    return { icon: <XCircle size={18} className="text-red-500" />,          ring: "border-red-200 bg-red-50/40",     badge: "bg-red-100 text-red-700",        label: "FAIL"    };
    case "running": return { icon: <RefreshCw size={18} className="text-blue-400 animate-spin" />, ring: "border-blue-100 bg-blue-50/30", badge: "bg-blue-100 text-blue-600", label: "CHECKING" };
    default:        return { icon: <Clock size={18} className="text-slate-300" />,           ring: "border-slate-100 bg-white",       badge: "bg-slate-100 text-slate-400",    label: "PENDING" };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PreFlightCheck() {
  const navigate = useNavigate();
  const [role, setRole]             = useState<Role>("Contractor");
  const [statuses, setStatuses]     = useState<Record<string, CheckStatus>>(
    Object.fromEntries(CHECK_ITEMS.map(c => [c.id, "idle"]))
  );
  const [running, setRunning]       = useState(false);
  const [runComplete, setRunComplete] = useState(false);
  const [selected, setSelected]     = useState<string>("scale");
  const [overrides, setOverrides]   = useState<Record<string, boolean>>({});
  const [launching, setLaunching]   = useState(false);
  const runRef = useRef(false);

  // Role-adjusted statuses
  const getStatus = (id: string): CheckStatus => {
    if (id === "rights") {
      if (!runComplete) return statuses[id];
      return role === "Designer" ? "fail" : "pass";
    }
    return statuses[id];
  };

  // Trigger sequential check run
  const runChecks = () => {
    if (runRef.current) return;
    runRef.current = true;
    setRunning(true);
    setRunComplete(false);
    setStatuses(Object.fromEntries(CHECK_ITEMS.map(c => [c.id, "idle"])));
    setOverrides({});

    CHECK_ITEMS.forEach((item, i) => {
      setTimeout(() => {
        // Mark as running
        setStatuses(prev => ({ ...prev, [item.id]: "running" }));
        setTimeout(() => {
          // Settle to result
          const result = item.id === "rights"
            ? (role === "Designer" ? "fail" : "pass")
            : BASE_STATUSES[item.id];
          setStatuses(prev => ({ ...prev, [item.id]: result }));
          if (i === CHECK_ITEMS.length - 1) {
            setRunning(false);
            setRunComplete(true);
            runRef.current = false;
          }
        }, 380);
      }, RUN_DELAYS[i]);
    });
  };

  // Auto-run on mount
  useEffect(() => { runChecks(); }, []);

  // Re-run when role changes (reset + re-run)
  const handleRoleChange = (r: Role) => {
    setRole(r);
    runRef.current = false;
    setTimeout(() => runChecks(), 50);
  };

  const passCount   = CHECK_ITEMS.filter(c => getStatus(c.id) === "pass").length;
  const warnCount   = CHECK_ITEMS.filter(c => getStatus(c.id) === "warn").length;
  const failCount   = CHECK_ITEMS.filter(c => getStatus(c.id) === "fail").length;

  // Critical fails block proceed (unless warn items are overridden)
  const criticalFails = CHECK_ITEMS.filter(c =>
    c.severity === "critical" && getStatus(c.id) === "fail"
  );
  const unoverriddenWarns = CHECK_ITEMS.filter(c =>
    getStatus(c.id) === "warn" && !overrides[c.id]
  );

  const isDesigner   = role === "Designer";
  const canLaunch    = runComplete && !isDesigner && criticalFails.length === 0 && unoverriddenWarns.length === 0;
  const partialLaunch = runComplete && !isDesigner && criticalFails.length === 0 && unoverriddenWarns.length > 0;

  const selectedItem   = CHECK_ITEMS.find(c => c.id === selected)!;
  const selectedStatus = getStatus(selected);

  const handleLaunch = () => {
    setLaunching(true);
    setTimeout(() => navigate("/contractor/marketplace"), 1600);
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col bg-slate-50 min-h-full">

      {/* ═══════════════════════════════════════════════════════════════
          STICKY TOP BAR
      ══════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 flex-wrap gap-y-2">
          {/* Back */}
          <button
            onClick={() => navigate("/contractor/responsibility")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline text-xs">Responsibility Gate</span>
          </button>
          <span className="text-slate-200 hidden sm:block">|</span>

          {/* Icon + Title */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
              <Rocket size={15} className="text-green-600" />
            </div>
            <div>
              <div className="text-xs text-slate-400">2847 Oak Ridge Dr · proj-001 · BOM v1.3</div>
              <div className="text-sm font-bold text-slate-900 leading-tight">Pre-Flight Check</div>
            </div>
          </div>

          {/* Blocking badge */}
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-full flex-shrink-0">
            <Lock size={9} /> BLOCKING — Required before marketplace
          </span>

          {/* Spacer + Role toggle */}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            {runComplete && (
              <button
                onClick={() => { runRef.current = false; runChecks(); }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-medium"
              >
                <RefreshCw size={12} /> Re-run Checks
              </button>
            )}
            <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
              {(["Contractor", "Homeowner", "Designer"] as Role[]).map(r => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
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

        {/* Progress summary bar */}
        <div className="px-4 pb-3 flex items-center gap-3 flex-wrap">
          {/* Progress bar */}
          <div className="flex-1 min-w-[120px] max-w-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 font-medium">Check progress</span>
              <span className="text-[10px] font-bold text-slate-600">
                {running ? "Running…" : runComplete ? `${passCount + warnCount}/${CHECK_ITEMS.length} passed` : "Pending"}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-px">
              {CHECK_ITEMS.map(c => {
                const s = getStatus(c.id);
                return (
                  <div
                    key={c.id}
                    className={`flex-1 rounded-full transition-all duration-500 ${
                      s === "pass" ? "bg-green-500" :
                      s === "warn" ? "bg-amber-400" :
                      s === "fail" ? "bg-red-400" :
                      s === "running" ? "bg-blue-300 animate-pulse" :
                      "bg-slate-200"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Counters */}
          {runComplete && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                <CheckCircle size={9} /> {passCount} PASS
              </span>
              {warnCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                  <AlertTriangle size={9} /> {warnCount} WARN
                </span>
              )}
              {failCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
                  <XCircle size={9} /> {failCount} FAIL
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          DESIGNER LOCKOUT BANNER
      ══════════════════════════════════════════════════════════════════ */}
      {isDesigner && runComplete && (
        <div className="bg-slate-900 border-b border-slate-800">
          <div className="flex items-start gap-3 px-5 py-4">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
              <Lock size={18} className="text-red-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white mb-0.5">Only the project owner can proceed</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The <strong className="text-slate-300">Designer</strong> role has read-only access to this pre-flight screen.
                Procurement authorization is restricted to <strong className="text-slate-300">Contractor</strong> and <strong className="text-slate-300">Homeowner</strong> roles only.
                Contact <strong className="text-slate-300">Mike Torres (Contractor)</strong> to proceed.
              </p>
            </div>
            <div className="flex-shrink-0">
              <button className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 transition-colors font-medium">
                Notify Owner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MAIN TWO-COLUMN LAYOUT
      ══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row items-start">

        {/* ── LEFT: Checklist ─────────────────────────────────────────── */}
        <div className="w-full lg:w-[58%] border-r border-slate-200">

          {/* Section label */}
          <div className="flex items-center gap-2 px-5 py-3 bg-white border-b border-slate-100">
            <Zap size={13} className="text-green-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">System Checks</span>
            <span className="text-xs text-slate-400 ml-1">— Click any item to inspect</span>
          </div>

          {/* Check cards */}
          <div className="divide-y divide-slate-100">
            {CHECK_ITEMS.map((item, idx) => {
              const status  = getStatus(item.id);
              const cfg     = statusCfg(status);
              const isActive = selected === item.id;
              const isWarnOverridden = status === "warn" && overrides[item.id];

              return (
                <div
                  key={item.id}
                  onClick={() => setSelected(item.id)}
                  className={`group flex flex-col cursor-pointer transition-colors ${
                    isActive ? "bg-green-50/60 border-l-2 border-l-green-500" : "bg-white hover:bg-slate-50/80 border-l-2 border-l-transparent"
                  }`}
                >
                  {/* Main row */}
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Step number + status icon */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${cfg.ring}`}>
                        {cfg.icon}
                      </div>
                      <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-slate-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Label + detail */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold ${
                          status === "fail" ? "text-red-700" :
                          status === "warn" && !isWarnOverridden ? "text-amber-800" :
                          status === "pass" || isWarnOverridden ? "text-slate-800" :
                          "text-slate-500"
                        }`}>
                          {item.label}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.categoryColor}`}>
                          {item.category}
                        </span>
                        {item.severity === "critical" && status !== "pass" && status !== "idle" && (
                          <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Critical</span>
                        )}
                        {isWarnOverridden && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600">
                            <CheckCircle size={9} /> Overridden
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {status === "idle"    && "Pending check…"}
                        {status === "running" && <span className="text-blue-400">Running check…</span>}
                        {status === "pass"    && item.source}
                        {status === "warn"    && <span className="text-amber-600">{item.source}</span>}
                        {status === "fail"    && <span className="text-red-500">{item.source}</span>}
                      </div>
                    </div>

                    {/* Status badge + chevron */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                      <ChevronRight size={14} className={`transition-transform ${isActive ? "rotate-90 text-green-600" : "text-slate-300 group-hover:text-slate-500"}`} />
                    </div>
                  </div>

                  {/* Inline warn override (only on warn items) */}
                  {status === "warn" && item.overrideLabel && (
                    <div
                      className="mx-5 mb-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setOverrides(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          overrides[item.id]
                            ? "border-green-500 bg-green-500"
                            : "border-amber-400 bg-white hover:border-amber-600 cursor-pointer"
                        }`}
                      >
                        {overrides[item.id] && <CheckCircle size={10} className="text-white" />}
                      </button>
                      <span className="text-[11px] text-amber-800 leading-relaxed">{item.overrideLabel}</span>
                    </div>
                  )}

                  {/* Fix Now — inline CTA for failed/warned items */}
                  {(status === "fail" || (status === "warn" && !overrides[item.id])) && item.fixLabel && (
                    <div
                      className="mx-5 mb-4"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => item.fixRoute && navigate(item.fixRoute)}
                        className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-semibold transition-colors ${
                          status === "fail"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-amber-500 hover:bg-amber-600 text-white"
                        }`}
                      >
                        <ExternalLink size={12} />
                        Fix Now — {item.fixLabel}
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Launch CTA (desktop bottom of left col) ──────────────── */}
          <div className="hidden lg:block bg-white border-t-2 border-slate-200 px-5 py-5">
            <LaunchCTA
              isDesigner={isDesigner}
              canLaunch={canLaunch}
              partialLaunch={partialLaunch}
              criticalFails={criticalFails}
              unoverriddenWarns={unoverriddenWarns}
              running={running}
              runComplete={runComplete}
              launching={launching}
              onLaunch={handleLaunch}
              role={role}
            />
          </div>
        </div>

        {/* ── RIGHT: Detail panel ──────────────────────────────────────── */}
        <div
          className="hidden lg:flex flex-col w-[42%] sticky bg-white border-l border-slate-200 self-start"
          style={{ top: "141px", height: "calc(100vh - 141px)" }}
        >
          {/* Panel header */}
          <div className="flex-shrink-0 flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 ${statusCfg(selectedStatus).ring} border`}>
              {selectedItem.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800">{selectedItem.label}</div>
              <div className="text-[10px] text-slate-400">{selectedItem.category}</div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg(selectedStatus).badge}`}>
              {statusCfg(selectedStatus).label}
            </span>
          </div>

          {/* Scrollable detail content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">

            {/* Status info card */}
            <div className={`rounded-xl border px-4 py-3 ${
              selectedStatus === "pass" ? "border-green-200 bg-green-50" :
              selectedStatus === "warn" ? "border-amber-200 bg-amber-50" :
              selectedStatus === "fail" ? "border-red-200 bg-red-50" :
              "border-slate-100 bg-slate-50"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {statusCfg(selectedStatus).icon}
                <span className={`text-xs font-bold ${
                  selectedStatus === "pass" ? "text-green-800" :
                  selectedStatus === "warn" ? "text-amber-800" :
                  selectedStatus === "fail" ? "text-red-800" :
                  "text-slate-600"
                }`}>
                  {selectedStatus === "idle"    && "Check pending"}
                  {selectedStatus === "running" && "Running check…"}
                  {selectedStatus === "pass"    && "Check passed"}
                  {selectedStatus === "warn"    && "Check passed with warning"}
                  {selectedStatus === "fail"    && `Check failed${selectedItem.severity === "critical" ? " — blocks proceed" : ""}`}
                </span>
              </div>
              {selectedItem.description || selectedItem.id === "rights" ? (
                <p className="text-[11px] leading-relaxed text-slate-600">
                  {selectedItem.id === "rights"
                    ? role === "Designer"
                      ? "Designer role does not have purchasing rights for this project. Only Contractor (Mike Torres) or Homeowner (Emily Davis) may authorize procurement. Please contact the project owner."
                      : `${role} role has full purchasing rights for proj-001. Permissions verified against project authorization record.`
                    : selectedItem.description
                  }
                </p>
              ) : null}
            </div>

            {/* Extra content (supplier list, finding detail, etc.) */}
            {selectedItem.extra && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Details</div>
                {selectedItem.extra}
              </div>
            )}

            {/* Rights extra for dynamic content */}
            {selectedItem.id === "rights" && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Project Authorization</div>
                {[
                  { user: "Mike Torres",  role: "Contractor", rights: "Full procurement", active: true  },
                  { user: "Emily Davis",  role: "Homeowner",  rights: "Full procurement", active: false },
                  { user: "James Chen",   role: "Designer",   rights: "Read-only",        active: false },
                ].map(u => (
                  <div key={u.user} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border ${
                    u.role === role && role !== "Designer"
                      ? "border-green-200 bg-green-50"
                      : role === "Designer" && u.role === "Designer"
                      ? "border-red-200 bg-red-50"
                      : "border-slate-100 bg-slate-50"
                  }`}>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {u.user.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold text-slate-700">{u.user}</div>
                      <div className="text-[10px] text-slate-400">{u.role}</div>
                    </div>
                    <span className={`text-[10px] font-semibold ${
                      u.rights === "Full procurement" ? "text-green-600" : "text-slate-400"
                    }`}>{u.rights}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check Metadata</div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <Clock size={10} className="text-slate-300 flex-shrink-0" />
                  <span className="text-slate-400 w-24 flex-shrink-0">Last checked</span>
                  <span className="text-slate-600 font-medium">{selectedItem.lastChecked}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info size={10} className="text-slate-300 flex-shrink-0" />
                  <span className="text-slate-400 w-24 flex-shrink-0">Source</span>
                  <span className="text-slate-600 font-medium leading-snug">{selectedItem.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle size={10} className="text-slate-300 flex-shrink-0" />
                  <span className="text-slate-400 w-24 flex-shrink-0">Severity</span>
                  <span className={`font-bold ${selectedItem.severity === "critical" ? "text-red-500" : "text-amber-500"}`}>
                    {selectedItem.severity === "critical" ? "Critical — blocks launch" : "Warning — can override"}
                  </span>
                </div>
              </div>
            </div>

            {/* Fix Now in detail panel */}
            {(selectedStatus === "fail" || selectedStatus === "warn") && selectedItem.fixLabel && selectedItem.fixRoute && (
              <button
                onClick={() => navigate(selectedItem.fixRoute!)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors ${
                  selectedStatus === "fail"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
              >
                <ExternalLink size={14} />
                Fix Now — {selectedItem.fixLabel}
                <ArrowRight size={14} />
              </button>
            )}

            {/* Mark as Resolved */}
            {(selectedStatus === "fail" || selectedStatus === "warn") && (
              <button
                type="button"
                onClick={() => setOverrides(prev => ({ ...prev, [selected]: !prev[selected] }))}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                  overrides[selected]
                    ? "border-green-400 bg-green-50"
                    : "border-dashed border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  overrides[selected]
                    ? "border-green-500 bg-green-500"
                    : "border-slate-300 bg-white"
                }`}>
                  {overrides[selected] && <CheckCircle size={12} className="text-white" />}
                </div>
                <div className="flex-1 text-left">
                  <div className={`text-xs font-semibold ${overrides[selected] ? "text-green-700" : "text-slate-600"}`}>
                    {overrides[selected] ? "Marked as Resolved" : "Mark as Resolved"}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {overrides[selected]
                      ? "This check will no longer block launch"
                      : "Manually acknowledge this issue as addressed"}
                  </div>
                </div>
                {overrides[selected] && (
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                )}
              </button>
            )}

            {/* What happens if ignored */}
            {selectedStatus === "fail" && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3 py-3">
                <XCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1">Cannot proceed</div>
                  <p className="text-[11px] text-red-700 leading-relaxed">
                    {selectedItem.id === "responsibility" && "You must re-acknowledge the Responsibility Gate before marketplace access is granted. This is a platform compliance requirement."}
                    {selectedItem.id === "rights"        && "Only the project owner (Contractor or Homeowner) may authorize procurement. Switch to an authorized role or contact the project owner."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Mobile: Launch CTA at bottom ────────────────────────────────── */}
      <div className="lg:hidden bg-white border-t-2 border-slate-200 px-4 py-5">
        <LaunchCTA
          isDesigner={isDesigner}
          canLaunch={canLaunch}
          partialLaunch={partialLaunch}
          criticalFails={criticalFails}
          unoverriddenWarns={unoverriddenWarns}
          running={running}
          runComplete={runComplete}
          launching={launching}
          onLaunch={handleLaunch}
          role={role}
        />
      </div>

      {/* ── Launch success overlay ───────────────────────────────────── */}
      {launching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Rocket size={30} className="text-green-600 animate-bounce" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">Pre-flight complete</div>
              <div className="text-sm text-slate-500 mt-1">All checks passed · Opening Marketplace…</div>
            </div>
            <div className="flex gap-1">
              {CHECK_ITEMS.map(c => (
                <div key={c.id} className="w-2 h-2 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: `${CHECK_ITEMS.indexOf(c) * 100}ms` }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Launch CTA — shared between desktop and mobile ──────────────────────────

function LaunchCTA({
  isDesigner, canLaunch, partialLaunch, criticalFails,
  unoverriddenWarns, running, runComplete, launching, onLaunch, role,
}: {
  isDesigner: boolean;
  canLaunch: boolean;
  partialLaunch: boolean;
  criticalFails: CheckItem[];
  unoverriddenWarns: CheckItem[];
  running: boolean;
  runComplete: boolean;
  launching: boolean;
  onLaunch: () => void;
  role: Role;
}) {
  if (isDesigner) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-slate-900 text-white rounded-xl px-4 py-3.5">
          <Lock size={18} className="text-slate-400 flex-shrink-0" />
          <div>
            <div className="text-sm font-bold">Only project owner can proceed</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Switch to <strong className="text-slate-200">Contractor</strong> or <strong className="text-slate-200">Homeowner</strong> role to launch marketplace.
            </div>
          </div>
        </div>
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium">
          <User size={14} /> Notify Project Owner
        </button>
      </div>
    );
  }

  if (!runComplete || running) {
    return (
      <button disabled className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-100 text-slate-400 text-sm font-semibold cursor-not-allowed">
        <RefreshCw size={15} className={running ? "animate-spin" : ""} />
        {running ? "Running pre-flight checks…" : "Awaiting check results"}
      </button>
    );
  }

  if (criticalFails.length > 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-xs font-bold text-red-700 mb-1">
              {criticalFails.length} critical check{criticalFails.length > 1 ? "s" : ""} failed — cannot proceed
            </div>
            <div className="space-y-1">
              {criticalFails.map(c => (
                <div key={c.id} className="text-[11px] text-red-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        </div>
        <button disabled className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-100 text-slate-400 text-sm font-semibold cursor-not-allowed">
          <Lock size={15} /> Resolve Issues to Launch
        </button>
      </div>
    );
  }

  if (partialLaunch) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 leading-relaxed">
            <strong>{unoverriddenWarns.length} warning{unoverriddenWarns.length > 1 ? "s" : ""}</strong> must be acknowledged before launching.
            Check and accept each warning item above.
          </div>
        </div>
        <button onClick={onLaunch} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors">
          <AlertTriangle size={15} /> Proceed with Unresolved Issues
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={onLaunch}
        disabled={launching}
        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-70"
      >
        {launching
          ? <><RefreshCw size={16} className="animate-spin" /> Launching…</>
          : <><Rocket size={16} /> Launch Marketplace <ArrowRight size={15} /></>
        }
      </button>
      <p className="text-center text-[10px] text-slate-400">
        All {CHECK_ITEMS.length} checks passed · {role} · proj-001 · BOM v1.3
      </p>
    </div>
  );
}