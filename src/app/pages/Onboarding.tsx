import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  HardHat, Building2, Ruler, UserCircle, ArrowRight, ArrowLeft,
  Check, Zap, Eye, EyeOff, Upload, Shield, AlertCircle,
} from "lucide-react";

type UserRole = "contractor" | "lumberyard" | "architect" | "homeowner";

const roles = [
  {
    id: "contractor" as UserRole,
    icon: <HardHat size={32} className="text-blue-600" />,
    label: "Contractor",
    desc: "Create projects, generate takeoffs, purchase materials, and schedule deliveries.",
    features: ["Smart Takeoffs", "Marketplace Access", "Delivery Scheduling", "Team Collaboration"],
    border: "border-blue-200 hover:border-blue-500",
    selected: "border-blue-500 bg-blue-50 ring-2 ring-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    id: "lumberyard" as UserRole,
    icon: <Building2 size={32} className="text-amber-600" />,
    label: "Lumberyard",
    desc: "Manage your catalog, receive orders, control delivery capacity, and grow your customer base.",
    features: ["Order Management", "Product Catalog", "Delivery Capacity", "Analytics Dashboard"],
    border: "border-amber-200 hover:border-amber-500",
    selected: "border-amber-500 bg-amber-50 ring-2 ring-amber-200",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    id: "architect" as UserRole,
    icon: <Ruler size={32} className="text-violet-600" />,
    label: "Architect / Engineer",
    desc: "Review takeoffs, verify structural requirements, and collaborate with contractors remotely.",
    features: ["Takeoff Review", "Structural Verification", "Project Collaboration", "Digital Sign-off"],
    border: "border-violet-200 hover:border-violet-500",
    selected: "border-violet-500 bg-violet-50 ring-2 ring-violet-200",
    badge: "bg-violet-100 text-violet-700",
  },
  {
    id: "homeowner" as UserRole,
    icon: <UserCircle size={32} className="text-rose-600" />,
    label: "Homeowner",
    desc: "Plan your DIY project, get accurate material estimates, and order from trusted suppliers.",
    features: ["Simple Interface", "Material Estimates", "Local Suppliers", "Direct Ordering"],
    border: "border-rose-200 hover:border-rose-500",
    selected: "border-rose-500 bg-rose-50 ring-2 ring-rose-200",
    badge: "bg-rose-100 text-rose-700",
  },
];

const specializations = ["Residential", "Commercial", "Industrial", "Structural", "Seismic", "Foundation"];
const productCategories = ["Framing Lumber", "Engineered Wood", "Sheathing", "Roofing", "Siding", "Insulation", "Fasteners", "Decking"];
const projectTypes = ["New Home Construction", "Room Addition", "Deck / Patio", "Fence", "Garage", "Shed", "Renovation", "Other"];

export function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginRole = (location.state as { loginRole?: UserRole } | null)?.loginRole ?? null;

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(loginRole);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [formData, setFormData] = useState({
    email: "", password: "", firstName: "", lastName: "", phone: "",
    companyName: "", license: "", businessAddress: "", serviceArea: "",
    projectType: "", licenseNumber: "",
  });

  const totalSteps = 4;

  const handleVerificationInput = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleFinish = () => {
    if (selectedRole) navigate(`/${selectedRole}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">LUMBERYARD</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`transition-all duration-300 ${
                    i + 1 === step ? "w-6 h-2 bg-green-600 rounded-full" :
                    i + 1 < step ? "w-2 h-2 bg-green-400 rounded-full" :
                    "w-2 h-2 bg-slate-200 rounded-full"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => navigate(`/${selectedRole || loginRole || "contractor"}`)}
              className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-3xl">

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div>
              <div className="text-center mb-10">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">What best describes you?</h1>
                <p className="text-slate-500">Choose your role to get a tailored experience.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`text-left p-6 rounded-2xl border-2 transition-all duration-200 ${
                      selectedRole === r.id ? r.selected : `bg-white ${r.border}`
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      {r.icon}
                      {selectedRole === r.id && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check size={13} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${r.badge}`}>{r.label}</div>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">{r.desc}</p>
                    <div className="space-y-1">
                      {r.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-xs text-slate-600">
                          <div className="w-1 h-1 rounded-full bg-green-500 flex-shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-8">
                <button
                  disabled={!selectedRole}
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
                >
                  Continue <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Account Information */}
          {step === 2 && (
            <div>
              <div className="text-center mb-10">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Create your account</h1>
                <p className="text-slate-500">Basic information to get you started.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                    <input
                      type="text"
                      placeholder="Mike"
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      placeholder="Torres"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      placeholder="mike@torrresconstruction.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      placeholder="(512) 555-0142"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2.5 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium px-4 py-3 transition-colors text-sm">
                  <ArrowLeft size={15} /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
                >
                  Continue <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Role-Specific Details */}
          {step === 3 && (
            <div>
              <div className="text-center mb-10">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  {selectedRole === "contractor" && "Business details"}
                  {selectedRole === "lumberyard" && "Lumberyard information"}
                  {selectedRole === "architect" && "Professional credentials"}
                  {selectedRole === "homeowner" && "Your project"}
                </h1>
                <p className="text-slate-500">Help us personalize your experience.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-5">

                {/* Contractor Fields */}
                {selectedRole === "contractor" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
                      <input type="text" placeholder="Torres Construction LLC" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Contractor License Number</label>
                      <input type="text" placeholder="TX-GC-2021-84512" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Primary Service Area</label>
                      <input type="text" placeholder="Austin Metro Area (50mi radius)" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
                      <div className="border border-slate-200 rounded-lg p-4 flex items-center gap-3 text-sm text-slate-500 cursor-pointer hover:border-green-400 transition-colors">
                        <Shield size={16} className="text-green-600" />
                        <span>Add credit card or ACH payment</span>
                        <ArrowRight size={14} className="ml-auto text-slate-400" />
                      </div>
                    </div>
                  </>
                )}

                {/* Lumberyard Fields */}
                {selectedRole === "lumberyard" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Name</label>
                      <input type="text" placeholder="Austin Timber Supply" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Address</label>
                      <input type="text" placeholder="4210 Industrial Blvd, Austin, TX 78741" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Delivery Radius (miles)</label>
                      <input type="number" placeholder="50" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Product Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {productCategories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategories(prev =>
                              prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                            )}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              selectedCategories.includes(cat)
                                ? "bg-green-600 border-green-600 text-white"
                                : "border-slate-200 text-slate-600 hover:border-green-400"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Architect Fields */}
                {selectedRole === "architect" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Professional License Number</label>
                      <input type="text" placeholder="TX-PE-2018-41238" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Firm Name</label>
                      <input type="text" placeholder="Chen Structural Engineering" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Service Region</label>
                      <input type="text" placeholder="Central Texas" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Specializations</label>
                      <div className="flex flex-wrap gap-2">
                        {specializations.map(spec => (
                          <button
                            key={spec}
                            onClick={() => setSelectedSpecs(prev =>
                              prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
                            )}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              selectedSpecs.includes(spec)
                                ? "bg-violet-600 border-violet-600 text-white"
                                : "border-slate-200 text-slate-600 hover:border-violet-400"
                            }`}
                          >
                            {spec}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Homeowner Fields */}
                {selectedRole === "homeowner" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Type</label>
                      <select className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white">
                        <option value="">Select project type...</option>
                        {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Address</label>
                      <input type="text" placeholder="1234 Maple Street, Austin, TX 78701" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                    <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-amber-800 mb-1">Liability Waiver</div>
                          <p className="text-xs text-amber-700 leading-relaxed mb-3">
                            By proceeding, you acknowledge that Lumberyard App provides material estimates only and is not a licensed engineering service. You are responsible for ensuring all construction complies with local codes.
                          </p>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={agreed}
                              onChange={e => setAgreed(e.target.checked)}
                              className="w-4 h-4 rounded accent-green-600"
                            />
                            <span className="text-xs text-amber-800 font-medium">I understand and accept the liability waiver</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium px-4 py-3 transition-colors text-sm">
                  <ArrowLeft size={15} /> Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
                >
                  Continue <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Verification */}
          {step === 4 && (
            <div>
              <div className="text-center mb-10">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Shield size={24} className="text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Verify your email</h1>
                <p className="text-slate-500">We sent a 6-digit code to <span className="font-medium text-slate-700">{formData.email || "your email"}</span></p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                <div className="flex gap-3 justify-center mb-8">
                  {verificationCode.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleVerificationInput(i, e.target.value)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-slate-500 mb-3">
                  Didn't receive a code?{" "}
                  <button className="text-green-600 font-medium hover:underline">Resend</button>
                </p>
                <div className="border-t border-slate-100 pt-5 mt-2">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <Shield size={16} className="text-slate-400" />
                    <div>
                      <div className="text-xs font-medium text-slate-700">Two-factor authentication</div>
                      <div className="text-xs text-slate-500">Enhanced security enabled for your account</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(3)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium px-4 py-3 transition-colors text-sm">
                  <ArrowLeft size={15} /> Back
                </button>
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
                >
                  <Check size={15} /> Complete Setup
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
