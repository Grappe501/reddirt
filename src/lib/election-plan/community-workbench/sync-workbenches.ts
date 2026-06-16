import { prisma } from "@/lib/db";

import { buildCommunityWorkbenchRegistry } from "./build-registry";

let syncPromise: Promise<void> | null = null;

/** Upsert registry rows into DB — idempotent; safe on every page load. */
export async function ensureCommunityWorkbenchesSynced(): Promise<void> {
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    const registry = buildCommunityWorkbenchRegistry();
    try {
      await Promise.all(
        registry.map((entry) =>
          prisma.communityWorkbench.upsert({
            where: { slug: entry.slug },
            create: {
              slug: entry.slug,
              name: entry.name,
              kind: entry.kind,
              countySlug: entry.countySlug,
              citySlug: entry.citySlug,
              kpiTemplate: entry.kpiTemplate,
              tagline: entry.tagline,
              population: entry.population,
            },
            update: {
              name: entry.name,
              kind: entry.kind,
              countySlug: entry.countySlug,
              citySlug: entry.citySlug,
              kpiTemplate: entry.kpiTemplate,
              tagline: entry.tagline,
            },
          }),
        ),
      );
    } catch {
      // DB unavailable — pages still render from registry fallback
    } finally {
      syncPromise = null;
    }
  })();

  return syncPromise;
}
