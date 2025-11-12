export type OrganizationPartner = {
  slug: string;
  name: string;
  description: string;
  region?: string;
};

export const ORGANIZATION_PARTNERS: OrganizationPartner[] = [
  {
    slug: "reuse-alliance",
    name: "Reuse Alliance",
    description:
      "Regional coalition of materials recovery non-profits focused on scaling deconstruction and donation logistics.",
    region: "North America",
  },
  {
    slug: "circular-builders-coalition",
    name: "Circular Builders Coalition",
    description:
      "Mission-driven builders and architects who commit to landfill diversion targets on every project.",
    region: "International",
  },
  {
    slug: "campus-build-labs",
    name: "Campus Build Labs",
    description:
      "University labs and student build clubs partnering with community organizations for adaptive reuse.",
    region: "Universities",
  },
  {
    slug: "community-material-exchange",
    name: "Community Material Exchange",
    description:
      "Local exchanges that connect homeowners, small contractors, and mutual aid groups with reclaimed stock.",
    region: "Local chapters",
  },
];

export function getOrganizationBySlug(slug?: string | null) {
  if (!slug) return null;
  return ORGANIZATION_PARTNERS.find((org) => org.slug === slug) ?? null;
}
