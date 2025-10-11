export function cleanListingDescription(description?: string | null) {
  if (!description) return "";
  const marker = "\n---\nDonor declaration:";
  const index = description.indexOf(marker);
  const trimmed = index >= 0 ? description.slice(0, index) : description;
  return trimmed.trim();
}
