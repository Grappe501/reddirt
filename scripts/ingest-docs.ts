/**
 * Usage: npx tsx scripts/ingest-docs.ts
 * Requires DATABASE_URL + OPENAI_API_KEY
 */
import { prisma } from "../src/lib/db";
import { loadAllDocChunks } from "../src/lib/content/loadDocs";
import { embedTexts } from "../src/lib/openai/embeddings";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const pageSeeds = [
  {
    path: "route:/",
    title: "Home",
    content:
      "Kelly Grappe for Arkansas Secretary of State: fair elections, transparent administration, service in all 75 counties, bipartisan outreach, ballot access education.",
  },
  {
    path: "route:/direct-democracy",
    title: "Direct Democracy",
    content:
      "Ballot initiatives, referenda, signature processes, and how the Secretary of State’s office relates to voter access.",
  },
  {
    path: "route:/priorities",
    title: "Office priorities",
    content:
      "Secretary of State responsibilities: elections, public records, business filings—focused on competence, clarity, and trust.",
  },
  {
    path: "route:/get-involved",
    title: "Get Involved",
    content: "Volunteer, invite the campaign to local meetings, stay connected, county organizing.",
  },
  {
    path: "route:/stories",
    title: "Stories",
    content:
      "Arkansas voices: voting, organizing, rural life, community resilience. Story archive with categories and submissions.",
  },
  {
    path: "route:/editorial",
    title: "Editorial",
    content:
      "Movement essays: participation, trust, direct democracy practice, future of work, local power, rebuilding civic faith.",
  },
  {
    path: "route:/explainers",
    title: "Explainers",
    content:
      "Plain-language explainers: referendums, ballot initiatives, collective bargaining, local organizing, petition pipelines.",
  },
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY required");

  const docChunks = await loadAllDocChunks(repoRoot);
  const seeded = pageSeeds.map((p, chunkIndex) => ({
    path: p.path,
    title: p.title,
    chunkIndex,
    content: p.content,
  }));

  const all = [...docChunks, ...seeded];
  console.log(`Ingesting ${all.length} chunks…`);

  const batchSize = 16;
  for (let i = 0; i < all.length; i += batchSize) {
    const batch = all.slice(i, i + batchSize);
    const embeddings = await embedTexts(batch.map((b) => `${b.title}\n\n${b.content}`));
    for (let j = 0; j < batch.length; j++) {
      const b = batch[j];
      await prisma.searchChunk.upsert({
        where: { path_chunkIndex: { path: b.path, chunkIndex: b.chunkIndex } },
        create: {
          path: b.path,
          title: b.title,
          chunkIndex: b.chunkIndex,
          content: b.content,
          embedding: JSON.stringify(embeddings[j]),
        },
        update: {
          title: b.title,
          content: b.content,
          embedding: JSON.stringify(embeddings[j]),
        },
      });
    }
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
