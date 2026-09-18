import React from "react";
import { Map, MapPin, Navigation } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ZoneColor = "blue" | "green" | "violet" | "amber";

export type ServiceZone = {
  id?: string | number;
  /** Pill label drawn over the zone. Omit to draw the circle only. */
  label?: string;
  color?: ZoneColor;
  active?: boolean;
  /** SVG circle geometry, as percentages of the map box — e.g. "44%". */
  cx: string;
  cy: string;
  r: string;
  /** Absolute position of the label pill, as percentages. */
  labelLeft?: string;
  labelTop?: string;
};

type Props = {
  title?: string;
  /** Right side of the header, next to the compass icon. */
  subtitle?: string;
  zones?: ServiceZone[];
  /** Yard marker. Pass null to hide it. */
  pin?: { left: string; top: string; label: string } | null;
  /** Amber cross drawn at the yard's exact coordinates. Pass null to hide it. */
  crosshair?: { cx: string; cy: string } | null;
  height?: number;
  className?: string;
};

// ─── Zone styling ─────────────────────────────────────────────────────────────

const ZONE_STYLES: Record<ZoneColor, {
  active: { fill: string; stroke: string };
  inactive: { fill: string; stroke: string };
  label: string;
}> = {
  blue: {
    active:   { fill: "rgba(59,130,246,0.07)", stroke: "rgba(59,130,246,0.5)" },
    inactive: { fill: "rgba(59,130,246,0.05)", stroke: "rgba(59,130,246,0.3)" },
    label: "text-blue-700 bg-blue-50 border-blue-200",
  },
  green: {
    active:   { fill: "rgba(34,197,94,0.07)", stroke: "rgba(34,197,94,0.5)" },
    inactive: { fill: "rgba(34,197,94,0.05)", stroke: "rgba(34,197,94,0.3)" },
    label: "text-green-700 bg-green-50 border-green-200",
  },
  violet: {
    active:   { fill: "rgba(139,92,246,0.07)", stroke: "rgba(139,92,246,0.5)" },
    inactive: { fill: "rgba(139,92,246,0.05)", stroke: "rgba(139,92,246,0.3)" },
    label: "text-violet-600 bg-violet-50 border-violet-200",
  },
  amber: {
    active:   { fill: "rgba(245,158,11,0.08)", stroke: "rgba(245,158,11,0.55)" },
    inactive: { fill: "rgba(245,158,11,0.05)", stroke: "rgba(245,158,11,0.3)" },
    label: "text-amber-700 bg-amber-50 border-amber-200",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "44%" -> 44. Falls back to 50 so a malformed value still lands on the map. */
function parsePct(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 50;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * The service-zone map used by Profile → Service Area, Configuration →
 * Service Area, and the supplier setup wizard. The basemap is decorative —
 * only the zones, pin, and crosshair are driven by data.
 */
export function ServiceZoneMap({
  title = "Service Zone Map",
  subtitle = "Austin, TX",
  zones = [],
  pin = null,
  crosshair = null,
  height = 380,
  className = "",
}: Props) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Map size={14} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>
        {subtitle && (
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <Navigation size={10} /> {subtitle}
          </div>
        )}
      </div>

      {/* Map Placeholder */}
      <div className="relative overflow-hidden bg-slate-50" style={{ height }}>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          {/* Base grid */}
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={`${i * 8.33}%`} x2="100%" y2={`${i * 8.33}%`} stroke="#e2e8f0" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 16 }).map((_, i) => (
            <line key={`v${i}`} x1={`${i * 6.25}%`} y1="0" x2={`${i * 6.25}%`} y2="100%" stroke="#e2e8f0" strokeWidth="0.5" />
          ))}
          {/* Major roads */}
          <line x1="0" y1="55%" x2="100%" y2="50%" stroke="#cbd5e1" strokeWidth="3" />
          <line x1="0" y1="30%" x2="100%" y2="35%" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="35%" y1="0" x2="38%" y2="100%" stroke="#cbd5e1" strokeWidth="3" />
          <line x1="65%" y1="0" x2="62%" y2="100%" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="0" y1="75%" x2="55%" y2="25%" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="55%" y1="25%" x2="100%" y2="20%" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Minor roads */}
          <line x1="0" y1="42%" x2="100%" y2="38%" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="20%" y1="0" x2="20%" y2="100%" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#e2e8f0" strokeWidth="1" />
          {/* City blocks */}
          <rect x="22%" y="22%" width="12%" height="8%" fill="#e8ecf0" rx="2" />
          <rect x="40%" y="57%" width="8%" height="6%" fill="#e8ecf0" rx="2" />
          <rect x="66%" y="37%" width="10%" height="7%" fill="#e8ecf0" rx="2" />

          {/* Service zones */}
          {zones.map((zone, idx) => {
            const styles = ZONE_STYLES[zone.color ?? "blue"] ?? ZONE_STYLES.blue;
            const active = zone.active !== false;
            const paint = active ? styles.active : styles.inactive;
            return (
              <circle
                key={zone.id ?? idx}
                cx={zone.cx}
                cy={zone.cy}
                r={zone.r}
                fill={paint.fill}
                stroke={paint.stroke}
                strokeWidth={active ? 1.5 : 1}
                strokeDasharray={active ? "5 3" : "3 3"}
              />
            );
          })}

          {/* Yard marker cross */}
          {crosshair && (() => {
            const cx = parsePct(crosshair.cx);
            const cy = parsePct(crosshair.cy);
            const d = 2; // half-size of the cross, in percent
            return (
              <>
                <line
                  x1={`${cx - d}%`} y1={`${cy - d}%`} x2={`${cx + d}%`} y2={`${cy + d}%`}
                  stroke="#f59e0b" strokeWidth="2"
                />
                <line
                  x1={`${cx + d}%`} y1={`${cy - d}%`} x2={`${cx - d}%`} y2={`${cy + d}%`}
                  stroke="#f59e0b" strokeWidth="2"
                />
              </>
            );
          })()}
        </svg>

        {/* Zone labels */}
        {zones.map((zone, idx) => {
          if (!zone.label || !zone.labelLeft || !zone.labelTop) return null;
          const styles = ZONE_STYLES[zone.color ?? "blue"] ?? ZONE_STYLES.blue;
          const active = zone.active !== false;
          return (
            <div key={zone.id ?? idx} className="absolute" style={{ left: zone.labelLeft, top: zone.labelTop }}>
              <span className={`text-[11px] font-semibold border rounded-full px-2 py-0.5 shadow-sm ${styles.label} ${active ? "" : "opacity-70"}`}>
                {zone.label}
              </span>
            </div>
          );
        })}

        {/* Yard pin */}
        {pin && (
          <div className="absolute flex flex-col items-center" style={{ left: pin.left, top: pin.top }}>
            <div className="w-5 h-5 bg-amber-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
              <MapPin size={10} className="text-white" />
            </div>
            <span className="text-[9px] font-bold text-amber-700 bg-white border border-amber-200 rounded px-1 mt-0.5 shadow-sm whitespace-nowrap">
              {pin.label}
            </span>
          </div>
        )}

        {/* Map controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 shadow-md">
          <button className="w-7 h-7 bg-white rounded-t-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 text-sm font-bold leading-none">+</button>
          <button className="w-7 h-7 bg-white rounded-b-lg border border-t-0 border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 text-sm font-bold leading-none">−</button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
            <div className="w-4 h-1 rounded-full bg-blue-400 border border-blue-500" style={{ borderStyle: "dashed" }} /> Active
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <div className="w-4 h-1 rounded-full bg-slate-300 border border-slate-400" style={{ borderStyle: "dashed" }} /> Inactive
          </div>
        </div>

        {/* Attribution */}
        <div className="absolute bottom-2 right-3 text-[9px] text-slate-300">© Map Placeholder</div>
      </div>
    </div>
  );
}

/** The three demo zones the supplier profile / configuration map has always shown. */
export const DEMO_SERVICE_ZONES: ServiceZone[] = [
  { id: "austin-core", label: "Austin Core", color: "blue",   active: true,  cx: "44%", cy: "48%", r: "18%", labelLeft: "38%", labelTop: "28%" },
  { id: "cedar-park",  label: "Cedar Park",  color: "green",  active: true,  cx: "20%", cy: "22%", r: "11%", labelLeft: "8%",  labelTop: "12%" },
  { id: "round-rock",  label: "Round Rock",  color: "violet", active: false, cx: "72%", cy: "68%", r: "10%", labelLeft: "64%", labelTop: "72%" },
];
