import React, { useState } from "react";
import {
  FileText, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp,
  Download, Eye, Shield, Handshake, AlertTriangle, ClipboardList, History,
} from "lucide-react";

interface TermsDoc {
  id: string;
  title: string;
  version: string;
  effectiveDate: string;
  icon: React.ReactNode;
  iconCls: string;
  accepted: boolean;
  acceptedOn?: string;
  acceptedBy?: string;
  summary: string;
  keyPoints: string[];
  history: { version: string; date: string; change: string }[];
}

const DOCS: TermsDoc[] = [
  {
    id: "marketplace-terms",
    title: "Marketplace Terms of Service",
    version: "v2.1",
    effectiveDate: "April 1, 2026",
    icon: <Handshake size={16} />,
    iconCls: "text-blue-600 bg-blue-50",
    accepted: true,
    acceptedOn: "May 14, 2026",
    acceptedBy: "Sarah Kim (Owner)",
    summary: "Governs your participation in the Lumberyard marketplace, including order fulfillment obligations, payment processing, and dispute resolution.",
    keyPoints: [
      "Orders must be confirmed within 4 business hours of receipt",
      "Payment is released 48 hours after confirmed delivery",
      "Platform fee: 2.9% per successfully fulfilled order",
      "Suppliers may not list products below documented acquisition cost",
      "Account suspension may occur for fulfillment rate below 85%",
    ],
    history: [
      { version: "v2.1", date: "Apr 1, 2026",  change: "Added Section 8: AI-Assisted Quoting Disclosures" },
      { version: "v2.0", date: "Jan 15, 2026", change: "Platform fee restructure from flat to percentage model" },
      { version: "v1.3", date: "Oct 3, 2025",  change: "Added dispute escalation timeline (72-hour window)" },
      { version: "v1.0", date: "Jun 1, 2025",  change: "Initial release" },
    ],
  },
  {
    id: "anti-circumvention",
    title: "Anti-Circumvention Policy",
    version: "v1.2",
    effectiveDate: "January 15, 2026",
    icon: <Shield size={16} />,
    iconCls: "text-violet-600 bg-violet-50",
    accepted: true,
    acceptedOn: "May 14, 2026",
    acceptedBy: "Sarah Kim (Owner)",
    summary: "Prohibits suppliers from directing contractors to transact outside the platform for orders that originated through a Lumberyard marketplace interaction.",
    keyPoints: [
      "Any order that originated from a Lumberyard lead must be processed on-platform",
      "Sharing direct contact info to bypass quoting is prohibited",
      "First violation: 30-day suspension. Second: permanent removal",
      "Applies for 12 months after initial contractor contact via platform",
      "Exceptions apply for pre-existing direct relationships (must be documented)",
    ],
    history: [
      { version: "v1.2", date: "Jan 15, 2026", change: "Clarified 'pre-existing relationship' exception documentation requirements" },
      { version: "v1.1", date: "Sep 20, 2025", change: "Added 12-month lookback period for enforcement" },
      { version: "v1.0", date: "Jun 1, 2025",  change: "Initial release" },
    ],
  },
  {
    id: "sla-24hr",
    title: "24-Hour Exception SLA",
    version: "v1.0",
    effectiveDate: "June 1, 2025",
    icon: <AlertTriangle size={16} />,
    iconCls: "text-amber-600 bg-amber-50",
    accepted: true,
    acceptedOn: "May 14, 2026",
    acceptedBy: "Sarah Kim (Owner)",
    summary: "Defines the 24-hour response requirement for order exceptions — including stock discrepancies, price corrections, and delivery rescheduling requests.",
    keyPoints: [
      "All exception notices must be responded to within 24 hours (business days)",
      "Weekend exceptions must be acknowledged by 9AM Monday",
      "Failure to respond transfers exception resolution rights to the platform",
      "Automated exception detection triggers contractor notification at T+2 hours",
      "Each missed SLA is logged and factored into your supplier reliability score",
    ],
    history: [
      { version: "v1.0", date: "Jun 1, 2025", change: "Initial release" },
    ],
  },
  {
    id: "supplier-responsibilities",
    title: "Supplier Responsibilities",
    version: "v1.1",
    effectiveDate: "September 20, 2025",
    icon: <ClipboardList size={16} />,
    iconCls: "text-green-600 bg-green-50",
    accepted: false,
    summary: "Outlines operational requirements including catalog accuracy, delivery documentation, packaging standards, and contractor communication guidelines.",
    keyPoints: [
      "Catalog pricing must be updated at least every 14 days",
      "Delivery must include a signed proof-of-delivery and photo documentation",
      "All lumber must be graded, stamped, and labeled per applicable code",
      "Contractors must receive an ETA update if delivery is delayed by >30 minutes",
      "Damaged or short shipments must be reported within 2 hours of driver return",
    ],
    history: [
      { version: "v1.1", date: "Sep 20, 2025", change: "Added photo documentation requirement for deliveries" },
      { version: "v1.0", date: "Jun 1, 2025",  change: "Initial release" },
    ],
  },
];

function StatusBadge({ accepted }: { accepted: boolean }) {
  return accepted ? (
    <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
      <CheckCircle size={11} /> Accepted
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
      <AlertCircle size={11} /> Action Required
    </span>
  );
}

export function SupplierTerms() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);

  const pending = DOCS.filter(d => !d.accepted).length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Terms & Acceptance</h1>
        <p className="text-sm text-slate-500 mt-1">Review and accept all required supplier agreements.</p>
      </div>

      {/* Alert if pending */}
      {pending > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">
            <span className="font-bold">{pending} document{pending !== 1 ? "s" : ""} require your acceptance</span> before your account can be fully activated.
          </p>
        </div>
      )}

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Documents",   value: DOCS.length, cls: "text-slate-900" },
          { label: "Accepted",    value: DOCS.filter(d => d.accepted).length, cls: "text-green-700" },
          { label: "Pending",     value: pending, cls: pending > 0 ? "text-red-600" : "text-slate-400" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
            <div className={`text-2xl font-bold ${stat.cls}`}>{stat.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Document list */}
      <div className="space-y-3">
        {DOCS.map(doc => {
          const isExpanded = expanded === doc.id;
          const showHistory = historyOpen === doc.id;

          return (
            <div
              key={doc.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                !doc.accepted ? "border-red-200" : "border-slate-100"
              }`}
            >
              {/* Header row */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${doc.iconCls}`}>
                  {doc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900">{doc.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{doc.version} · Effective {doc.effectiveDate}</div>
                </div>
                <StatusBadge accepted={doc.accepted} />
                <button
                  onClick={() => setExpanded(isExpanded ? null : doc.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 flex-shrink-0"
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-4">
                  {/* Summary */}
                  <p className="text-xs text-slate-600 leading-relaxed">{doc.summary}</p>

                  {/* Key Points */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Key Points</div>
                    <ul className="space-y-1.5">
                      {doc.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Acceptance status */}
                  {doc.accepted && doc.acceptedOn && (
                    <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-3">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      <div className="text-xs text-green-800">
                        Accepted by <span className="font-semibold">{doc.acceptedBy}</span> on {doc.acceptedOn}
                      </div>
                    </div>
                  )}

                  {/* Version History toggle */}
                  <div>
                    <button
                      onClick={() => setHistoryOpen(showHistory ? null : doc.id)}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      <History size={12} />
                      {showHistory ? "Hide" : "Show"} Version History ({doc.history.length} revision{doc.history.length !== 1 ? "s" : ""})
                    </button>

                    {showHistory && (
                      <div className="mt-3 border border-slate-100 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
                          <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            <span>Version</span><span>Date</span><span>Change</span>
                          </div>
                        </div>
                        {doc.history.map((h, i) => (
                          <div key={i} className="grid grid-cols-3 gap-2 px-4 py-2.5 border-b border-slate-50 last:border-0 text-xs">
                            <span className="font-mono font-semibold text-slate-600">{h.version}</span>
                            <span className="text-slate-400">{h.date}</span>
                            <span className="text-slate-600">{h.change}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600">
                      <Eye size={12} /> View Full Document
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600">
                      <Download size={12} /> Download PDF
                    </button>
                    {!doc.accepted && (
                      <button className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors ml-auto">
                        <CheckCircle size={12} /> Accept & Sign
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="flex items-start gap-2 text-[11px] text-slate-400">
        <Clock size={12} className="flex-shrink-0 mt-0.5" />
        All acceptances are timestamped and stored as immutable audit records. Contact legal@lumberyard.build to dispute a version change.
      </div>
    </div>
  );
}
