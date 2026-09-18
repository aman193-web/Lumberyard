import React, { useState } from "react";
import {
  User, Bell, Shield, CreditCard, Building2, MapPin,
  Phone, Mail, Save, Eye, EyeOff, Check,
} from "lucide-react";

type Tab = "profile" | "notifications" | "security" | "billing";

export function SettingsPage({ role }: { role: string }) {
  const [tab, setTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User size={15} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={15} /> },
    { id: "security", label: "Security", icon: <Shield size={15} /> },
    { id: "billing", label: "Billing", icon: <CreditCard size={15} /> },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-8 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === t.id ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.icon}
            <span className="hidden sm:block">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-5">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name</label>
                <input defaultValue="Mike" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name</label>
                <input defaultValue="Torres" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input defaultValue="mike@torresconstruction.com" className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input defaultValue="(512) 555-0142" className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-green-500" />
                </div>
              </div>
            </div>
          </div>

          {(role === "contractor" || role === "lumberyard") && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-5">Business Information</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company Name</label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      defaultValue={role === "contractor" ? "Torres Construction LLC" : "Austin Timber Supply"}
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">License / Registration</label>
                  <input defaultValue="TX-GC-2021-84512" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Service Area</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input defaultValue="Austin Metro Area" className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-green-500" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "notifications" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-semibold text-slate-900">Notification Preferences</h2>
          {[
            { label: "New order received", desc: "When a new order comes in", checked: true },
            { label: "Delivery updates", desc: "Status changes and tracking updates", checked: true },
            { label: "Takeoff ready", desc: "When smart takeoff is complete", checked: true },
            { label: "Review requests", desc: "When someone requests your review", checked: false },
            { label: "Low inventory alerts", desc: "When product stock falls below threshold", checked: true },
            { label: "Payment confirmations", desc: "When a payment is processed", checked: true },
            { label: "Platform announcements", desc: "Product updates and news", checked: false },
          ].map((item, i) => (
            <label key={i} className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-sm font-medium text-slate-800">{item.label}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
              <input type="checkbox" defaultChecked={item.checked} className="w-4 h-4 accent-green-600" />
            </label>
          ))}
        </div>
      )}

      {tab === "security" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-5">Change Password</h2>
            <div className="space-y-4">
              {[
                { label: "Current Password", placeholder: "••••••••" },
                { label: "New Password", placeholder: "Min. 8 characters" },
                { label: "Confirm New Password", placeholder: "••••••••" },
              ].map((f, i) => (
                <div key={i}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{f.label}</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder={f.placeholder} className="w-full px-4 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-green-500" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Two-Factor Authentication</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-700">Authenticator App</div>
                <div className="text-xs text-green-600">Enabled</div>
              </div>
              <button className="text-xs text-red-500 hover:text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Disable</button>
            </div>
          </div>
        </div>
      )}

      {tab === "billing" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Current Plan</h2>
              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">Pro</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">$49<span className="text-base font-normal text-slate-400">/mo</span></div>
            <div className="text-xs text-slate-500 mb-4">Billed monthly · Renews Mar 7, 2026</div>
            <div className="space-y-2">
              {["Unlimited projects", "Smart Takeoffs", "Marketplace access", "Priority support"].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-slate-600">
                  <Check size={12} className="text-green-500" /> {f}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Payment Method</h2>
            <div className="flex items-center gap-4 p-3 border border-slate-100 rounded-xl">
              <div className="w-10 h-7 bg-slate-800 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
              <div className="text-sm text-slate-700">•••• •••• •••• 4242</div>
              <div className="text-xs text-slate-400 ml-auto">Exp 12/27</div>
              <button className="text-xs text-green-600 hover:underline">Update</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
        >
          {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
