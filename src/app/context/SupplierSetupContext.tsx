import React, { createContext, useContext, useState, ReactNode } from "react";
import type { MatchRow, ImportException } from "../lib/catalogMatching";

/**
 * Supplier setup is the source of truth for terms, price policy and
 * certifications. The setup wizard writes here; Supplier Profile reads the
 * same store, so the two screens can never drift apart.
 */

// ─── Terms ────────────────────────────────────────────────────────────────────

export type TermsDoc = {
  id: string;
  title: string;
  body: string;
  version: string;
};

export const TERMS_DOCS: TermsDoc[] = [
  {
    id: "agreement",
    title: "Supplier Agreement — Merchant of Record",
    body: "I agree to sell as the Merchant of Record on LocalLumberyard under this agreement.",
    version: "v2.1",
  },
  {
    id: "antiCircumvention",
    title: "Anti-Circumvention",
    body: "I agree that orders originated on the platform complete on the platform.",
    version: "v1.2",
  },
  {
    id: "serviceLevelTerms",
    title: "Service-Level Terms",
    body: "I agree to honor the availability, delivery, and exception commitments I configure.",
    version: "v1.0",
  },
  {
    id: "catalogTerms",
    title: "Catalog & Data Feed Terms",
    body: "I confirm my catalog data is accurate, mine to provide, and lawful to sell.",
    version: "v1.1",
  },
];

export type TermsAcceptance = { accepted: boolean; date: string };

const INITIAL_TERMS: Record<string, TermsAcceptance> = {
  agreement:         { accepted: true,  date: "May 14, 2026" },
  antiCircumvention: { accepted: true,  date: "May 14, 2026" },
  serviceLevelTerms: { accepted: true,  date: "May 14, 2026" },
  catalogTerms:      { accepted: false, date: "" },
};

// ─── Price policy ─────────────────────────────────────────────────────────────

export type PricePolicy = {
  lockStyle: "cap" | "fixed";
  downPaymentPct: string;
  lockWindowDays: string;
};

const INITIAL_PRICE_POLICY: PricePolicy = {
  lockStyle: "cap",
  downPaymentPct: "20",
  lockWindowDays: "14",
};

// ─── Certifications ───────────────────────────────────────────────────────────

export type CertStatus = "active" | "expiring" | "expired";

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  /** Display string, e.g. "Dec 2027". */
  expires: string;
  status: CertStatus;
};

const INITIAL_CERTIFICATIONS: Certification[] = [
  { id: "fsc",  name: "FSC Chain of Custody", issuer: "Forest Stewardship Council",    expires: "Dec 2027", status: "active"   },
  { id: "sfi",  name: "SFI Certified",        issuer: "Sustainable Forestry Initiative", expires: "Mar 2026", status: "expiring" },
  { id: "osha", name: "OSHA-10 Certified",    issuer: "OSHA / DOL",                    expires: "Aug 2027", status: "active"   },
  { id: "tdhca",name: "Texas Dealer License", issuer: "TDHCA",                         expires: "Jan 2028", status: "active"   },
];

/** "2027-12-31" -> "Dec 2027". Falls back to the raw input. */
export function formatExpiry(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** Expired once past, "expiring" inside six months, otherwise active. */
export function statusForExpiry(isoDate: string): CertStatus {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "active";
  const now = new Date();
  if (d.getTime() < now.getTime()) return "expired";
  const sixMonths = new Date(now);
  sixMonths.setMonth(sixMonths.getMonth() + 6);
  return d.getTime() <= sixMonths.getTime() ? "expiring" : "active";
}

// ─── Compliance (insurance attestation + payout identity) ─────────────────────

export type Compliance = {
  insuranceCarrier: string;
  insuranceExpiry: string;
  insuranceAttested: boolean;
  insuranceAttestedDate: string;
  businessVerified: boolean;
  businessVerifiedDate: string;
  w9LegalName: string;
  tin: string;
  w9Submitted: boolean;
  w9SubmittedDate: string;
};

const INITIAL_COMPLIANCE: Compliance = {
  insuranceCarrier: "",
  insuranceExpiry: "",
  insuranceAttested: false,
  insuranceAttestedDate: "",
  businessVerified: false,
  businessVerifiedDate: "",
  w9LegalName: "",
  tin: "",
  w9Submitted: false,
  w9SubmittedDate: "",
};

/** "Sep 18, 2026" — the stamp shown wherever an acceptance is recorded. */
export function today(): string {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Business identity & service area ─────────────────────────────────────────

export type BusinessIdentity = {
  legalName: string;
  dba: string;
  phone: string;
};

const INITIAL_BUSINESS_IDENTITY: BusinessIdentity = {
  legalName: "Austin Timber Supply",
  dba: "",
  phone: "",
};

export type ServiceArea = {
  latitude: string;
  longitude: string;
  /** Delivery radius in miles. */
  radius: string;
};

const INITIAL_SERVICE_AREA: ServiceArea = {
  latitude: "",
  longitude: "",
  radius: "20",
};

// ─── Service zones ────────────────────────────────────────────────────────────

export type ServiceZone = {
  id: string;
  name: string;
  /** "circle" | "polygon" — display only. */
  shape: string;
  radius: string;
  color: "blue" | "green" | "violet" | "amber";
  active: boolean;
  /** Where the zone sits on the placeholder map, as percentages. */
  cx: string;
  cy: string;
  r: string;
  labelLeft: string;
  labelTop: string;
};

const INITIAL_SERVICE_ZONES: ServiceZone[] = [
  { id: "austin-core", name: "Austin Core",          shape: "circle",  radius: "10 mi", color: "blue",   active: true,  cx: "44%", cy: "48%", r: "18%", labelLeft: "38%", labelTop: "28%" },
  { id: "cedar-park",  name: "Cedar Park / Leander", shape: "polygon", radius: "5 mi",  color: "green",  active: true,  cx: "20%", cy: "22%", r: "11%", labelLeft: "8%",  labelTop: "12%" },
  { id: "round-rock",  name: "Round Rock",           shape: "circle",  radius: "8 mi",  color: "violet", active: false, cx: "72%", cy: "68%", r: "10%", labelLeft: "64%", labelTop: "72%" },
];

// ─── Delivery rules & availability ────────────────────────────────────────────

export type DeliveryRules = {
  baseFee: string;
  freeMiles: string;
  perMileRate: string;
  whoDelivers: "our-trucks" | "third-party" | "customer-pickup";
};

const INITIAL_DELIVERY_RULES: DeliveryRules = {
  baseFee: "75",
  freeMiles: "10",
  perMileRate: "3",
  whoDelivers: "our-trucks",
};

export type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type Availability = {
  days: Record<DayKey, boolean>;
  fromTime: string;
  toTime: string;
  deliveriesPerDay: string;
};

const INITIAL_AVAILABILITY: Availability = {
  days: { sun: false, mon: true, tue: true, wed: true, thu: true, fri: true, sat: false },
  fromTime: "07:00",
  toTime: "15:00",
  deliveriesPerDay: "6",
};

// ─── Catalog import ───────────────────────────────────────────────────────────

/**
 * The catalog import survives leaving and returning to the step, so a supplier
 * can work a large catalog across several sittings (save/resume).
 */
export type CatalogImport = {
  fileName: string;
  importedAt: string;
  rowCount: number;
  exceptions: ImportException[];
  /** The file was the master catalog rather than a supplier export. */
  looksLikeMasterCatalog?: boolean;
  rows: MatchRow[];
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface SupplierSetupContextValue {
  terms: Record<string, TermsAcceptance>;
  acceptTerm: (id: string) => void;
  termsCount: number;
  allTermsAccepted: boolean;

  pricePolicy: PricePolicy;
  updatePricePolicy: (patch: Partial<PricePolicy>) => void;

  certifications: Certification[];
  addCertification: (cert: Omit<Certification, "id">) => void;
  removeCertification: (id: string) => void;

  compliance: Compliance;
  updateCompliance: (patch: Partial<Compliance>) => void;

  businessIdentity: BusinessIdentity;
  updateBusinessIdentity: (patch: Partial<BusinessIdentity>) => void;

  serviceArea: ServiceArea;
  updateServiceArea: (patch: Partial<ServiceArea>) => void;

  serviceZones: ServiceZone[];
  addServiceZone: (name: string) => void;
  removeServiceZone: (id: string) => void;
  toggleServiceZone: (id: string) => void;

  deliveryRules: DeliveryRules;
  updateDeliveryRules: (patch: Partial<DeliveryRules>) => void;

  availability: Availability;
  updateAvailability: (patch: Partial<Availability>) => void;
  toggleDeliveryDay: (day: DayKey) => void;

  /** Steps the supplier has explicitly saved. Persists across navigation. */
  completedSteps: Set<number>;
  markStepComplete: (step: number) => void;

  catalogImport: CatalogImport | null;
  setCatalogImport: (value: CatalogImport | null) => void;
  /** Replace specific match rows by id, leaving the rest untouched. */
  updateCatalogRows: (updater: (rows: MatchRow[]) => MatchRow[]) => void;
}

const SupplierSetupContext = createContext<SupplierSetupContextValue | null>(null);

export function SupplierSetupProvider({ children }: { children: ReactNode }) {
  const [terms, setTerms] = useState<Record<string, TermsAcceptance>>(INITIAL_TERMS);
  const [pricePolicy, setPricePolicy] = useState<PricePolicy>(INITIAL_PRICE_POLICY);
  const [certifications, setCertifications] = useState<Certification[]>(INITIAL_CERTIFICATIONS);
  const [compliance, setCompliance] = useState<Compliance>(INITIAL_COMPLIANCE);
  const [businessIdentity, setBusinessIdentity] = useState<BusinessIdentity>(INITIAL_BUSINESS_IDENTITY);
  const [serviceArea, setServiceArea] = useState<ServiceArea>(INITIAL_SERVICE_AREA);
  const [serviceZones, setServiceZones] = useState<ServiceZone[]>(INITIAL_SERVICE_ZONES);
  const [deliveryRules, setDeliveryRules] = useState<DeliveryRules>(INITIAL_DELIVERY_RULES);
  const [availability, setAvailability] = useState<Availability>(INITIAL_AVAILABILITY);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [catalogImport, setCatalogImport] = useState<CatalogImport | null>(null);

  const acceptTerm = (id: string) =>
    setTerms(prev => ({ ...prev, [id]: { accepted: true, date: today() } }));

  const updateCompliance = (patch: Partial<Compliance>) =>
    setCompliance(prev => ({ ...prev, ...patch }));

  const updateBusinessIdentity = (patch: Partial<BusinessIdentity>) =>
    setBusinessIdentity(prev => ({ ...prev, ...patch }));

  const updateServiceArea = (patch: Partial<ServiceArea>) =>
    setServiceArea(prev => ({ ...prev, ...patch }));

  const addServiceZone = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    // Drop new zones onto a free-ish spot so they are visible on the map.
    const spots = [
      { cx: "26%", cy: "72%", r: "9%",  labelLeft: "18%", labelTop: "78%" },
      { cx: "76%", cy: "26%", r: "9%",  labelLeft: "68%", labelTop: "18%" },
      { cx: "58%", cy: "78%", r: "8%",  labelLeft: "50%", labelTop: "84%" },
    ];
    setServiceZones(prev => {
      const spot = spots[prev.length % spots.length];
      return [...prev, {
        id: `zone-${Date.now()}`,
        name: trimmed,
        shape: "circle",
        radius: "5 mi",
        color: "amber",
        active: true,
        ...spot,
      }];
    });
  };

  const removeServiceZone = (id: string) =>
    setServiceZones(prev => prev.filter(zone => zone.id !== id));

  const toggleServiceZone = (id: string) =>
    setServiceZones(prev => prev.map(zone => (zone.id === id ? { ...zone, active: !zone.active } : zone)));

  const updateDeliveryRules = (patch: Partial<DeliveryRules>) =>
    setDeliveryRules(prev => ({ ...prev, ...patch }));

  const updateAvailability = (patch: Partial<Availability>) =>
    setAvailability(prev => ({ ...prev, ...patch }));

  const toggleDeliveryDay = (day: DayKey) =>
    setAvailability(prev => ({ ...prev, days: { ...prev.days, [day]: !prev.days[day] } }));

  const markStepComplete = (step: number) =>
    setCompletedSteps(prev => new Set([...prev, step]));

  const updateCatalogRows = (updater: (rows: MatchRow[]) => MatchRow[]) =>
    setCatalogImport(prev => (prev ? { ...prev, rows: updater(prev.rows) } : prev));

  const updatePricePolicy = (patch: Partial<PricePolicy>) =>
    setPricePolicy(prev => ({ ...prev, ...patch }));

  const addCertification = (cert: Omit<Certification, "id">) =>
    setCertifications(prev => [...prev, { ...cert, id: `cert-${Date.now()}` }]);

  const removeCertification = (id: string) =>
    setCertifications(prev => prev.filter(c => c.id !== id));

  const termsCount = TERMS_DOCS.filter(doc => terms[doc.id]?.accepted).length;

  return (
    <SupplierSetupContext.Provider
      value={{
        terms,
        acceptTerm,
        termsCount,
        allTermsAccepted: termsCount === TERMS_DOCS.length,
        pricePolicy,
        updatePricePolicy,
        certifications,
        addCertification,
        removeCertification,
        compliance,
        updateCompliance,
        businessIdentity,
        updateBusinessIdentity,
        serviceArea,
        updateServiceArea,
        serviceZones,
        addServiceZone,
        removeServiceZone,
        toggleServiceZone,
        deliveryRules,
        updateDeliveryRules,
        availability,
        updateAvailability,
        toggleDeliveryDay,
        completedSteps,
        markStepComplete,
        catalogImport,
        setCatalogImport,
        updateCatalogRows,
      }}
    >
      {children}
    </SupplierSetupContext.Provider>
  );
}

export function useSupplierSetup() {
  const ctx = useContext(SupplierSetupContext);
  if (!ctx) throw new Error("useSupplierSetup must be used within <SupplierSetupProvider>");
  return ctx;
}
