/**
 * One-off / maintenance: surface DB rows that may inform elections messaging.
 * Run: npx tsx scripts/query-elections-corpus.ts
 * Requires DATABASE_URL (no secrets printed).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const synced = await prisma.syncedPost.findMany({
    where: {
      OR: [
        { title: { contains: "election", mode: "insensitive" } },
        { title: { contains: "voter", mode: "insensitive" } },
        { title: { contains: "ballot", mode: "insensitive" } },
      ],
    },
    take: 20,
    select: { slug: true, title: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const inbound = await prisma.inboundContentItem.findMany({
    where: {
      OR: [
        { title: { contains: "election", mode: "insensitive" } },
        { excerpt: { contains: "election", mode: "insensitive" } },
      ],
    },
    take: 20,
    select: { id: true, title: true, excerpt: true, publishedAt: true, issueTags: true },
    orderBy: { publishedAt: "desc" },
  });

  console.log("SyncedPost (sample):", synced.length);
  for (const r of synced) console.log(`  - ${r.slug}: ${r.title}`);
  console.log("InboundContentItem (sample):", inbound.length);
  for (const r of inbound) {
    const ex = r.excerpt?.slice(0, 120)?.replace(/\s+/g, " ") ?? "";
    console.log(`  - ${r.id}: ${r.title} — ${ex}…`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
