import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus, Search, FolderOpen, ChevronRight, MapPin,
  Calendar, Package, DollarSign, MoreHorizontal, FileUp, BadgeCheck,
  ChevronDown, Truck, CheckCircle, Clock, Circle,
} from "lucide-react";
import { mockProjects, type ProjectStatus } from "../../data/mockData";
import { QuoteBanner } from "../../components/contractor/QuoteBanner";
import { useQuoteContext } from "../../context/QuoteContext";

// ─── Phased delivery data per project ────────────────────────────────────────

type PhaseStage = "delivered" | "in-transit" | "confirmed" | "created" | "pending";

interface ProjectPhase {
  name: string;
  stage: PhaseStage;
  date: string;
  value: number;
  supplier: string;
}

const PROJECT_PHASES: Record<string, ProjectPhase[]> = {
  "proj-001": [
    { name: "Foundation",          stage: "delivered",   date: "Apr 10", value: 6200,  supplier: "Austin Timber Supply" },
    { name: "Framing",             stage: "in-transit",  date: "Apr 14", value: 14800, supplier: "Austin Timber Supply" },
    { name: "Sheathing & Panels",  stage: "confirmed",   date: "Apr 17", value: 9200,  supplier: "Hill Country Lumber" },
    { name: "Exterior & Siding",   stage: "created",     date: "Apr 22", value: 7400,  supplier: "Central TX Lumber Co" },
    { name: "Roofing",             stage: "pending",     date: "Apr 25", value: 5800,  supplier: "Austin Timber Supply" },
    { name: "Insulation",          stage: "pending",     date: "Apr 30", value: 4200,  supplier: "Hill Country Lumber" },
  ],
};

const PHASE_DOT: Record<PhaseStage, string> = {
  "delivered":  "bg-green-500",
  "in-transit": "bg-amber-400 animate-pulse",
  "confirmed":  "bg-blue-400",
  "created":    "bg-slate-300",
  "pending":    "bg-slate-200",
};

const PHASE_LABEL: Record<PhaseStage, string> = {
  "delivered":  "Delivered",
  "in-transit": "In Transit",
  "confirmed":  "Confirmed",
  "created":    "Scheduled",
  "pending":    "Pending",
};

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  "draft": { label: "Draft", color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  "in-progress": { label: "In Progress", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  "takeoff-ready": { label: "Takeoff Ready", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  "ordered": { label: "Ordered", color: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
  "delivering": { label: "Delivering", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  "completed": { label: "Completed", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" },
};

const statuses: (ProjectStatus | "all")[] = ["all", "in-progress", "takeoff-ready", "ordered", "delivering", "completed"];

export function ContractorProjects() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { getQuote } = useQuoteContext();

  const filtered = mockProjects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">{mockProjects.length} total projects</p>
        </div>
        <button
          onClick={() => navigate("/contractor/projects/new")}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors w-fit"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-all border ${
                filter === s
                  ? "bg-green-600 border-green-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-green-400"
              }`}
            >
              {s === "all" ? "All" : statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {filtered.map((project) => {
          const quote = project.id === "proj-001" ? getQuote("rfq-001") : null;
          return (
          <div
            key={project.id}
            className="bg-white rounded-2xl border border-slate-100 hover:border-green-200 hover:shadow-sm transition-all cursor-pointer group"
            onClick={() => navigate(`/contractor/projects/${project.id}/takeoff`)}
          >
            <div className="flex items-center gap-5 p-5">
              {/* Thumbnail */}
              <div
                className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden"
                style={{
                  background: project.thumbnail
                    ? undefined
                    : "linear-gradient(135deg, #166534 0%, #15803d 100%)"
                }}
              >
                {project.thumbnail ? (
                  <img src={project.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                    {project.type.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{project.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin size={11} className="text-slate-400" />
                      <span className="text-xs text-slate-500">{project.city}, {project.state} · {project.jurisdiction} · {project.buildingCode}</span>
                    </div>
                  </div>
                  {/* Status badge — override to "Quote Received" for proj-001 */}
                  {quote ? (
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 bg-green-100 text-green-700">
                      <BadgeCheck size={12} /> Quote Received
                    </span>
                  ) : (
                    <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusConfig[project.status].color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[project.status].dot}`} />
                      {statusConfig[project.status].label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-5 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <FolderOpen size={12} className="text-slate-400" />
                    {project.blueprintsUploaded} blueprints
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Package size={12} className="text-slate-400" />
                    {project.totalMaterials} materials
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <DollarSign size={12} className="text-slate-400" />
                    {/* Show live quote total for proj-001, otherwise static estimate */}
                    {quote
                      ? <span className="text-green-700 font-semibold">${quote.total.toLocaleString("en-US", { maximumFractionDigits: 0 })} quoted</span>
                      : `$${project.totalCost.toLocaleString()}`
                    }
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar size={12} className="text-slate-400" />
                    Due {project.estimatedCompletion}
                  </div>
                  {project.lumberyard && (
                    <div className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      {project.lumberyard}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {project.status === "in-progress" && project.blueprintsUploaded === 0 && (
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/contractor/projects/${project.id}/upload`); }}
                    className="flex items-center gap-1.5 text-xs px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                  >
                    <FileUp size={13} /> Upload Plans
                  </button>
                )}
                {project.status === "takeoff-ready" && (
                  <button className="flex items-center gap-1.5 text-xs px-3 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg font-medium transition-colors">
                    Review Takeoff
                  </button>
                )}
                {/* Place Order CTA for proj-001 */}
                {quote && (
                  <button
                    onClick={e => { e.stopPropagation(); navigate("/contractor/checkout"); }}
                    className="flex items-center gap-1.5 text-xs px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <DollarSign size={13} /> Place Order
                  </button>
                )}
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors opacity-0 group-hover:opacity-100">
                  <MoreHorizontal size={16} />
                </button>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-5 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{
                      width: quote ? "55%" : ({
                        "draft": "5%",
                        "in-progress": "25%",
                        "takeoff-ready": "45%",
                        "ordered": "65%",
                        "delivering": "80%",
                        "completed": "100%",
                      }[project.status])
                    }}
                  />
                </div>
                <span className="text-xs text-slate-400">
                  {quote ? "55%" : ({
                    "draft": "5%",
                    "in-progress": "25%",
                    "takeoff-ready": "45%",
                    "ordered": "65%",
                    "delivering": "80%",
                    "completed": "100%",
                  }[project.status])}
                </span>
              </div>
            </div>

            {/* Phased Delivery toggle */}
            {PROJECT_PHASES[project.id] && (
              <div className="border-t border-slate-100">
                <button
                  onClick={e => { e.stopPropagation(); setExpandedId(expandedId === project.id ? null : project.id); }}
                  className="w-full flex items-center justify-between px-5 py-2.5 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold flex items-center gap-1.5"><Truck size={12} /> Phased Delivery Schedule</span>
                  {expandedId === project.id ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>

                {expandedId === project.id && (
                  <div className="px-5 pb-4">
                    <div className="relative">
                      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-100" />
                      <div className="space-y-2">
                        {PROJECT_PHASES[project.id].map((phase, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 z-10 border-2 border-white shadow-sm ${PHASE_DOT[phase.stage]}`} />
                            <div className="flex-1 flex items-center justify-between gap-2 bg-slate-50 rounded-xl px-3 py-2">
                              <div>
                                <div className="text-xs font-semibold text-slate-800">{phase.name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{phase.supplier} · {phase.date}</div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  phase.stage === "delivered"  ? "bg-green-100 text-green-700" :
                                  phase.stage === "in-transit" ? "bg-amber-100 text-amber-700" :
                                  phase.stage === "confirmed"  ? "bg-blue-100 text-blue-700"   :
                                  "bg-slate-100 text-slate-500"
                                }`}>{PHASE_LABEL[phase.stage]}</span>
                                <span className="text-xs font-semibold text-slate-700">${(phase.value / 1000).toFixed(1)}K</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quote banner — embedded inline inside proj-001 card */}
            {quote && <QuoteBanner inline />}
          </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <FolderOpen size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No projects found</p>
            <button
              onClick={() => navigate("/contractor/projects/new")}
              className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Create your first project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}