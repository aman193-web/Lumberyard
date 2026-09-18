import React from "react";
import { useNavigate, useParams } from "react-router";
import {
  MapPin, Star, Truck, BadgeCheck, Clock, Package,
  ArrowLeft, Shield, MessageSquare, Phone, Search,
} from "lucide-react";
import { mockLumberyards, type Lumberyard } from "../../data/mockData";

const PRICE_LABEL: Record<string, string> = { "$": "Budget", "$$": "Mid-range", "$$$": "Premium" };

function RatingBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 rounded-full" style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-semibold text-slate-600 w-7 text-right">{value}%</span>
    </div>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────

function LumberyardGridCard({ ly, onClick }: { ly: Lumberyard; onClick: () => void }) {
  const fullStars = Math.round(ly.rating);
  return (
    <button
      onClick={onClick}
      className="bg-white border border-slate-100 rounded-2xl p-5 text-left hover:border-green-300 hover:shadow-md transition-all group w-full"
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{ly.name.slice(0, 2).toUpperCase()}</span>
        </div>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{ly.priceRange}</span>
      </div>

      <div className="mb-1">
        <div className="text-sm font-bold text-slate-900 group-hover:text-green-700 transition-colors">{ly.name}</div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
          <MapPin size={9} /> {ly.city}, {ly.state} · {ly.distance} mi
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={10} className={i < fullStars ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
          ))}
        </div>
        <span className="text-xs font-semibold text-slate-700">{ly.rating}</span>
        <span className="text-[10px] text-slate-400">({ly.reviewCount})</span>
      </div>

      {/* Metrics */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 w-20 flex-shrink-0">Delivery</span>
          <RatingBar value={ly.deliveryReliability} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 w-20 flex-shrink-0">Quality</span>
          <RatingBar value={ly.materialQuality} />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {ly.specialties.slice(0, 3).map(s => (
          <span key={s} className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{s}</span>
        ))}
        {ly.specialties.length > 3 && (
          <span className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full">+{ly.specialties.length - 3}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
        {ly.deliveryAvailable && (
          <span className="flex items-center gap-1 text-green-600 font-semibold"><Truck size={9} /> Delivers</span>
        )}
        <span className="flex items-center gap-1"><Clock size={9} /> {ly.responseTime}</span>
        {ly.certifications.length > 0 && (
          <span className="flex items-center gap-1 text-green-600"><BadgeCheck size={9} /> Certified</span>
        )}
      </div>
    </button>
  );
}

// ─── Detail Page ──────────────────────────────────────────────────────────────

function LumberyardDetail({ ly }: { ly: Lumberyard }) {
  const navigate = useNavigate();
  const fullStars = Math.round(ly.rating);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-white flex-shrink-0">
        <button
          onClick={() => navigate("/contractor/marketplace")}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-4 transition-colors"
        >
          <ArrowLeft size={13} /> Back to Marketplace
        </button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{ly.name.slice(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{ly.name}</h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <MapPin size={11} /> {ly.address}, {ly.city}, {ly.state} · {ly.distance} mi away
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={12} className={i < fullStars ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
                ))}
                <span className="text-xs font-semibold text-slate-700">{ly.rating}</span>
                <span className="text-xs text-slate-400">({ly.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
          {ly.deliveryAvailable && (
            <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 flex-shrink-0">
              <Truck size={12} /> Delivery Available
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-6 max-w-3xl space-y-5">
          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/contractor/checkout")}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
            >
              Request Quote
            </button>
            <button className="flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold px-5 py-3 rounded-xl transition-colors">
              <MessageSquare size={14} /> Message
            </button>
            <button className="flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold px-5 py-3 rounded-xl transition-colors">
              <Phone size={14} /> Call
            </button>
          </div>

          {/* Score cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Delivery Reliability", value: ly.deliveryReliability, color: "text-green-600" },
              { label: "Material Quality",      value: ly.materialQuality,     color: "text-blue-600"  },
              { label: "Communication",         value: ly.communicationRating, color: "text-violet-600"},
            ].map(s => (
              <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}%</div>
                <div className="text-[10px] text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-bold text-slate-700 mb-3">Details</div>
            <div className="space-y-2.5">
              {[
                { label: "Response Time",   value: ly.responseTime },
                { label: "Min Order",       value: `$${ly.minOrderValue.toLocaleString()}` },
                { label: "Delivery Radius", value: `${ly.deliveryRadius} miles` },
                { label: "Price Range",     value: `${PRICE_LABEL[ly.priceRange]} (${ly.priceRange})` },
                { label: "Established",     value: `${ly.established}` },
              ].map(d => (
                <div key={d.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{d.label}</span>
                  <span className="text-xs font-semibold text-slate-800">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specialties */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-bold text-slate-700 mb-3">Specialties</div>
            <div className="flex flex-wrap gap-2">
              {ly.specialties.map(s => (
                <span key={s} className="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full">{s}</span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          {ly.certifications.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <div className="text-xs font-bold text-slate-700 mb-3">Certifications</div>
              <div className="space-y-2">
                {ly.certifications.map(c => (
                  <div key={c} className="flex items-center gap-2 text-sm text-green-700">
                    <Shield size={13} /> {c}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Grid View ────────────────────────────────────────────────────────────────

function MarketplaceGrid() {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");

  const filtered = mockLumberyards.filter(ly =>
    ly.name.toLowerCase().includes(search.toLowerCase()) ||
    ly.city.toLowerCase().includes(search.toLowerCase()) ||
    ly.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-slate-100 bg-white flex-shrink-0">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Marketplace</h1>
            <p className="text-sm text-slate-500 mt-0.5">{mockLumberyards.length} suppliers available in your area</p>
          </div>
        </div>
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, specialty, city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-sm text-slate-400">No suppliers match your search</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(ly => (
              <LumberyardGridCard
                key={ly.id}
                ly={ly}
                onClick={() => navigate(`/contractor/marketplace/${ly.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function Marketplace() {
  const { id } = useParams<{ id: string }>();
  const ly = id ? mockLumberyards.find(l => l.id === id) : null;

  if (ly) return <LumberyardDetail ly={ly} />;
  return <MarketplaceGrid />;
}
