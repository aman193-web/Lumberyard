import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Upload, FileText, X, CheckCircle, AlertCircle,
  Camera, Loader2, ArrowRight, Eye, Download, Ruler,
  ChevronDown, ChevronUp, HelpCircle, Zap, Archive,
  ScanLine, MousePointer2, Lock, CircleDot, Image,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type FileStatus = "uploading" | "processing" | "done" | "error";
type PipelineStage = "idle" | "uploading" | "parsing" | "clarification" | "rules" | "verified";
type CalibrationMode = "auto" | "manual";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  progress: number;
  status: FileStatus;
  pages?: number;
  preview?: string;
  thumbColor?: string;
}

interface QAQuestion {
  id: string;
  question: string;
  why: string;
  options: string[];
  codeRef?: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const THUMB_COLORS = [
  "from-blue-200 to-blue-400",
  "from-slate-200 to-slate-400",
  "from-violet-200 to-violet-400",
  "from-amber-200 to-amber-400",
  "from-green-200 to-green-400",
];

const sampleFiles: UploadedFile[] = [
  { id: "f-1", name: "Floor_Plan_A1.pdf",       size: "4.2 MB", type: "pdf", progress: 100, status: "done", pages: 2,  thumbColor: THUMB_COLORS[0] },
  { id: "f-2", name: "Structural_Plans_S1.pdf", size: "6.8 MB", type: "pdf", progress: 100, status: "done", pages: 4,  thumbColor: THUMB_COLORS[1] },
  { id: "f-3", name: "Elevations_A3.pdf",       size: "3.1 MB", type: "pdf", progress: 100, status: "done", pages: 3,  thumbColor: THUMB_COLORS[2] },
];

const QA_QUESTIONS: QAQuestion[] = [
  {
    id: "heated",
    question: "Is this structure heated or conditioned space?",
    why: "Determines insulation R-value requirements, vapor barrier placement, and HVAC rough-in quantities per IECC 2021 and IRC §N1102.",
    options: ["Yes — fully conditioned", "Partially (e.g. attached garage)", "No — unheated structure"],
    codeRef: "IECC 2021 · IRC §N1102",
  },
  {
    id: "deck-height",
    question: "Is the deck or platform surface more than 30 inches above grade?",
    why: "Surfaces exceeding 30 in. from grade require guardrails per IRC §R312. This affects linear footage of railing posts, baluster count, and hardware quantities.",
    options: ["Yes — above 30 in.", "No — at or below 30 in.", "Not applicable"],
    codeRef: "IRC §R312",
  },
  {
    id: "garage",
    question: "Will this project include an attached garage?",
    why: "Attached garages require a fire-rated separation wall per IRC §R302.6. This affects drywall type (5/8\" Type X), penetration collars, and door assembly specs.",
    options: ["Yes — attached garage", "Detached garage only", "No garage"],
    codeRef: "IRC §R302.6",
  },
];

const PIPELINE_STEPS: { id: PipelineStage; label: string }[] = [
  { id: "uploading",     label: "Uploading"    },
  { id: "parsing",       label: "Parsing"      },
  { id: "clarification", label: "Clarification"},
  { id: "rules",         label: "Rules Check"  },
  { id: "verified",      label: "Verified"     },
];

const STAGE_ORDER: PipelineStage[] = ["idle","uploading","parsing","clarification","rules","verified"];

function stageIndex(s: PipelineStage) { return STAGE_ORDER.indexOf(s); }

// ─── Pipeline strip ───────────────────────────────────────────────────────────

function PipelineStrip({ current }: { current: PipelineStage }) {
  if (current === "idle") return null;
  const currentIdx = stageIndex(current);
  return (
    <div className="flex items-center gap-0 bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm">
      {PIPELINE_STEPS.map((step, i) => {
        const idx = stageIndex(step.id);
        const done    = idx < currentIdx;
        const active  = idx === currentIdx;
        const pending = idx > currentIdx;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                done    ? "bg-green-600"                  :
                active  ? "bg-green-600 ring-4 ring-green-100" :
                          "bg-slate-100"
              }`}>
                {done   ? <CheckCircle size={13} className="text-white" /> :
                 active ? <Loader2 size={13} className="text-white animate-spin" /> :
                          <span className="text-[10px] font-bold text-slate-400">{i + 1}</span>
                }
              </div>
              <span className={`text-[10px] font-semibold text-center leading-tight hidden sm:block ${
                active ? "text-green-700" : done ? "text-slate-500" : "text-slate-300"
              }`}>{step.label}</span>
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-1 transition-all ${idx < currentIdx ? "bg-green-400" : "bg-slate-100"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Thumbnail strip ──────────────────────────────────────────────────────────

function ThumbnailStrip({ files, onRemove }: { files: UploadedFile[]; onRemove: (id: string) => void }) {
  const done = files.filter(f => f.status === "done");
  if (done.length === 0) return null;
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <Image size={13} className="text-slate-400" />
        <span className="text-xs font-semibold text-slate-600">Preview Strip</span>
        <span className="text-xs text-slate-400">— {done.length} sheet{done.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {done.map((f, i) => (
          <div
            key={f.id}
            className="relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border border-slate-200 group cursor-pointer"
          >
            <div className={`w-full h-full bg-gradient-to-br ${f.thumbColor ?? THUMB_COLORS[i % THUMB_COLORS.length]} flex flex-col items-center justify-center gap-1`}>
              <FileText size={20} className="text-white/70" />
              <span className="text-[8px] text-white font-bold px-1 text-center leading-tight truncate w-full text-center">
                {f.name.replace(/\.[^.]+$/, "")}
              </span>
              {f.pages && (
                <span className="text-[8px] text-white/80">{f.pages}p</span>
              )}
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <button className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Eye size={11} className="text-white" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); onRemove(f.id); }}
                className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
              >
                <X size={11} className="text-white" />
              </button>
            </div>
            {/* Page badge */}
            <div className="absolute top-1 right-1 bg-black/50 text-white text-[8px] font-bold px-1 rounded">
              {f.type.toUpperCase()}
            </div>
          </div>
        ))}
        {/* Add more slot */}
        <div className="flex-shrink-0 w-20 h-24 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-300 cursor-pointer hover:border-green-400 hover:text-green-400 transition-colors">
          <Upload size={16} />
          <span className="text-[9px] font-semibold">Add more</span>
        </div>
      </div>
    </div>
  );
}

// ─── Scale Calibration ────────────────────────────────────────────────────────

function ScaleCalibration({
  mode, onModeChange, confirmed, onConfirm,
}: {
  mode: CalibrationMode;
  onModeChange: (m: CalibrationMode) => void;
  confirmed: boolean;
  onConfirm: () => void;
}) {
  const [pt1, setPt1] = useState("");
  const [pt2, setPt2] = useState("");
  const [dist, setDist] = useState("");

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden transition-all ${
      confirmed ? "border-green-200 bg-green-50" : "border-slate-200 bg-white"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <Ruler size={14} className="text-slate-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Scale Calibration</div>
            <div className="text-[10px] text-slate-400">Required for accurate quantity calculations</div>
          </div>
        </div>
        {confirmed && (
          <div className="flex items-center gap-1.5 bg-green-100 text-green-700 text-[11px] font-semibold px-3 py-1 rounded-full">
            <Lock size={10} />
            Calibrated
          </div>
        )}
      </div>

      <div className="px-5 py-4">
        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          {(["auto", "manual"] as CalibrationMode[]).map(m => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              disabled={confirmed}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
                mode === m
                  ? "bg-green-50 border-green-500 text-green-700"
                  : "bg-white border-slate-200 text-slate-500 hover:border-green-300"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {m === "auto" ? <ScanLine size={13} /> : <MousePointer2 size={13} />}
              {m === "auto" ? "Auto-detect" : "Manual 2-point"}
            </button>
          ))}
        </div>

        {/* Auto mode */}
        {mode === "auto" && !confirmed && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <ScanLine size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-blue-800">Scale auto-detected from title block</div>
                <div className="text-[11px] text-blue-600 mt-0.5">
                  Detected: <strong>1″ = 4′-0″ (1:48)</strong> from Floor_Plan_A1.pdf
                </div>
                <div className="text-[10px] text-blue-500 mt-1">Confidence: 97% · Source: sheet title block stamp</div>
              </div>
            </div>
            <button
              onClick={onConfirm}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
            >
              <CheckCircle size={13} /> Confirm Auto-detected Scale
            </button>
          </div>
        )}

        {/* Manual mode */}
        {mode === "manual" && !confirmed && (
          <div className="space-y-3">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Click two known points on the plan and enter the real-world distance between them.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1 block">Point A (x, y)</label>
                <input
                  type="text"
                  placeholder="e.g. 120, 340"
                  value={pt1}
                  onChange={e => setPt1(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1 block">Point B (x, y)</label>
                <input
                  type="text"
                  placeholder="e.g. 520, 340"
                  value={pt2}
                  onChange={e => setPt2(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1 block">Known Distance (feet)</label>
              <input
                type="text"
                placeholder="e.g. 24.5"
                value={dist}
                onChange={e => setDist(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
            <button
              disabled={!pt1 || !pt2 || !dist}
              onClick={onConfirm}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
            >
              <CheckCircle size={13} /> Set Manual Scale
            </button>
          </div>
        )}

        {/* Confirmed state */}
        {confirmed && (
          <div className="flex items-center gap-3 bg-green-100/60 rounded-xl px-4 py-3">
            <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-green-800">
                Scale confirmed · {mode === "auto" ? "Auto-detected: 1″ = 4′-0″" : "Manual: custom calibration applied"}
              </div>
              <div className="text-[10px] text-green-600 mt-0.5">All quantity calculations will use this scale.</div>
            </div>
            <button
              onClick={() => onConfirm()}
              className="text-[10px] text-green-600 font-semibold hover:underline"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI Q&A Panel ─────────────────────────────────────────────────────────────

function AIQAPanel({
  answers, onAnswer, whyOpen, onToggleWhy, onSubmit,
}: {
  answers: Record<string, string>;
  onAnswer: (id: string, val: string) => void;
  whyOpen: Record<string, boolean>;
  onToggleWhy: (id: string) => void;
  onSubmit: () => void;
}) {
  const allAnswered = QA_QUESTIONS.every(q => answers[q.id]);

  return (
    <div className="bg-white border border-violet-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-violet-50 border-b border-violet-100">
        <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
          <Zap size={15} className="text-violet-600" />
        </div>
        <div>
          <div className="text-sm font-semibold text-violet-900">AI Clarification Questions</div>
          <div className="text-[11px] text-violet-600 mt-0.5">
            These answers refine your takeoff for code accuracy. Takes ~30 seconds.
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-violet-500">
          {Object.keys(answers).length}/{QA_QUESTIONS.length} answered
        </div>
      </div>

      {/* Questions */}
      <div className="divide-y divide-slate-50">
        {QA_QUESTIONS.map((q, i) => {
          const answered = !!answers[q.id];
          return (
            <div key={q.id} className={`px-5 py-4 transition-colors ${answered ? "bg-green-50/40" : ""}`}>
              {/* Question row */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold ${
                  answered ? "bg-green-600 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {answered ? <CheckCircle size={11} /> : i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{q.question}</p>
                  {q.codeRef && (
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">{q.codeRef}</span>
                  )}
                </div>
              </div>

              {/* Answer options */}
              <div className="ml-8 grid grid-cols-1 gap-1.5 mb-2">
                {q.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => onAnswer(q.id, opt)}
                    className={`text-left text-xs px-3 py-2.5 rounded-xl border transition-all font-medium ${
                      answers[q.id] === opt
                        ? "bg-green-50 border-green-500 text-green-800"
                        : "bg-white border-slate-200 text-slate-600 hover:border-green-300 hover:bg-slate-50"
                    }`}
                  >
                    {answers[q.id] === opt && <CheckCircle size={11} className="inline mr-1.5 text-green-600" />}
                    {opt}
                  </button>
                ))}
              </div>

              {/* Why we ask */}
              <div className="ml-8">
                <button
                  onClick={() => onToggleWhy(q.id)}
                  className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <HelpCircle size={11} />
                  Why we ask
                  {whyOpen[q.id] ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
                {whyOpen[q.id] && (
                  <div className="mt-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 text-[11px] text-slate-500 leading-relaxed">
                    {q.why}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
        <button
          disabled={!allAnswered}
          onClick={onSubmit}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          {allAnswered ? (
            <><CheckCircle size={15} /> Submit Answers &amp; Continue</>
          ) : (
            <>Answer all {QA_QUESTIONS.length} questions to continue</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BlueprintUpload() {
  const navigate = useNavigate();
  const [files, setFiles]                   = useState<UploadedFile[]>(sampleFiles);
  const [dragging, setDragging]             = useState(false);
  const [pipelineStage, setPipelineStage]   = useState<PipelineStage>("idle");
  const [calMode, setCalMode]               = useState<CalibrationMode>("auto");
  const [calConfirmed, setCalConfirmed]     = useState(false);
  const [qaAnswers, setQaAnswers]           = useState<Record<string, string>>({});
  const [whyOpen, setWhyOpen]               = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const pipelineTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allDone      = files.length > 0 && files.every(f => f.status === "done");
  const anyUploading = files.some(f => f.status === "uploading");

  // ── File management ─────────────────────────────────────────────────────────

  const addFiles = (newFiles: File[]) => {
    const uploads: UploadedFile[] = newFiles.map((f, i) => ({
      id: `upload-${Date.now()}-${i}`,
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      type: f.name.split(".").pop() || "file",
      progress: 0,
      status: "uploading" as FileStatus,
      thumbColor: THUMB_COLORS[(sampleFiles.length + i) % THUMB_COLORS.length],
    }));
    setFiles(prev => [...prev, ...uploads]);

    uploads.forEach(upload => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress >= 100) {
          clearInterval(interval);
          setFiles(prev => prev.map(f =>
            f.id === upload.id ? { ...f, progress: 100, status: "done" } : f
          ));
        } else {
          setFiles(prev => prev.map(f =>
            f.id === upload.id ? { ...f, progress } : f
          ));
        }
      }, 300);
    });
  };

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  // ── Pipeline ─────────────────────────────────────────────────────────────────

  const advancePipeline = (from: PipelineStage) => {
    const order = STAGE_ORDER;
    const idx = order.indexOf(from);
    if (idx < order.length - 1) {
      const next = order[idx + 1];
      setPipelineStage(next);
      return next;
    }
    return from;
  };

  const handleProcess = () => {
    if (!allDone || anyUploading) return;
    setPipelineStage("uploading");
    // Simulate: uploading → parsing
    pipelineTimer.current = setTimeout(() => {
      setPipelineStage("parsing");
      // parsing → clarification
      pipelineTimer.current = setTimeout(() => {
        setPipelineStage("clarification");
      }, 1800);
    }, 1200);
  };

  const handleQASubmit = () => {
    setPipelineStage("rules");
    pipelineTimer.current = setTimeout(() => {
      setPipelineStage("verified");
    }, 2000);
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const toggleWhy = (id: string) =>
    setWhyOpen(prev => ({ ...prev, [id]: !prev[id] }));

  const handleCalConfirm = () => setCalConfirmed(v => !v ? true : false);

  const readyToProcess = allDone && !anyUploading && calConfirmed && pipelineStage === "idle";

  // ──────────────────────────────────────────���──────────────────────────────────

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate("/contractor/projects")}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Projects
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="text-xs text-green-600 font-medium mb-1">2847 OAK RIDGE DR — SFR</div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Blueprints</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload your construction drawings. Accepts PDF, JPG, PNG, TIFF, and ZIP archives.
        </p>
      </div>

      {/* ── Pipeline strip ─────────────────────────────────────────────── */}
      <div className="mb-6">
        <PipelineStrip current={pipelineStage} />
      </div>

      {/* ── Drop Zone ─────────────────────────────────────────────────── */}
      {pipelineStage === "idle" && (
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
            dragging ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-green-400 hover:bg-slate-50"
          }`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.tiff,.zip"
            className="hidden"
            onChange={e => addFiles(Array.from(e.target.files || []))}
          />
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload size={24} className="text-green-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Drop blueprints here</h3>
          <p className="text-xs text-slate-500 mb-1">PDF, JPG, PNG, TIFF up to 50 MB each</p>
          <p className="text-xs text-slate-400 mb-4 flex items-center justify-center gap-1">
            <Archive size={11} className="text-slate-400" />
            ZIP archives supported — all sheets extracted automatically
          </p>
          <div className="flex items-center gap-3 justify-center">
            <span className="inline-flex items-center gap-2 text-xs bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
              <Upload size={13} /> Browse Files
            </span>
            <span className="inline-flex items-center gap-2 text-xs border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium">
              <Archive size={13} /> Upload ZIP
            </span>
            <span className="inline-flex items-center gap-2 text-xs border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium">
              <Camera size={13} /> Take Photo
            </span>
          </div>
        </div>
      )}

      {/* ── Uploaded Files list ────────────────────────────────────────── */}
      {files.length > 0 && pipelineStage === "idle" && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              {files.length} file{files.length > 1 ? "s" : ""} uploaded
            </h3>
            <span className="text-xs text-slate-400">{files.filter(f => f.status === "done").length} ready</span>
          </div>

          {files.map(file => (
            <div key={file.id} className="bg-white rounded-xl border border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${file.thumbColor ?? "from-slate-200 to-slate-300"}`}>
                  <FileText size={18} className="text-white/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 truncate">{file.name}</span>
                    {file.pages && <span className="text-xs text-slate-400">{file.pages} pages</span>}
                    {file.type === "zip" && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-1.5 py-0.5 rounded">ZIP</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{file.size}</span>
                    {file.status === "uploading" && (
                      <><span className="text-xs text-slate-300">·</span>
                      <span className="text-xs text-blue-600">Uploading {Math.round(file.progress)}%</span></>
                    )}
                    {file.status === "processing" && (
                      <><span className="text-xs text-slate-300">·</span>
                      <span className="text-xs text-amber-600 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Analyzing...</span></>
                    )}
                    {file.status === "done" && (
                      <><span className="text-xs text-slate-300">·</span>
                      <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={10} /> Ready</span></>
                    )}
                  </div>
                  {file.status === "uploading" && (
                    <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${file.progress}%` }} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {file.status === "done" && (
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                      <Eye size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* ── Thumbnail preview strip ──────────────────────────────── */}
          <ThumbnailStrip files={files} onRemove={removeFile} />
        </div>
      )}

      {/* ── Scale Calibration ─────────────────────────────────────────── */}
      {allDone && pipelineStage === "idle" && (
        <div className="mt-6">
          <ScaleCalibration
            mode={calMode}
            onModeChange={setCalMode}
            confirmed={calConfirmed}
            onConfirm={handleCalConfirm}
          />
        </div>
      )}

      {/* ── Tips (only on idle) ───────────────────────────────────────── */}
      {pipelineStage === "idle" && (
        <div className="mt-6 bg-slate-50 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-slate-700 mb-2">For best results:</h4>
          <div className="space-y-1.5">
            {[
              "Include architectural, structural, and mechanical plans",
              "Ensure drawings are to scale with dimensions visible",
              "Include cover sheet with project information",
              "ZIP all sheets together to batch-upload an entire plan set",
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle size={11} className="text-green-500 flex-shrink-0" />
                {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI Clarification Q&A (clarification stage) ────────────────── */}
      {pipelineStage === "clarification" && (
        <div className="space-y-4">
          <AIQAPanel
            answers={qaAnswers}
            onAnswer={(id, val) => setQaAnswers(prev => ({ ...prev, [id]: val }))}
            whyOpen={whyOpen}
            onToggleWhy={toggleWhy}
            onSubmit={handleQASubmit}
          />
        </div>
      )}

      {/* ── Rules Check spinner ───────────────────────────────────────── */}
      {pipelineStage === "rules" && (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 size={22} className="text-amber-500 animate-spin" />
          </div>
          <div className="text-sm font-semibold text-slate-900 mb-1">Running Rules Check</div>
          <div className="text-xs text-slate-400">Applying IRC 2021, IECC 2021, NEC 2020, and local Austin amendments…</div>
          <div className="mt-4 space-y-1.5 text-left max-w-xs mx-auto">
            {[
              "Span table validation ✓",
              "Insulation R-value check…",
              "Electrical load calculation…",
              "Wind / seismic adjustment…",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                {item.includes("✓")
                  ? <CheckCircle size={11} className="text-green-500 flex-shrink-0" />
                  : <Loader2 size={11} className="text-amber-400 animate-spin flex-shrink-0" />
                }
                {item.replace(" ✓", "")}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Uploading / Parsing spinners ──────────────────────────────── */}
      {(pipelineStage === "uploading" || pipelineStage === "parsing") && (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 size={22} className="text-green-600 animate-spin" />
          </div>
          <div className="text-sm font-semibold text-slate-900 mb-1">
            {pipelineStage === "uploading" ? "Uploading files securely…" : "Parsing blueprints with AI…"}
          </div>
          <div className="text-xs text-slate-400">
            {pipelineStage === "uploading"
              ? `Transferring ${files.length} file${files.length > 1 ? "s" : ""} to secure processing environment`
              : "Detecting elements, scale, and takeoff quantities — this takes 1–3 minutes"
            }
          </div>
        </div>
      )}

      {/* ── Verified / Done ───────────────────────────────────────────── */}
      {pipelineStage === "verified" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-green-800">Takeoff Verified</div>
              <div className="text-xs text-green-600 mt-0.5">
                142 material items identified across 6 categories · IRC 2021 rules applied · Scale confirmed
              </div>
            </div>
          </div>

          {/* Code confirmation strip */}
          <div className="flex flex-wrap gap-2">
            {["IRC 2021", "IECC 2021", "NEC 2020", "IBC 2021", "Austin Local Amends"].map(code => (
              <span key={code} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                <CheckCircle size={10} /> {code}
              </span>
            ))}
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <Download size={15} /> Download List
            </button>
            <button
              onClick={() => navigate("/contractor/projects/proj-001/takeoff")}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Review Takeoff <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Process Button (idle state) ───────────────────────────────── */}
      {pipelineStage === "idle" && (
        <div className="mt-6">
          {!calConfirmed && allDone && (
            <p className="text-xs text-amber-600 flex items-center gap-1.5 mb-3">
              <AlertCircle size={12} className="flex-shrink-0" />
              Confirm scale calibration above before generating takeoff
            </p>
          )}
          <button
            onClick={handleProcess}
            disabled={!readyToProcess}
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
          >
            <CheckCircle size={16} />
            Generate Smart Takeoff ({files.filter(f => f.status === "done").length} files)
          </button>
        </div>
      )}
    </div>
  );
}
