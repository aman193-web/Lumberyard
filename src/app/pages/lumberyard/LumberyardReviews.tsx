import React, { useState } from "react";
import {
  Star, TrendingDown, TrendingUp, MessageSquare, AlertCircle,
  ChevronDown, ChevronUp, CheckCircle, Flag, Shield, ThumbsUp,
  Package, MapPin, Phone, Clock, Award, FileText, Zap, Users,
  BarChart3, ArrowRight, Edit2,
} from "lucide-react";

// ─── 10 Review dimensions ─────────────────────────────────────────────────────

const DIMENSIONS = [
  { id: "materials-protection",  label: "Materials Protection",  icon: <Shield size={13} />,       desc: "How well materials were packaged and protected during delivery" },
  { id: "placement-accuracy",    label: "Placement Accuracy",    icon: <MapPin size={13} />,       desc: "Materials placed where requested on job site" },
  { id: "communication",         label: "Communication",         icon: <Phone size={13} />,        desc: "Responsiveness and clarity before and during delivery" },
  { id: "delivery-accuracy",     label: "Delivery Accuracy",     icon: <Package size={13} />,      desc: "Correct items, quantities, and specs as ordered" },
  { id: "timeliness",            label: "Timeliness",            icon: <Clock size={13} />,        desc: "On-time arrival within scheduled delivery window" },
  { id: "product-quality",       label: "Product Quality",       icon: <Award size={13} />,        desc: "Condition, grading, and quality of delivered materials" },
  { id: "professionalism",       label: "Professionalism",       icon: <Users size={13} />,        desc: "Driver and staff conduct and professional demeanor" },
  { id: "documentation",         label: "Documentation",         icon: <FileText size={13} />,     desc: "Accuracy and completeness of packing slips and delivery docs" },
  { id: "issue-resolution",      label: "Issue Resolution",      icon: <Zap size={13} />,          desc: "How quickly and fairly exceptions or problems were resolved" },
  { id: "overall-experience",    label: "Overall Experience",    icon: <Star size={13} />,         desc: "Contractor's overall satisfaction with the order experience" },
];

// ─── Mock Reviews ─────────────────────────────────────────────────────────────

interface ReviewScore { dimension: string; score: number; }

interface Review {
  id: string;
  orderId: string;
  project: string;
  contractor: string;
  date: string;
  overallScore: number;
  scores: ReviewScore[];
  comment: string;
  supplierResponse?: string;
  disputed: boolean;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-001",
    orderId: "ORD-001",
    project: "Riverside Townhomes - Phase 2",
    contractor: "Mike Torres · Torres Construction LLC",
    date: "May 28, 2026",
    overallScore: 4.6,
    disputed: false,
    comment: "Really solid delivery. Driver was professional and knew exactly where to stage materials. Lumber was well-strapped and moisture content was labeled clearly. Only minor issue was the LVL beams arrived 20 min outside the window — not a big deal given traffic.",
    supplierResponse: "Thank you Mike! We're glad the framing materials worked well for Phase 2. We'll work on the window accuracy — we've since adjusted our south route schedule.",
    scores: [
      { dimension: "materials-protection",  score: 5 },
      { dimension: "placement-accuracy",    score: 5 },
      { dimension: "communication",         score: 4 },
      { dimension: "delivery-accuracy",     score: 5 },
      { dimension: "timeliness",            score: 4 },
      { dimension: "product-quality",       score: 5 },
      { dimension: "professionalism",       score: 5 },
      { dimension: "documentation",         score: 4 },
      { dimension: "issue-resolution",      score: 4 },
      { dimension: "overall-experience",    score: 5 },
    ],
  },
  {
    id: "rev-002",
    orderId: "ORD-002",
    project: "Barton Hills Custom Home",
    contractor: "Dana Perkins · Perkins & Co",
    date: "May 15, 2026",
    overallScore: 3.2,
    disputed: false,
    comment: "The Hardie siding arrived 8 days late due to backorder — I understand the supply chain issue but the communication around it was poor. Nobody called until I followed up. Once material arrived the quality was fine. Delivery itself was smooth.",
    scores: [
      { dimension: "materials-protection",  score: 4 },
      { dimension: "placement-accuracy",    score: 4 },
      { dimension: "communication",         score: 2 },
      { dimension: "delivery-accuracy",     score: 3 },
      { dimension: "timeliness",            score: 2 },
      { dimension: "product-quality",       score: 4 },
      { dimension: "professionalism",       score: 4 },
      { dimension: "documentation",         score: 3 },
      { dimension: "issue-resolution",      score: 2 },
      { dimension: "overall-experience",    score: 3 },
    ],
  },
  {
    id: "rev-003",
    orderId: "ORD-003",
    project: "Mueller District Deck Build",
    contractor: "Jason Ruiz · Ruiz Outdoor Living",
    date: "Apr 22, 2026",
    overallScore: 4.9,
    disputed: false,
    comment: "Best lumber delivery experience I've had in years. Driver Ray was outstanding — staged the composite decking by length exactly as requested. Every board was wrapped. No shorts. Packing slip matched the PO perfectly.",
    scores: [
      { dimension: "materials-protection",  score: 5 },
      { dimension: "placement-accuracy",    score: 5 },
      { dimension: "communication",         score: 5 },
      { dimension: "delivery-accuracy",     score: 5 },
      { dimension: "timeliness",            score: 5 },
      { dimension: "product-quality",       score: 5 },
      { dimension: "professionalism",       score: 5 },
      { dimension: "documentation",         score: 5 },
      { dimension: "issue-resolution",      score: 4 },
      { dimension: "overall-experience",    score: 5 },
    ],
  },
  {
    id: "rev-004",
    orderId: "ORD-004",
    project: "Cedar Park Roof Replacement",
    contractor: "Lisa Huang · Apex Roofing",
    date: "Apr 12, 2026",
    overallScore: 3.8,
    disputed: true,
    comment: "Shingles were correct but 2 bundles were clearly damaged — shrink wrap was torn and some tabs were creased. We used them anyway to stay on schedule but filed a defect report. Price was also different from the quote by $48. Would appreciate resolution.",
    scores: [
      { dimension: "materials-protection",  score: 2 },
      { dimension: "placement-accuracy",    score: 4 },
      { dimension: "communication",         score: 4 },
      { dimension: "delivery-accuracy",     score: 4 },
      { dimension: "timeliness",            score: 4 },
      { dimension: "product-quality",       score: 3 },
      { dimension: "professionalism",       score: 4 },
      { dimension: "documentation",         score: 3 },
      { dimension: "issue-resolution",      score: 3 },
      { dimension: "overall-experience",    score: 4 },
    ],
  },
];

// ─── Aggregate dimension averages ─────────────────────────────────────────────

const DIM_AVERAGES = DIMENSIONS.map(dim => {
  const scores = MOCK_REVIEWS.flatMap(r => r.scores.filter(s => s.dimension === dim.id).map(s => s.score));
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return { ...dim, avg: Math.round(avg * 10) / 10 };
}).sort((a, b) => a.avg - b.avg);

const OVERALL_AVG = MOCK_REVIEWS.reduce((s, r) => s + r.overallScore, 0) / MOCK_REVIEWS.length;

// ─── Star display ─────────────────────────────────────────────────────────────

function Stars({ score, size = 12 }: { score: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={size}
          className={score >= n ? "text-amber-400 fill-amber-400" : score >= n - 0.5 ? "text-amber-300 fill-amber-200" : "text-slate-200 fill-slate-100"}
        />
      ))}
    </div>
  );
}

function ScoreBar({ score, max = 5 }: { score: number; max?: number }) {
  const pct = (score / max) * 100;
  const color = pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold w-6 text-right ${pct >= 80 ? "text-green-600" : pct >= 60 ? "text-amber-600" : "text-red-600"}`}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState(review.supplierResponse ?? "");
  const [submitted, setSubmitted] = useState(!!review.supplierResponse);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${review.disputed ? "border-red-200" : "border-slate-100"}`}>
      {/* Header */}
      <div className="flex items-start gap-4 px-5 py-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Stars score={review.overallScore} size={13} />
            <span className="text-sm font-bold text-slate-900">{review.overallScore.toFixed(1)}</span>
            {review.disputed && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                <Flag size={9} /> Disputed
              </span>
            )}
            {!review.supplierResponse && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <MessageSquare size={9} /> Awaiting Response
              </span>
            )}
          </div>
          <div className="text-xs font-semibold text-slate-800">{review.project}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{review.contractor} · {review.date} · {review.orderId}</div>
        </div>
        <button onClick={() => setExpanded(v => !v)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 flex-shrink-0">
          {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </button>
      </div>

      {/* Contractor comment */}
      <div className="px-5 pb-4">
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-slate-600 leading-relaxed italic">
          "{review.comment}"
        </div>
      </div>

      {/* Expanded: dimension scores + supplier response */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-4">
          {/* Dimension scores */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Score Breakdown</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {DIMENSIONS.map(dim => {
                const score = review.scores.find(s => s.dimension === dim.id)?.score ?? 0;
                return (
                  <div key={dim.id} className="flex items-center gap-2">
                    <div className="w-28 text-[11px] text-slate-500 flex-shrink-0 flex items-center gap-1">
                      {dim.icon} {dim.label}
                    </div>
                    <ScoreBar score={score} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supplier response */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Supplier Response</div>
            {submitted && responseText ? (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 space-y-2">
                <div className="text-[10px] font-bold text-blue-700">Austin Timber Supply responded:</div>
                <p className="text-xs text-slate-700 leading-relaxed">"{responseText}"</p>
                <button onClick={() => { setSubmitted(false); setShowResponseForm(true); }} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <Edit2 size={9} /> Edit Response
                </button>
              </div>
            ) : showResponseForm ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  placeholder="Write a professional response visible to this contractor and future viewers…"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowResponseForm(false)} className="px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50">Cancel</button>
                  <button
                    disabled={!responseText.trim()}
                    onClick={() => { setSubmitted(true); setShowResponseForm(false); }}
                    className="flex-1 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40"
                  >
                    Post Response
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowResponseForm(true)} className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-medium transition-colors">
                <MessageSquare size={12} /> Write a Supplier Response
              </button>
            )}
          </div>

          {/* Dispute option */}
          {!review.disputed && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">Believe this review is inaccurate?</span>
              <button className="flex items-center gap-1 text-[10px] font-semibold text-red-600 hover:text-red-800 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors">
                <Flag size={10} /> Dispute Review
              </button>
            </div>
          )}
          {review.disputed && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <Flag size={12} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-700">Dispute filed. Platform team will review within 5 business days.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

type ReviewTab = "reviews" | "trends" | "weakest";

export function LumberyardReviews() {
  const [activeTab, setActiveTab] = useState<ReviewTab>("reviews");
  const [filterMin, setFilterMin] = useState(0);

  const filtered = MOCK_REVIEWS.filter(r => r.overallScore >= filterMin);
  const weakestDims = [...DIM_AVERAGES].slice(0, 4); // bottom 4 by avg
  const strongestDims = [...DIM_AVERAGES].slice(-3).reverse(); // top 3

  const tabs: { id: ReviewTab; label: string; icon: React.ReactNode }[] = [
    { id: "reviews", label: "All Reviews",      icon: <Star size={13} /> },
    { id: "trends",  label: "Review Trends",    icon: <BarChart3 size={13} /> },
    { id: "weakest", label: "Weakest Areas",    icon: <TrendingDown size={13} /> },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review Management</h1>
          <p className="text-sm text-slate-500 mt-1">{MOCK_REVIEWS.length} reviews · {MOCK_REVIEWS.filter(r => !r.supplierResponse).length} awaiting response</p>
        </div>
        {MOCK_REVIEWS.filter(r => r.disputed).length > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
            <Flag size={12} /> {MOCK_REVIEWS.filter(r => r.disputed).length} active dispute
          </span>
        )}
      </div>

      {/* Summary score cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Overall Rating",  value: OVERALL_AVG.toFixed(1), sub: `${MOCK_REVIEWS.length} reviews`,   color: "text-amber-600" },
          { label: "Response Rate",   value: `${Math.round((MOCK_REVIEWS.filter(r => r.supplierResponse).length / MOCK_REVIEWS.length) * 100)}%`, sub: "supplier responses", color: "text-blue-600" },
          { label: "Disputed",        value: MOCK_REVIEWS.filter(r => r.disputed).length.toString(), sub: "under review",  color: "text-red-600" },
          { label: "Pending Reply",   value: MOCK_REVIEWS.filter(r => !r.supplierResponse).length.toString(), sub: "awaiting response", color: "text-amber-600" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">{stat.label}</div>
            <div className="text-[10px] text-slate-400">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Alert: reviews awaiting response */}
      {MOCK_REVIEWS.filter(r => !r.supplierResponse).length > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            <span className="font-bold">{MOCK_REVIEWS.filter(r => !r.supplierResponse).length} review{MOCK_REVIEWS.filter(r => !r.supplierResponse).length !== 1 ? "s" : ""} need your response.</span>{" "}
            Responding within 48 hours improves your supplier score.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ALL REVIEWS */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">Filter:</span>
            {[0, 3, 4, 5].map(min => (
              <button
                key={min}
                onClick={() => setFilterMin(min)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  filterMin === min ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-amber-400"
                }`}
              >
                {min === 0 ? "All" : <><Star size={10} className="fill-amber-400 text-amber-400" /> {min}+</>}
              </button>
            ))}
          </div>

          {filtered.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}

      {/* TRENDS */}
      {activeTab === "trends" && (
        <div className="space-y-4">
          {/* Dimension averages — all 10 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="text-sm font-bold text-slate-900">All 10 Dimensions — Average Score</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Across {MOCK_REVIEWS.length} reviews</div>
            </div>
            <div className="p-5 space-y-3">
              {DIM_AVERAGES.map(dim => (
                <div key={dim.id} className="flex items-center gap-3">
                  <div className="w-36 flex items-center gap-1.5 text-[11px] text-slate-600 flex-shrink-0">
                    {dim.icon} {dim.label}
                  </div>
                  <ScoreBar score={dim.avg} />
                  <Stars score={dim.avg} size={10} />
                </div>
              ))}
            </div>
          </div>

          {/* Monthly trend mock */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="text-sm font-bold text-slate-900 mb-1">Rating Trend (Last 6 Months)</div>
            <div className="text-[10px] text-slate-400 mb-4">Overall score per month</div>
            <div className="flex items-end gap-3 h-24">
              {[
                { month: "Jan", score: 3.9 },
                { month: "Feb", score: 4.1 },
                { month: "Mar", score: 4.0 },
                { month: "Apr", score: 4.4 },
                { month: "May", score: 4.6 },
                { month: "Jun", score: 4.7 },
              ].map(m => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] font-bold text-amber-600">{m.score}</div>
                  <div
                    className="w-full rounded-t-lg bg-amber-400 transition-all"
                    style={{ height: `${((m.score - 3) / 2) * 100}%` }}
                  />
                  <div className="text-[10px] text-slate-400">{m.month}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-xs text-green-600 font-semibold">
              <TrendingUp size={13} /> +0.8 improvement over 6 months
            </div>
          </div>
        </div>
      )}

      {/* WEAKEST AREAS */}
      {activeTab === "weakest" && (
        <div className="space-y-4">
          {/* Weakest */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <div className="w-7 h-7 bg-red-50 rounded-xl flex items-center justify-center">
                <TrendingDown size={14} className="text-red-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Weakest Categories</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Bottom 4 dimensions by average score — focus improvement here</div>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {weakestDims.map((dim, idx) => (
                <div key={dim.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-red-500">#{idx + 1}</span>
                  </div>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-50 text-red-500`}>
                    {dim.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900">{dim.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{dim.desc}</div>
                  </div>
                  <div className="flex-shrink-0 w-32">
                    <ScoreBar score={dim.avg} />
                  </div>
                  <Stars score={dim.avg} size={11} />
                </div>
              ))}
            </div>
          </div>

          {/* Strongest */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <div className="w-7 h-7 bg-green-50 rounded-xl flex items-center justify-center">
                <TrendingUp size={14} className="text-green-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Strongest Categories</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Top 3 dimensions — your competitive advantages</div>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {strongestDims.map((dim, idx) => (
                <div key={dim.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-50 text-green-600">
                    {dim.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900">{dim.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{dim.desc}</div>
                  </div>
                  <div className="flex-shrink-0 w-32">
                    <ScoreBar score={dim.avg} />
                  </div>
                  <Stars score={dim.avg} size={11} />
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="text-sm font-bold text-amber-900 mb-3">Improvement Suggestions</div>
            <div className="space-y-2">
              {[
                { area: "Communication",   tip: "Set up automatic ETA notifications via platform relay when driver leaves yard." },
                { area: "Timeliness",      tip: "Pad delivery windows by 15–20% during peak traffic hours (7–9AM, 4–6PM)." },
                { area: "Issue Resolution",tip: "Respond to exception flags within 4 hours — the platform SLA is 24h but contractors notice faster responses." },
              ].map(item => (
                <div key={item.area} className="flex items-start gap-2">
                  <ArrowRight size={11} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    <span className="font-bold">{item.area}:</span> {item.tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
