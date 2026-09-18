import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  ShoppingCart, DollarSign, Truck, Star, TrendingUp,
  ChevronRight, Clock, CheckCircle, AlertCircle, Package,
  BarChart3, FileText, AlertTriangle, ShieldCheck, Layers,
  TrendingDown, Zap, Timer, ArrowUpRight, CircleDot,
  UserCircle, MapPin, CalendarClock, BadgeCheck, XCircle,
  Percent, Activity, Wallet, Calendar, Map, SlidersHorizontal,
} from "lucide-react";
import { mockOrders, lumberyardRevenue, deliveryPerformance } from "../../data/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";

// ─── Status config (unchanged) ────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  pending:    { label: "Pending",    color: "bg-amber-100 text-amber-700",  dot: "bg-amber-500"  },
  confirmed:  { label: "Confirmed",  color: "bg-blue-100 text-blue-700",    dot: "bg-blue-500"   },
  processing: { label: "Processing", color: "bg-violet-100 text-violet-700",dot: "bg-violet-500" },
  shipped:    { label: "Shipped",    color: "bg-green-100 text-green-700",  dot: "bg-green-500"  },
  delivered:  { label: "Delivered",  color: "bg-slate-100 text-slate-600",  dot: "bg-slate-400"  },
};

// ─── Active orders with exception timer data ──────────────────────────────────

const ACTIVE_ORDERS = [
  {
    id: "ORD-4823",
    contractor: "Torres Construction LLC",
    project: "2847 Oak Ridge Dr",
    phase: "Framing Package",
    items: 14,
    value: 47090,
    receivedMins: 210,   // how many minutes ago it arrived → 24h - 210m = ~20h 30m remaining
    status: "pending" as const,
    urgent: false,
  },
  {
    id: "ORD-4822",
    contractor: "BuildRight Austin",
    project: "9102 Cedar Bluff Ct",
    phase: "Exterior & Siding",
    items: 36,
    value: 22100,
    receivedMins: 1170,  // 19.5h ago → ~4h 30m remaining
    status: "pending" as const,
    urgent: true,
  },
  {
    id: "ORD-4821",
    contractor: "Walsh Home Builders",
    project: "14 Lakewood Trail",
    phase: "Interior Package",
    items: 22,
    value: 14800,
    receivedMins: 750,   // 12.5h ago → ~11h 30m remaining
    status: "confirmed" as const,
    urgent: false,
  },
];

// ─── Today's deliveries (enhanced) ───────────────────────────────────────────

const TODAY_DELIVERIES = [
  {
    project: "418 Willow Creek Ln",
    address: "Cedar Park, TX",
    time: "7:00 AM",
    items: 22,
    driver: "Ray Morales",
    driverInitials: "RM",
    driverColor: "bg-green-600",
    status: "delivered" as const,
    trackingId: "TRK-8841",
    phase: "Foundation",
  },
  {
    project: "531 Riverside Ave",
    address: "Austin, TX",
    time: "10:30 AM",
    items: 14,
    driver: "Carlos Vega",
    driverInitials: "CV",
    driverColor: "bg-amber-500",
    status: "in-transit" as const,
    trackingId: "TRK-8842",
    phase: "Framing",
  },
  {
    project: "2847 Oak Ridge Dr",
    address: "Austin, TX",
    time: "2:00 PM",
    items: 8,
    driver: "James Olufemi",
    driverInitials: "JO",
    driverColor: "bg-blue-500",
    status: "confirmed" as const,
    trackingId: "TRK-8843",
    phase: "Framing",
  },
];

// ─── Delivery status config ───────────────────────────────────────────────────

const deliveryStatusConfig = {
  confirmed: {
    label: "Confirmed",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <CalendarClock size={11} />,
    dot: "bg-blue-500",
  },
  "in-transit": {
    label: "In Transit",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <Truck size={11} />,
    dot: "bg-amber-500",
    pulse: true,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: <CheckCircle size={11} />,
    dot: "bg-green-600",
  },
};

// ─── Catalog health data ──────────────────────────────────────────────────────

const CATALOG_HEALTH = {
  matchRate: 94.7,
  totalItems: 847,
  matchedItems: 802,
  unmatchedItems: 45,
  lowStockItems: [
    { sku: "HBK-2×4-92", name: "HardiePlank Siding 5/4×6", stock: 0,  threshold: 50, critical: true  },
    { sku: "LVL-3.5×14", name: "LVL 3.5×14\" 20' Beam",   stock: 3,  threshold: 10, critical: true  },
    { sku: "OSB-7/16-4×8", name: "OSB 7/16\" Sheathing",  stock: 18, threshold: 40, critical: false },
  ],
  unmatchedTopItems: [
    "2×6 Cedar #1 KD 16'",
    "5/4×6 Redwood Decking",
    "Aluminum Drip Edge 10'",
    "4×8 MDO Plywood",
    "Perforated Ridge Vent",
  ],
  lastUpdated: "Today, 8:00 AM",
};

// ─── Financial data ───────────────────────────────────────────────────────────

const FINANCIALS = {
  commissionMonth: 3847,
  commissionLastMonth: 3412,
  commissionPct: 8.0,
  upcomingPayouts: [
    { label: "Apr Payout", date: "May 1, 2026", amount: 12140, status: "pending" as const },
    { label: "Mid-Apr",    date: "Apr 15, 2026", amount: 6890,  status: "processing" as const },
  ],
  totalProtectedRevenue: 284700,
  avgOrderValue: 18900,
};

// ─── Exception timer helpers ──────────────────────────────────────────────────

function getExceptionTime(receivedMins: number) {
  const totalWindowMins = 24 * 60;
  const remaining = totalWindowMins - receivedMins;
  if (remaining <= 0) return { label: "EXPIRED", urgent: true, pct: 100 };
  const h = Math.floor(remaining / 60);
  const m = remaining % 60;
  const pct = Math.round((receivedMins / totalWindowMins) * 100);
  const urgent = remaining < 6 * 60; // < 6 hours
  return { label: `${h}h ${m}m left`, urgent, pct };
}

function ExceptionTimerBar({ pct, urgent }: { pct: number; urgent: boolean }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${urgent ? "bg-red-500" : pct > 60 ? "bg-amber-400" : "bg-green-500"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LumberyardDashboard() {
  const navigate = useNavigate();
  const [confirmedOrders, setConfirmedOrders] = useState<string[]>([]);

  const monthRevenue = lumberyardRevenue[lumberyardRevenue.length - 1].revenue;
  const activeOrderCount = ACTIVE_ORDERS.length;
  const urgentCount = ACTIVE_ORDERS.filter(o => getExceptionTime(o.receivedMins).urgent).length;

  const handleConfirmOrder = (id: string) => {
    setConfirmedOrders(prev => [...prev, id]);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* ── Header (unchanged) ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good morning, Sarah 👋</h1>
          <p className="text-sm text-slate-500 mt-1">Austin Timber Supply · Here's your business overview</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/lumberyard/catalog")}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700"
          >
            <Package size={15} /> Manage Catalog
          </button>
          <button
            onClick={() => navigate("/lumberyard/orders")}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <ShoppingCart size={15} /> View Orders
          </button>
        </div>
      </div>

      {/* ── Enhanced KPI Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Active Orders */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
            <ShoppingCart size={18} className="text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeOrderCount}</div>
          <div className="text-sm text-slate-500 mt-0.5">Active Orders</div>
          <div className="flex items-center gap-1 mt-1">
            {urgentCount > 0 ? (
              <span className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                <AlertTriangle size={11} /> {urgentCount} expiring soon
              </span>
            ) : (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <CheckCircle size={10} /> All in window
              </span>
            )}
          </div>
        </div>

        {/* Exception Rate */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center mb-3">
            <Timer size={18} className="text-red-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">4.2%</div>
          <div className="text-sm text-slate-500 mt-0.5">Exception Rate</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-green-600 font-medium">
            <TrendingDown size={11} /> −1.1% vs last week
          </div>
        </div>

        {/* Catalog Match Rate */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center mb-3">
            <Percent size={18} className="text-violet-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{CATALOG_HEALTH.matchRate}%</div>
          <div className="text-sm text-slate-500 mt-0.5">Catalog Match Rate</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 font-medium">
            <AlertTriangle size={10} /> {CATALOG_HEALTH.unmatchedItems} unmatched items
          </div>
        </div>

        {/* Materials Protection Score */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center mb-3">
            <ShieldCheck size={18} className="text-green-600" />
          </div>
          <div className="flex items-end gap-1">
            <div className="text-2xl font-bold text-slate-900">4.8</div>
            <Star size={16} className="text-amber-400 fill-amber-400 mb-1" />
          </div>
          <div className="text-sm text-slate-500 mt-0.5">Protection Score</div>
          <div className="text-xs text-slate-400 mt-1">247 verified reviews</div>
        </div>
      </div>

      {/* ── Active Orders with Exception Timers ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Active Orders</h2>
              <p className="text-sm text-amber-100 mt-0.5">
                {activeOrderCount} orders in queue · {urgentCount > 0 ? `${urgentCount} expiring within 6h` : "All within 24h window"}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/lumberyard/orders")}
            className="flex items-center gap-2 bg-white text-amber-600 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-amber-50 transition-colors flex-shrink-0"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>

        {/* Exception Window Legend */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-amber-100">
            <div className="w-3 h-1.5 rounded-full bg-green-400" /> &gt; 12h remaining
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-100">
            <div className="w-3 h-1.5 rounded-full bg-amber-300" /> 6–12h remaining
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-100">
            <div className="w-3 h-1.5 rounded-full bg-red-400" /> &lt; 6h — urgent
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {ACTIVE_ORDERS.map(order => {
            const timer = getExceptionTime(order.receivedMins);
            const isConfirmed = confirmedOrders.includes(order.id);
            const sc = statusConfig[isConfirmed ? "confirmed" : order.status];

            return (
              <div
                key={order.id}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-all"
              >
                {/* Order header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono text-amber-200 mb-0.5">{order.id}</div>
                    <div className="text-sm font-bold text-white truncate">{order.contractor}</div>
                    <div className="text-xs text-amber-100 truncate mt-0.5">{order.project} · {order.phase}</div>
                  </div>
                  {timer.urgent && !isConfirmed && (
                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-red-500 text-white rounded-lg font-bold flex-shrink-0">
                      <AlertTriangle size={9} /> URGENT
                    </span>
                  )}
                  {isConfirmed && (
                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-green-500 text-white rounded-lg font-semibold flex-shrink-0">
                      <CheckCircle size={9} /> Confirmed
                    </span>
                  )}
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-3 text-xs text-amber-100 mb-3">
                  <span className="flex items-center gap-1"><Package size={11} /> {order.items} items</span>
                  <span>·</span>
                  <span className="font-semibold text-white">${(order.value / 1000).toFixed(1)}K</span>
                </div>

                {/* Exception timer */}
                {!isConfirmed ? (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-100">
                        <Timer size={9} /> Exception Window Active
                      </span>
                      <span className={`text-[10px] font-bold ${timer.urgent ? "text-red-300" : "text-white"}`}>
                        {timer.label}
                      </span>
                    </div>
                    <ExceptionTimerBar pct={timer.pct} urgent={timer.urgent} />
                  </div>
                ) : (
                  <div className="mb-3 flex items-center gap-1.5 text-[10px] text-green-300 font-semibold">
                    <CheckCircle size={10} /> Order confirmed · Exception cleared
                  </div>
                )}

                {/* Actions */}
                {!isConfirmed ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfirmOrder(order.id)}
                      className="flex-1 py-1.5 text-[11px] font-bold bg-white text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => navigate("/lumberyard/orders")}
                      className="px-3 py-1.5 text-[11px] font-semibold bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                    >
                      View
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate("/lumberyard/orders")}
                    className="w-full py-1.5 text-[11px] font-semibold bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                  >
                    View Order
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recent Orders + Revenue Chart (layout unchanged) ────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingCart size={15} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Recent Orders</h2>
            </div>
            <button onClick={() => navigate("/lumberyard/orders")} className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium">
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {mockOrders.slice(0, 4).map(order => (
              <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => navigate("/lumberyard/orders")}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{order.projectName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{order.contractorName} · {order.items} items · Delivery: {order.deliveryDate}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-bold text-slate-900">${order.totalValue.toLocaleString()}</span>
                  <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[order.status].color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[order.status].dot}`} />
                    {statusConfig[order.status].label}
                  </span>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <BarChart3 size={15} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Revenue</h2>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-slate-900">${(monthRevenue / 1000).toFixed(0)}K</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5 mb-4">
              <TrendingUp size={12} />
              <span>+9.6% this month</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={lumberyardRevenue} barSize={8}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`, "Revenue"]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Today's Deliveries + Pending Actions (layout unchanged) ─────────── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Today's Deliveries — Enhanced */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Truck size={15} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Today's Deliveries</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {TODAY_DELIVERIES.length} scheduled
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {TODAY_DELIVERIES.map((d, i) => {
              const sc = deliveryStatusConfig[d.status];
              return (
                <div key={i} className="px-6 py-4">
                  {/* Top row: project + status badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{d.project}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <MapPin size={10} /> {d.address}
                        <span>·</span>
                        <Clock size={10} /> {d.time}
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${sc.bg} ${sc.color} ${sc.border}`}>
                      {sc.icon}
                      {sc.label}
                      {"pulse" in sc && sc.pulse && (
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} animate-pulse`} />
                      )}
                    </span>
                  </div>

                  {/* Driver row */}
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full ${d.driverColor} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                      {d.driverInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-700">{d.driver}</div>
                      <div className="text-[10px] text-slate-400">Driver · {d.phase} · {d.items} items</div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-300">{d.trackingId}</div>
                  </div>

                  {/* Confirmation CTA for in-transit */}
                  {d.status === "in-transit" && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-amber-400 rounded-full" />
                      </div>
                      <span className="text-[10px] text-amber-600 font-semibold">En route · ~35 min</span>
                    </div>
                  )}
                  {d.status === "delivered" && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-green-600 font-semibold">
                      <BadgeCheck size={13} /> Signed off · {d.trackingId}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Actions (unchanged) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <AlertCircle size={15} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Action Required</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {[
              { title: "New order from BuildRight Austin", sub: "9102 Cedar Bluff Ct — 36 items · $22,100", action: "Confirm", urgent: true },
              { title: "Low stock: HardiePlank Siding", sub: "0 units in stock — expected on backorder", action: "Restock", urgent: true },
              { title: "Review response needed", sub: "Mike Torres left a 4.2★ review · 2 days ago", action: "Respond", urgent: false },
              { title: "Update capacity: Apr 22–23", sub: "Currently marked as blocked in calendar", action: "Edit", urgent: false },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 px-6 py-4">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${item.urgent ? "bg-red-500" : "bg-amber-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.sub}</div>
                </div>
                <button className="text-xs text-amber-600 hover:text-amber-700 font-semibold whitespace-nowrap transition-colors">
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── NEW: Catalog Health + Financial Summary ──────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Catalog Health — 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Catalog Health</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Updated {CATALOG_HEALTH.lastUpdated}</span>
              <button onClick={() => navigate("/lumberyard/catalog")} className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium">
                Manage <ChevronRight size={12} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Match Rate bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">Catalog Match Rate</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{CATALOG_HEALTH.matchRate}%</span>
                  <span className="text-[10px] text-slate-400">{CATALOG_HEALTH.matchedItems} / {CATALOG_HEALTH.totalItems} items</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                  style={{ width: `${CATALOG_HEALTH.matchRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle size={9} /> {CATALOG_HEALTH.matchedItems} matched
                </span>
                <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                  <AlertTriangle size={9} /> {CATALOG_HEALTH.unmatchedItems} unmatched
                </span>
              </div>
            </div>

            {/* Unmatched items alert */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={13} className="text-amber-600 flex-shrink-0" />
                <span className="text-xs font-bold text-amber-800">Unmatched Items Require Attention</span>
                <span className="ml-auto text-[10px] font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                  {CATALOG_HEALTH.unmatchedItems} items
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATALOG_HEALTH.unmatchedTopItems.map((item, i) => (
                  <span key={i} className="text-[10px] font-medium text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                    {item}
                  </span>
                ))}
              </div>
              <button className="mt-2 text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors">
                Review all unmatched <ChevronRight size={11} />
              </button>
            </div>

            {/* Low stock warnings */}
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Low Stock Warnings</div>
              <div className="space-y-2">
                {CATALOG_HEALTH.lowStockItems.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                      item.critical ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.critical ? "bg-red-500" : "bg-amber-500"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm font-bold ${item.critical ? "text-red-600" : "text-amber-600"}`}>
                        {item.stock} units
                      </div>
                      <div className="text-[10px] text-slate-400">min: {item.threshold}</div>
                    </div>
                    <button className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 ${
                      item.critical ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    } transition-colors`}>
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary — 1/3 width */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <Wallet size={15} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Financial Summary</h2>
          </div>

          <div className="flex-1 p-6 space-y-5">
            {/* Commission this month */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">Commission — April 2026</div>
              <div className="text-2xl font-bold text-green-800">
                ${FINANCIALS.commissionMonth.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                <TrendingUp size={11} />
                +${(FINANCIALS.commissionMonth - FINANCIALS.commissionLastMonth).toLocaleString()} vs last month
              </div>
              <div className="mt-2.5 text-[10px] text-green-600">
                Based on {FINANCIALS.commissionPct}% platform commission rate
              </div>
            </div>

            {/* Upcoming payouts */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Upcoming Payouts</div>
              <div className="space-y-2">
                {FINANCIALS.upcomingPayouts.map((payout, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${payout.status === "processing" ? "bg-violet-500" : "bg-amber-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800">{payout.label}</div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Calendar size={9} /> {payout.date}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-slate-900">${payout.amount.toLocaleString()}</div>
                      <div className={`text-[9px] font-semibold capitalize ${payout.status === "processing" ? "text-violet-600" : "text-amber-600"}`}>
                        {payout.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Protected revenue + avg order */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 text-center">
                <div className="text-[10px] text-slate-400 font-medium mb-0.5">Protected Revenue</div>
                <div className="text-sm font-bold text-slate-800">
                  ${(FINANCIALS.totalProtectedRevenue / 1000).toFixed(0)}K
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 text-center">
                <div className="text-[10px] text-slate-400 font-medium mb-0.5">Avg Order Value</div>
                <div className="text-sm font-bold text-slate-800">
                  ${(FINANCIALS.avgOrderValue / 1000).toFixed(1)}K
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delivery Performance (unchanged) ────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-slate-900">Delivery Performance (Last 6 Weeks)</h2>
          <span className="text-xs text-green-600 font-medium">95.2% avg on-time</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={deliveryPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip formatter={(v: number) => [`${v}%`, "On-Time"]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Line type="monotone" dataKey="onTime" stroke="#15803d" strokeWidth={2} dot={{ fill: "#15803d", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Configuration Quick Access ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Supplier Configuration</h2>
          </div>
          <button
            onClick={() => navigate("/lumberyard/configuration")}
            className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium"
          >
            Open all <ChevronRight size={12} />
          </button>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: Map,
              label: "Service Area",
              desc: "3 active zones · Austin metro",
              detail: "Cedar Park · Round Rock · Austin Core",
              color: "text-blue-600",
              bg: "bg-blue-50",
              badge: "3 zones",
              badgeCls: "text-blue-700 bg-blue-50 border-blue-200",
            },
            {
              icon: Truck,
              label: "Delivery Rules",
              desc: "Base $45 · 3 surcharges active",
              detail: "Fuel · Weekend · Multi-floor",
              color: "text-amber-600",
              bg: "bg-amber-50",
              badge: "4 tiers",
              badgeCls: "text-amber-700 bg-amber-50 border-amber-200",
            },
            {
              icon: Calendar,
              label: "Availability Calendar",
              desc: "Mon – Fri · 7 AM – 5 PM",
              detail: "Sat limited · Sun closed",
              color: "text-green-600",
              bg: "bg-green-50",
              badge: "This week",
              badgeCls: "text-green-700 bg-green-50 border-green-200",
            },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigate("/lumberyard/configuration")}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-start gap-4 hover:border-amber-200 hover:shadow-md transition-all text-left group"
            >
              <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <item.icon size={18} className={item.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                  <span className={`text-[10px] font-semibold border rounded-full px-1.5 py-0.5 ${item.badgeCls}`}>{item.badge}</span>
                </div>
                <div className="text-xs text-slate-500">{item.desc}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{item.detail}</div>
              </div>
              <ChevronRight size={14} className="text-slate-300 flex-shrink-0 group-hover:text-amber-400 transition-colors mt-1" />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
