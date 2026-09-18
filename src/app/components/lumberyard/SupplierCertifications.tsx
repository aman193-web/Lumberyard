import React, { useRef, useState } from "react";
import { Award, Upload, X, CheckCircle, Trash2 } from "lucide-react";
import {
  useSupplierSetup, formatExpiry, statusForExpiry,
} from "../../context/SupplierSetupContext";

const INPUT = "w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors bg-white";

const EMPTY_FORM = { name: "", issuer: "", expiry: "" };

/**
 * Certification cards plus the add-certification form, backed by the shared
 * setup store. Rendered by both Supplier Setup → Certifications and
 * Supplier Profile → Certifications.
 */
export function SupplierCertifications() {
  const { certifications, addCertification, removeCertification } = useSupplierSetup();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [certDocument, setCertDocument] = useState<File | null>(null);

  const isValid = !!form.name.trim() && !!form.issuer.trim() && !!form.expiry;

  const handleSave = () => {
    if (!isValid) return;
    addCertification({
      name: form.name.trim(),
      issuer: form.issuer.trim(),
      expires: formatExpiry(form.expiry),
      status: statusForExpiry(form.expiry),
    });
    setForm(EMPTY_FORM);
    setCertDocument(null);
    setShowForm(false);
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setCertDocument(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-3">
      {certifications.map(cert => (
        <div key={cert.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            cert.status === "active" ? "bg-green-50 text-green-600"
            : cert.status === "expiring" ? "bg-amber-50 text-amber-600"
            : "bg-red-50 text-red-600"
          }`}>
            <Award size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-900">{cert.name}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{cert.issuer} · Expires {cert.expires}</div>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${
            cert.status === "active"   ? "text-green-700 bg-green-50 border-green-200"
            : cert.status === "expiring" ? "text-amber-700 bg-amber-50 border-amber-200"
            : "text-red-700 bg-red-50 border-red-200"
          }`}>
            {cert.status === "expiring" ? "Expiring Soon" : cert.status === "active" ? "Active" : "Expired"}
          </span>
          <button
            onClick={() => removeCertification(cert.id)}
            title="Remove certification"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}

      {showForm ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Add Certification</h3>
            <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 p-1">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Certification name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. FSC Chain of Custody"
                className={INPUT}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Issuing body
                </label>
                <input
                  type="text"
                  value={form.issuer}
                  onChange={e => setForm({ ...form, issuer: e.target.value })}
                  placeholder="e.g. Forest Stewardship Council"
                  className={INPUT}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Expires
                </label>
                <input
                  type="date"
                  value={form.expiry}
                  onChange={e => setForm({ ...form, expiry: e.target.value })}
                  className={INPUT}
                />
              </div>
            </div>

            <div
              className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-amber-300 hover:bg-amber-50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={e => setCertDocument(e.target.files?.[0] ?? null)}
              />
              {certDocument ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle size={14} className="text-green-600" />
                  <span className="text-xs font-semibold text-green-700">{certDocument.name}</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload size={18} className="text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Attach certificate</span> — optional
                  </p>
                  <p className="text-[10px] text-slate-400">PDF or image</p>
                </div>
              )}
            </div>

            {form.expiry && (
              <p className="text-[11px] text-slate-500">
                Status will be set to{" "}
                <span className="font-semibold text-slate-700">
                  {statusForExpiry(form.expiry) === "expiring" ? "Expiring Soon"
                    : statusForExpiry(form.expiry) === "active" ? "Active" : "Expired"}
                </span>{" "}
                based on the expiry date.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={!isValid}
              className={`font-semibold px-5 py-2 rounded-xl text-xs transition-colors ${
                isValid
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Save Certification
            </button>
            <button
              onClick={handleCancel}
              className="border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-medium px-4 py-2 rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 rounded-2xl text-sm font-medium transition-colors"
        >
          <Upload size={14} /> Upload Certification
        </button>
      )}
    </div>
  );
}
