import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Zap, Eye, EyeOff, HardHat, Building2, ArrowRight, Lock, Mail,
} from "lucide-react";

type LoginRole = "contractor" | "lumberyard";

const roleConfig = {
  contractor: {
    icon: <HardHat size={18} className="text-blue-600" />,
    label: "Contractor",
    color: "blue",
    accentBorder: "border-blue-500",
    accentBg: "bg-blue-600 hover:bg-blue-700",
    accentRing: "focus:ring-blue-500/20 focus:border-blue-500",
    pillActive: "bg-blue-600 text-white",
    pillInactive: "text-slate-500 hover:text-slate-900",
    placeholder: { email: "mike@torresconstruction.com", password: "••••••••" },
    tagline: "Manage projects, takeoffs & deliveries",
  },
  lumberyard: {
    icon: <Building2 size={18} className="text-amber-600" />,
    label: "Lumberyard",
    color: "amber",
    accentBorder: "border-amber-500",
    accentBg: "bg-amber-600 hover:bg-amber-700",
    accentRing: "focus:ring-amber-500/20 focus:border-amber-500",
    pillActive: "bg-amber-600 text-white",
    pillInactive: "text-slate-500 hover:text-slate-900",
    placeholder: { email: "sarah@austintimber.com", password: "••••••••" },
    tagline: "Manage orders, catalog & deliveries",
  },
};

export function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<LoginRole>("contractor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const cfg = roleConfig[role];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (role === "lumberyard") {
        navigate("/lumberyard-setup");
      } else {
        navigate("/onboarding", { state: { fromLogin: true, loginRole: role } });
      }
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-sm mx-auto flex items-center gap-2">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-wide">LUMBERYARD</span>
        </div>
      </header>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
            <p className="text-slate-500 text-sm">Sign in to your account to continue.</p>
          </div>

          {/* Role Switcher */}
          <div className="bg-slate-100 rounded-xl p-1 flex gap-1 mb-6">
            {(["contractor", "lumberyard"] as LoginRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  role === r
                    ? `${roleConfig[r].pillActive} shadow-sm`
                    : roleConfig[r].pillInactive
                }`}
              >
                {React.cloneElement(roleConfig[r].icon as React.ReactElement, {
                  className: role === r ? "text-white" : roleConfig[r].icon.props.className,
                })}
                {roleConfig[r].label}
              </button>
            ))}
          </div>

          {/* Role tagline */}
          <p className="text-center text-xs text-slate-400 mb-6 -mt-2">{cfg.tagline}</p>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder={cfg.placeholder.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 ${cfg.accentRing} transition-colors`}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <button
                    type="button"
                    className="text-xs text-green-600 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 ${cfg.accentRing} transition-colors`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-green-600"
                />
                <span className="text-sm text-slate-600">Remember me for 30 days</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 ${cfg.accentBg} disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <>
                    Sign In <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/onboarding")}
              className="text-green-600 font-medium hover:underline"
            >
              Get started free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
