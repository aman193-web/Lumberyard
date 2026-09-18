import masterCatalogUrl from "../../assets/lumberyard-master-catalog-v1.csv";
import { parseCsv, toObjects } from "../lib/csv";

/**
 * LocalLumberyard's master catalog — the spec every supplier item is matched
 * against. Shipped as a CSV asset and parsed on first use so it stays out of
 * the main bundle.
 */

export type MasterItem = {
  sku: string;
  itemClass: string;
  family: string;
  subfamily: string;
  productType: string;
  name: string;
  species: string;
  /** Allowed | EquivalentOnlySameSpec | StructuralNoSub | NotAllowed | Must_Match */
  substitutionPolicy: string;
  allowedAlternates: string;
  grade: string;
  moisture: string;
  nominalSize: string;
  actualSize: string;
  lengthIn: string;
  uomTakeoff: string;
  uomPurchase: string;
  manufacturer: string;
  series: string;
  requiresQuote: boolean;
  stockStatus: string;
  /** Lowercased search tokens, precomputed for matching. */
  tokens: string[];
};

/** Items under these policies can only ever be an exact match. */
export const NO_SUBSTITUTE_POLICIES = ["StructuralNoSub", "NotAllowed", "Must_Match"];
/** Items under these policies may be satisfied by an approved substitute. */
export const SUBSTITUTABLE_POLICIES = ["Allowed", "EquivalentOnlySameSpec"];

export function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    // Keep digits, letters, and the fraction/dimension characters that carry meaning.
    .replace(/["']/g, "")
    .split(/[^a-z0-9./-]+/)
    .map(t => t.replace(/^[-.]+|[-.]+$/g, ""))
    .filter(t => t.length > 0);
}

let cache: Promise<MasterItem[]> | null = null;

export function loadMasterCatalog(): Promise<MasterItem[]> {
  if (!cache) {
    cache = fetch(masterCatalogUrl)
      .then(res => {
        if (!res.ok) throw new Error(`Master catalog failed to load (${res.status})`);
        return res.text();
      })
      .then(text => {
        const objects = toObjects(parseCsv(text));
        return objects
          .filter(o => (o.sku || "").trim())
          .map(toMasterItem);
      })
      .catch(err => { cache = null; throw err; });
  }
  return cache;
}

function toMasterItem(o: Record<string, string>): MasterItem {
  const name = (o.product_name || "").trim();
  const item: MasterItem = {
    sku: (o.sku || "").trim(),
    itemClass: (o.item_class || "").trim(),
    family: (o.family || "").trim(),
    subfamily: (o.subfamily || "").trim(),
    productType: (o.product_type || "").trim(),
    name,
    species: (o.species_group || "").trim(),
    substitutionPolicy: (o.substitution_policy || "").trim(),
    allowedAlternates: (o.allowed_alternates || "").trim(),
    grade: (o.lumber_grade || o.design_grade || "").trim(),
    moisture: (o.moisture_condition || "").trim(),
    nominalSize: (o.nominal_size_text || "").trim(),
    actualSize: (o.actual_size_text || "").trim(),
    lengthIn: (o.length_in || "").trim(),
    uomTakeoff: (o.uom_takeoff || "").trim(),
    uomPurchase: (o.uom_purchase || "").trim(),
    manufacturer: (o.manufacturer || "").trim(),
    series: (o.series || "").trim(),
    requiresQuote: (o.requires_quote || "").trim().toUpperCase() === "Y",
    stockStatus: (o.stock_status || "").trim(),
    tokens: [],
  };
  item.tokens = tokenize(
    [name, item.species, item.nominalSize, item.manufacturer, item.series, item.grade].join(" ")
  );
  return item;
}

/** Human label for a class/family slug: "engineered_wood" -> "Engineered Wood". */
export function humanize(slug: string): string {
  if (!slug) return "—";
  return slug
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
