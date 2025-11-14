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
