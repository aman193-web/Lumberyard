import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2, MapPin, Award, Truck, FileText,
  Edit2, Plus, Star, CheckCircle, Camera,
  AlertCircle, ChevronRight, Map, Calendar, DollarSign,
  Target, X, Package,
} from "lucide-react";
import { ReadinessContent } from "./MarketplaceReadiness";
import { computeCoverage, GO_LIVE_COVERAGE_FLOOR } from "../../lib/catalogMatching";
import { useSupplierSetup, TERMS_DOCS } from "../../context/SupplierSetupContext";
import {
  SupplierPricePolicy, PRICE_POLICY_DESCRIPTION,
} from "../../components/lumberyard/SupplierPricePolicy";
import { SupplierCertifications } from "../../components/lumberyard/SupplierCertifications";
import { CheckboxField } from "../../components/lumberyard/Checkbox";
import { formatTime, summarizeDays } from "../../components/lumberyard/AvailabilityCalendar";
import { ApprovedCatalog } from "../../components/lumberyard/catalog/ApprovedCatalog";
import {
  SupplierServiceArea, SERVICE_AREA_DESCRIPTION,
} from "../../components/lumberyard/SupplierServiceArea";
import {
  SupplierAvailability, AVAILABILITY_DESCRIPTION,
} from "../../components/lumberyard/SupplierAvailability";
import {
  SupplierDeliveryRules, DELIVERY_RULES_DESCRIPTION,
} from "../../components/lumberyard/SupplierDeliveryRules";

const INITIAL_BRANCH_LOCATIONS = [
  { name: "North Austin (HQ)", address: "2801 E 5th St, Austin, TX 78702", phone: "(512) 555-0142", hours: "Mon–Sat 6:30AM–6PM", manager: "Dave Reyes", primary: true },
  { name: "South Yard", address: "9411 S Congress Ave, Austin, TX 78745", phone: "(512) 555-0187", hours: "Mon–Fri 7AM–5PM", manager: "Lena Park", primary: false },
];

const MATERIALS_SCORE = {
  overall: 88,
  breakdown: [
    { label: "Packaging Integrity",    score: 92 },
    { label: "Species/Grade Accuracy", score: 95 },
    { label: "Moisture Compliance",    score: 84 },
    { label: "Labeling & Stamps",      score: 90 },
    { label: "Short Shipments",        score: 78 },
  ],
};

type ProfileSection =
  | "overview"
  | "locations"
  | "service-area"
  | "delivery-rules"
  | "calendar"
  | "catalog"
  | "price-policy"
  | "certifications"
  | "terms"
  | "readiness";

// Ordered to match the Supplier Setup wizard, with Readiness kept at the end.
const SECTION_TABS: { id: ProfileSection; label: string; icon: React.ReactNode }[] = [
  { id: "overview",       label: "Overview",       icon: <Building2 size={13} /> },
  { id: "locations",      label: "Locations",      icon: <MapPin size={13} /> },
  { id: "service-area",   label: "Service Area",   icon: <Map size={13} /> },
  { id: "delivery-rules", label: "Delivery Rules", icon: <Truck size={13} /> },
  { id: "calendar",       label: "Availability",   icon: <Calendar size={13} /> },
  { id: "catalog",        label: "Catalog",        icon: <Package size={13} /> },
  { id: "price-policy",   label: "Pricing Policy", icon: <DollarSign size={13} /> },
  { id: "certifications", label: "Certifications", icon: <Award size={13} /> },
  { id: "terms",          label: "Terms",          icon: <FileText size={13} /> },
  { id: "readiness",      label: "Readiness",      icon: <Target size={13} /> },
];

/** "2027-04-30" -> "Apr 30, 2027". Falls back to the raw value. */
function formatPolicyDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function SupplierProfile() {
  const navigate = useNavigate();
  // Supplier setup is the source of truth for certifications and terms.
  const {
    terms, compliance, catalogImport, businessIdentity,
    serviceArea, availability, deliveryRules, pricePolicy, certifications,
  } = useSupplierSetup();
  const catalogCoverage = catalogImport ? computeCoverage(catalogImport.rows) : null;

  const [activeSection, setActiveSection] = useState<ProfileSection>("overview");
  // The four terms documents, plus the two go-live attestations from
  // Supplier Setup → Terms & go-live.
  const termsRows = [
    ...TERMS_DOCS.map(doc => {
      const acceptance = terms[doc.id];
      const accepted = acceptance?.accepted ?? false;
      return {
        key: doc.id,
        label: doc.title,
        accepted,
        detail: `${accepted ? `Accepted ${acceptance?.date}` : "Not yet accepted"} · ${doc.version}`,
      };
    }),
    {
      key: "insurance",
      label: "Insurance attestation",
      accepted: compliance.insuranceAttested,
      detail: compliance.insuranceAttested
        ? `Attested ${compliance.insuranceAttestedDate} · ${compliance.insuranceCarrier || "carrier on file"}`
          + (compliance.insuranceExpiry ? ` · Policy expires ${formatPolicyDate(compliance.insuranceExpiry)}` : "")
        : "GL/auto coverage not yet attested",
    },
    {
      key: "payout",
      label: "Payout identity",
      accepted: compliance.w9Submitted,
      detail: compliance.w9Submitted
        ? `W-9 submitted ${compliance.w9SubmittedDate}`
        : "W-9 not yet submitted — needed before your first payout",
    },
  ];

  const acceptedTermsCount = termsRows.filter(row => row.accepted).length;

  const [locations, setLocations] = useState(INITIAL_BRANCH_LOCATIONS);
  const primaryLocation = locations.find(l => l.primary) ?? locations[0] ?? null;

  const overviewFacts: {
    label: string; value: React.ReactNode; sub?: string;
    section: ProfileSection; icon: React.ReactNode;
  }[] = [
    {
      label: "Primary location",
      value: primaryLocation?.name ?? "",
      sub: primaryLocation?.address,
      section: "locations",
      icon: <MapPin size={11} />,
    },
    {
      label: "Locations",
      value: `${locations.length} yard${locations.length === 1 ? "" : "s"}`,
      sub: locations.map(l => l.name).join(" · "),
      section: "locations",
      icon: <Building2 size={11} />,
    },
    {
      label: "Service area",
      value: serviceArea.radius ? `${serviceArea.radius}-mile radius` : "",
      sub: serviceArea.latitude && serviceArea.longitude
        ? `${serviceArea.latitude}, ${serviceArea.longitude}`
        : "Yard coordinates not set",
      section: "service-area",
      icon: <Map size={11} />,
    },
    {
      label: "Delivery hours",
      value: `${summarizeDays(availability.days)}`,
      sub: `${formatTime(availability.fromTime)}–${formatTime(availability.toTime)} · up to ${availability.deliveriesPerDay || 0} a day`,
      section: "calendar",
      icon: <Calendar size={11} />,
    },
    {
      label: "Delivery fee",
      value: `$${parseFloat(deliveryRules.baseFee) || 0} base`,
      sub: `${deliveryRules.freeMiles} free miles, then $${parseFloat(deliveryRules.perMileRate) || 0}/mile`,
      section: "delivery-rules",
      icon: <Truck size={11} />,
    },
    {
      label: "Price policy",
      value: pricePolicy.lockStyle.toUpperCase(),
      sub: `${pricePolicy.lockWindowDays}-day lock · ${pricePolicy.downPaymentPct}% down`,
      section: "price-policy",
      icon: <DollarSign size={11} />,
    },
    {
      label: "Catalog",
      value: catalogCoverage
        ? `${catalogCoverage.confirmed.toLocaleString()} approved items`
        : "No import yet",
      sub: catalogCoverage
        ? `${catalogCoverage.coverage}% confirmed-match coverage`
        : "Import your catalog to publish items",
      section: "catalog",
      icon: <Package size={11} />,
    },
    {
      label: "Certifications",
      value: `${certifications.length} on file`,
      sub: certifications.map(c => c.name).slice(0, 2).join(" · "),
      section: "certifications",
      icon: <Award size={11} />,
    },
    {
      label: "Terms",
      value: `${acceptedTermsCount}/${termsRows.length} accepted`,
      sub: acceptedTermsCount === termsRows.length ? "All current versions" : "Outstanding items remain",
      section: "terms",
      icon: <FileText size={11} />,
    },
  ];

  const [showAddLocationForm, setShowAddLocationForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [locationForm, setLocationForm] = useState({
    name: "",
    address: "",
    phone: "",
    hours: "",
    manager: "",
    primary: false,
  });

  const handleOpenAdd = () => {
    setLocationForm({
      name: "",
      address: "",
      phone: "",
      hours: "",
      manager: "",
      primary: locations.length === 0,
    });
    setEditingIndex(null);
    setShowAddLocationForm(true);
  };

  const handleEdit = (idx: number) => {
    setLocationForm({ ...locations[idx] });
    setEditingIndex(idx);
    setShowAddLocationForm(true);
  };

  const handleSaveLocation = () => {
    if (!locationForm.name.trim()) return;
    let updated = [...locations];
    if (locationForm.primary) {
      updated = updated.map(l => ({ ...l, primary: false }));
    }
    if (editingIndex !== null) {
      updated[editingIndex] = { ...locationForm };
    } else {
      updated.push({ ...locationForm });
    }
    setLocations(updated);
    setShowAddLocationForm(false);
    setEditingIndex(null);
  };


  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Supplier Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Manage how your business appears to contractors in the marketplace.</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors">
          <Edit2 size={14} /> Edit Profile
        </button>
      </div>

      {/* Identity card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-start gap-5">
        <div className="w-20 h-20 rounded-2xl bg-amber-50 border-2 border-dashed border-amber-200 flex flex-col items-center justify-center flex-shrink-0 cursor-pointer hover:bg-amber-100 transition-colors group">
          <Camera size={18} className="text-amber-400 group-hover:text-amber-500" />
          <span className="text-[9px] font-semibold text-amber-400 mt-1">Upload Logo</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Austin Timber Supply</h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={11} /> Austin, TX · 2 locations</span>
                <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  <CheckCircle size={10} /> Verified Supplier
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-700"><Star size={11} className="fill-amber-400 text-amber-400" /> 4.7 · 83 reviews</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{MATERIALS_SCORE.overall}</div>
              <div className="text-[10px] text-slate-400">Materials Score</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 max-w-xl leading-relaxed">
            Family-owned lumber yard serving the greater Austin metro since 1992. Specializing in residential framing, engineered wood systems, and roofing supply for general contractors and custom homebuilders.
          </p>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <span className="text-xs text-slate-400">Est. 1992</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-400">20-mile delivery radius</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-400">14 catalog products</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-400">94% on-time delivery</span>
          </div>
        </div>
      </div>

      {/* Section Tabs — same order as Supplier Setup */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {SECTION_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeSection === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Profile tabs ───────────────────────────────────────── */}

      {/* Overview — a roll-up of what Supplier Setup captured */}
      {activeSection === "overview" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Business identity</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Who buyers and paperwork see. Set in Supplier Setup &rarr; Business identity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Legal name", value: businessIdentity.legalName },
                { label: "DBA",        value: businessIdentity.dba },
                { label: "Phone",      value: businessIdentity.phone },
              ].map(item => (
                <div key={item.label} className="border border-slate-100 rounded-xl px-4 py-3">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{item.label}</div>
                  <div className="text-sm font-semibold text-slate-800">
                    {item.value || <span className="text-slate-300 font-normal">Not set</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">How you operate</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Pulled from the rest of your setup — open a tab above to change any of it.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {overviewFacts.map(fact => (
                <button
                  key={fact.label}
                  onClick={() => setActiveSection(fact.section)}
                  className="text-left border border-slate-100 rounded-xl px-4 py-3 hover:border-amber-300 hover:bg-amber-50/40 transition-colors"
                >
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    {fact.icon} {fact.label}
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    {fact.value || <span className="text-slate-300 font-normal">Not set</span>}
                  </div>
                  {fact.sub && <div className="text-[11px] text-slate-400 mt-0.5">{fact.sub}</div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Locations */}
      {activeSection === "locations" && (
        <div className="space-y-4">
          {locations.map((loc, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-slate-900">{loc.name}</span>
                    {loc.primary && (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">Primary</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">{loc.address}</div>
                </div>
                <button
                  onClick={() => handleEdit(idx)}
                  className="text-amber-600 hover:text-amber-700 flex-shrink-0 p-1"
                  title="Edit Location"
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

          {!showAddLocationForm && (
            <button
              onClick={handleOpenAdd}
              className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 rounded-2xl text-sm font-medium transition-colors"
            >
              <Plus size={14} /> Add Branch Location
            </button>
          )}

          {showAddLocationForm && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingIndex !== null ? "Edit Location" : "Add Location"}
                </h3>
                <button
                  onClick={() => setShowAddLocationForm(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={16} />
                </button>
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
                    className="w-full px-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
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
                    className="w-full px-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
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
                      placeholder="(512) 555-0142"
                      className="w-full px-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
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
                      placeholder="Mon–Sat 6:30AM–6PM"
                      className="w-full px-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
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
                      placeholder="Dave Reyes"
                      className="w-full px-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <CheckboxField
                    checked={locationForm.primary}
                    onChange={primary => setLocationForm({ ...locationForm, primary })}
                    label="Set as primary location"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleSaveLocation}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2 rounded-xl text-xs transition-colors"
                >
                  {editingIndex !== null ? "Update Location" : "Save Location"}
                </button>
                <button
                  onClick={() => setShowAddLocationForm(false)}
                  className="border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-medium px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Certifications */}
      {activeSection === "certifications" && <SupplierCertifications />}

      {/* Terms Summary */}
      {activeSection === "terms" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-slate-900">Terms & Agreement Status</div>
              <div className="text-xs text-slate-400 mt-0.5">Accepted in Supplier Setup &rarr; Terms & go-live</div>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${
              acceptedTermsCount === termsRows.length
                ? "text-green-700 bg-green-50 border-green-200"
                : "text-amber-700 bg-amber-50 border-amber-200"
            }`}>
              {acceptedTermsCount}/{termsRows.length} accepted
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {termsRows.map(row => (
              <div key={row.key} className="flex items-center gap-4 px-5 py-3.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  row.accepted ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
                }`}>
                  {row.accepted ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900">{row.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{row.detail}</div>
                </div>
                <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Catalog — the approved items from Supplier Setup → Catalog */}
      {activeSection === "catalog" && (
        <ApprovedCatalog
          catalogImport={catalogImport}
          coverage={catalogCoverage}
          onOpenSetup={() => navigate("/lumberyard-setup")}
        />
      )}

      {/* ── Configuration tabs (inline) ─────────────────────────── */}

      {activeSection === "service-area" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Service area</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                {SERVICE_AREA_DESCRIPTION} Set in Supplier Setup &rarr; Service area.
              </p>
            </div>
            <SupplierServiceArea primaryLocation={primaryLocation} />
          </div>
        </div>
      )}

      {activeSection === "delivery-rules" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Delivery rules</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {DELIVERY_RULES_DESCRIPTION} Set in Supplier Setup &rarr; Delivery rules.
            </p>
          </div>
          <SupplierDeliveryRules />
        </div>
      )}

      {activeSection === "calendar" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Availability</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {AVAILABILITY_DESCRIPTION} Set in Supplier Setup &rarr; Availability.
            </p>
          </div>
          <SupplierAvailability />
        </div>
      )}
      {activeSection === "price-policy"   && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Price policy</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {PRICE_POLICY_DESCRIPTION} Set in Supplier Setup &rarr; Price policy.
            </p>
          </div>
          <SupplierPricePolicy />
        </div>
      )}
      {activeSection === "readiness"      && <ReadinessContent />}

    </div>
  );
}
