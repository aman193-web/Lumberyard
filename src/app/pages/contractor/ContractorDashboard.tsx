import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  FolderOpen, Truck, Clock, Plus, ArrowRight,
  CheckCircle, AlertCircle, Package, TrendingUp, BarChart3,
  Calendar, ChevronRight, AlertTriangle, X, Zap,
  MapPin, ShieldAlert, CircleCheck,
} from "lucide-react";
import { mockProjects, mockDeliveries, spendingByMonth } from "../../data/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// ─── Status configs ──────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  "draft":         { label: "Draft",         color: "bg-slate-100 text-slate-600",  dot: "bg-slate-400"  },
  "in-progress":   { label: "In Progress",   color: "bg-blue-100 text-blue-700",    dot: "bg-blue-500"   },
  "takeoff-ready": { label: "Takeoff Ready", color: "bg-amber-100 text-amber-700",  dot: "bg-amber-500"  },
  "ordered":       { label: "Ordered",       color: "bg-violet-100 text-violet-700",dot: "bg-violet-500" },
  "delivering":    { label: "Delivering",    color: "bg-green-100 text-green-700",  dot: "bg-green-500"  },
  "completed":     { label: "Completed",     color: "bg-slate-100 text-slate-500",  dot: "bg-slate-300"  },
};

const deliveryPhaseColors: Record<string, string> = {
  foundation: "bg-amber-100 text-amber-700",
  framing:    "bg-blue-100 text-blue-700",
  exterior:   "bg-violet-100 text-violet-700",
  interior:   "bg-green-100 text-green-700",
};

// ─── Delivery status badge ────────────────────────────────────────────────────

const deliveryStatusConfig: Record<string, {
  label: string;
  color: string;
  dotColor: string;
  pulse: boolean;
}> = {
  scheduled:  { label: "Confirmed",         color: "bg-blue-100 text-blue-700",    dotColor: "bg-blue-500",   pulse: false },
  "in-transit": { label: "In Transit",      color: "bg-green-100 text-green-700",  dotColor: "bg-green-500",  pulse: true  },
  delivered:  { label: "Delivered",         color: "bg-slate-100 text-slate-500",  dotColor: "bg-slate-400",  pulse: false },
  delayed:    { label: "Exception Flagged", color: "bg-red-100 text-red-700",      dotColor: "bg-red-500",    pulse: true  },
};

function DeliveryStatusBadge({ status }: { status: string }) {
  const cfg = deliveryStatusConfig[status] ?? deliveryStatusConfig.scheduled;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dotColor} ${cfg.pulse ? "animate-pulse" : ""}`} />
      {cfg.label}
    </span>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function ContractorDashboard() {
  const navigate = useNavigate();
  const [reviewAlertDismissed, setReviewAlertDismissed] = useState(false);
  const [criticalPathDismissed, setCriticalPathDismissed] = useState(false);

  const activeProjects      = mockProjects.filter(p => p.status !== "completed");
  const allDeliveries       = mockDeliveries;
  const activeDeliveries    = allDeliveries.filter(d => d.status === "scheduled" || d.status === "in-transit");
  const upcomingDeliveries  = allDeliveries; // Show all for enhanced cards
  const pendingTakeoffs     = mockProjects.filter(p => p.status === "takeoff-ready");
  const monthlySpend        = spendingByMonth[spendingByMonth.length - 1].spend;

  // Review gate: deliveries that are delivered but haven't been reviewed yet
  const pendingReviews = allDeliveries.filter(d => d.status === "delivered" || d.status === "in-transit").length;
  // Critical path: pick the highest-priority task
  const inTransitDelivery = allDeliveries.find(d => d.status === "in-transit");
  const criticalTask = inTransitDelivery
    ? {
        type: "delivery" as const,
        label: "Delivery in transit right now",
        detail: `${inTransitDelivery.projectName} · ${inTransitDelivery.phase} package · Driver: ${inTransitDelivery.driver}`,
        cta: "Track",
        path: "/contractor/tracking",
        icon: <Truck size={15} className="text-green-600" />,
        accent: "border-green-400 bg-green-50",
        ctaColor: "text-green-700 hover:text-green-800",
      }
    : pendingTakeoffs.length > 0
    ? {
        type: "takeoff" as const,
        label: "Takeoff awaiting your approval",
        detail: `${pendingTakeoffs[0].name} — review materials before placing order`,
        cta: "Review Now",
        path: `/contractor/projects/${pendingTakeoffs[0].id}/takeoff`,
        icon: <Clock size={15} className="text-amber-600" />,
        accent: "border-amber-400 bg-amber-50",
        ctaColor: "text-amber-700 hover:text-amber-800",
      }
    : null;

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good morning, Mike 👋</h1>
          <p className="text-sm text-slate-500 mt-1">Here's what needs your attention today.</p>
        </div>
        <button
          onClick={() => navigate("/contractor/projects/new")}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors w-fit"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* ── Today's Critical Path ────────────────────────────────────────── */}
      {criticalTask && !criticalPathDismissed && (
        <div className={`flex items-center gap-4 px-5 py-3.5 rounded-xl border-l-4 ${criticalTask.accent} border border-slate-100 shadow-sm`}>
          <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
            {criticalTask.icon}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Zap size={11} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Critical Path</span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-slate-900">{criticalTask.label}</span>
            <span className="text-xs text-slate-500 ml-2 hidden sm:inline">{criticalTask.detail}</span>
          </div>
          <button
            onClick={() => navigate(criticalTask.path)}
            className={`flex items-center gap-1 text-xs font-semibold flex-shrink-0 transition-colors ${criticalTask.ctaColor}`}
          >
            {criticalTask.cta} <ArrowRight size={12} />
          </button>
          <button
            onClick={() => setCriticalPathDismissed(true)}
            className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 ml-1"
            title="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Active Projects",
            value: activeProjects.length,
            icon: <FolderOpen size={18} className="text-blue-600" />,
            bg: "bg-blue-50",
            trend: "+2 this month",
          },
          {
            label: "Upcoming Deliveries",
            value: activeDeliveries.length,
            icon: <Truck size={18} className="text-amber-600" />,
            bg: "bg-amber-50",
            trend: "Next: Feb 18",
          },
          {
            label: "Pending Review",
            value: pendingTakeoffs.length,
            icon: <Clock size={18} className="text-violet-600" />,
            bg: "bg-violet-50",
            trend: "Needs action",
          },
          {
            label: "Active Deliveries",
            value: activeDeliveries.length,
            icon: <MapPin size={18} className="text-green-600" />,
            bg: "bg-green-50",
            trend: inTransitDelivery ? "1 in transit now" : "All confirmed",
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{stat.label}</div>
            <div className="text-xs text-slate-400 mt-1">{stat.trend}</div>
          </div>
        ))}
      </div>

      {/* ── Review Gate Alert ─────────────────────────────────────────────── */}
      {pendingReviews > 0 && !reviewAlertDismissed && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={14} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-amber-900">
              {pendingReviews} {pendingReviews === 1 ? "delivery requires" : "deliveries require"} review before your next checkout
            </span>
            <span className="text-xs text-amber-700 ml-2">
              Reviewing won't block browsing or project creation.
            </span>
          </div>
          <button
            onClick={() => navigate("/contractor/review")}
            className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors flex-shrink-0 whitespace-nowrap"
          >
            Leave Review <ArrowRight size={11} />
          </button>
          <button
            onClick={() => setReviewAlertDismissed(true)}
            className="text-amber-400 hover:text-amber-600 transition-colors flex-shrink-0 ml-1"
            title="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Active Projects + Spending Chart ─────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FolderOpen size={16} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">Active Projects</h2>
            </div>
            <button
              onClick={() => navigate("/contractor/projects")}
              className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {activeProjects.slice(0, 4).map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/contractor/projects/${project.id}/takeoff`)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #166534 0%, #15803d 100%)" }}
                >
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                    {project.type.charAt(0)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{project.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {project.city}, {project.state} · {project.type}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[project.status].color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[project.status].dot}`} />
                    {statusConfig[project.status].label}
                  </span>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spending Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <BarChart3 size={16} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Monthly Spend</h2>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-slate-900">${(monthlySpend / 1000).toFixed(1)}K</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5 mb-4">
              <TrendingUp size={12} />
              <span>+18% vs last month</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={spendingByMonth} barSize={6}>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis key="x-axis" dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis key="y-axis" hide />
                <Tooltip
                  key="tooltip"
                  formatter={(val: number) => [`$${(val / 1000).toFixed(1)}K`, "Spend"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
                <Bar key="bar-spend" dataKey="spend" fill="#15803d" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Deliveries + Action Required ─────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Enhanced Deliveries */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">Deliveries</h2>
              {inTransitDelivery && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <button
              onClick={() => navigate("/contractor/deliveries")}
              className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
            >
              Calendar <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {upcomingDeliveries.map((del) => (
              <div key={del.id} className="px-6 py-4">
                {/* Top row: project + status badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{del.projectName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{del.lumberyard}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Phase tag */}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${deliveryPhaseColors[del.phase]}`}>
                      {del.phase.charAt(0).toUpperCase() + del.phase.slice(1)}
                    </span>
                    {/* Delivery status badge */}
                    <DeliveryStatusBadge status={del.status} />
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-2 mt-2">
                  <Calendar size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-500">{del.scheduledDate}</span>
                  <span className="text-slate-200">·</span>
                  <span className="text-xs text-slate-500">{del.timeSlot}</span>
                  <span className="text-slate-200">·</span>
                  <Package size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-500">{del.items} items · {del.totalWeight}</span>
                </div>

                {/* In-transit live tracker */}
                {del.status === "in-transit" && del.driver && (
                  <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-100 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-green-700 font-medium">Driver: {del.driver}</span>
                      {del.trackingId && (
                        <span className="text-[10px] text-green-600 font-mono">{del.trackingId}</span>
                      )}
                    </div>
                    <button
                      onClick={() => navigate("/contractor/tracking")}
                      className="text-[10px] text-green-700 font-semibold hover:text-green-800 transition-colors"
                    >
                      Track →
                    </button>
                  </div>
                )}

                {/* Exception flagged */}
                {del.status === "delayed" && (
                  <div className="mt-2 flex items-center gap-2 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                    <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />
                    <span className="text-xs text-red-700 font-medium">Exception flagged — contact supplier</span>
                    <button className="ml-auto text-[10px] text-red-700 font-semibold hover:text-red-800 transition-colors">
                      Message →
                    </button>
                  </div>
                )}

                {/* Delivered — needs review nudge */}
                {del.status === "delivered" && (
                  <div className="mt-2 flex items-center gap-2">
                    <CircleCheck size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-400">Completed · </span>
                    <button
                      onClick={() => navigate(`/contractor/review/${del.id}`)}
                      className="text-xs text-amber-600 font-semibold hover:text-amber-700 transition-colors"
                    >
                      Leave Review →
                    </button>
                  </div>
                )}
              </div>
            ))}
            {upcomingDeliveries.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-slate-400">No deliveries scheduled</div>
            )}
          </div>
        </div>

        {/* Action Required */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <AlertCircle size={16} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Action Required</h2>
            {(pendingTakeoffs.length + 2) > 0 && (
              <span className="ml-auto text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                {pendingTakeoffs.length + 2} items
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-50">
            {pendingTakeoffs.map((p) => (
              <div key={p.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Clock size={14} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{p.name}</div>
                  <div className="text-xs text-slate-500">Takeoff ready — review before ordering</div>
                </div>
                <button
                  onClick={() => navigate(`/contractor/projects/${p.id}/takeoff`)}
                  className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                >
                  Review <ArrowRight size={12} />
                </button>
              </div>
            ))}
            {[
              { icon: <CheckCircle size={14} className="text-green-600" />, bg: "bg-green-50", title: "Review submitted for 9102 Cedar Bluff Ct", sub: "Architect approved takeoff · Ready to order", action: "Order Now", path: "/contractor/marketplace" },
              { icon: <Package size={14} className="text-violet-600" />, bg: "bg-violet-50", title: "Delivery review pending", sub: "418 Willow Creek Ln delivery was completed Feb 12", action: "Leave Review", path: "/contractor/review/del-004" },
            ].map((item, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.sub}</div>
                </div>
                <button
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-semibold whitespace-nowrap transition-colors"
                >
                  {item.action} <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "New Project",      icon: <Plus size={18} />,     path: "/contractor/projects/new",  color: "bg-green-600 text-white hover:bg-green-700" },
          { label: "Browse Suppliers", icon: <Package size={18} />,  path: "/contractor/marketplace",   color: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200" },
          { label: "View Calendar",    icon: <Calendar size={18} />, path: "/contractor/deliveries",    color: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200" },
          { label: "Analytics",        icon: <BarChart3 size={18} />,path: "/contractor/analytics",     color: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200" },
        ].map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.path)}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${action.color}`}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}