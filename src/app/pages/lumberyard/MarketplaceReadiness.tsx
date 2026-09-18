import React, { useState } from "react";
import {
  CheckCircle, AlertCircle, Clock, Package, MapPin, Calendar,
  ShieldCheck, Target, FileText, ChevronRight, TrendingUp,
  Star, Zap, ArrowRight, AlertTriangle, RefreshCw,
} from "lucide-react";

// ─── Checklist Items ──────────────────────────────────────────────────────────

type CheckStatus = "pass" | "warn" | "fail" | "pending";

interface CheckItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: CheckStatus;
  score: number;       // 0–100 contribution to overall score
  weight: number;      // weight in total (must sum to 100)
  detail: string;
  action?: string;
  route?: string;
}

const CHECKLIST: CheckItem[] = [
  {
    id: "catalog",
    label: "Catalog Health",
    description: "Active products, stale pricing, and out-of-stock items affecting visibility",
    icon: <Package size={16} />,
    status: "warn",
    score: 72,
    weight: 20,
    detail: "14 products active · 4 with stale pricing (>14 days) · 0 out of stock",
    action: "Update Pricing",
    route: "/lumberyard/catalog",
  },
  {
    id: "service-area",
    label: "Service Area Active",
    description: "Delivery radius and zone coverage configured and enabled",
    icon: <MapPin size={16} />,
    status: "pass",
    score: 100,
    weight: 15,
    detail: "20-mile radius · 3 named zones · North Austin, Cedar Park, Round Rock",
    action: "Edit Area",
    route: "/lumberyard/configuration",
  },
  {
    id: "calendar",
    label: "Availability Calendar",
    description: "Delivery days, time windows, and capacity slots are configured",
    icon: <Calendar size={16} />,
    status: "warn",
    score: 75,
    weight: 15,
    detail: "Delivery windows set · 3 upcoming dates need holiday flag review",
    action: "Review Calendar",
    route: "/lumberyard/capacity",
  },
  {
    id: "price-policy",
    label: "Price Policy Active",
    description: "Price lock window, down payment %, and floating rules are configured",
    icon: <ShieldCheck size={16} />,
    status: "fail",
    score: 0,
    weight: 20,
    detail: "Price policy not yet configured — required before marketplace activation",
    action: "Configure Now",
    route: "/lumberyard/configuration",
  },
  {
    id: "terms",
    label: "Terms Accepted",
    description: "All supplier agreements signed and current version accepted",
    icon: <FileText size={16} />,
    status: "warn",
    score: 75,
    weight: 15,
    detail: "3 of 4 agreements accepted · Supplier Responsibilities v1.1 pending signature",
    action: "Accept Terms",
    route: "/lumberyard/terms",
  },
  {
    id: "match-rate",
    label: "Match Rate Status",
    description: "Bid-to-order conversion rate must be ≥70% to remain active in marketplace",
    icon: <Target size={16} />,
    status: "warn",
    score: 58,
    weight: 15,
    detail: "Current rate: 58% · Target: ≥70% · Trending up +6% over 30 days",
    action: "View Analytics",
    route: "/lumberyard/analytics",
  },
];

// ─── Overall score ────────────────────────────────────────────────────────────

const OVERALL_SCORE = Math.round(
  CHECKLIST.reduce((acc, item) => acc + (item.score * item.weight) / 100, 0)
);

const STATUS_CONFIG: Record<CheckStatus, { dot: string; label: string; labelCls: string; icon: React.ReactNode }> = {
  pass:    { dot: "bg-green-500",  label: "Pass",     labelCls: "text-green-700 bg-green-50 border-green-200",   icon: <CheckCircle size={14} /> },
  warn:    { dot: "bg-amber-400 animate-pulse", label: "Needs Attention", labelCls: "text-amber-700 bg-amber-50 border-amber-200",  icon: <AlertTriangle size={14} /> },
  fail:    { dot: "bg-red-500",    label: "Blocked",  labelCls: "text-red-700 bg-red-50 border-red-200",         icon: <AlertCircle size={14} /> },
  pending: { dot: "bg-slate-300",  label: "Pending",  labelCls: "text-slate-500 bg-slate-50 border-slate-200",   icon: <Clock size={14} /> },
};

function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx={50} cy={50} r={r} fill="none" stroke="#f1f5f9" strokeWidth={10} />
        <circle
          cx={50} cy={50} r={r} fill="none"
          stroke={color} strokeWidth={10}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-slate-900">{score}</div>
        <div className="text-[10px] text-slate-400">/100</div>
      </div>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ReadinessContent() {
  const [expanded, setExpanded] = useState<string | null>("price-policy");

  const passCount = CHECKLIST.filter(c => c.status === "pass").length;
  const failCount = CHECKLIST.filter(c => c.status === "fail").length;
  const warnCount = CHECKLIST.filter(c => c.status === "warn").length;
  const isReady = OVERALL_SCORE >= 80 && failCount === 0;

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Hero score card */}
      <div className={`rounded-2xl border p-6 ${isReady ? "bg-green-50 border-green-200" : OVERALL_SCORE >= 60 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"}`}>
        <div className="flex items-center gap-6">
          <ScoreRing score={OVERALL_SCORE} />
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold text-slate-900 mb-1">
              {isReady ? "Marketplace Ready" : OVERALL_SCORE >= 60 ? "Almost Ready" : "Action Required"}
            </div>
            <p className={`text-xs leading-relaxed mb-3 ${isReady ? "text-green-800" : OVERALL_SCORE >= 60 ? "text-amber-800" : "text-red-800"}`}>
              {isReady
                ? "All requirements met. You're visible to contractors in your service area."
                : failCount > 0
                  ? `${failCount} item${failCount !== 1 ? "s" : ""} blocking marketplace activation. Resolve to go live.`
                  : `${warnCount} item${warnCount !== 1 ? "s" : ""} need attention to reach full readiness score.`}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-4 flex-wrap">
              {[
                { count: passCount, label: "Passing",   cls: "text-green-700 bg-green-100" },
                { count: warnCount, label: "Warnings",  cls: "text-amber-700 bg-amber-100" },
                { count: failCount, label: "Blocked",   cls: "text-red-700 bg-red-100" },
              ].map(stat => (
                <div key={stat.label} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${stat.cls}`}>
                  {stat.count} {stat.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weight breakdown mini-bars */}
        <div className="mt-5 pt-4 border-t border-white/50 space-y-2">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-3">Score Breakdown by Category</div>
          {CHECKLIST.map(item => {
            const cfg = STATUS_CONFIG[item.status];
            const contribution = Math.round((item.score * item.weight) / 100);
            return (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-32 text-[11px] text-slate-600 flex-shrink-0 flex items-center gap-1">
                  {item.icon} {item.label}
                </div>
                <ScoreBar score={item.score} />
                <span className={`text-[10px] font-bold flex-shrink-0 w-8 text-right ${
                  item.status === "pass" ? "text-green-600" : item.status === "warn" ? "text-amber-600" : "text-red-600"
                }`}>{item.score}</span>
                <span className="text-[10px] text-slate-400 flex-shrink-0 w-12">+{contribution}pts</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {CHECKLIST.map(item => {
          const cfg = STATUS_CONFIG[item.status];
          const isExpanded = expanded === item.id;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                item.status === "fail" ? "border-red-200" : item.status === "warn" ? "border-amber-200" : "border-slate-100"
              }`}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : item.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
              >
                {/* Status icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${cfg.labelCls}`}>
                  {cfg.icon}
                </div>

                {/* Category icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50 text-slate-500`}>
                  {item.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900">{item.label}</div>
                  {!isExpanded && <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.detail}</div>}
                </div>

                {/* Score pill */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-bold text-slate-600">{item.score}/100</span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.labelCls}`}>
                    {cfg.label}
                  </span>
                </div>

                <ChevronRight size={14} className={`text-slate-300 flex-shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-50 space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>

                  {/* Detail chip */}
                  <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border text-xs ${cfg.labelCls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    {item.detail}
                  </div>

                  {/* Weight contribution */}
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Weight: <span className="font-semibold text-slate-600">{item.weight}%</span></span>
                    <span>·</span>
                    <span>Your contribution: <span className={`font-semibold ${item.status === "pass" ? "text-green-600" : item.status === "warn" ? "text-amber-600" : "text-red-600"}`}>
                      {Math.round((item.score * item.weight) / 100)} pts
                    </span></span>
                    <span>·</span>
                    <span>Max possible: <span className="font-semibold text-slate-600">{item.weight} pts</span></span>
                  </div>

                  {/* Action button */}
                  {item.action && (
                    <button className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${
                      item.status === "fail"
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : item.status === "warn"
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}>
                      {item.action} <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
        <div className="text-sm font-bold text-slate-900">How the Score is Calculated</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CHECKLIST.map(item => (
            <div key={item.id} className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_CONFIG[item.status].dot}`} />
              {item.label} ({item.weight}%)
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400">
          Overall score is a weighted average. A score ≥80 with no blocked items activates your marketplace listing.
          Scores are recalculated automatically as you update your profile.
        </p>
      </div>
    </div>
  );
}

export function MarketplaceReadiness() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Marketplace Readiness</h1>
        <p className="text-sm text-slate-500 mt-1">Your real-time status across all marketplace activation requirements.</p>
      </div>
      <ReadinessContent />
    </div>
  );
}
