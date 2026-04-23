import { prisma } from "@/lib/db";

/**
 * Pinned + user / smart collections for Media Center left rail.
 * Membership is `OwnedMediaCollectionItem`; assets are never duplicated in storage.
 */
export async function listMediaCenterCollections() {
  try {
    return await prisma.ownedMediaCollection.findMany({
      orderBy: [{ isPinned: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, slug: true, name: true, isSmart: true, isPinned: true, sortOrder: true },
    });
  } catch {
    return [];
  }
}

export async function countItemsInCollection(collectionId: string): Promise<number> {
  if (!collectionId) return 0;
  try {
    return await prisma.ownedMediaCollectionItem.count({ where: { collectionId } });
  } catch {
    return 0;
  }
}
