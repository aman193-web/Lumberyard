import React from "react";
import { useNavigate } from "react-router";
import {
  ClipboardCheck, Clock, CheckCircle, AlertTriangle, ChevronRight,
  FileText, MapPin, DollarSign, Calendar, User, Star, TrendingUp,
} from "lucide-react";
import { mockTakeoffReviews } from "../../data/mockData";

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  "pending": { label: "Pending Review", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  "in-review": { label: "In Review", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  "approved": { label: "Approved", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  "revision-needed": { label: "Revision Needed", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  "high": { label: "High Priority", color: "bg-red-50 text-red-600 border-red-200" },
  "medium": { label: "Medium Priority", color: "bg-amber-50 text-amber-600 border-amber-200" },
  "low": { label: "Low Priority", color: "bg-green-50 text-green-600 border-green-200" },
};

export function ArchitectDashboard() {
  const navigate = useNavigate();
  const pending = mockTakeoffReviews.filter(r => r.status === "pending");
  const inReview = mockTakeoffReviews.filter(r => r.status === "in-review");
  const approved = mockTakeoffReviews.filter(r => r.status === "approved");

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good morning, James 👋</h1>
          <p className="text-sm text-slate-500 mt-1">Chen Structural Engineering · {mockTakeoffReviews.filter(r => r.status === "pending" || r.status === "in-review").length} reviews need attention</p>
        </div>
        <button
          onClick={() => navigate("/architect/reviews")}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors w-fit"
        >
          <ClipboardCheck size={15} /> Review Queue
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending Review", value: pending.length, icon: <Clock size={18} className="text-amber-600" />, bg: "bg-amber-50", trend: "Action needed" },
          { label: "In Progress", value: inReview.length, icon: <ClipboardCheck size={18} className="text-blue-600" />, bg: "bg-blue-50", trend: "Currently reviewing" },
          { label: "Approved (Month)", value: approved.length + 6, icon: <CheckCircle size={18} className="text-green-600" />, bg: "bg-green-50", trend: "This month" },
          { label: "Avg Response Time", value: "4.2h", icon: <Clock size={18} className="text-violet-600" />, bg: "bg-violet-50", trend: "Industry avg: 12h" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
            <div className="text-xs text-slate-400 mt-1">{s.trend}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Review Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ClipboardCheck size={15} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Review Queue</h2>
            </div>
            <button onClick={() => navigate("/architect/reviews")} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium">
              All reviews <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {mockTakeoffReviews.map(review => (
              <div
                key={review.id}
                onClick={() => navigate(`/architect/reviews/${review.id}`)}
                className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-900 truncate flex-1">{review.projectName}</h3>
                    <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusConfig[review.status].color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[review.status].dot}`} />
                      {statusConfig[review.status].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-1"><User size={11} className="text-slate-400" />{review.contractorName}</div>
                    <div className="flex items-center gap-1"><MapPin size={11} className="text-slate-400" />{review.address.split(",")[1]}</div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1"><FileText size={11} className="text-slate-400" />{review.itemCount} items</div>
                    <div className="flex items-center gap-1"><DollarSign size={11} className="text-slate-400" />${review.estimatedValue.toLocaleString()}</div>
                    <div className="flex items-center gap-1"><Calendar size={11} className="text-slate-400" />{new Date(review.submittedAt).toLocaleDateString()}</div>
                  </div>
                  {review.notes && (
                    <div className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5 italic truncate">
                      "{review.notes}"
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${priorityConfig[review.priority].color}`}>
                    {review.priority}
                  </span>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-bold text-lg">JC</div>
              <div>
                <div className="text-sm font-bold text-slate-900">James Chen, PE</div>
                <div className="text-xs text-slate-500">Structural Engineer</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-semibold text-slate-700">4.9</span>
                  <span className="text-xs text-slate-400">(42 reviews)</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">License</span>
                <span className="font-medium text-slate-700">TX-PE-2018-41238</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Area</span>
                <span className="font-medium text-slate-700">Central Texas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Response Time</span>
                <span className="font-medium text-green-700">4.2 hours avg</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {["Residential", "Commercial", "Structural", "Seismic"].map(tag => (
                <span key={tag} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">This Month</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Reviews Completed", value: "9", color: "text-green-700" },
                { label: "Avg Review Time", value: "3.8h", color: "text-blue-700" },
                { label: "Items Verified", value: "842", color: "text-violet-700" },
                { label: "Estimated Value", value: "$184K", color: "text-amber-700" },
              ].map((m, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">{m.label}</span>
                  <span className={`text-sm font-bold ${m.color}`}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
