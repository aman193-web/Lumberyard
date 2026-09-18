import React, { useState } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Minus, Lock, Unlock,
  Truck, AlertCircle, Info, Settings, Save,
} from "lucide-react";
import { mockCapacitySlots } from "../../data/mockData";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const timeSlots = [
  "6:00 AM – 9:00 AM",
  "7:00 AM – 10:00 AM",
  "8:00 AM – 12:00 PM",
  "10:00 AM – 2:00 PM",
  "1:00 PM – 5:00 PM",
];

export function CapacityManagement() {
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>("2025-02-18");
  const [maxDailySlots, setMaxDailySlots] = useState(4);
  const [selectedSlots, setSelectedSlots] = useState<string[]>(["7:00 AM – 10:00 AM", "8:00 AM – 12:00 PM"]);

  const slots = mockCapacitySlots;
  const slotMap = Object.fromEntries(slots.map(s => [s.date, s]));

  function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
  function getFirstDay(y: number, m: number) { return new Date(y, m, 1).getDay(); }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  const formatDate = (d: number) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  const selectedSlotData = selectedDate ? slotMap[selectedDate] : null;

  const toggleSlot = (slot: string) => {
    setSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Delivery Capacity</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your daily delivery slots and availability</p>
        </div>
        <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors w-fit">
          <Save size={15} /> Save Changes
        </button>
      </div>

      {/* Settings Row */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Max Daily Deliveries", value: maxDailySlots, desc: "Maximum concurrent delivery slots" },
          { label: "Total Orders This Month", value: slots.reduce((s, sl) => s + sl.booked, 0), desc: `Across ${slots.filter(s => !s.blocked).length} available days` },
          { label: "Fully Booked Days", value: slots.filter(s => s.booked >= s.slots && !s.blocked).length, desc: "No availability remaining" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="text-sm font-medium text-slate-700 mt-1">{s.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.desc}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <button onClick={() => setMonth(m => m > 0 ? m - 1 : 11)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-600">
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-sm font-bold text-slate-900">{MONTHS[month]} {year}</h2>
            <button onClick={() => setMonth(m => m < 11 ? m + 1 : 0)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-600">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 px-6 py-3 border-b border-slate-50 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-100 border border-green-300" /> Available</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300" /> Partial</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-100 border border-red-300" /> Full</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200" /> Blocked</div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DAYS.map(d => <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400">{d}</div>)}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} className="h-16 border-r border-b border-slate-50" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDate(day);
              const slot = slotMap[dateStr];
              const isSelected = selectedDate === dateStr;

              let bgClass = "";
              if (slot) {
                if (slot.blocked) bgClass = "bg-slate-50";
                else if (slot.booked >= slot.slots) bgClass = "bg-red-50";
                else if (slot.booked > 0) bgClass = "bg-amber-50";
                else bgClass = "bg-green-50";
              }

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(prev => prev === dateStr ? null : dateStr)}
                  className={`h-16 border-r border-b border-slate-50 p-2 cursor-pointer transition-colors ${bgClass} ${isSelected ? "ring-2 ring-amber-500 ring-inset" : "hover:ring-1 hover:ring-amber-300 hover:ring-inset"}`}
                >
                  <div className="text-xs font-medium text-slate-700 mb-1">{day}</div>
                  {slot && !slot.blocked && (
                    <div className="text-xs text-slate-500">
                      <span className="font-semibold">{slot.booked}/{slot.slots}</span>
                    </div>
                  )}
                  {slot?.blocked && (
                    <Lock size={10} className="text-slate-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side: Edit Capacity */}
        <div className="space-y-4">
          {selectedDate ? (
            <>
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4">{selectedDate}</h3>

                {selectedSlotData?.blocked ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
                      <Lock size={13} className="text-slate-400" />
                      This day is blocked (no deliveries)
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-amber-300 text-amber-600 hover:bg-amber-50 rounded-xl text-xs font-medium transition-colors">
                      <Unlock size={13} /> Unblock Day
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-700">Daily Slot Limit</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setMaxDailySlots(v => Math.max(1, v - 1))}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-sm font-bold text-slate-900 w-4 text-center">{maxDailySlots}</span>
                          <button
                            onClick={() => setMaxDailySlots(v => Math.min(8, v + 1))}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{ width: `${(selectedSlotData?.booked || 0) / maxDailySlots * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>{selectedSlotData?.booked || 0} booked</span>
                        <span>{maxDailySlots - (selectedSlotData?.booked || 0)} open</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-slate-700 block mb-2">Available Time Slots</span>
                      <div className="space-y-2">
                        {timeSlots.map(slot => (
                          <label key={slot} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-amber-200 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedSlots.includes(slot)}
                              onChange={() => toggleSlot(slot)}
                              className="accent-amber-500"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <Truck size={12} className="text-slate-400" />
                              <span className="text-xs text-slate-700">{slot}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs font-medium transition-colors">
                      <Lock size={13} /> Block This Day
                    </button>
                  </div>
                )}
              </div>

              {selectedSlotData && !selectedSlotData.blocked && selectedSlotData.booked > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <span className="text-xs font-semibold text-slate-700 block mb-3">Booked Orders</span>
                  <div className="space-y-2">
                    {Array.from({ length: selectedSlotData.booked }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs p-2 bg-slate-50 rounded-lg">
                        <Truck size={11} className="text-amber-500" />
                        <span className="text-slate-600">Order #{`ORD-${2025}${String(i + 1).padStart(3, "0")}`}</span>
                        <span className="ml-auto text-slate-400">7:00 AM</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-8 text-center">
              <Settings size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Select a date to manage its capacity</p>
            </div>
          )}

          {/* Global Settings */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Info size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">Global Settings</span>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-700">Auto-confirm orders</div>
                  <div className="text-xs text-slate-400">Automatically confirm all incoming orders</div>
                </div>
                <input type="checkbox" className="accent-amber-500" />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-700">Weekend availability</div>
                  <div className="text-xs text-slate-400">Accept delivery orders on weekends</div>
                </div>
                <input type="checkbox" className="accent-amber-500" />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-700">Overbooking protection</div>
                  <div className="text-xs text-slate-400">Block bookings when at capacity</div>
                </div>
                <input type="checkbox" defaultChecked className="accent-amber-500" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
