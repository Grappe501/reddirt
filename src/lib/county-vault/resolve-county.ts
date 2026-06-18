import { prisma } from "@/lib/db";
import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";

export type ResolvedDbCounty = {
  id: string | null;
  slug: string;
  fips: string | null;
  displayName: string;
};

/** Maps election-plan short slugs (`faulkner`) or full slugs (`faulkner-county`) to DB county row when present. */
export async function resolveDbCountyForVault(inputSlug: string): Promise<ResolvedDbCounty | null> {
  const candidates = [
    inputSlug,
    inputSlug.endsWith("-county") ? inputSlug : `${inputSlug}-county`,
    inputSlug.replace(/-county$/, ""),
  ].filter((v, i, a) => a.indexOf(v) === i);

  for (const slug of candidates) {
    const row = await prisma.county.findFirst({
      where: { slug },
      select: { id: true, slug: true, fips: true, displayName: true },
    });
    if (row) return row;
  }

  const reg =
    candidates.map((s) => getRegistryCountyBySlug(s)).find(Boolean) ?? null;
  if (reg) {
    return { id: null, slug: reg.slug, fips: reg.fips, displayName: reg.displayName };
  }

  return null;
}
