import React, { useMemo, useState } from "react";
import { MapPin, Plus, Trash2, AlertCircle, X } from "lucide-react";
import { useSupplierSetup } from "../../context/SupplierSetupContext";
import { ServiceZoneMap, ServiceZone as MapZone } from "./ServiceZoneMap";

const INPUT = "w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors bg-white";

/** "2801 E 5th St, Austin, TX 78702" -> "Austin, TX". */
function cityLabel(address?: string): string | null {
  if (!address?.trim()) return null;
  const parts = address.split(",").map(part => part.trim()).filter(Boolean);
  if (parts.length >= 3) return `${parts[1]}, ${parts[2].split(/\s+/)[0]}`;
  return parts[parts.length - 1] ?? null;
}

const DOT_COLORS: Record<string, string> = {
  blue: "bg-blue-500", green: "bg-green-500", violet: "bg-violet-500", amber: "bg-amber-500",
};

type Props = {
  primaryLocation?: { name: string; address: string } | null;
};

/**
 * Yard coordinates, delivery radius and named service zones. The zone tabs
 * above the map choose what the map draws — "All zones" shows the delivery
 * radius and every zone; picking one shows that zone alone.
 */
export function SupplierServiceArea({ primaryLocation = null }: Props) {
  const {
    serviceArea, updateServiceArea,
    serviceZones, addServiceZone, removeServiceZone, toggleServiceZone,
  } = useSupplierSetup();
  const { latitude, longitude, radius } = serviceArea;

  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");

  // The placeholder map is percentage-based, so map miles onto a sane % radius.
  const zoneRadiusPct = Math.min(40, Math.max(6, 6 + (parseFloat(radius) || 0) * 0.9));
  const center = { x: 44, y: 48 };

  const yardZone: MapZone = {
    id: "delivery-radius",
    label: `${radius || 0} mi radius`,
    color: "amber",
    active: true,
    cx: `${center.x}%`,
    cy: `${center.y}%`,
    r: `${zoneRadiusPct}%`,
    labelLeft: `${center.x - 6}%`,
    labelTop: `${Math.max(4, center.y - zoneRadiusPct - 5)}%`,
  };

  const active = serviceZones.find(zone => zone.id === selectedZone) ?? null;

  const mapZones: MapZone[] = useMemo(() => {
    if (active) {
      return [{
        id: active.id,
        label: active.name,
        color: active.color,
        active: active.active,
        cx: active.cx, cy: active.cy, r: active.r,
        labelLeft: active.labelLeft, labelTop: active.labelTop,
      }];
    }
    return [
      yardZone,
      ...serviceZones.map(zone => ({
        id: zone.id,
        label: zone.name,
        color: zone.color,
        active: zone.active,
        cx: zone.cx, cy: zone.cy, r: zone.r,
        labelLeft: zone.labelLeft, labelTop: zone.labelTop,
      })),
    ];
  }, [active, serviceZones, yardZone]);

  const handleAdd = () => {
    if (!newZoneName.trim()) return;
    addServiceZone(newZoneName);
    setNewZoneName("");
    setShowAdd(false);
  };

  const activeCount = serviceZones.filter(zone => zone.active).length;

  return (
    <div className="space-y-4">
      {/* Zone tabs — these choose what the map draws */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        <button
          onClick={() => setSelectedZone("all")}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
            selectedZone === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          All zones
          <span className="text-[10px] font-bold text-slate-400">{serviceZones.length}</span>
        </button>
        {serviceZones.map(zone => (
          <button
            key={zone.id}
            onClick={() => setSelectedZone(zone.id)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              selectedZone === zone.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${zone.active ? DOT_COLORS[zone.color] ?? "bg-blue-500" : "bg-slate-300"}`} />
            {zone.name}
            {!zone.active && <span className="text-[9px] font-bold text-slate-400">OFF</span>}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <ServiceZoneMap
          className="lg:col-span-2"
          title={active ? active.name : "Service Zone Map"}
          subtitle={active
            ? `${active.shape} · ${active.radius}`
            : cityLabel(primaryLocation?.address) ?? "Yard location not set"}
          zones={mapZones}
          crosshair={active ? null : { cx: `${center.x}%`, cy: `${center.y}%` }}
          pin={active ? null : {
            left: `${center.x - 2}%`,
            top: `${center.y - 6}%`,
            label: primaryLocation?.name || "Your yard",
          }}
        />

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 self-start">
          <h3 className="text-sm font-semibold text-slate-900">Yard coordinates</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Yard latitude</label>
            <input
              type="text"
              value={latitude}
              onChange={e => updateServiceArea({ latitude: e.target.value })}
              placeholder="36.3884"
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Yard longitude</label>
            <input
              type="text"
              value={longitude}
              onChange={e => updateServiceArea({ longitude: e.target.value })}
              placeholder="-86.4467"
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Radius (miles)</label>
            <input
              type="number"
              value={radius}
              onChange={e => updateServiceArea({ radius: e.target.value })}
              className={INPUT}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
            <MapPin size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-700 leading-relaxed">
              {primaryLocation
                ? <>Drawn around <span className="font-semibold">{primaryLocation.name}</span>. Orders outside this radius are never matched to you.</>
                : <>Add a location in Supplier Setup and the service area will be drawn around it.</>}
            </p>
          </div>
        </div>
      </div>

      {/* Zone list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Service Zones</h3>
          <span className="text-[11px] text-slate-400 bg-slate-50 rounded-full px-2 py-0.5">{activeCount} active</span>
        </div>

        <div className="divide-y divide-slate-50">
          {serviceZones.map(zone => (
            <div
              key={zone.id}
              className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${
                selectedZone === zone.id ? "bg-amber-50/60" : ""
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${zone.active ? DOT_COLORS[zone.color] ?? "bg-blue-500" : "bg-slate-300"}`} />
              <button onClick={() => setSelectedZone(zone.id)} className="flex-1 min-w-0 text-left">
                <div className="text-xs font-semibold text-slate-800 truncate">{zone.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 capitalize">{zone.shape} · {zone.radius}</div>
              </button>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => toggleServiceZone(zone.id)}
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border transition-colors ${
                    zone.active
                      ? "text-green-700 bg-green-50 border-green-200 hover:bg-green-100"
                      : "text-slate-400 bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {zone.active ? "Active" : "Off"}
                </button>
                <button
                  onClick={() => {
                    removeServiceZone(zone.id);
                    if (selectedZone === zone.id) setSelectedZone("all");
                  }}
                  aria-label={`Remove ${zone.name}`}
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {showAdd ? (
          <div className="px-5 py-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">New service zone</span>
              <button onClick={() => { setShowAdd(false); setNewZoneName(""); }} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={14} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Zone name (e.g. Pflugerville)"
              value={newZoneName}
              onChange={e => setNewZoneName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newZoneName.trim()}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors ${
                  newZoneName.trim()
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                Add Zone
              </button>
              <button
                onClick={() => { setShowAdd(false); setNewZoneName(""); }}
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

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-2">
        <AlertCircle size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-semibold text-blue-800 mb-1">Coverage Tip</div>
          <p className="text-[11px] text-blue-700 leading-relaxed">
            Orders outside your active zones will not be matched to your yard. Expand zones to capture more business.
          </p>
        </div>
      </div>
    </div>
  );
}

export const SERVICE_AREA_DESCRIPTION =
  "How far you deliver. Orders outside your active area are never matched to you. Enter your yard's coordinates (right-click your yard in Google Maps and the numbers appear first) and a delivery radius.";
