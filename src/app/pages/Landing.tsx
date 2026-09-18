import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Zap, ArrowRight, CheckCircle, Star, HardHat, Building2, Ruler,
  UserCircle, Upload, BarChart3, Truck, Shield, Award, ChevronRight,
  Play, Package, FileText, MapPin,
} from "lucide-react";

const features = [
  {
    icon: <FileText size={22} className="text-green-600" />,
    title: "Smart Takeoffs",
    desc: "Upload blueprints and get precise, engineer-ready material lists in minutes. No guesswork.",
  },
  {
    icon: <MapPin size={22} className="text-green-600" />,
    title: "Local Marketplace",
    desc: "Compare rated local lumberyards side by side. Best price, quality, and delivery — guaranteed.",
  },
  {
    icon: <Truck size={22} className="text-green-600" />,
    title: "Phased Delivery",
    desc: "Schedule material deliveries aligned to your construction timeline. Never run short or overstock.",
  },
];

const stats = [
  { value: "12,400+", label: "Projects Completed" },
  { value: "98%", label: "On-Time Delivery" },
  { value: "340+", label: "Verified Lumberyards" },
  { value: "$2.4B", label: "Materials Processed" },
];

const testimonials = [
  {
    quote: "Lumberyard App cut our takeoff time from 3 days to 2 hours. The accuracy is unreal.",
    name: "Marcus T.",
    title: "General Contractor — Austin, TX",
    rating: 5,
  },
  {
    quote: "Our order volume went up 40% since joining the platform. Setup was painless.",
    name: "Sarah K.",
    title: "Owner — Central Texas Lumber Co",
    rating: 5,
  },
  {
    quote: "Finally a platform that speaks our language. Reviewing takeoffs remotely is seamless.",
    name: "James C., PE",
    title: "Structural Engineer",
    rating: 5,
  },
];

const roles = [
  {
    role: "contractor",
    icon: <HardHat size={28} className="text-blue-600" />,
    label: "Contractor",
    desc: "Manage projects, generate takeoffs, purchase materials, and schedule deliveries.",
    color: "border-blue-200 hover:border-blue-400 hover:bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    path: "/contractor",
  },
  {
    role: "lumberyard",
    icon: <Building2 size={28} className="text-amber-600" />,
    label: "Lumberyard",
    desc: "Manage your catalog, handle orders, and reach more contractors in your area.",
    color: "border-amber-200 hover:border-amber-400 hover:bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    path: "/lumberyard",
  },
  {
    role: "architect",
    icon: <Ruler size={28} className="text-violet-600" />,
    label: "Architect / Engineer",
    desc: "Review takeoffs, verify structural requirements, and collaborate on projects remotely.",
    color: "border-violet-200 hover:border-violet-400 hover:bg-violet-50",
    badge: "bg-violet-100 text-violet-700",
    path: "/architect",
  },
  {
    role: "homeowner",
    icon: <UserCircle size={28} className="text-rose-600" />,
    label: "Homeowner",
    desc: "Plan your DIY project, get material estimates, and order from trusted local suppliers.",
    color: "border-rose-200 hover:border-rose-400 hover:bg-rose-50",
    badge: "bg-rose-100 text-rose-700",
    path: "/homeowner",
  },
];

export function Landing() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-slate-900 font-bold text-base tracking-wide">LUMBERYARD</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#roles" className="hover:text-slate-900 transition-colors">Who It's For</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="hidden sm:block text-sm text-slate-700 hover:text-slate-900 font-medium px-4 py-2 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/onboarding")}
              className="text-sm bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Zap size={12} />
            <span>Intelligent Takeoffs · Verified Suppliers · Phased Delivery</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Build smarter.<br />
            <span className="text-green-600">Order confidently.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            The construction platform that turns your blueprints into precise material orders — 
            matched to the best local lumberyards, delivered on your schedule.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/onboarding")}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm"
            >
              Start Your First Project
              <ArrowRight size={16} />
            </button>
            <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm">
              <Play size={14} className="text-green-600 fill-green-600" />
              Watch Demo (2 min)
            </button>
          </div>
        </div>

        {/* Hero Screenshot */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-white/30 text-xs ml-2">Lumberyard App — Contractor Dashboard</span>
            </div>
            <div className="p-6 grid grid-cols-4 gap-4">
              {[
                { label: "Active Projects", value: "8", color: "text-green-400" },
                { label: "Pending Deliveries", value: "3", color: "text-amber-400" },
                { label: "Takeoff Ready", value: "2", color: "text-blue-400" },
                { label: "Monthly Spend", value: "$48.2K", color: "text-violet-400" },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-white/50 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 grid grid-cols-3 gap-3">
              {["2847 Oak Ridge Dr — Framing", "531 Riverside Ave — Takeoff Ready", "9102 Cedar Bluff Ct — Ordered"].map((p, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3">
                  <div className="w-full h-16 bg-white/5 rounded-lg mb-2" style={{background: `linear-gradient(135deg, rgba(21,128,61,0.3) 0%, rgba(30,41,59,0.8) 100%)`}} />
                  <div className="text-white/80 text-xs font-medium truncate">{p}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-amber-400" : i === 1 ? "bg-blue-400" : "bg-green-400"}`} />
                    <span className="text-white/40 text-xs">{i === 0 ? "In Progress" : i === 1 ? "Ready to Order" : "Ordered"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-slate-900">{s.value}</div>
                <div className="text-sm text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need. Nothing you don't.</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Three powerful tools that work together to take your project from blueprint to delivery.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-100 hover:border-green-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">From blueprint to delivery in 4 steps</h2>
          </div>
          <div className="space-y-6">
            {[
              { step: "01", title: "Create your project", desc: "Enter the address — we auto-detect jurisdiction, building codes, and compliance requirements.", icon: <MapPin size={20} className="text-green-600" /> },
              { step: "02", title: "Upload your blueprints", desc: "Drop PDFs or images. Our intelligent engine analyzes dimensions and generates a full material takeoff.", icon: <Upload size={20} className="text-green-600" /> },
              { step: "03", title: "Compare & purchase", desc: "Browse matched local lumberyards. Compare pricing, ratings, and availability. Buy with one click.", icon: <Package size={20} className="text-green-600" /> },
              { step: "04", title: "Schedule your deliveries", desc: "Set phased delivery dates aligned to your timeline. Track everything in real time.", icon: <Truck size={20} className="text-green-600" /> },
            ].map((s, i) => (
              <div key={i} className="flex gap-6 bg-white rounded-2xl p-6 border border-slate-100">
                <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  {s.icon}
                </div>
                <div>
                  <div className="text-green-600 text-xs font-bold mb-1">STEP {s.step}</div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles / Explore */}
      <section id="roles" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Explore the platform by role</h2>
            <p className="text-slate-500">Each role has a tailored experience built for how you actually work.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {roles.map((r) => (
              <button
                key={r.role}
                onMouseEnter={() => setHovered(r.role)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate(r.path)}
                className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 ${r.color}`}
              >
                <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full mb-4 ${r.badge}`}>
                  {r.label}
                </div>
                <div className="mb-3">{r.icon}</div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{r.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{r.desc}</p>
                <div className={`flex items-center gap-1 text-xs font-medium transition-colors ${hovered === r.role ? "text-slate-900" : "text-slate-400"}`}>
                  <span>Explore dashboard</span>
                  <ChevronRight size={12} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Trusted by builders across the country</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic mb-5 leading-relaxed">"{t.quote}"</p>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 bg-green-600">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center gap-4 mb-6">
            <Shield size={20} className="text-green-200" />
            <Award size={20} className="text-green-200" />
            <CheckCircle size={20} className="text-green-200" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Ready to build smarter?</h2>
          <p className="text-green-100 mb-8 text-base">
            Join 12,400+ contractors and builders using Lumberyard App to save time and cut material costs.
          </p>
          <button
            onClick={() => navigate("/onboarding")}
            className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-10 py-4 rounded-xl hover:bg-green-50 transition-colors text-sm"
          >
            Create Free Account
            <ArrowRight size={16} />
          </button>
          <p className="text-green-200 text-xs mt-4">No credit card required · Free 14-day trial · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 bg-slate-900">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-white/60 text-sm">LUMBERYARD © 2025</span>
          </div>
          <div className="flex gap-6 text-sm text-white/40">
            <a href="#" className="hover:text-white/70 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/70 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/70 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
