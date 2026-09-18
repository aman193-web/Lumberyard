import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Truck, CheckCircle, Clock, Package, MapPin,
  Camera, Upload, X, Star, BadgeCheck, Navigation, Phone,
  FileText, Shield, ChevronDown, ChevronUp, AlertCircle,
  Image, User, Zap, ClipboardCheck,
} from "lucide-react";

// ─── Types & Constants ────────────────────────────────────────────────────────

type DeliveryStage = "created" | "confirmed" | "in-transit" | "delivered";

const STAGES: { id: DeliveryStage; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: "created",    label: "Created",    desc: "Order received and logged",               icon: <FileText size={14} /> },
  { id: "confirmed",  label: "Confirmed",  desc: "Austin Timber Supply confirmed order",    icon: <BadgeCheck size={14} /> },
  { id: "in-transit", label: "In Transit", desc: "Carlos Vega en route · ~35 min ETA",     icon: <Truck size={14} /> },
  { id: "delivered",  label: "Delivered",  desc: "Materials signed off at site",            icon: <CheckCircle size={14} /> },
];

const STAGE_INDEX: Record<DeliveryStage, number> = {
  created: 0, confirmed: 1, "in-transit": 2, delivered: 3,
};

const DELIVERY_ITEMS = [
  { sku: "LBR-2×4-16",  name: "2×4 KD Lumber 16′",    qty: 120, unit: "EA",  category: "Framing Lumber",  status: "delivered" },
  { sku: "LBR-2×6-8",   name: "2×6 KD Lumber 8′",     qty:  60, unit: "EA",  category: "Framing Lumber",  status: "delivered" },
  { sku: "EWP-LVL-3.5", name: "LVL Beam 3.5″×14″",    qty:   4, unit: "EA",  category: "Engineered Wood", status: "delivered" },
  { sku: "PLY-OSB-716",  name: "OSB 7/16″ 4×8 Sheet",  qty:  48, unit: "SHT", category: "Sheathing",       status: "delivered" },
  { sku: "HDW-JHG-4×",  name: "Joist Hanger 4×",      qty:  36, unit: "EA",  category: "Hardware",        status: "delivered" },
  { sku: "HDW-LUS-26",  name: "LUS26 Single Hanger",   qty:  24, unit: "EA",  category: "Hardware",        status: "delivered" },
];

// ─── Mock POD photos (visual-only) ───────────────────────────────────────────

const MOCK_POD: { id: number; label: string; time: string; bg: string; icon: React.ReactNode }[] = [
  { id: 1, label: "Stack at driveway",      time: "2:14 PM",  bg: "bg-amber-100",  icon: <Package size={28} className="text-amber-400" /> },
  { id: 2, label: "LVL beams — wrapped",   time: "2:15 PM",  bg: "bg-blue-100",   icon: <Shield size={28} className="text-blue-400" /> },
  { id: 3, label: "Full delivery overview", time: "2:16 PM",  bg: "bg-green-100",  icon: <Image size={28} className="text-green-400" /> },
];

// ─── Status Stepper ───────────────────────────────────────────────────────────

function DeliveryStatusStepper({ currentStage }: { currentStage: DeliveryStage }) {
  const currentIdx = STAGE_INDEX[currentStage];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Truck size={15} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-900">Delivery Status</h2>
      </div>

      <div className="relative">
        {/* Connector line */}
        <div className="absolute top-5 left-5 right-5 h-px bg-slate-100" style={{ left: "calc(2rem)", right: "calc(2rem)" }} />

        <div className="grid grid-cols-4 gap-2 relative">
          {STAGES.map((stage, i) => {
            const isDone    = i < currentIdx;
            const isCurrent = i === currentIdx;
            const isPending = i > currentIdx;

            return (
              <div key={stage.id} className="flex flex-col items-center gap-2 relative">
                {/* Icon bubble */}
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isDone    ? "bg-green-600 border-green-600 text-white shadow-sm" :
                  isCurrent ? "bg-amber-500 border-amber-500 text-white shadow-md ring-4 ring-amber-100" :
                              "bg-white border-slate-200 text-slate-300"
                }`}>
                  {isDone ? <CheckCircle size={18} /> : stage.icon}
                  {isCurrent && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white animate-pulse" />
                  )}
                </div>

                {/* Label */}
                <div className="text-center">
                  <div className={`text-xs font-bold ${
                    isCurrent ? "text-amber-600" : isDone ? "text-green-700" : "text-slate-400"
                  }`}>
                    {stage.label}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-tight text-center hidden sm:block">
                    {stage.desc}
                  </div>
                </div>

                {/* Timestamp */}
                {isDone && (
                  <span className="text-[9px] font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-1.5 py-0.5">
                    Done
                  </span>
                )}
                {isCurrent && (
                  <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5 animate-pulse">
                    Live
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current status banner */}
      <div className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-amber-800">In Transit — Carlos Vega</div>
          <div className="text-[11px] text-amber-700 mt-0.5">
            Departed Austin Timber Supply 1:38 PM · Estimated arrival: <strong>2:15 PM</strong> · 4.7 miles remaining
          </div>
        </div>
        <button className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex-shrink-0 transition-colors">
          <Navigation size={11} /> Track
        </button>
      </div>
    </div>
  );
}

// ─── Driver Card ──────────────────────────────────────────────────────────────

function DriverCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <User size={14} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-900">Driver & Vehicle</h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          CV
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-900">Carlos Vega</div>
          <div className="text-xs text-slate-500 mt-0.5">Austin Timber Supply · Licensed CDL-A</div>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={11} className={i < 4 ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
            ))}
            <span className="text-[10px] text-slate-400 ml-1">4.0 · 382 deliveries</span>
          </div>
        </div>
        <button className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors flex-shrink-0">
          <Phone size={15} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Vehicle",   value: "Ford F-750" },
          { label: "Plate",     value: "TX · KLB-4482" },
          { label: "Tracking",  value: "TRK-8842" },
        ].map(item => (
          <div key={item.label} className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
            <div className="text-[10px] text-slate-400 font-medium">{item.label}</div>
            <div className="text-[11px] font-bold text-slate-700 mt-0.5">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Items Summary ────────────────────────────────────────────────────────────

function ItemsSummary() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? DELIVERY_ITEMS : DELIVERY_ITEMS.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Package size={14} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900">Delivery Manifest</h3>
        </div>
        <span className="text-[11px] text-slate-400 bg-slate-50 rounded-full px-2.5 py-0.5 border border-slate-100">
          {DELIVERY_ITEMS.length} line items
        </span>
      </div>

      <div className="divide-y divide-slate-50">
        {visible.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3">
            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-800 truncate">{item.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">{item.sku} · {item.category}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs font-bold text-slate-700">{item.qty} {item.unit}</div>
              <div className="text-[10px] text-green-600 flex items-center gap-0.5 justify-end">
                <CheckCircle size={9} /> Confirmed
              </div>
            </div>
          </div>
        ))}
      </div>

      {DELIVERY_ITEMS.length > 3 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-amber-600 hover:text-amber-700 border-t border-slate-50 transition-colors"
        >
          {expanded ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Show {DELIVERY_ITEMS.length - 3} more items</>}
        </button>
      )}
    </div>
  );
}

// ─── POD Upload ───────────────────────────────────────────────────────────────

function PODUpload({ isDelivered }: { isDelivered: boolean }) {
  const [photos, setPhotos] = useState(isDelivered ? MOCK_POD : []);
  const [showUpload, setShowUpload] = useState(false);

  const removePhoto = (id: number) => setPhotos(prev => prev.filter(p => p.id !== id));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Camera size={14} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900">Proof of Delivery (POD)</h3>
        </div>
        {photos.length > 0 && (
          <span className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5 flex items-center gap-1">
            <BadgeCheck size={10} /> {photos.length} photo{photos.length > 1 ? "s" : ""} uploaded
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {!isDelivered && (
          <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <Clock size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500">
              POD upload will be available once the delivery status reaches <strong>Delivered</strong>.
              The driver will also upload photos from their end upon sign-off.
            </p>
          </div>
        )}

        {/* Existing photos grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {photos.map(photo => (
              <div key={photo.id} className="relative group">
                <div className={`aspect-square rounded-xl ${photo.bg} flex flex-col items-center justify-center border border-slate-200 overflow-hidden`}>
                  {photo.icon}
                  <span className="text-[10px] text-slate-500 mt-2 px-2 text-center leading-tight">{photo.label}</span>
                </div>
                <div className="absolute bottom-1.5 left-1.5 text-[9px] text-slate-500 bg-white/80 rounded px-1 py-0.5">{photo.time}</div>
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/80 border border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                >
                  <X size={10} />
                </button>
              </div>
            ))}

            {/* Placeholder for more */}
            {photos.length < 6 && isDelivered && (
              <button
                onClick={() => setShowUpload(true)}
                className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-300 hover:bg-amber-50 flex flex-col items-center justify-center gap-1.5 transition-all group"
              >
                <Camera size={20} className="text-slate-300 group-hover:text-amber-400 transition-colors" />
                <span className="text-[10px] text-slate-400 group-hover:text-amber-500">Add photo</span>
              </button>
            )}
          </div>
        )}

        {/* Upload drop zone */}
        {isDelivered && (
          <div
            className={`border-2 border-dashed rounded-xl px-6 py-5 text-center cursor-pointer transition-all ${
              showUpload
                ? "border-amber-400 bg-amber-50"
                : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/40"
            }`}
            onClick={() => setShowUpload(s => !s)}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Upload size={18} className="text-slate-400" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-700">Upload POD Photos</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Drag & drop or click to browse · JPG, PNG up to 10 MB each</div>
              </div>
            </div>
            {showUpload && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="h-px flex-1 bg-amber-200" />
                <span className="text-[10px] text-amber-600 font-semibold">Browse files or drag here</span>
                <div className="h-px flex-1 bg-amber-200" />
              </div>
            )}
          </div>
        )}

        {/* Signature row */}
        {isDelivered && (
          <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
            <ClipboardCheck size={15} className="text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-green-800">Signed Off — Apr 12, 2026 · 2:21 PM</div>
              <div className="text-[10px] text-green-600 mt-0.5">Received by: Mike Torres · Site superintendent</div>
            </div>
            <BadgeCheck size={16} className="text-green-600 flex-shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DeliveryTracking() {
  const navigate = useNavigate();
  const [currentStage] = useState<DeliveryStage>("in-transit");
  const isDelivered = currentStage === "delivered";

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate("/contractor/deliveries")}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0 mt-1"
        >
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">Deliveries</span>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-amber-600 font-semibold">ORD-4821</span>
            <span className="text-xs text-slate-300">·</span>
            <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 font-semibold">
              <Truck size={10} className="animate-bounce" /> In Transit
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">531 Riverside Ave</h1>
          <p className="text-sm text-slate-500 mt-0.5">Framing Package · Austin Timber Supply · Apr 14, 2026 · 7:00–9:00 AM</p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => navigate("/contractor/review")}
            disabled={!isDelivered}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Star size={14} /> Rate
          </button>
          <button
            disabled={!isDelivered}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <FileText size={14} /> Download BOL
          </button>
        </div>
      </div>

      {/* Status stepper */}
      <DeliveryStatusStepper currentStage={currentStage} />

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <ItemsSummary />
          <PODUpload isDelivered={isDelivered} />
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <DriverCard />

          {/* Delivery details */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={14} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900">Delivery Info</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Delivery Date",  value: "Apr 14, 2026" },
                { label: "Window",         value: "7:00 – 9:00 AM" },
                { label: "Site Address",   value: "531 Riverside Ave, Austin TX" },
                { label: "Phase",          value: "Framing Package" },
                { label: "Order Value",    value: "$14,800" },
                { label: "Delivery Fee",   value: "$195" },
              ].map(d => (
                <div key={d.label} className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">{d.label}</span>
                  <span className="text-[11px] font-semibold text-slate-700">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review CTA */}
          {isDelivered ? (
            <button
              onClick={() => navigate("/contractor/review")}
              className="w-full flex flex-col items-center gap-2 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl px-5 py-5 hover:from-green-700 hover:to-green-800 transition-all shadow-sm"
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Star size={20} className="text-white" />
              </div>
              <div className="text-center">
                <div className="text-sm font-bold">Rate This Delivery</div>
                <div className="text-[11px] text-green-200 mt-0.5">Required before next phase checkout</div>
              </div>
            </button>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Star size={20} className="text-slate-300" />
              </div>
              <div className="text-xs font-semibold text-slate-500">Rate This Delivery</div>
              <div className="text-[10px] text-slate-400 mt-1">Available after delivery is confirmed</div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
