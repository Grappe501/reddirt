/**
 * Surface DB rows that may inform a "policies / priorities / first 100 days" section.
 * Run: npx tsx scripts/query-policy-priorities-corpus.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const KEYWORDS = [
  "priorit",
  "100 day",
  "first 100",
  "hundred day",
  "once elected",
  "when elected",
  "first days",
  "platform",
  "secretary of state",
  "SOS ",
];

async function main() {
  const blocks = await prisma.adminContentBlock.findMany({
    where: {
      OR: [
        { pageKey: { contains: "priorit", mode: "insensitive" } },
        { label: { contains: "priorit", mode: "insensitive" } },
      ],
    },
    select: { pageKey: true, blockKey: true, blockType: true, label: true, payload: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const allPageKeys = await prisma.adminContentBlock.groupBy({
    by: ["pageKey"],
    _count: true,
  });

  const homepage = await prisma.homepageConfig.findUnique({
    where: { id: "default" },
  });

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  const posts = await prisma.syncedPost.findMany({
    where: {
      OR: KEYWORDS.flatMap((k) => [
        { title: { contains: k, mode: "insensitive" } },
        { teaserOverride: { contains: k, mode: "insensitive" } },
      ]),
    },
    take: 25,
    select: { slug: true, title: true, teaserOverride: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const inbound = await prisma.inboundContentItem.findMany({
    where: {
      OR: KEYWORDS.flatMap((k) => [
        { title: { contains: k, mode: "insensitive" } },
        { excerpt: { contains: k, mode: "insensitive" } },
      ]),
    },
    take: 25,
    select: { id: true, title: true, excerpt: true, issueTags: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  console.log("=== AdminContentBlock (priority-ish filter) ===", blocks.length);
  for (const b of blocks) {
    const payloadPreview =
      b.payload && typeof b.payload === "object"
        ? JSON.stringify(b.payload).slice(0, 400)
        : "";
    console.log(`${b.pageKey}/${b.blockKey} (${b.blockType})`, b.label ?? "", payloadPreview);
  }

  console.log("\n=== AdminContentBlock pageKey counts ===");
  console.log(allPageKeys);

  console.log("\n=== HomepageConfig (truncated) ===");
  if (homepage) {
    const { id: _id, updatedAt, ...rest } = homepage;
    console.log(JSON.stringify(rest, null, 2).slice(0, 5000));
    console.log("… updatedAt:", updatedAt);
  } else {
    console.log("(none)");
  }

  console.log("\n=== SiteSettings.adminNotes (first 1500 chars) ===");
  console.log(settings?.adminNotes?.slice(0, 1500) ?? "(null)");

  console.log("\n=== SyncedPost keyword hits ===", posts.length);
  for (const p of posts) console.log(`  ${p.slug}: ${p.title}`);

  console.log("\n=== InboundContentItem keyword hits ===", inbound.length);
  for (const r of inbound) {
    const ex = r.excerpt?.slice(0, 100)?.replace(/\s+/g, " ");
    console.log(`  ${r.id}: ${r.title} — ${ex}…`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
