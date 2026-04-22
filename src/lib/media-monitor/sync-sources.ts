import { ExternalMediaSourceType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { ArkansasMediaSourceSeed } from "./sources/types";

function toEnum(t: ArkansasMediaSourceSeed["sourceType"]): ExternalMediaSourceType {
  const map: Record<ArkansasMediaSourceSeed["sourceType"], ExternalMediaSourceType> = {
    NEWSPAPER: ExternalMediaSourceType.NEWSPAPER,
    NEWS_MAGAZINE: ExternalMediaSourceType.NEWS_MAGAZINE,
    DIGITAL_LOCAL: ExternalMediaSourceType.DIGITAL_LOCAL,
    TV: ExternalMediaSourceType.TV,
    RADIO: ExternalMediaSourceType.RADIO,
    BLOG: ExternalMediaSourceType.BLOG,
    OTHER: ExternalMediaSourceType.OTHER,
  };
  return map[t];
}

export async function upsertExternalMediaSourcesFromSeeds(seeds: ArkansasMediaSourceSeed[]): Promise<void> {
  for (const seed of seeds) {
    const data: Prisma.ExternalMediaSourceCreateInput = {
      slug: seed.slug,
      name: seed.name,
      sourceType: toEnum(seed.sourceType),
      region: seed.region,
      coveredCities: seed.coveredCities,
      homepage: seed.homepage,
      priority: seed.priority,
      rssUrl: seed.rssUrl?.trim() || null,
      sitemapUrl: seed.sitemapUrl?.trim() || null,
      searchUrlTemplate: seed.searchUrlTemplate?.trim() || null,
      discoveryMethods: seed.discoveryMethods,
      notes: seed.notes?.trim() || null,
      isActive: seed.isActive,
    };
    await prisma.externalMediaSource.upsert({
      where: { slug: seed.slug },
      create: data,
      update: {
        name: data.name,
        sourceType: data.sourceType,
        region: data.region,
        coveredCities: data.coveredCities,
        homepage: data.homepage,
        priority: data.priority,
        rssUrl: data.rssUrl,
        sitemapUrl: data.sitemapUrl,
        searchUrlTemplate: data.searchUrlTemplate,
        discoveryMethods: data.discoveryMethods,
        notes: data.notes,
        isActive: data.isActive,
      },
    });
  }
}
