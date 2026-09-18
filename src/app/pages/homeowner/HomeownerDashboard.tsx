import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus, Upload, Package, Truck, CheckCircle, Clock,
  Home, MapPin, ArrowRight, Star, Shield, ChevronRight,
  FileText, DollarSign, Calendar,
} from "lucide-react";

const steps = [
  { id: 1, label: "Project Created", done: true, icon: <CheckCircle size={14} /> },
  { id: 2, label: "Plans Uploaded", done: true, icon: <CheckCircle size={14} /> },
  { id: 3, label: "Takeoff Generated", done: true, icon: <CheckCircle size={14} /> },
  { id: 4, label: "Supplier Selected", done: false, icon: <Clock size={14} /> },
  { id: 5, label: "Materials Ordered", done: false, icon: <Clock size={14} /> },
  { id: 6, label: "Delivery Scheduled", done: false, icon: <Clock size={14} /> },
];

const materialHighlights = [
  { category: "Decking", items: 8, cost: 3200, ready: true },
  { category: "Framing Lumber", items: 12, cost: 1840, ready: true },
  { category: "Hardware & Fasteners", items: 6, cost: 420, ready: true },
  { category: "Concrete Accessories", items: 4, cost: 280, ready: false },
];

export function HomeownerDashboard() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(4);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-green-200 text-xs mb-1">MY PROJECT</div>
            <h1 className="text-xl font-bold mb-1">418 Willow Creek Ln — Deck</h1>
            <div className="flex items-center gap-1.5 text-green-200 text-xs">
              <MapPin size={12} /> Cedar Park, TX · Outdoor Structure
            </div>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <Home size={20} className="text-white" />
          </div>
        </div>
        <div className="mt-4 bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-green-200">Project Progress</span>
            <span className="text-xs font-bold text-white">50%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: "50%" }} />
          </div>
          <div className="mt-2 text-xs text-green-200">Ready to select a supplier and order materials</div>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Your Progress</h2>
        <div className="relative">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-4 mb-4 last:mb-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                step.done ? "bg-green-500 text-white" :
                step.id === activeStep ? "bg-green-100 text-green-600 border-2 border-green-400" :
                "bg-slate-100 text-slate-400"
              }`}>
                {step.done ? step.icon : <span className="text-xs font-bold">{step.id}</span>}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-medium ${step.done ? "text-slate-700" : step.id === activeStep ? "text-green-700" : "text-slate-400"}`}>
                  {step.label}
                </div>
              </div>
              {step.id === activeStep && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">Next step</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package size={18} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-900 mb-1">Your materials are ready to order</h3>
            <p className="text-xs text-amber-700 mb-4 leading-relaxed">
              We've identified 30 items totaling $5,740 for your deck project. 
              Browse local suppliers to compare prices and order.
            </p>
            <button
              onClick={() => navigate("/homeowner/materials")}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Browse Suppliers <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Material Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Material Summary</h2>
          </div>
          <span className="text-xs text-slate-400">30 items</span>
        </div>
        <div className="divide-y divide-slate-50">
          {materialHighlights.map((cat, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cat.ready ? "bg-green-500" : "bg-slate-200"}`} />
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">{cat.category}</div>
                <div className="text-xs text-slate-400">{cat.items} items</div>
              </div>
              <div className="text-sm font-bold text-slate-900">${cat.cost.toLocaleString()}</div>
              {cat.ready ? (
                <div className="flex items-center gap-1 text-xs text-green-600"><CheckCircle size={12} /> Ready</div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-slate-400"><Clock size={12} /> Pending</div>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50">
            <span className="text-sm font-semibold text-slate-700">Estimated Total</span>
            <span className="text-lg font-bold text-green-700">$5,740</span>
          </div>
        </div>
      </div>

      {/* Nearest Suppliers */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Nearby Suppliers</h2>
          <button className="text-xs text-green-600 font-medium">See all</button>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { name: "Hill Country Lumber", dist: "8.4 mi", rating: 4.5, price: "$", delivery: true },
            { name: "Austin Timber Supply", dist: "3.2 mi", rating: 4.8, price: "$$", delivery: true },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={11} /> {s.dist}</span>
                  <span className="flex items-center gap-1"><Star size={11} className="text-amber-400 fill-amber-400" /> {s.rating}</span>
                  <span className="font-medium text-slate-700">{s.price}</span>
                  {s.delivery && <span className="flex items-center gap-1 text-green-600"><Truck size={11} /> Delivers</span>}
                </div>
              </div>
              <button
                onClick={() => navigate("/homeowner/materials")}
                className="text-xs bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Select
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
        <Shield size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          Material estimates are based on your uploaded plans. Lumberyard App provides estimates only 
          and is not a licensed engineering service. Always consult with a licensed professional for structural work.
        </p>
      </div>
    </div>
  );
}
