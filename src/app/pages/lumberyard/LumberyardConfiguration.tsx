import React, { useState } from "react";
import {
  Map, Truck, Calendar, Save, Plus, Trash2, ChevronLeft,
  ChevronRight, Lock, CheckCircle, DollarSign,
  Percent, AlertCircle, Edit2, Clock, ShieldCheck, Tag,
  ToggleLeft, ToggleRight, BadgeCheck, TrendingUp,
} from "lucide-react";
import { ServiceZoneMap } from "../../components/lumberyard/ServiceZoneMap";
import { useSupplierSetup } from "../../context/SupplierSetupContext";

type ConfigTab = "service-area" | "delivery-rules" | "calendar" | "price-policy";

// ─── Service Area data ────────────────────────────────────────────────────────

const areaColorMap: Record<string, { badge: string; label: string; svgFill: string; svgStroke: string }> = {
  blue:   { badge: "bg-blue-100 border-blue-300 text-blue-700",   label: "text-blue-700 bg-blue-50 border-blue-200",   svgFill: "rgba(59,130,246,0.08)",   svgStroke: "rgba(59,130,246,0.45)" },
  green:  { badge: "bg-green-100 border-green-300 text-green-700", label: "text-green-700 bg-green-50 border-green-200", svgFill: "rgba(34,197,94,0.08)",    svgStroke: "rgba(34,197,94,0.45)"  },
  violet: { badge: "bg-violet-100 border-violet-300 text-violet-700", label: "text-violet-700 bg-violet-50 border-violet-200", svgFill: "rgba(139,92,246,0.06)", svgStroke: "rgba(139,92,246,0.35)" },
};

// ─── Delivery Rules data ──────────────────────────────────────────────────────

const DISTANCE_TIERS = [
  { range: "0 – 5 miles",   fee: "Free",           sub: "Included with order" },
  { range: "5 – 15 miles",  fee: "$1.50 / mile",   sub: "Standard radius" },
  { range: "15 – 30 miles", fee: "$2.25 / mile",   sub: "Extended zone" },
  { range: "30+ miles",     fee: "$3.00 / mile",   sub: "Long-haul rate" },
];

const INITIAL_SURCHARGES = [
  { id: "fuel",      label: "Fuel Surcharge",      value: "4.5%",  unit: "%", enabled: true,  desc: "Applied to all delivery totals" },
  { id: "weekend",   label: "Weekend Delivery",     value: "$75",   unit: "$", enabled: true,  desc: "Saturday & Sunday premium" },
  { id: "oversized", label: "Oversized Load",       value: "$150",  unit: "$", enabled: false, desc: "Items > 500 lbs or 16 ft length" },
  { id: "afterhours",label: "After-Hours Delivery", value: "$100",  unit: "$", enabled: false, desc: "Before 7 AM or after 5 PM" },
  { id: "multifloor",label: "Multi-Floor Delivery", value: "$50",   unit: "$", enabled: true,  desc: "Per floor above ground level" },
];

// ─── Calendar data ────────────────────────────────────────────────────────────

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_DATES = ["May 13", "May 14", "May 15", "May 16", "May 17", "May 18", "May 19"];
const TIME_SLOTS = [
  "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
];

type SlotState = "available" | "booked" | "blocked" | "unavailable";

function buildInitialSlots(): Record<string, SlotState> {
  const data: Record<string, SlotState> = {
    // Mon
    "Mon-7:00 AM": "booked", "Mon-8:00 AM": "booked", "Mon-9:00 AM": "available",
    "Mon-10:00 AM": "available", "Mon-11:00 AM": "booked", "Mon-12:00 PM": "available",
    "Mon-1:00 PM": "available", "Mon-2:00 PM": "available", "Mon-3:00 PM": "blocked",
    "Mon-4:00 PM": "blocked",
    // Tue
    "Tue-7:00 AM": "available", "Tue-8:00 AM": "booked", "Tue-9:00 AM": "booked",
    "Tue-10:00 AM": "booked", "Tue-11:00 AM": "available", "Tue-12:00 PM": "available",
    "Tue-1:00 PM": "booked", "Tue-2:00 PM": "available", "Tue-3:00 PM": "available",
    "Tue-4:00 PM": "unavailable",
    // Wed
    "Wed-7:00 AM": "available", "Wed-8:00 AM": "available", "Wed-9:00 AM": "booked",
    "Wed-10:00 AM": "booked", "Wed-11:00 AM": "booked", "Wed-12:00 PM": "blocked",
    "Wed-1:00 PM": "blocked", "Wed-2:00 PM": "blocked", "Wed-3:00 PM": "available",
    "Wed-4:00 PM": "available",
    // Thu
    "Thu-7:00 AM": "booked", "Thu-8:00 AM": "booked", "Thu-9:00 AM": "booked",
    "Thu-10:00 AM": "available", "Thu-11:00 AM": "available", "Thu-12:00 PM": "available",
    "Thu-1:00 PM": "booked", "Thu-2:00 PM": "booked", "Thu-3:00 PM": "available",
    "Thu-4:00 PM": "available",
    // Fri
    "Fri-7:00 AM": "available", "Fri-8:00 AM": "available", "Fri-9:00 AM": "available",
    "Fri-10:00 AM": "booked", "Fri-11:00 AM": "booked", "Fri-12:00 PM": "available",
    "Fri-1:00 PM": "available", "Fri-2:00 PM": "available", "Fri-3:00 PM": "blocked",
    "Fri-4:00 PM": "blocked",
    // Sat (limited)
    "Sat-7:00 AM": "unavailable", "Sat-8:00 AM": "available", "Sat-9:00 AM": "booked",
    "Sat-10:00 AM": "available", "Sat-11:00 AM": "available",
    "Sat-12:00 PM": "unavailable", "Sat-1:00 PM": "unavailable", "Sat-2:00 PM": "unavailable",
    "Sat-3:00 PM": "unavailable", "Sat-4:00 PM": "unavailable",
    // Sun (closed)
    "Sun-7:00 AM": "unavailable", "Sun-8:00 AM": "unavailable", "Sun-9:00 AM": "unavailable",
    "Sun-10:00 AM": "unavailable", "Sun-11:00 AM": "unavailable", "Sun-12:00 PM": "unavailable",
    "Sun-1:00 PM": "unavailable", "Sun-2:00 PM": "unavailable", "Sun-3:00 PM": "unavailable",
    "Sun-4:00 PM": "unavailable",
  };
  return data;
}

const slotStyles: Record<SlotState, string> = {
  available:   "bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer",
  booked:      "bg-amber-50 border-amber-200",
  blocked:     "bg-slate-100 border-slate-200",
  unavailable: "bg-white border-slate-100 opacity-50",
};

const slotOrders: Partial<Record<string, number>> = {
  "Mon-7:00 AM": 2, "Mon-8:00 AM": 1, "Mon-11:00 AM": 3,
  "Tue-8:00 AM": 2, "Tue-9:00 AM": 1, "Tue-10:00 AM": 2, "Tue-1:00 PM": 1,
  "Wed-9:00 AM": 2, "Wed-10:00 AM": 1, "Wed-11:00 AM": 3,
  "Thu-7:00 AM": 2, "Thu-8:00 AM": 2, "Thu-9:00 AM": 1, "Thu-1:00 PM": 2, "Thu-2:00 PM": 1,
  "Fri-10:00 AM": 2, "Fri-11:00 AM": 1,
  "Sat-9:00 AM": 1,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

export function ServiceAreaTab({ showMap = true }: { showMap?: boolean } = {}) {
  const { serviceZones, addServiceZone, removeServiceZone } = useSupplierSetup();
  const [showAdd, setShowAdd] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");

  const areas = serviceZones.map(zone => ({
    id: zone.id, name: zone.name, type: zone.shape, radius: zone.radius,
    color: zone.color, active: zone.active,
  }));

  const handleAddArea = () => {
    if (newAreaName.trim()) {
      addServiceZone(newAreaName);
      setNewAreaName("");
      setShowAdd(false);
    }
  };

  return (
    <div className={showMap ? "grid lg:grid-cols-3 gap-6" : "grid lg:grid-cols-2 gap-6"}>
      {showMap && (
        <ServiceZoneMap
          className="lg:col-span-2"
          subtitle="Austin, TX"
          zones={serviceZones.map(zone => ({
            id: zone.id, label: zone.name, color: zone.color, active: zone.active,
            cx: zone.cx, cy: zone.cy, r: zone.r,
            labelLeft: zone.labelLeft, labelTop: zone.labelTop,
          }))}
          crosshair={{ cx: "44%", cy: "48%" }}
          pin={{ left: "42%", top: "42%", label: "Austin Timber HQ" }}
        />
      )}

      {/* Areas List */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Service Zones</h3>
            <span className="text-[11px] text-slate-400 bg-slate-50 rounded-full px-2 py-0.5">{areas.filter(a => a.active).length} active</span>
          </div>
          <div className="divide-y divide-slate-50">
            {areas.map(area => {
              const colors = areaColorMap[area.color] ?? areaColorMap.blue;
              return (
                <div key={area.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${area.active ? `bg-${area.color}-500` : "bg-slate-300"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate">{area.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 capitalize">{area.type} · {area.radius}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${area.active ? "text-green-700 bg-green-50 border-green-200" : "text-slate-400 bg-slate-50 border-slate-200"}`}>
                      {area.active ? "Active" : "Off"}
                    </span>
                    <button
                      onClick={() => removeServiceZone(area.id)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Area */}
          {showAdd ? (
            <div className="px-5 py-4 border-t border-slate-100 space-y-3">
              <input
                type="text"
                placeholder="Zone name (e.g. Pflugerville)"
                value={newAreaName}
                onChange={e => setNewAreaName(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddArea}
                  className="flex-1 py-2 text-xs font-semibold bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                >
                  Add Zone
                </button>
                <button
                  onClick={() => { setShowAdd(false); setNewAreaName(""); }}
                  className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="px-5 py-4 border-t border-slate-100">
              <button
                onClick={() => setShowAdd(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-amber-300 text-amber-600 hover:bg-amber-50 rounded-xl text-xs font-semibold transition-colors"
              >
                <Plus size={13} /> Add Service Area
              </button>
            </div>
          )}
        </div>

        {/* Info card */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-blue-800 mb-1">Coverage Tip</div>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Orders outside your active zones will not be matched to your yard. Expand zones to capture more business.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DeliveryRulesTab() {
  const [baseFee, setBaseFee] = useState("45.00");
  const [minOrder, setMinOrder] = useState("500.00");
  const [surcharges, setSurcharges] = useState(INITIAL_SURCHARGES);

  const toggleSurcharge = (id: string) =>
    setSurcharges(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));

  const activeCount = surcharges.filter(s => s.enabled).length;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left column */}
      <div className="space-y-5">
        {/* Base fee */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
              <DollarSign size={15} className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Base Delivery Fee</h3>
              <p className="text-[10px] text-slate-400">Flat fee applied to every delivery</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Base Fee</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-semibold">$</span>
                <input
                  type="text"
                  value={baseFee}
                  onChange={e => setBaseFee(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Minimum Order Value</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-semibold">$</span>
                <input
                  type="text"
                  value={minOrder}
                  onChange={e => setMinOrder(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Orders below this value are not eligible for delivery</p>
            </div>
          </div>
        </div>

        {/* Distance tiers */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
              <Truck size={15} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Distance-Based Fees</h3>
              <p className="text-[10px] text-slate-400">Per-mile rate by distance bracket</p>
            </div>
          </div>
          <div className="space-y-2">
            {DISTANCE_TIERS.map((tier, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <div className="text-xs font-semibold text-slate-800">{tier.range}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{tier.sub}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${tier.fee === "Free" ? "text-green-600" : "text-slate-900"}`}>
                    {tier.fee}
                  </span>
                  <button className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                    <Edit2 size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-3 w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-medium transition-colors">
            <Plus size={12} /> Add Tier
          </button>
        </div>
      </div>

      {/* Right column — Surcharges */}
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center">
                <Percent size={15} className="text-violet-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Surcharges</h3>
                <p className="text-[10px] text-slate-400">Additional fees for special conditions</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5">
              {activeCount} active
            </span>
          </div>

          <div className="space-y-3">
            {surcharges.map(surcharge => (
              <div
                key={surcharge.id}
                className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border transition-all ${
                  surcharge.enabled ? "bg-violet-50 border-violet-200" : "bg-slate-50 border-slate-100"
                }`}
              >
                <button
                  onClick={() => toggleSurcharge(surcharge.id)}
                  className={`mt-0.5 w-8 h-4.5 rounded-full flex-shrink-0 relative transition-all flex items-center ${
                    surcharge.enabled ? "bg-amber-500" : "bg-slate-300"
                  }`}
                  style={{ width: 30, height: 16 }}
                >
                  <span
                    className={`w-3 h-3 rounded-full bg-white shadow transition-transform flex-shrink-0 ${
                      surcharge.enabled ? "translate-x-3.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${surcharge.enabled ? "text-slate-900" : "text-slate-500"}`}>
                      {surcharge.label}
                    </span>
                    <span className={`text-xs font-bold ${surcharge.enabled ? "text-violet-700" : "text-slate-400"}`}>
                      {surcharge.value}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{surcharge.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-medium transition-colors">
            <Plus size={12} /> Add Surcharge
          </button>
        </div>

        {/* Preview card */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="text-xs font-bold text-green-800 mb-3">Sample Fee Calculation</div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-700">
              <span>Base delivery fee</span>
              <span className="font-semibold">${baseFee}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Distance (12 miles × $1.50)</span>
              <span className="font-semibold">$18.00</span>
            </div>
            {surcharges.filter(s => s.enabled).map(s => (
              <div key={s.id} className="flex justify-between text-slate-600">
                <span>{s.label}</span>
                <span>{s.value}</span>
              </div>
            ))}
            <div className="border-t border-green-300 pt-1.5 flex justify-between font-bold text-green-800">
              <span>Est. Delivery Total</span>
              <span>≈ $67.00+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CalendarTab() {
  const [slots, setSlots] = useState<Record<string, SlotState>>(buildInitialSlots());
  const [weekLabel] = useState("May 13 – 19, 2026");

  const toggleSlot = (day: string, time: string) => {
    const key = `${day}-${time}`;
    setSlots(prev => {
      const current = prev[key];
      if (current === "available") return { ...prev, [key]: "blocked" };
      if (current === "blocked") return { ...prev, [key]: "available" };
      return prev;
    });
  };

  const countByState = (state: SlotState) =>
    Object.values(slots).filter(v => v === state).length;

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Available",   count: countByState("available"),   color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
          { label: "Booked",      count: countByState("booked"),      color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
          { label: "Blocked",     count: countByState("blocked"),     color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
          { label: "Unavailable", count: countByState("unavailable"), color: "text-slate-400", bg: "bg-white",    border: "border-slate-100" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} ${s.border} border rounded-2xl px-4 py-3 text-center`}>
            <div className={`text-xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <ChevronLeft size={15} />
          </button>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-900">{weekLabel}</span>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 px-5 py-2.5 border-b border-slate-50 bg-slate-50/50">
          {[
            { state: "available",   label: "Available",   cls: "bg-green-100 border-green-300" },
            { state: "booked",      label: "Booked",      cls: "bg-amber-100 border-amber-300" },
            { state: "blocked",     label: "Blocked",     cls: "bg-slate-200 border-slate-300" },
            { state: "unavailable", label: "Closed",      cls: "bg-white border-slate-200" },
          ].map(item => (
            <div key={item.state} className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <div className={`w-3 h-3 rounded border ${item.cls}`} />
              {item.label}
            </div>
          ))}
          <div className="ml-auto text-[10px] text-slate-400">Click available/blocked slots to toggle</div>
        </div>

        {/* Day headers */}
        <div className="grid border-b border-slate-100" style={{ gridTemplateColumns: "72px repeat(7, 1fr)" }}>
          <div className="py-3 px-3 border-r border-slate-100" />
          {WEEK_DAYS.map((day, i) => (
            <div key={day} className="py-3 text-center border-r border-slate-100 last:border-r-0">
              <div className="text-xs font-bold text-slate-700">{day}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{WEEK_DATES[i]}</div>
              {day === "Mon" && (
                <span className="inline-block mt-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 rounded-full px-1.5">Today</span>
              )}
            </div>
          ))}
        </div>

        {/* Time slot rows */}
        <div className="overflow-x-auto">
          {TIME_SLOTS.map(time => (
            <div key={time} className="grid border-b border-slate-50 last:border-b-0" style={{ gridTemplateColumns: "72px repeat(7, 1fr)" }}>
              {/* Time label */}
              <div className="px-3 py-2.5 border-r border-slate-100 flex items-center">
                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{time}</span>
              </div>
              {/* Day slots */}
              {WEEK_DAYS.map(day => {
                const key = `${day}-${time}`;
                const state = slots[key] ?? "unavailable";
                const orderCount = slotOrders[key];

                return (
                  <div
                    key={day}
                    onClick={() => toggleSlot(day, time)}
                    className={`border-r border-slate-50 last:border-r-0 px-2 py-2 min-h-[44px] flex flex-col justify-center transition-colors ${slotStyles[state]}`}
                  >
                    {state === "available" && (
                      <div className="flex items-center justify-center">
                        <CheckCircle size={13} className="text-green-400" />
                      </div>
                    )}
                    {state === "booked" && (
                      <div className="flex flex-col items-center gap-0.5">
                        <Truck size={12} className="text-amber-500" />
                        {orderCount && (
                          <span className="text-[9px] font-bold text-amber-700">{orderCount} order{orderCount > 1 ? "s" : ""}</span>
                        )}
                      </div>
                    )}
                    {state === "blocked" && (
                      <div className="flex items-center justify-center">
                        <Lock size={12} className="text-slate-400" />
                      </div>
                    )}
                    {state === "unavailable" && null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="flex items-start gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
        <Clock size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Click any <span className="font-semibold text-green-600">available</span> slot to mark it as blocked, or click a <span className="font-semibold text-slate-600">blocked</span> slot to re-open it.
          Booked slots cannot be changed here — manage those through the Orders page.
        </p>
      </div>
    </div>
  );
}

// ─── Price Policy Tab ─────────────────────────────────────────────────────────

const LOCK_CATEGORIES = ["Framing Lumber", "Engineered Wood", "Sheathing & Panels", "Roofing", "Exterior"];
const FLOATING_RULES = [
  { id: "lumber", label: "Framing Lumber",     index: "Random Lengths Framing Lumber Index", cadence: "Weekly",  variance: "±8%" },
  { id: "panel",  label: "Sheathing & Panels", index: "OSB Composite Panel Index",           cadence: "Bi-weekly", variance: "±5%" },
  { id: "engw",   label: "Engineered Wood",    index: "EWP Mill Net Index",                  cadence: "Monthly", variance: "±3%" },
];

export function PricePolicyTab() {
  // Lock window, down payment and model come from Supplier Setup → Price policy.
  const { pricePolicy, updatePricePolicy } = useSupplierSetup();
  const lockWindow = pricePolicy.lockWindowDays;
  const downPayment = pricePolicy.downPaymentPct;
  const pricingModel = pricePolicy.lockStyle;
  const setLockWindow = (v: string) => updatePricePolicy({ lockWindowDays: v });
  const setDownPayment = (v: string) => updatePricePolicy({ downPaymentPct: v });
  const setPricingModel = (v: "cap" | "fixed") => updatePricePolicy({ lockStyle: v });

  const [lockedCategories, setLockedCategories] = useState<Set<string>>(
    new Set(["Framing Lumber", "Engineered Wood"])
  );
  const [floatingEnabled, setFloatingEnabled] = useState<Set<string>>(new Set(["lumber"]));
  const [lockStatus, setLockStatus] = useState<"active" | "paused">("active");

  const toggleCat = (cat: string) =>
    setLockedCategories(prev => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });

  const toggleFloat = (id: string) =>
    setFloatingEnabled(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left column */}
      <div className="space-y-5">

        {/* Price Lock Status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${lockStatus === "active" ? "bg-green-50" : "bg-slate-100"}`}>
              <ShieldCheck size={15} className={lockStatus === "active" ? "text-green-600" : "text-slate-400"} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900">Price Lock Status</h3>
              <p className="text-[10px] text-slate-400">Global on/off for price locking</p>
            </div>
            <button
              onClick={() => setLockStatus(s => s === "active" ? "paused" : "active")}
              className="flex items-center gap-2"
            >
              {lockStatus === "active"
                ? <ToggleRight size={28} className="text-green-500" />
                : <ToggleLeft size={28} className="text-slate-300" />}
            </button>
          </div>
          <div className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            lockStatus === "active"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-slate-50 border border-slate-200 text-slate-500"
          }`}>
            <BadgeCheck size={13} />
            {lockStatus === "active"
              ? "Price locking is active — contractors can lock prices on eligible orders"
              : "Price locking is paused — all prices are quoted at market rate"}
          </div>
        </div>

        {/* Price Lock Window */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock size={15} className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Price Lock Window</h3>
              <p className="text-[10px] text-slate-400">Set in Supplier Setup → Price policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={lockWindow}
              onChange={e => setLockWindow(e.target.value)}
              className="w-24 px-3 py-2.5 text-sm border border-slate-200 rounded-xl text-center font-bold focus:outline-none focus:border-amber-400"
            />
            <span className="text-sm text-slate-600">calendar days from quote date</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">After {lockWindow} days, prices revert to current market rate. Contractor receives 48-hour warning before expiry.</p>
        </div>

        {/* Down Payment */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
              <DollarSign size={15} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Down Payment %</h3>
              <p className="text-[10px] text-slate-400">Set in Supplier Setup → Price policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="number"
                value={downPayment}
                onChange={e => setDownPayment(e.target.value)}
                className="w-24 pl-3 pr-7 py-2.5 text-sm border border-slate-200 rounded-xl text-center font-bold focus:outline-none focus:border-amber-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
            </div>
            <span className="text-sm text-slate-600">of total order value</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Deposit is applied to final invoice. Non-refundable if contractor cancels after lock activation.</p>
        </div>

        {/* CAP vs FIXED */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={15} className="text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Pricing Model</h3>
              <p className="text-[10px] text-slate-400">Set in Supplier Setup → Price policy</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["cap", "fixed"] as const).map(model => (
              <button
                key={model}
                onClick={() => setPricingModel(model)}
                className={`px-4 py-4 rounded-xl border text-left transition-all ${
                  pricingModel === model
                    ? "bg-amber-50 border-amber-400 ring-1 ring-amber-300"
                    : "bg-slate-50 border-slate-200 hover:border-amber-200"
                }`}
              >
                <div className="text-sm font-bold text-slate-900 mb-1">{model === "cap" ? "CAP" : "FIXED"}</div>
                <div className="text-[10px] text-slate-500 leading-relaxed">
                  {model === "cap"
                    ? "Price cannot exceed locked rate. If market drops, contractor pays lower."
                    : "Exact price is guaranteed for both parties for the full lock window."}
                </div>
                {pricingModel === model && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-700 font-semibold">
                    <CheckCircle size={10} /> Active policy
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-5">

        {/* Lock Eligible Categories */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
              <Tag size={15} className="text-slate-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Lock Eligible Categories</h3>
              <p className="text-[10px] text-slate-400">Only selected categories can be price-locked</p>
            </div>
          </div>
          <div className="space-y-2">
            {LOCK_CATEGORIES.map(cat => {
              const active = lockedCategories.has(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCat(cat)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    active ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <span className={`text-xs font-semibold ${active ? "text-slate-900" : "text-slate-500"}`}>{cat}</span>
                  <span
                    className={`w-8 h-4 rounded-full relative transition-all flex items-center flex-shrink-0 ${active ? "bg-amber-500" : "bg-slate-300"}`}
                    style={{ width: 30, height: 16 }}
                  >
                    <span className={`w-3 h-3 rounded-full bg-white shadow transition-transform flex-shrink-0 ${active ? "translate-x-3.5" : "translate-x-0.5"}`} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Floating Price Policy */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
              <Percent size={15} className="text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Floating Price Policy</h3>
              <p className="text-[10px] text-slate-400">Prices indexed to commodity benchmarks</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mb-4 pl-10">When enabled, prices auto-adjust based on the selected index. Contractors see the index and current price.</p>

          <div className="space-y-3">
            {FLOATING_RULES.map(rule => {
              const on = floatingEnabled.has(rule.id);
              return (
                <div key={rule.id} className={`px-4 py-3.5 rounded-xl border transition-all ${on ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-100"}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-semibold ${on ? "text-slate-900" : "text-slate-500"}`}>{rule.label}</span>
                    <button
                      onClick={() => toggleFloat(rule.id)}
                      className={`w-8 h-4 rounded-full relative transition-all flex items-center flex-shrink-0 ${on ? "bg-orange-500" : "bg-slate-300"}`}
                      style={{ width: 30, height: 16 }}
                    >
                      <span className={`w-3 h-3 rounded-full bg-white shadow transition-transform flex-shrink-0 ${on ? "translate-x-3.5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  {on && (
                    <div className="space-y-0.5 text-[10px] text-slate-500">
                      <div>Index: <span className="font-semibold text-slate-700">{rule.index}</span></div>
                      <div>Updates: <span className="font-semibold text-slate-700">{rule.cadence}</span> · Max variance: <span className="font-semibold text-orange-700">{rule.variance}</span></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Policy Summary card */}
        <div className="bg-slate-900 rounded-2xl p-5 text-white">
          <div className="text-xs font-bold mb-3 flex items-center gap-2"><Lock size={12} /> Active Policy Summary</div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/60">Lock Window</span>
              <span className="font-semibold">{lockWindow} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Model</span>
              <span className="font-semibold uppercase">{pricingModel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Down Payment</span>
              <span className="font-semibold">{downPayment}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Eligible Categories</span>
              <span className="font-semibold">{lockedCategories.size} of {LOCK_CATEGORIES.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Floating Prices</span>
              <span className="font-semibold">{floatingEnabled.size} category{floatingEnabled.size !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/10">
              <span className="text-white/60">Status</span>
              <span className={`font-bold ${lockStatus === "active" ? "text-green-400" : "text-slate-400"}`}>
                {lockStatus === "active" ? "● Active" : "○ Paused"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LumberyardConfiguration() {
  const [activeTab, setActiveTab] = useState<ConfigTab>("service-area");

  const tabs: { id: ConfigTab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "service-area",   label: "Service Area",          icon: <Map size={15} />,        desc: "Zones & coverage" },
    { id: "delivery-rules", label: "Delivery Rules",        icon: <Truck size={15} />,      desc: "Fees & surcharges" },
    { id: "calendar",       label: "Availability Calendar", icon: <Calendar size={15} />,   desc: "Weekly time slots" },
    { id: "price-policy",   label: "Price Policy",          icon: <ShieldCheck size={15} />,desc: "Lock & float pricing" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configuration</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your service area, delivery pricing, and availability</p>
        </div>
        <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors w-fit">
          <Save size={15} /> Save Changes
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {activeTab !== tab.id && (
              <span className="text-[10px] font-normal opacity-60">{tab.desc}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "service-area"   && <ServiceAreaTab />}
      {activeTab === "delivery-rules" && <DeliveryRulesTab />}
      {activeTab === "calendar"       && <CalendarTab />}
      {activeTab === "price-policy"   && <PricePolicyTab />}

    </div>
  );
}
