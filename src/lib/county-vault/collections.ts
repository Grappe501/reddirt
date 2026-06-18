import { prisma } from "@/lib/db";

export function countyVaultCollectionSlug(countySlug: string): string {
  return `county-${countySlug}-vault`;
}

/** Ensures a smart collection exists for county-scoped vault browsing in Media Center. */
export async function ensureCountyVaultCollection(countySlug: string, displayName: string) {
  const slug = countyVaultCollectionSlug(countySlug);
  return prisma.ownedMediaCollection.upsert({
    where: { slug },
    create: {
      slug,
      name: `${displayName} Media Vault`,
      description: `County-scoped media vault for ${displayName} — photos, videos, documents uploaded via county dashboard.`,
      isSmart: true,
      isPinned: false,
      filterJson: { countySlug },
      sortOrder: 0,
    },
    update: {},
  });
}

export async function addAssetToCountyCollection(collectionId: string, ownedMediaId: string, sortOrder = 0) {
  await prisma.ownedMediaCollectionItem.upsert({
    where: { collectionId_ownedMediaId: { collectionId, ownedMediaId } },
    create: { collectionId, ownedMediaId, sortOrder },
    update: {},
  });
}
