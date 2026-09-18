import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, DollarSign, Package, Truck, Star } from "lucide-react";
import { lumberyardRevenue, deliveryPerformance, categoryBreakdown } from "../../data/mockData";

export function LumberyardAnalytics() {
  const totalRevenue = lumberyardRevenue.reduce((s, m) => s + m.revenue, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Track revenue, delivery performance, and customer metrics.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Revenue (YTD)", value: `$${(totalRevenue / 1000).toFixed(0)}K`, icon: <DollarSign size={16} className="text-green-600" />, bg: "bg-green-50", trend: "+9.6% avg" },
          { label: "Orders Fulfilled", value: "184", icon: <Package size={16} className="text-blue-600" />, bg: "bg-blue-50", trend: "7 months" },
          { label: "On-Time Rate", value: "95.2%", icon: <Truck size={16} className="text-amber-600" />, bg: "bg-amber-50", trend: "Industry avg: 87%" },
          { label: "Avg Rating", value: "4.8★", icon: <Star size={16} className="text-amber-400" />, bg: "bg-amber-50", trend: "247 reviews" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
            <div className="text-xs text-slate-400 mt-1">{s.trend}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-5">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={lumberyardRevenue}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis key="x-axis" dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis key="y-axis" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip key="tooltip" formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`, "Revenue"]} contentStyle={{ fontSize: 12, borderRadius: 10 }} />
              <Bar key="bar-revenue" dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Delivery Performance */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-5">Delivery On-Time Rate</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={deliveryPerformance}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis key="x-axis" dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis key="y-axis" domain={[80, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip key="tooltip" formatter={(v: number) => [`${v}%`, "On-Time"]} contentStyle={{ fontSize: 12, borderRadius: 10 }} />
              <Line key="line-on-time" type="monotone" dataKey="onTime" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: "#f59e0b", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Mix */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-5">Revenue by Product Category</h2>
        <div className="flex items-center gap-8">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                {categoryBreakdown.map((e, i) => <Cell key={`cell-${i}`} fill={e.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-3">
            {categoryBreakdown.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="text-sm text-slate-600 flex-1">{item.name}</span>
                <div className="text-sm font-bold text-slate-800">{item.value}%</div>
                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.value * 2.5}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Contractors */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Top Customers by Volume</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { name: "Mike Torres Construction", orders: 8, volume: "$38,200", lastOrder: "Feb 12" },
            { name: "Apex Build Group", orders: 5, volume: "$22,100", lastOrder: "Feb 10" },
            { name: "Summit Roofing LLC", orders: 4, volume: "$16,400", lastOrder: "Feb 05" },
            { name: "BuildRight Austin", orders: 3, volume: "$14,800", lastOrder: "Feb 01" },
          ].map((c, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-700 font-bold text-sm">{i + 1}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                <div className="text-xs text-slate-500">{c.orders} orders · Last: {c.lastOrder}</div>
              </div>
              <div className="text-sm font-bold text-slate-900">{c.volume}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}