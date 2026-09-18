import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { TrendingUp, DollarSign, Package, Truck, Award } from "lucide-react";
import { spendingByMonth, categoryBreakdown, deliveryPerformance } from "../../data/mockData";

export function ContractorAnalytics() {
  const totalSpend = spendingByMonth.reduce((s, m) => s + m.spend, 0);
  const avgMonthly = totalSpend / spendingByMonth.length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Track spending, delivery performance, and material trends.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Spend (YTD)", value: `$${(totalSpend / 1000).toFixed(0)}K`, icon: <DollarSign size={16} className="text-green-600" />, bg: "bg-green-50", trend: "8 months" },
          { label: "Avg Monthly", value: `$${(avgMonthly / 1000).toFixed(1)}K`, icon: <TrendingUp size={16} className="text-blue-600" />, bg: "bg-blue-50", trend: "+18% MoM" },
          { label: "Materials Ordered", value: "360", icon: <Package size={16} className="text-violet-600" />, bg: "bg-violet-50", trend: "Across 5 projects" },
          { label: "On-Time Deliveries", value: "94%", icon: <Truck size={16} className="text-amber-600" />, bg: "bg-amber-50", trend: "11/12 deliveries" },
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Spend */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-slate-900">Monthly Material Spend</h2>
            <span className="text-xs text-slate-400">Last 7 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={spendingByMonth}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis key="x-axis" dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis key="y-axis" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                key="tooltip"
                formatter={(val: number) => [`$${(val / 1000).toFixed(1)}K`, "Spend"]}
                contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e2e8f0" }}
              />
              <Bar key="bar-spend" dataKey="spend" fill="#15803d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-slate-900">Spend by Category</h2>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryBreakdown.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-slate-600 flex-1">{item.name}</span>
                  <span className="text-xs font-semibold text-slate-700">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Performance */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-slate-900">Delivery Performance</h2>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-slate-500">On-Time</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-300" /><span className="text-slate-500">Delayed</span></div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={deliveryPerformance}>
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis key="x-axis" dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis key="y-axis" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
            <Tooltip key="tooltip" contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e2e8f0" }} />
            <Bar key="bar-on-time" dataKey="onTime" name="On-Time" fill="#15803d" radius={[4, 4, 0, 0]} stackId="a" />
            <Bar key="bar-delayed" dataKey="delayed" name="Delayed" fill="#fca5a5" radius={[0, 0, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Suppliers */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Award size={14} className="text-amber-500" /> Top Suppliers by Volume</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { name: "Austin Timber Supply", orders: 8, volume: "$38,200", reliability: 96, rating: 4.8 },
            { name: "Central Texas Lumber Co", orders: 3, volume: "$22,800", reliability: 91, rating: 4.6 },
            { name: "Hill Country Lumber", orders: 1, volume: "$6,800", reliability: 88, rating: 4.5 },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center text-green-700 font-bold text-sm">{i + 1}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                <div className="text-xs text-slate-500">{s.orders} orders · {s.volume} volume</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-green-700">{s.reliability}% on-time</div>
                <div className="text-xs text-amber-500">★ {s.rating}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}