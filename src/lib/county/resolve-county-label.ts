import {
  ARKANSAS_COUNTY_REGISTRY,
  getRegistryCountyBySlug,
  type ArkansasRegistryCounty,
} from "@/lib/county/arkansas-county-registry";

/** Resolve free-text county labels from calendar/events to registry rows. */
export function resolveRegistryCountyFromLabel(label: string | null | undefined): ArkansasRegistryCounty | null {
  if (!label?.trim()) return null;
  const raw = label.trim();
  const lower = raw.toLowerCase();
  const bySlug = getRegistryCountyBySlug(lower.replace(/\s+county$/i, "").replace(/\s+/g, "-"));
  if (bySlug) return bySlug;
  const direct = getRegistryCountyBySlug(lower);
  if (direct) return direct;
  const stripped = lower.replace(/\s+county$/i, "").trim();
  return (
    ARKANSAS_COUNTY_REGISTRY.find(
      (c) =>
        c.displayName.toLowerCase() === lower ||
        c.displayName.toLowerCase().replace(/\s+county$/i, "") === stripped ||
        c.slug === stripped,
    ) ?? null
  );
}
