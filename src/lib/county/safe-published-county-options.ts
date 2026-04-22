import { prisma } from "@/lib/db";
import { isPrismaDatabaseUnavailable, logPrismaDatabaseUnavailable } from "@/lib/prisma-connectivity";

/** County pick lists for public forms when the DB is optional; empty if Postgres is down. */
export async function safePublishedCountyOptions(): Promise<{ id: string; displayName: string }[]> {
  try {
    return await prisma.county.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, displayName: true },
    });
  } catch (e) {
    if (isPrismaDatabaseUnavailable(e)) {
      logPrismaDatabaseUnavailable("safePublishedCountyOptions", e);
      return [];
    }
    throw e;
  }
}

export async function safePublishedCountyOptionsWithSlug(): Promise<{ id: string; slug: string; displayName: string }[]> {
  try {
    return await prisma.county.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, slug: true, displayName: true },
    });
  } catch (e) {
    if (isPrismaDatabaseUnavailable(e)) {
      logPrismaDatabaseUnavailable("safePublishedCountyOptionsWithSlug", e);
      return [];
    }
    throw e;
  }
}
