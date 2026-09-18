import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, ArrowRight, MapPin, Building2, FileText, Calendar,
  CheckCircle, Info, Lock, ChevronDown, ChevronUp, Zap,
  BookOpen, Bolt, Flame, Shield, ClipboardCheck,
} from "lucide-react";

const projectTypes = [
  "Single Family Residence",
  "Multi-Family Residential",
  "Commercial New Construction",
  "Commercial Renovation",
  "ADU / Guest House",
  "Garage / Carport",
  "Deck / Pergola",
  "Outdoor Structure",
  "Roof Replacement",
  "Interior Renovation",
];

const detectedData = {
  jurisdiction: "City of Austin",
  ahj:          "Austin Building Services Dept.",
  buildingCode: "IBC 2021 / IRC 2021",
  floodZone:    "Zone X (minimal risk)",
  windZone:     "115 mph / Exposure B",
  snowLoad:     "Not Applicable",
};

// ─── Structured code context ──────────────────────────────────────────────────

const detectedCodes = [
  {
    code: "IRC 2021",
    name: "International Residential Code",
    scope: "Structural framing, envelope & occupancy",
    icon: <BookOpen size={13} />,
    primary: true,
    primaryLabel: "Primary · Residential",
    color: "text-green-700 bg-green-50 border-green-200",
    labelColor: "bg-green-100 text-green-700",
  },
  {
    code: "IECC 2021",
    name: "Int'l Energy Conservation Code",
    scope: "Insulation, fenestration & HVAC efficiency",
    icon: <Flame size={13} />,
    primary: false,
    color: "text-slate-700 bg-slate-50 border-slate-200",
    labelColor: "",
  },
  {
    code: "NEC 2020",
    name: "National Electrical Code",
    scope: "Electrical systems, panels & wiring",
    icon: <Bolt size={13} />,
    primary: false,
    color: "text-slate-700 bg-slate-50 border-slate-200",
    labelColor: "",
  },
  {
    code: "IBC 2021",
    name: "International Building Code",
    scope: "Life safety, accessibility & structural loads",
    icon: <Shield size={13} />,
    primary: false,
    color: "text-slate-700 bg-slate-50 border-slate-200",
    labelColor: "",
  },
];

const localAmendments = [
  { ref: "Austin §R301.1.3",   desc: "Wind exposure category amended to Exposure C within 1 mile of lakes and waterways." },
  { ref: "Austin §N1102.1.2",  desc: "Minimum R-38 ceiling insulation required (exceeds IECC 2021 baseline of R-30)." },
  { ref: "Austin §E3601.6",    desc: "EV charging conduit stub-out required in all new single-family attached garages." },
];

// ─── Component ────────────────────────��───────────────────────────────────────

export function NewProject() {
  const navigate = useNavigate();
  const [step, setStep]             = useState(1);
  const [address, setAddress]       = useState("");
  const [projectType, setProjectType] = useState("");
  const [description, setDescription] = useState("");
  const [completion, setCompletion] = useState("");
  const [detected, setDetected]     = useState(false);
  const [detecting, setDetecting]   = useState(false);
  const [amendsOpen, setAmendsOpen] = useState(false);

  const handleDetect = () => {
    if (address.length > 5) {
      setDetecting(true);
      setTimeout(() => {
        setDetecting(false);
        setDetected(true);
      }, 800);
    }
  };

  // Keep blur detection so typing and tabbing away still triggers it
  const handleAddressBlur = () => {
    if (address.length > 5 && !detected) handleDetect();
  };

  const autoName = address
    ? `${address.split(",")[0]} — ${projectType || "Construction Project"}`
    : "";

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate("/contractor/projects")}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Projects
      </button>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {["Location", "Project Info", "Review"].map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i + 1 < step  ? "bg-green-600 text-white" :
                  i + 1 === step ? "bg-green-600 text-white" :
                  "bg-slate-100 text-slate-400"
                }`}>
                  {i + 1 < step ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i + 1 === step ? "text-slate-900" : "text-slate-400"}`}>{s}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-px ${i + 1 < step ? "bg-green-400" : "bg-slate-200"}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Step 1: Location ────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Where's the project?</h1>
            <p className="text-sm text-slate-500">We'll auto-detect jurisdiction, codes, and compliance requirements.</p>
          </div>

          {/* Address input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Project Address</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="2847 Oak Ridge Dr, Austin, TX 78701"
                value={address}
                onChange={e => { setAddress(e.target.value); if (detected) setDetected(false); }}
                onBlur={handleAddressBlur}
                className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
              <Info size={11} />
              Start typing for address autocomplete (Powered by Google Maps)
            </p>
          </div>

          {/* Detect button — renamed */}
          {!detected && (
            <button
              disabled={address.length <= 5 || detecting}
              onClick={handleDetect}
              className="flex items-center justify-center gap-2 w-full border border-green-500 text-green-700 hover:bg-green-50 disabled:border-slate-200 disabled:text-slate-400 disabled:bg-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              {detecting ? (
                <>
                  <Zap size={14} className="animate-pulse" />
                  Detecting jurisdiction &amp; codes…
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Detect Jurisdiction &amp; Codes
                </>
              )}
            </button>
          )}

          {/* ── Detected code context panel ─────────────────────────────── */}
          {detected && (
            <div className="bg-green-50 border border-green-200 rounded-2xl overflow-hidden">

              {/* Header row */}
              <div className="flex items-center gap-2 px-5 py-4 border-b border-green-100">
                <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
                <span className="text-sm font-semibold text-green-800">Jurisdiction &amp; Codes Detected</span>

                {/* "Codes locked" indicator */}
                <div className="ml-auto flex items-center gap-1.5 bg-white border border-green-200 text-green-700 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                  <Lock size={10} />
                  Codes locked to this project
                </div>
              </div>

              {/* Jurisdiction metadata */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 py-4 border-b border-green-100">
                {[
                  { key: "Jurisdiction",  val: detectedData.jurisdiction },
                  { key: "AHJ",           val: detectedData.ahj },
                  { key: "Flood Zone",    val: detectedData.floodZone },
                  { key: "Wind Zone",     val: detectedData.windZone },
                ].map(({ key, val }) => (
                  <div key={key}>
                    <div className="text-[10px] text-green-600 font-semibold uppercase tracking-wider mb-0.5">{key}</div>
                    <div className="text-xs font-semibold text-green-900">{val}</div>
                  </div>
                ))}
              </div>

              {/* Code rows — IRC / IECC / NEC / IBC */}
              <div className="px-5 py-3 space-y-2 border-b border-green-100">
                <div className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-3">Applied Building Codes</div>
                {detectedCodes.map((c) => (
                  <div
                    key={c.code}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${c.color}`}
                  >
                    <span className="flex-shrink-0 opacity-60">{c.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{c.code}</span>
                        {c.primary && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${c.labelColor}`}>
                            {c.primaryLabel}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] opacity-70 mt-0.5">{c.name} · {c.scope}</div>
                    </div>
                    <CheckCircle size={13} className="text-green-500 flex-shrink-0 opacity-80" />
                  </div>
                ))}
              </div>

              {/* Local amendments — collapsible */}
              <div className="px-5 py-3">
                <button
                  onClick={() => setAmendsOpen(v => !v)}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-green-700">Local Amendments</span>
                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                      {localAmendments.length} active
                    </span>
                  </div>
                  {amendsOpen
                    ? <ChevronUp size={14} className="text-green-600" />
                    : <ChevronDown size={14} className="text-green-600" />
                  }
                </button>
                {amendsOpen && (
                  <div className="mt-3 space-y-2">
                    {localAmendments.map((a) => (
                      <div key={a.ref} className="flex gap-3 bg-white border border-green-100 rounded-lg px-3 py-2.5">
                        <span className="text-[10px] font-mono font-bold text-green-700 flex-shrink-0 mt-0.5 whitespace-nowrap">{a.ref}</span>
                        <span className="text-[11px] text-green-800 leading-relaxed">{a.desc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            disabled={!address}
            onClick={() => setStep(2)}
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            Continue <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* ── Step 2: Project Info (unchanged) ────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Project details</h1>
            <p className="text-sm text-slate-500">Tell us about the scope of work.</p>
          </div>

          {autoName && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-1">Auto-generated project name</div>
              <div className="text-sm font-semibold text-slate-900">{autoName}</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Project Type</label>
            <div className="grid grid-cols-2 gap-2">
              {projectTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setProjectType(type)}
                  className={`text-left text-xs px-3 py-2.5 rounded-xl border transition-all font-medium ${
                    projectType === type
                      ? "bg-green-50 border-green-500 text-green-800"
                      : "bg-white border-slate-200 text-slate-600 hover:border-green-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="Brief description of the scope of work..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Estimated Completion</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={completion}
                onChange={e => setCompletion(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition-colors">
              <ArrowLeft size={15} /> Back
            </button>
            <button
              disabled={!projectType}
              onClick={() => setStep(3)}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Continue <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Review ───────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Review &amp; create</h1>
            <p className="text-sm text-slate-500">Confirm your project details before we set it up.</p>
          </div>

          {/* Summary rows */}
          <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-50 shadow-sm">
            {[
              { label: "Project Name",  value: autoName || "New Project",                        icon: <FileText size={14} className="text-slate-400" /> },
              { label: "Address",       value: address,                                           icon: <MapPin size={14} className="text-slate-400" /> },
              { label: "Type",          value: projectType,                                       icon: <Building2 size={14} className="text-slate-400" /> },
              { label: "Jurisdiction",  value: detected ? detectedData.jurisdiction : "—",       icon: <Info size={14} className="text-slate-400" /> },
              { label: "Building Code", value: detected ? detectedData.buildingCode : "—",       icon: <Info size={14} className="text-slate-400" /> },
              { label: "Est. Completion", value: completion || "Not set",                        icon: <Calendar size={14} className="text-slate-400" /> },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3 px-5 py-3.5">
                {row.icon}
                <span className="text-xs text-slate-500 w-28 flex-shrink-0">{row.label}</span>
                <span className="text-sm font-medium text-slate-900">{row.value}</span>
              </div>
            ))}

            {/* Codes locked indicator inside summary */}
            {detected && (
              <div className="flex items-center gap-3 px-5 py-3.5 bg-green-50/60">
                <Lock size={14} className="text-green-600 flex-shrink-0" />
                <span className="text-xs text-slate-500 w-28 flex-shrink-0">Applied Codes</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {detectedCodes.map(c => (
                    <span key={c.code} className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {c.code}
                    </span>
                  ))}
                  <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5 ml-1">
                    <Lock size={9} /> Locked
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Review step approval message */}
          <div className="flex items-start gap-3 bg-violet-50 border border-violet-200 rounded-xl px-4 py-4">
            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ClipboardCheck size={14} className="text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-900">You will approve quantities before procurement</p>
              <p className="text-xs text-violet-700 mt-0.5 leading-relaxed">
                After uploading blueprints, a Smart Takeoff will be generated for your review.
                No materials will be ordered until you explicitly approve quantities and confirm the order.
              </p>
            </div>
          </div>

          {/* Existing info banner — unchanged */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              After creating your project, you'll be prompted to upload your blueprints.
              Our system will then generate a Smart Takeoff within minutes.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition-colors">
              <ArrowLeft size={15} /> Back
            </button>
            <button
              onClick={() => navigate("/contractor/projects/proj-new/upload")}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              <CheckCircle size={15} /> Create Project &amp; Upload Blueprints
            </button>
          </div>
        </div>
      )}
    </div>
  );
}