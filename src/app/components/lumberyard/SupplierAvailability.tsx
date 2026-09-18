import React from "react";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { useSupplierSetup } from "../../context/SupplierSetupContext";
import {
  AvailabilityCalendar, DAY_KEYS, DAY_LABELS, formatTime, summarizeDays,
} from "./AvailabilityCalendar";

const INPUT = "w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors bg-white";

/**
 * Recurring delivery days, window and daily capacity, with a month calendar
 * showing what that actually means. Backed by the shared setup store and
 * rendered identically by Supplier Setup → Availability and
 * Supplier Profile → Availability.
 */
export function SupplierAvailability() {
  const { availability, updateAvailability, toggleDeliveryDay } = useSupplierSetup();
  const { days, fromTime, toTime, deliveriesPerDay } = availability;

  const openDayCount = DAY_KEYS.filter(d => days[d]).length;
  const weeklyCapacity = openDayCount * (parseInt(deliveriesPerDay, 10) || 0);

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Delivery days
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {DAY_KEYS.map(d => (
                <button
                  key={d}
                  onClick={() => toggleDeliveryDay(d)}
                  aria-pressed={days[d]}
                  className={`aspect-square rounded-xl border text-xs font-semibold transition-all ${
                    days[d]
                      ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                  }`}
                >
                  {DAY_LABELS[d].slice(0, 2)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">From</label>
              <input
                type="time"
                value={fromTime}
                onChange={e => updateAvailability({ fromTime: e.target.value })}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">To</label>
              <input
                type="time"
                value={toTime}
                onChange={e => updateAvailability({ toTime: e.target.value })}
                className={INPUT}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Deliveries per day
            </label>
            <input
              type="number"
              min="0"
              value={deliveriesPerDay}
              onChange={e => updateAvailability({ deliveriesPerDay: e.target.value })}
              className={INPUT}
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Caps how many delivery slots the marketplace can book on an open day.
            </p>
          </div>

          {/* Live summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-start gap-2">
              <Calendar size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700">
                <span className="font-semibold">{summarizeDays(days)}</span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {openDayCount} day{openDayCount === 1 ? "" : "s"} a week
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700">
                <span className="font-semibold">{formatTime(fromTime)} – {formatTime(toTime)}</span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Up to {deliveriesPerDay || 0} deliveries · {weeklyCapacity} a week
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-3">
          <AvailabilityCalendar
            days={days}
            capacity={deliveriesPerDay}
            onToggleDay={toggleDeliveryDay}
          />
        </div>
      </div>

      {openDayCount === 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl">
          <AlertTriangle size={13} className="text-orange-500 flex-shrink-0" />
          <span className="text-xs text-orange-700">
            With no delivery days selected, buyers cannot book you at all.
          </span>
        </div>
      )}
    </div>
  );
}

export const AVAILABILITY_DESCRIPTION =
  "Your recurring delivery days and window — buyers see the earliest date from this.";
