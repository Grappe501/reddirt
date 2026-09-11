import { ARKANSAS_COUNTY_REGISTRY, type ArkansasRegistryCounty } from "@/lib/county/arkansas-county-registry";
import { resolveRegistryCountyFromLabel } from "@/lib/county/resolve-county-label";

export const COUNTY_DROP_SKIP_FOLDERS = new Set([
  "uploads",
  "processed",
  "failed",
  "duplicate",
  "phone-import",
]);

/** Turn a drop-folder name (Johnson-county, VanBuren, Baxter) into a registry county. */
export function resolveCountyFromDropFolderName(folderName: string): ArkansasRegistryCounty | null {
  const raw = folderName.trim();
  if (!raw || COUNTY_DROP_SKIP_FOLDERS.has(raw.toLowerCase())) return null;

  const spaced = raw
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const withoutCounty = spaced.replace(/\s+county$/i, "").trim();

  return (
    resolveRegistryCountyFromLabel(spaced) ??
    resolveRegistryCountyFromLabel(`${withoutCounty} County`) ??
    ARKANSAS_COUNTY_REGISTRY.find((c) => {
      const short = c.displayName.replace(/\s+County$/i, "");
      return short.toLowerCase() === withoutCounty.toLowerCase();
    }) ??
    null
  );
}
