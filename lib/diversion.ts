export const MATERIAL_OPTIONS = [
  "Wood (dimensional lumber)",
  "Steel (structural, generic carbon)",
  "Aluminum (wrought/ingot)",
  "Glass (soda-lime)",
  "Plastic PET (#1)",
  "Plastic PVC (#3)",
  "Drywall (gypsum board)",
  "Concrete (ready-mix, 4000 psi)",
  "Masonry (CMU)",
  "Other",
];

const EMISSIONS_PER_POUND_KG: Record<string, number> = {
  "Wood (dimensional lumber)": 0.595,
  "Steel (structural, generic carbon)": 0.845,
  "Aluminum (wrought/ingot)": 3.75,
  "Glass (soda-lime)": 0.275,
  "Plastic PET (#1)": 1.09,
  "Plastic PVC (#3)": 0.975,
  "Drywall (gypsum board)": 0.08,
  "Concrete (ready-mix, 4000 psi)": 0.0682,
  "Masonry (CMU)": 0.0613,
};

const LEGACY_ALIASES: Record<string, string> = {
  Wood: "Wood (dimensional lumber)",
  Steel: "Steel (structural, generic carbon)",
  Aluminum: "Aluminum (wrought/ingot)",
  Glass: "Glass (soda-lime)",
  Plastic: "Plastic PET (#1)",
  Drywall: "Drywall (gypsum board)",
  Concrete: "Concrete (ready-mix, 4000 psi)",
  Masonry: "Masonry (CMU)",
};

export function normalizeMaterialLabel(label?: string | null) {
  if (!label) return null;
  const trimmed = label.trim();
  if (!trimmed) return null;
  return LEGACY_ALIASES[trimmed] ?? trimmed;
}

export function calculateCo2eKg(
  materialLabel?: string | null,
  weightLbs?: number | null,
) {
  const weight =
    typeof weightLbs === "number" && Number.isFinite(weightLbs) ? weightLbs : 0;
  if (weight <= 0) return 0;
  const normalized = normalizeMaterialLabel(materialLabel);
  if (!normalized) return 0;
  const factor = EMISSIONS_PER_POUND_KG[normalized] ?? 0;
  const co2 = weight * factor;
  return Number(co2.toFixed(2));
}

export function formatPounds(value: number) {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function formatCo2Kg(value: number) {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export type MaterialStat = {
  type: string;
  weight_lbs: number;
  co2e_kg: number;
};

function safeParseJSON(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function parseMaterialStats(value: unknown): MaterialStat[] {
  const rawEntries = Array.isArray(value) ? value : safeParseJSON(value);
  if (!Array.isArray(rawEntries)) return [];

  return rawEntries
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      const rawLabel =
        typeof record.type === "string"
          ? record.type
          : typeof record.material === "string"
            ? record.material
            : null;
      const label = normalizeMaterialLabel(rawLabel);
      if (!label) return null;
      const weightCandidate =
        typeof record.weight_lbs === "number"
          ? record.weight_lbs
          : typeof record.weightLbs === "number"
            ? record.weightLbs
            : Number(record.weight ?? record.weight_lb ?? record.weightLb);
      if (!Number.isFinite(weightCandidate) || weightCandidate <= 0) {
        return null;
      }
      const co2Value =
        typeof record.co2e_kg === "number"
          ? record.co2e_kg
          : Number(record.co2 ?? record.co2e ?? record.co2Kg);
      const co2e =
        Number.isFinite(co2Value) && co2Value >= 0
          ? Number(co2Value)
          : calculateCo2eKg(label, weightCandidate);
      return {
        type: label,
        weight_lbs: Number(weightCandidate.toFixed(2)),
        co2e_kg: Number(co2e.toFixed(2)),
      } satisfies MaterialStat;
    })
    .filter((entry): entry is MaterialStat => entry !== null);
}

export function summarizeListingMaterials(listing: {
  materials?: unknown;
  approximate_weight_lbs?: number | null;
  type?: string | null;
}) {
  const entries = parseMaterialStats(listing.materials);

  if (entries.length === 0) {
    const fallbackWeight = Number(listing.approximate_weight_lbs);
    if (Number.isFinite(fallbackWeight) && fallbackWeight > 0) {
      const fallbackType =
        normalizeMaterialLabel(listing.type ?? "") ??
        listing.type ??
        "Materials";
      entries.push({
        type: fallbackType,
        weight_lbs: Number(fallbackWeight.toFixed(2)),
        co2e_kg: calculateCo2eKg(fallbackType, fallbackWeight),
      });
    }
  }

  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight_lbs, 0);
  const totalCo2 = entries.reduce((sum, entry) => sum + entry.co2e_kg, 0);

  return {
    entries,
    totalWeight: Number(totalWeight.toFixed(2)),
    totalCo2: Number(totalCo2.toFixed(2)),
  };
}
