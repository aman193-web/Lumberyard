import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Star, CheckCircle, ArrowLeft, Send, Info, Truck,
  Package, MessageSquare, Clock, ThumbsUp, Shield,
  BadgeCheck, ClipboardList, User, Sparkles, AlertTriangle,
  ChevronDown, ChevronUp, Zap,
} from "lucide-react";

// ─── Category definitions ─────────────────────────────────────────────────────
// Score = (materialsProtection × 2 + Σ others) / 50 × 10  →  displayed as X.X / 10
// max: (5×2 + 5×8) = 50 → (50/50)×10 = 10.0

interface ReviewCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  weight: number;   // 1 = normal, 2 = double
  rating: number;   // 0 = unrated
}

const defaultCategories: ReviewCategory[] = [
  {
    id: "materials-protection",
    label: "Materials Protection",
    description: "Materials were covered, wrapped, and protected from weather & damage during transit and offloading",
    icon: <Shield size={16} />,
    weight: 2,
    rating: 0,
  },
  {
    id: "placement-accuracy",
    label: "Placement Accuracy",
    description: "Materials delivered and placed at the exact location specified on the site plan",
    icon: <Truck size={16} />,
    weight: 1,
    rating: 0,
  },
  {
    id: "punctuality",
    label: "Punctuality",
    description: "Delivery arrived within the confirmed time window without unannounced delay",
    icon: <Clock size={16} />,
    weight: 1,
    rating: 0,
  },
  {
    id: "communication",
    label: "Communication",
    description: "Timely ETAs, proactive issue alerts, and professional driver conduct throughout delivery",
    icon: <MessageSquare size={16} />,
    weight: 1,
    rating: 0,
  },
  {
    id: "order-accuracy",
    label: "Order Accuracy",
    description: "All ordered items delivered in the correct quantities, grades, and specifications",
    icon: <ClipboardList size={16} />,
    weight: 1,
    rating: 0,
  },
  {
    id: "material-quality",
    label: "Material Quality",
    description: "Materials met grade standards and arrived in undamaged, usable condition",
    icon: <Package size={16} />,
    weight: 1,
    rating: 0,
  },
  {
    id: "driver-professionalism",
    label: "Driver Professionalism",
    description: "Driver was respectful, careful with site conditions, and professional throughout",
    icon: <User size={16} />,
    weight: 1,
    rating: 0,
  },
  {
    id: "documentation",
    label: "Documentation",
    description: "Bill of lading, delivery receipts, and all paperwork provided accurately and promptly",
    icon: <BadgeCheck size={16} />,
    weight: 1,
    rating: 0,
  },
  {
    id: "site-condition",
    label: "Site Condition",
    description: "Delivery area was left tidy — no excess debris, packing waste, or site hazards",
    icon: <Sparkles size={16} />,
    weight: 1,
    rating: 0,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ratingLabels: Record<number, string> = {
  0: "",
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

function computeScore(cats: ReviewCategory[]): number {
  const weightedSum = cats.reduce((acc, c) => acc + c.rating * c.weight, 0);
  const maxPossible = cats.reduce((acc, c) => acc + 5 * c.weight, 0);
  return maxPossible > 0 ? (weightedSum / maxPossible) * 10 : 0;
}

function scoreColor(score: number): string {
  if (score >= 8.5) return "text-green-700";
  if (score >= 7.0) return "text-amber-600";
  return "text-red-600";
}

function scoreBg(score: number): string {
  if (score >= 8.5) return "bg-green-50 border-green-200";
  if (score >= 7.0) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function scoreMessage(score: number): string {
  if (score >= 9.0) return "Outstanding delivery. Your review helps other contractors choose this supplier with confidence.";
  if (score >= 7.5) return "Good experience overall. Your detailed feedback helps Austin Timber Supply keep improving.";
  if (score >= 6.0) return "Average experience. Your specific ratings show where the supplier needs to focus.";
  return "Below expectations. Your feedback is critical for improving delivery standards on the platform.";
}

// ─── Star Input ───────────────────────────────────────────────────────────────

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          onMouseEnter={() => setHovered(i + 1)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i + 1)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            size={22}
            className={`transition-colors ${
              (hovered || value) > i ? "text-amber-400 fill-amber-400" : "text-slate-200 hover:text-amber-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, allRated }: { score: number; allRated: boolean }) {
  const pct = score / 10;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct);

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0" width={96} height={96} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={48} cy={48} r={r} fill="none" stroke="#f1f5f9" strokeWidth={8} />
        {allRated && (
          <circle
            cx={48} cy={48} r={r}
            fill="none"
            stroke={score >= 8.5 ? "#16a34a" : score >= 7.0 ? "#d97706" : "#dc2626"}
            strokeWidth={8}
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        )}
      </svg>
      <div className="text-center z-10">
        {allRated ? (
          <>
            <div className={`text-xl font-bold leading-none ${scoreColor(score)}`}>{score.toFixed(1)}</div>
            <div className="text-[9px] text-slate-400 mt-0.5">out of 10</div>
          </>
        ) : (
          <>
            <div className="text-base font-bold text-slate-300">—</div>
            <div className="text-[9px] text-slate-400">/ 10</div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ReviewSubmission() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(defaultCategories);
  const [overallNote, setOverallNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [recommended, setRecommended] = useState<boolean | null>(null);
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  const allRated     = categories.every(c => c.rating > 0);
  const ratedCount   = categories.filter(c => c.rating > 0).length;
  const score        = computeScore(categories);
  const displayScore = allRated ? score : 0;

  const updateRating = (id: string, rating: number) =>
    setCategories(prev => prev.map(c => c.id === id ? { ...c, rating } : c));

  const handleSubmit = () => {
    if (!allRated) return;
    setSubmitted(true);
  };

  // ── Success screen ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="p-6 lg:p-8 max-w-xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-8 py-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Review Submitted</h2>
          <p className="text-sm text-slate-500 mb-4">Thank you for rating Austin Timber Supply</p>

          {/* Final score display */}
          <div className="flex justify-center mb-4">
            <ScoreRing score={score} allRated />
          </div>

          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border mb-4 ${scoreBg(score)} ${scoreColor(score)}`}>
            {score >= 8.5 ? <Sparkles size={12} /> : score >= 7.0 ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
            {score >= 8.5 ? "Excellent" : score >= 7.0 ? "Good" : "Below average"} · {score.toFixed(1)} / 10
          </div>

          <p className="text-xs text-slate-400 mb-8">
            Your review is now visible to Austin Timber Supply and helps other contractors on the platform make better decisions.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/contractor/deliveries")}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
            >
              <Truck size={15} /> Back to Deliveries
            </button>
            <button
              onClick={() => navigate("/contractor/checkout")}
              className="flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
            >
              <Zap size={15} /> Proceed to Next Phase Checkout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">

      {/* Back */}
      <button
        onClick={() => navigate("/contractor")}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5 uppercase tracking-wide">
            Required
          </span>
          <span className="text-xs text-slate-400">Delivery completed Apr 12, 2026</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Rate Your Delivery</h1>
        <p className="text-sm text-slate-500 mt-1">
          531 Riverside Ave — Framing Package · Austin Timber Supply
        </p>
      </div>

      {/* Gate notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-xs text-amber-700 leading-relaxed">
          <strong>This review is required</strong> before you can proceed to the next delivery phase checkout.
          Rate all 9 categories on a 1–5 star scale. Materials Protection carries 2× weight in the final 10-point score.
        </div>
      </div>

      {/* Score overview + progress */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
        <div className="flex items-center gap-5">
          <ScoreRing score={displayScore} allRated={allRated} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-slate-900">Review Progress</span>
              <span className="text-xs text-slate-500">{ratedCount} / {categories.length} rated</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
                style={{ width: `${(ratedCount / categories.length) * 100}%` }}
              />
            </div>

            {/* Category dots */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map(c => (
                <div
                  key={c.id}
                  className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border transition-all ${
                    c.rating > 0
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}
                >
                  {c.weight === 2 && <span className="text-[8px] font-bold">2×</span>}
                  {c.label.split(" ")[0]}
                  {c.rating > 0 && <CheckCircle size={9} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Score breakdown info */}
        <button
          onClick={() => setShowScoreInfo(s => !s)}
          className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Info size={11} />
          How is the score calculated?
          {showScoreInfo ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
        {showScoreInfo && (
          <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 rounded-xl px-4 py-3 leading-relaxed border border-slate-100">
            Score = (Materials Protection × 2 + sum of other 8 ratings) ÷ 50 × 10.
            Materials Protection is weighted 2× because protecting materials from weather and site damage is the highest-impact factor.
            Maximum score = (5 × 2 + 5 × 8) ÷ 50 × 10 = <strong>10.0</strong>.
          </div>
        )}
      </div>

      {/* Rating categories */}
      <div className="space-y-3 mb-6">
        {categories.map(cat => (
          <div
            key={cat.id}
            className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${
              cat.rating > 0 ? "border-green-100" : "border-slate-100"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                cat.weight === 2 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-500"
              }`}>
                {cat.icon}
              </div>

              {/* Label + description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-900">{cat.label}</span>
                  {cat.weight === 2 && (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">
                      2× WEIGHT
                    </span>
                  )}
                  {cat.rating > 0 && (
                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                      {ratingLabels[cat.rating]}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{cat.description}</p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-3 mt-4 pl-12">
              <StarInput value={cat.rating} onChange={v => updateRating(cat.id, v)} />
              <span className="text-sm text-slate-400 min-w-[60px]">
                {cat.rating > 0 ? `${cat.rating} / 5` : "Tap to rate"}
              </span>
              {cat.weight === 2 && cat.rating > 0 && (
                <span className="text-[10px] text-amber-600 font-semibold ml-auto">
                  +{cat.rating * 2} pts (2×)
                </span>
              )}
              {cat.weight === 1 && cat.rating > 0 && (
                <span className="text-[10px] text-slate-400 font-semibold ml-auto">
                  +{cat.rating} pts
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Overall score summary */}
      {allRated && (
        <div className={`rounded-2xl border p-5 mb-5 ${scoreBg(score)}`}>
          <div className="flex items-center gap-4">
            <ScoreRing score={score} allRated />
            <div>
              <div className={`text-sm font-bold mb-1 ${scoreColor(score)}`}>
                Final Score: {score.toFixed(1)} / 10
              </div>
              <p className={`text-[11px] leading-relaxed ${scoreColor(score)}`}>
                {scoreMessage(score)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Would you recommend */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5">
        <div className="text-sm font-semibold text-slate-900 mb-3">Would you use Austin Timber Supply again?</div>
        <div className="flex gap-3">
          <button
            onClick={() => setRecommended(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              recommended === true
                ? "bg-green-50 border-green-500 text-green-700"
                : "border-slate-200 text-slate-600 hover:border-green-300"
            }`}
          >
            <ThumbsUp size={14} /> Yes, definitely
          </button>
          <button
            onClick={() => setRecommended(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              recommended === false
                ? "bg-red-50 border-red-400 text-red-600"
                : "border-slate-200 text-slate-600 hover:border-red-300"
            }`}
          >
            No, I wouldn't
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-6">
        <label className="text-sm font-semibold text-slate-900 block mb-1">
          Additional Comments <span className="text-xs font-normal text-slate-400">(Optional)</span>
        </label>
        <p className="text-[11px] text-slate-400 mb-3">
          Specific feedback about driver conduct, material condition, or site handling is especially helpful.
        </p>
        <textarea
          rows={4}
          placeholder="e.g. LVL beams arrived well-wrapped and bone dry despite the morning drizzle. Driver stacked materials exactly where marked on the site plan. Would have been 5★ punctuality but arrived 12 min late..."
          value={overallNote}
          onChange={e => setOverallNote(e.target.value)}
          className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none transition-colors"
        />
        {overallNote.length > 0 && (
          <div className="text-right text-[10px] text-slate-300 mt-1">{overallNote.length} chars</div>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!allRated}
        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-4 rounded-xl transition-colors text-sm"
      >
        <Send size={15} />
        {allRated
          ? `Submit Review · ${score.toFixed(1)} / 10`
          : `Rate all 9 categories to continue (${ratedCount} / ${categories.length})`}
      </button>

      <p className="text-xs text-slate-400 text-center mt-3">
        Submitting unlocks the next delivery phase checkout
      </p>
    </div>
  );
}
