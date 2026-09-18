import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Zap, Check, LogOut, AlertTriangle, CheckCircle, ExternalLink, Upload,
  MapPin, Plus, Edit2, X, Building2, Award, Trash2, Clock, Calendar,
} from "lucide-react";
import {
  SupplierServiceArea, SERVICE_AREA_DESCRIPTION,
} from "../../components/lumberyard/SupplierServiceArea";
import {
  SupplierPricePolicy, PRICE_POLICY_DESCRIPTION,
} from "../../components/lumberyard/SupplierPricePolicy";
import { SupplierCertifications } from "../../components/lumberyard/SupplierCertifications";
import { CheckboxField } from "../../components/lumberyard/Checkbox";
import { CatalogMatchingWorkspace } from "../../components/lumberyard/catalog/CatalogMatchingWorkspace";
import { computeCoverage, GO_LIVE_COVERAGE_FLOOR } from "../../lib/catalogMatching";
import {
  SupplierAvailability, AVAILABILITY_DESCRIPTION,
} from "../../components/lumberyard/SupplierAvailability";
import {
  SupplierDeliveryRules, DELIVERY_RULES_DESCRIPTION,
} from "../../components/lumberyard/SupplierDeliveryRules";
import { useSupplierSetup, TERMS_DOCS, today } from "../../context/SupplierSetupContext";

// ─── Constants ────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: "Business identity" },
  { id: 2, label: "Locations" },
  { id: 3, label: "Service area" },
  { id: 4, label: "Delivery rules" },
  { id: 5, label: "Availability" },
  { id: 6, label: "Catalog" },
  { id: 7, label: "Price policy" },
  { id: 8, label: "Certifications" },
  { id: 9, label: "Terms & go-live" },
];

const LAST_STEP: Step = 9;

// ─── Shared input class ───────────────────────────────────────────────────────

const INPUT = "w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors bg-white";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "2801 E 5th St, Austin, TX 78702" -> "Austin, TX". */
function cityLabel(address?: string): string | null {
  if (!address?.trim()) return null;
  const parts = address.split(",").map(part => part.trim()).filter(Boolean);
  if (parts.length >= 3) return `${parts[1]}, ${parts[2].split(/\s+/)[0]}`;
  return parts[parts.length - 1] ?? null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LumberyardSetup() {
  const navigate = useNavigate();

  // Setup owns terms, price policy and certifications — Supplier Profile reads
  // the same store, so whatever is set here is what the profile shows.
  const {
    terms, acceptTerm, termsCount, allTermsAccepted,
    certifications,
    compliance, updateCompliance,
    catalogImport,
    businessIdentity, updateBusinessIdentity,
    serviceArea,
    deliveryRules, availability, pricePolicy,
    completedSteps, markStepComplete,
    serviceZones,
  } = useSupplierSetup();

  const [step, setStep] = useState<Step>(1);

  // Step 1 — Business identity (shared with Profile → Overview)
  const { legalName, dba, phone } = businessIdentity;

  // Step 2 — Locations
  type Location = {
    name: string; address: string; phone: string; hours: string; manager: string; primary: boolean;
  };
  const [locations, setLocations] = useState<Location[]>([]);
  // Nothing is configured yet, so the step opens straight into the form.
  const [showAddLocationForm, setShowAddLocationForm] = useState(true);
  const [editingLocationIndex, setEditingLocationIndex] = useState<number | null>(null);
  const [locationForm, setLocationForm] = useState({
    name: "",
    address: "",
    phone: "",
    hours: "",
    manager: "",
    primary: true,
  });

  const handleOpenAddLocation = () => {
    setLocationForm({
      name: "",
      address: "",
      phone: "",
      hours: "",
      manager: "",
      primary: locations.length === 0,
    });
    setEditingLocationIndex(null);
    setShowAddLocationForm(true);
  };

  const handleEditLocation = (index: number) => {
    const loc = locations[index];
    setLocationForm({ ...loc });
    setEditingLocationIndex(index);
    setShowAddLocationForm(true);
  };

  const canSaveLocation = !!locationForm.name.trim() && !!locationForm.address.trim();

  const handleSaveLocation = () => {
    if (!canSaveLocation) return;
    let updated = [...locations];
    if (locationForm.primary) {
      updated = updated.map(l => ({ ...l, primary: false }));
    }
    if (editingLocationIndex !== null) {
      updated[editingLocationIndex] = { ...locationForm };
    } else {
      updated.push({ ...locationForm });
    }
    setLocations(updated);
    setShowAddLocationForm(false);
    setEditingLocationIndex(null);
  };

  // Step 3 — Service area (the values live in the shared store)
  const primaryLocation = locations.find(l => l.primary) ?? locations[0] ?? null;

  // Step 6 — Catalog (the import itself lives in the shared store)
  const catalogCoverage = catalogImport ? computeCoverage(catalogImport.rows) : null;
  const catalogStepSatisfied = !!catalogCoverage?.meetsFloor;

  // Step 9 — Terms & go-live (insurance + payout identity live in the store,
  // so Profile → Terms can report on them too)
  const {
    insuranceCarrier, insuranceExpiry, insuranceAttested,
    w9LegalName, tin, w9Submitted,
  } = compliance;

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const advance = (from: Step) => {
    markStepComplete(from);
    const next = Math.min(from + 1, LAST_STEP) as Step;
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToStep = (s: Step) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const canAttest = !!insuranceCarrier && !!insuranceExpiry;
  const openDeliveryDays = Object.values(availability.days).filter(Boolean).length;

  // ─── Go-live checklist ─────────────────────────────────────────────────────

  const activeServiceZones = serviceZones.filter(zone => zone.active).length;

  const checklist: { label: string; detail: string; done: boolean; step: Step }[] = [
    {
      label: "Business profile",
      detail: "Add a contact phone so buyers and drivers can reach you",
      done: !!phone.trim(),
      step: 1,
    },
    {
      label: "Locations",
      detail: "Add the yard buyers collect from and drivers deliver out of",
      done: locations.length > 0,
      step: 2,
    },
    {
      label: "Service area",
      detail: "Set your yard coordinates and keep at least one service zone active",
      done: !!serviceArea.latitude.trim() && !!serviceArea.longitude.trim() && activeServiceZones > 0,
      step: 3,
    },
    {
      label: "Delivery rules",
      detail: "Set your base fee, free miles and per-mile rate",
      done: !!deliveryRules.baseFee.trim() && !!deliveryRules.perMileRate.trim() && !!deliveryRules.freeMiles.trim(),
      step: 4,
    },
    {
      label: "Availability",
      detail: "Set your recurring weekly delivery windows",
      done: openDeliveryDays > 0 && !!availability.fromTime && !!availability.toTime,
      step: 5,
    },
    {
      label: "Catalog",
      detail: `Import your catalog and confirm ${GO_LIVE_COVERAGE_FLOOR}% match coverage against the master catalog`,
      done: catalogStepSatisfied,
      step: 6,
    },
    {
      label: "Price policy",
      detail: "Choose CAP or FIXED and your lock terms",
      done: !!pricePolicy.lockStyle && !!pricePolicy.downPaymentPct.trim() && !!pricePolicy.lockWindowDays.trim(),
      step: 7,
    },
    {
      label: "Certifications",
      detail: "Upload the certifications buyers filter on (FSC, SFI, OSHA, dealer license)",
      done: certifications.length > 0,
      step: 8,
    },
    {
      label: "Terms acceptance",
      detail: `All ${TERMS_DOCS.length} terms documents must be accepted at their current versions`,
      done: allTermsAccepted,
      step: 9,
    },
    {
      label: "Insurance attestation",
      detail: "Attest that GL/auto coverage is in force (carrier + expiry)",
      done: insuranceAttested,
      step: 9,
    },
    {
      label: "Payout identity",
      detail: "Submit your W-9 so payouts can be released after your first order",
      done: w9Submitted,
      step: 9,
    },
  ];

  const doneCount = checklist.filter(c => c.done).length;
  const readinessScore = Math.round((doneCount / checklist.length) * 100);
  const canGoLive = readinessScore >= 80;

  const progressPct = Math.round((completedSteps.size / LAST_STEP) * 100);
  const currentStepMeta = STEPS.find(s => s.id === step)!;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-wide">LUMBERYARD</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-slate-500">
            <button
              onClick={() => navigate("/login")}
              className="hover:text-slate-800 transition-colors flex items-center gap-1.5"
            >
              <LogOut size={13} /> Sign out
            </button>
          </nav>
        </div>
      </header>

      {/* ── Page body ──────────────────────────────────────────────────────── */}
      <div className="flex-1 py-10 px-4">
        <div className="max-w-3xl mx-auto space-y-7">

          {/* Page title */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Supplier Setup
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              {legalName.trim() || "Your Business"}
            </h1>
          </div>

          {/* Progress row */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600">
                Step {step} of {LAST_STEP} —{" "}
                <span className="font-semibold text-slate-800">{currentStepMeta.label}</span>
              </span>
              <span className="text-slate-400 text-xs">{progressPct}% complete</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.max(progressPct, 2)}%` }}
              />
            </div>
          </div>

          {/* Step chips */}
          <div className="flex flex-wrap gap-2">
            {STEPS.map(s => {
              const isDone = completedSteps.has(s.id);
              const isCurrent = s.id === step;
              return (
                <button
                  key={s.id}
                  onClick={() => goToStep(s.id)}
                  className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                    isCurrent
                      ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                      : isDone
                      ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                      : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                  }`}
                >
                  {isDone && !isCurrent && <Check size={10} strokeWidth={3} />}
                  {s.id}. {s.label}
                  {isDone && !isCurrent && " ✓"}
                </button>
              );
            })}
          </div>

          {/* ══ STEP CARDS ════════════════════════════════════════════════════ */}

          {/* ── Step 1: Business identity ──────────────────────────────────── */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-1">Business identity</h2>
                <p className="text-sm text-slate-500">
                  Who buyers and paperwork see. Prefilled where we already know it.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Legal name
                  </label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={e => updateBusinessIdentity({ legalName: e.target.value })}
                    className={INPUT}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      DBA (optional)
                    </label>
                    <input
                      type="text"
                      value={dba}
                      onChange={e => updateBusinessIdentity({ dba: e.target.value })}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => updateBusinessIdentity({ phone: e.target.value })}
                      placeholder="(512) 555-0142"
                      className={INPUT}
                    />
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => advance(1)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Save and continue
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Locations ─────────────────────────────────────────── */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-1">Locations</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Manage your branch and yard locations. Review your configured locations or add new branch locations for your business.
                </p>
              </div>

              {/* Location Cards — only once at least one has been saved */}
              {locations.length > 0 && (
              <div className="space-y-4">
                {locations.map((loc, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-slate-900">{loc.name}</span>
                          {loc.primary && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{loc.address}</div>
                      </div>
                      <button
                        onClick={() => handleEditLocation(idx)}
                        className="text-amber-600 hover:text-amber-700 p-1 flex-shrink-0"
                        title="Edit location"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 rounded-xl px-3 py-2">
                        <div className="text-[10px] text-slate-400">Phone</div>
                        <div className="text-xs font-semibold text-slate-700 mt-0.5">{loc.phone || "—"}</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl px-3 py-2">
                        <div className="text-[10px] text-slate-400">Hours</div>
                        <div className="text-xs font-semibold text-slate-700 mt-0.5">{loc.hours || "—"}</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl px-3 py-2">
                        <div className="text-[10px] text-slate-400">Manager</div>
                        <div className="text-xs font-semibold text-slate-700 mt-0.5">{loc.manager || "—"}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}

              {/* Action row to trigger Add Location form */}
              {!showAddLocationForm && (
                <button
                  onClick={handleOpenAddLocation}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 hover:border-slate-400 rounded-2xl text-sm font-medium transition-colors"
                >
                  <Plus size={14} /> Add Location
                </button>
              )}

              {/* Add / Edit Location Form */}
              {showAddLocationForm && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      {editingLocationIndex !== null ? "Edit Location" : "Add Location"}
                    </h3>
                    {locations.length > 0 && (
                      <button
                        onClick={() => setShowAddLocationForm(false)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Location / Branch Name
                      </label>
                      <input
                        type="text"
                        value={locationForm.name}
                        onChange={e => setLocationForm({ ...locationForm, name: e.target.value })}
                        placeholder="e.g. North Austin (HQ) or South Yard"
                        className={INPUT}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={locationForm.address}
                        onChange={e => setLocationForm({ ...locationForm, address: e.target.value })}
                        placeholder="e.g. 2801 E 5th St, Austin, TX 78702"
                        className={INPUT}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="text"
                          value={locationForm.phone}
                          onChange={e => setLocationForm({ ...locationForm, phone: e.target.value })}
                          placeholder="e.g. (512) 555-0142"
                          className={INPUT}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Hours
                        </label>
                        <input
                          type="text"
                          value={locationForm.hours}
                          onChange={e => setLocationForm({ ...locationForm, hours: e.target.value })}
                          placeholder="e.g. Mon–Sat 6:30AM–6PM"
                          className={INPUT}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Manager
                        </label>
                        <input
                          type="text"
                          value={locationForm.manager}
                          onChange={e => setLocationForm({ ...locationForm, manager: e.target.value })}
                          placeholder="e.g. Dave Reyes"
                          className={INPUT}
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <CheckboxField
                        checked={locationForm.primary}
                        onChange={primary => setLocationForm({ ...locationForm, primary })}
                        label="Set as primary location"
                        description="Buyers and drivers see this address first."
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    <button
                      onClick={handleSaveLocation}
                      disabled={!canSaveLocation}
                      className={`font-semibold px-5 py-2 rounded-xl text-xs transition-colors ${
                        canSaveLocation
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {editingLocationIndex !== null ? "Update Location" : "Save Location"}
                    </button>
                    {locations.length > 0 && (
                      <button
                        onClick={() => setShowAddLocationForm(false)}
                        className="border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-medium px-4 py-2 rounded-xl text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    {!canSaveLocation && (
                      <span className="text-[11px] text-slate-400">
                        A name and an address are needed before this can be saved.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Main Step Navigation */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => advance(2)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Save and continue
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Service area ──────────────────────────────────────── */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-1">Service area</h2>
                <p className="text-sm text-slate-500 leading-relaxed">{SERVICE_AREA_DESCRIPTION}</p>
              </div>

              <SupplierServiceArea primaryLocation={primaryLocation} />

              <div className="flex items-center gap-3">
                <button
                  onClick={() => advance(3)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Save and continue
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Delivery rules ────────────────────────────────────── */}
          {step === 4 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-1">Delivery rules</h2>
                <p className="text-sm text-slate-500">{DELIVERY_RULES_DESCRIPTION}</p>
              </div>

              <SupplierDeliveryRules />

              <div className="flex items-center gap-3">
                <button
                  onClick={() => advance(4)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Save and continue
                </button>
              </div>
            </div>
          )}

          {/* ── Step 5: Availability ──────────────────────────────────────── */}
          {step === 5 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-1">Availability</h2>
                <p className="text-sm text-slate-500">{AVAILABILITY_DESCRIPTION}</p>
              </div>

              <SupplierAvailability />

              <div className="flex items-center gap-3">
                <button
                  onClick={() => advance(5)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Save and continue
                </button>
              </div>
            </div>
          )}

          {/* ── Step 6: Catalog ───────────────────────────────────────────── */}
          {step === 6 && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-2">
                <h2 className="text-base font-bold text-slate-900">Catalog</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Import your catalog, confirm how your items map to the LocalLumberyard master
                  catalog, and keep your prices current. Confirmed-match coverage has to reach
                  {" "}{GO_LIVE_COVERAGE_FLOOR}% before this step is satisfied.
                </p>
              </div>

              <CatalogMatchingWorkspace onOpenReadiness={() => goToStep(9)} />

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => advance(6)}
                  disabled={!catalogStepSatisfied}
                  className={`font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors ${
                    catalogStepSatisfied
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Save and continue
                </button>
                {!catalogStepSatisfied && (
                  <span className="text-xs text-slate-500">
                    {catalogImport
                      ? `Reach ${GO_LIVE_COVERAGE_FLOOR}% confirmed-match coverage to finish this step.`
                      : "Import your catalog to continue."}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Step 7: Price policy ──────────────────────────────────────── */}
          {step === 7 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-1">Price policy</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {PRICE_POLICY_DESCRIPTION} This is the source of truth for your pricing policy
                  everywhere else in the app.
                </p>
              </div>

              <SupplierPricePolicy note="Profile → Pricing Policy shows exactly this. Change it here and the profile follows." />

              <div className="flex items-center gap-3">
                <button
                  onClick={() => advance(7)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Save and continue
                </button>
              </div>
            </div>
          )}

          {/* ── Step 8: Certifications ────────────────────────────────────── */}
          {step === 8 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-1">Certifications</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Chain-of-custody, safety and licensing credentials. Buyers filter on these, and
                  they are what Profile &rarr; Certifications shows.
                </p>
              </div>

              <SupplierCertifications />

              <div className="flex items-center gap-3">
                <button
                  onClick={() => advance(8)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Save and continue
                </button>
              </div>
            </div>
          )}

          {/* ── Step 9: Terms & go-live ───────────────────────────────────── */}
          {step === 9 && (
            <div className="space-y-5">

              {/* ── Terms ── */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-5">
                <div className="space-y-3">
                  <h2 className="text-base font-bold text-slate-900">
                    Terms ({termsCount}/{TERMS_DOCS.length} accepted)
                  </h2>
                  <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertTriangle size={12} className="text-orange-500 flex-shrink-0" />
                    <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wide">
                      Interim — Pending Counsel Review (CQ-23/24/25)
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {TERMS_DOCS.map(doc => {
                    const accepted = terms[doc.id]?.accepted ?? false;
                    return (
                      <div
                        key={doc.id}
                        className={`border rounded-xl p-5 transition-all ${
                          accepted
                            ? "border-green-200 bg-green-50"
                            : "border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-sm font-semibold text-slate-900">{doc.title}</span>
                          <button className="text-xs text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1 flex-shrink-0 ml-4">
                            Read full text <ExternalLink size={10} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm text-slate-500 leading-relaxed flex-1">{doc.body}</p>
                          <button
                            onClick={() => !accepted && acceptTerm(doc.id)}
                            disabled={accepted}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              accepted
                                ? "bg-green-100 border border-green-200 text-green-700"
                                : "bg-slate-900 hover:bg-slate-700 text-white"
                            }`}
                          >
                            {accepted ? (
                              <><Check size={11} strokeWidth={3} /> Accepted</>
                            ) : (
                              "Accept"
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Insurance attestation ── */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Insurance attestation</h3>
                <div className="flex items-end gap-4 flex-wrap">
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Carrier</label>
                    <input
                      type="text"
                      value={insuranceCarrier}
                      onChange={e => updateCompliance({ insuranceCarrier: e.target.value })}
                      className={INPUT}
                    />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Policy expires
                    </label>
                    <input
                      type="date"
                      value={insuranceExpiry}
                      onChange={e => updateCompliance({ insuranceExpiry: e.target.value })}
                      className={INPUT}
                    />
                  </div>
                  <button
                    onClick={() => canAttest && updateCompliance({ insuranceAttested: true, insuranceAttestedDate: today() })}
                    disabled={insuranceAttested || !canAttest}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                      insuranceAttested
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : canAttest
                        ? "bg-slate-900 hover:bg-slate-700 text-white"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {insuranceAttested ? (
                      <><Check size={13} strokeWidth={3} /> Attested</>
                    ) : (
                      "I attest GL/auto coverage is in force"
                    )}
                  </button>
                </div>
              </div>

              {/* ── Payout identity ── */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Payout identity</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Business verification (identity, bank, tax + screening) is required to go live;
                    the W-9 is needed before your first payout. Your TIN is validated with the
                    payment processor and never stored; we keep the last four digits only.
                  </p>
                </div>

                <div className="flex items-end gap-4 flex-wrap">
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Legal name (as on your W-9)
                    </label>
                    <input
                      type="text"
                      value={w9LegalName}
                      onChange={e => updateCompliance({ w9LegalName: e.target.value })}
                      className={INPUT}
                    />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      TIN / EIN
                    </label>
                    <input
                      type="text"
                      value={tin}
                      onChange={e => updateCompliance({ tin: e.target.value })}
                      placeholder="XX-XXXXXXX"
                      className={INPUT}
                    />
                  </div>
                  <button
                    onClick={() => { if (w9LegalName && tin) updateCompliance({ w9Submitted: true, w9SubmittedDate: today() }); }}
                    disabled={w9Submitted || !w9LegalName || !tin}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      w9Submitted
                        ? "bg-green-50 border-green-200 text-green-700"
                        : w9LegalName && tin
                        ? "border-slate-900 text-slate-900 hover:bg-slate-50"
                        : "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                    }`}
                  >
                    {w9Submitted ? (
                      <><Check size={13} strokeWidth={3} /> W-9 submitted</>
                    ) : (
                      "Submit W-9"
                    )}
                  </button>
                </div>
              </div>

              {/* ── Go-live checklist ── */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900">
                    Go-live checklist — readiness{" "}
                    <span className={readinessScore >= 80 ? "text-green-600" : readinessScore >= 50 ? "text-amber-600" : "text-slate-900"}>
                      {readinessScore}/100
                    </span>
                    <span className="font-normal text-slate-400 ml-1">(minimum 80, nothing blocked)</span>
                  </h3>
                  {/* Mini score bar */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          readinessScore >= 80 ? "bg-green-500" : readinessScore >= 50 ? "bg-amber-400" : "bg-red-400"
                        }`}
                        style={{ width: `${readinessScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{doneCount}/{checklist.length}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {checklist.map(item => (
                    <button
                      key={item.label}
                      onClick={() => goToStep(item.step)}
                      className="w-full flex items-start gap-3 text-left rounded-lg px-2 py-1.5 -mx-2 hover:bg-slate-50 transition-colors group"
                    >
                      <span className="mt-0.5 flex-shrink-0 w-4 text-center">
                        {item.done ? (
                          <CheckCircle size={14} className="text-green-500" />
                        ) : (
                          <span className="text-slate-400 text-sm leading-none">■</span>
                        )}
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed flex-1">
                        <span className="font-semibold">{item.label}</span>
                        {" "}—{" "}
                        <span className="text-slate-500">{item.detail}</span>
                      </p>
                      {!item.done && (
                        <span className="text-[11px] font-semibold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 whitespace-nowrap">
                          Step {item.step} →
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <button
                    onClick={() => navigate("/lumberyard")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                      canGoLive
                        ? "bg-amber-500 hover:bg-amber-600 border-amber-500 text-white shadow-sm"
                        : "border-slate-200 text-slate-400 bg-white cursor-default"
                    }`}
                  >
                    Go live
                    {canGoLive && <Check size={14} strokeWidth={3} />}
                  </button>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Anything marked ■ above tells you exactly what is left — use the step chips at
                    the top to jump straight to it.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* Bottom privacy note */}
          <p className="text-center text-[11px] text-slate-400 pb-6">Privacy Notice</p>

        </div>
      </div>
    </div>
  );
}
