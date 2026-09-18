import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export type DayKey = typeof DAY_KEYS[number];

export const DAY_LABELS: Record<DayKey, string> = {
  sun: "Sun", mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat",
};

/** "07:00" -> "7:00 AM". Returns the input unchanged if it isn't HH:MM. */
export function formatTime(value: string): string {
  const [h, m] = value.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return value;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/** "Mon–Fri", "Mon, Wed, Fri", "Closed" — collapses runs of open days. */
export function summarizeDays(days: Record<DayKey, boolean>): string {
  const open = DAY_KEYS.filter(d => days[d]);
  if (open.length === 0) return "Closed";
  if (open.length === 7) return "Every day";

  const runs: DayKey[][] = [];
  open.forEach(day => {
    const last = runs[runs.length - 1];
    const prevIndex = DAY_KEYS.indexOf(day) - 1;
    if (last && prevIndex >= 0 && last[last.length - 1] === DAY_KEYS[prevIndex]) last.push(day);
    else runs.push([day]);
  });

  return runs
    .map(run => run.length >= 3
      ? `${DAY_LABELS[run[0]]}–${DAY_LABELS[run[run.length - 1]]}`
      : run.map(d => DAY_LABELS[d]).join(", "))
    .join(", ");
}

type Props = {
  days: Record<DayKey, boolean>;
  /** Shown inside each open day cell, e.g. "6". */
  capacity?: string;
  /** Clicking a day toggles that weekday. */
  onToggleDay?: (day: DayKey) => void;
};

/**
 * A month view of the recurring weekly schedule — every date that falls on an
 * enabled weekday reads as open. Past dates are dimmed; today is ringed.
 */
export function AvailabilityCalendar({ days, capacity, onToggleDay }: Props) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = today.toDateString();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const shiftMonth = (delta: number) => setCursor(new Date(year, month + delta, 1));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">
          {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {DAY_KEYS.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wide py-1">
              {DAY_LABELS[d].slice(0, 1)}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((date, idx) => {
            if (date === null) return <div key={`pad-${idx}`} />;

            const cellDate = new Date(year, month, date);
            const dayKey = DAY_KEYS[cellDate.getDay()];
            const isOpen = days[dayKey];
            const isToday = cellDate.toDateString() === todayKey;
            const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());

            return (
              <button
                key={date}
                onClick={() => onToggleDay?.(dayKey)}
                title={`${DAY_LABELS[dayKey]} — ${isOpen ? "open for delivery" : "closed"}`}
                className={`aspect-square rounded-lg border text-[11px] font-semibold flex flex-col items-center justify-center transition-all ${
                  isOpen
                    ? "bg-amber-50 border-amber-200 text-amber-800 hover:border-amber-400"
                    : "bg-slate-50 border-slate-100 text-slate-300 hover:border-slate-300"
                } ${isPast ? "opacity-40" : ""} ${isToday ? "ring-2 ring-slate-900 ring-offset-1" : ""}`}
              >
                {date}
                {isOpen && capacity && (
                  <span className="text-[8px] font-bold text-amber-500 leading-none mt-0.5">{capacity}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
          <span className="w-3 h-3 rounded bg-amber-50 border border-amber-200" /> Delivering
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200" /> Closed
        </div>
        <span className="text-[10px] text-slate-400 ml-auto">Tap a date to toggle that weekday</span>
      </div>
    </div>
  );
}
