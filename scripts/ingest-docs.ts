/**
 * Usage: npm run ingest  (from repo root)
 * Requires DATABASE_URL + OPENAI_API_KEY
 * Loads: markdown under docs/ (including docs/background/campaign-team-positions/ after `npm run sync:team-positions`),
 * structured site content (explainers, stories, editorial, events, regions, homepage/toolkit/press extras), and route seeds.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";
import { prisma } from "../src/lib/db";
import { loadAllDocChunks } from "../src/lib/content/loadDocs";
import { loadStructuredSiteChunks } from "../src/lib/content/structuredSearchChunks";
import { embedTexts } from "../src/lib/openai/embeddings";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
/** Prefer .env / .env.local over a stale shell or Windows user OPENAI_API_KEY. */
const shellOpenAiKey = process.env.OPENAI_API_KEY?.trim();
delete process.env.OPENAI_API_KEY;
loadEnvConfig(repoRoot);

const pageSeeds = [
  {
    path: "route:/",
    title: "Home",
    content:
      "Kelly Grappe for Arkansas Secretary of State: fair elections, transparent administration, service in all 75 counties, bipartisan outreach, ballot access education.",
  },
  {
    path: "route:/about",
    title: "About Kelly",
    content:
      "Kelly’s story, values, and why she is running for Secretary of State—farming roots, public service, transparent elections, and respect for every county.",
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
    path: "route:/civic-depth",
    title: "Civic depth",
    content: "Deeper civic context for the office: elections administration, records, and how Arkansans interact with state government.",
  },
  {
    path: "route:/understand",
    title: "Understand the office",
    content:
      "What the Secretary of State does in Arkansas: elections, business services, constitutional duties—plain language overview.",
  },
  {
    path: "route:/what-we-believe",
    title: "What we stand for",
    content: "Campaign principles: fair process, transparency, service to all 75 counties, and nonpartisan administration of the law.",
  },
  {
    path: "route:/voter-registration",
    title: "Voter registration center",
    content:
      "Register to vote, Arkansas paper registration, VoterView official lookup, county help, and how the campaign tracks registration organizing metrics.",
  },
  {
    path: "route:/from-the-road",
    title: "From the Road",
    content:
      "Campaign field journal: notebook, social channels, video, and approved trail updates in one place for voters who do not live in social apps.",
  },
  {
    path: "route:/press-coverage",
    title: "Press coverage",
    content: "Earned media and news clips the campaign monitors—approved links to original reporting.",
  },
  {
    path: "route:/events",
    title: "Events",
    content: "Campaign calendar: rallies, trainings, festivals, and public appearances across Arkansas.",
  },
  {
    path: "route:/listening-sessions",
    title: "Election listening sessions",
    content: "Facilitated conversations for voters and clerks to share concerns about elections and the Secretary of State’s role.",
  },
  {
    path: "route:/local-organizing",
    title: "Local organizing",
    content: "County and regional organizing: teams, hosts, trainings, and pathways to plug in near home.",
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
  {
    path: "route:/resources",
    title: "Resources",
    content: "Toolkits, explainers, briefing materials, and field education for organizers and curious voters.",
  },
  {
    path: "route:/donate",
    title: "Donate",
    content: "Support the campaign: compliance-friendly contribution paths for Kelly Grappe for Secretary of State.",
  },
  {
    path: "route:/explainers",
    title: "Explainers hub",
    content:
      "Plain-language explainers on referendums, ballot initiatives, collective bargaining, local organizing, and what happens after you sign a petition—education for Arkansas voters and organizers.",
  },
  {
    path: "route:/host-a-gathering",
    title: "Host a gathering",
    content:
      "Host a porch circle, coffee meetup, or small community conversation—pathways and guidance for opening your space to neighbors and the campaign.",
  },
  {
    path: "route:/start-a-local-team",
    title: "Start a local team",
    content:
      "Start or join a county registration and organizing team—mentor support, field structure, and local pathways to plug in.",
  },
  {
    path: "route:/campaign-calendar",
    title: "Campaign calendar",
    content:
      "Public campaign calendar: appearances, trainings, festivals, and scheduled events across Arkansas (synced from CampaignOS where configured).",
  },
  {
    path: "route:/direct-democracy/ballot-initiative-process",
    title: "How initiatives reach the ballot",
    content:
      "Arkansas ballot initiative process: drafting, Attorney General review, signature thresholds, deadlines, and how measures qualify for the ballot.",
  },
  {
    path: "route:/voter-registration/assistance",
    title: "Voter registration assistance (campaign)",
    content:
      "Campaign-side help with registration questions—not a substitute for the Secretary of State’s official VoterView lookup; clearly labeled assistance for volunteers and voters.",
  },
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");

  const openaiKey = process.env.OPENAI_API_KEY?.trim() || shellOpenAiKey;
  if (openaiKey) {
    process.env.OPENAI_API_KEY = openaiKey;
  }
  const skipEmbeddings =
    process.env.INGEST_SKIP_EMBEDDINGS === "1" || process.env.INGEST_KEYWORD_ONLY === "1" || !openaiKey;
  if (skipEmbeddings) {
    console.warn(
      "[ingest] No embeddings: set OPENAI_API_KEY (unset INGEST_SKIP_EMBEDDINGS) for semantic search + RAG answers. Storing empty vectors — keyword search still works.",
    );
  }

  const docChunks = await loadAllDocChunks(repoRoot);
  const structuredChunks = loadStructuredSiteChunks();
  const seeded = pageSeeds.map((p) => ({
    path: p.path,
    title: p.title,
    chunkIndex: 0,
    content: p.content,
  }));

  const all = [...docChunks, ...structuredChunks, ...seeded];
  console.log(
    `Ingesting ${all.length} chunks (docs: ${docChunks.length}, structured: ${structuredChunks.length}, route seeds: ${seeded.length})…`,
  );

  await prisma.searchChunk.deleteMany();

  const batchSize = 16;
  let embeddingUnavailable = skipEmbeddings;
  for (let i = 0; i < all.length; i += batchSize) {
    const batch = all.slice(i, i + batchSize);
    let embeddings: number[][];
    if (embeddingUnavailable) {
      embeddings = batch.map(() => []);
    } else {
      try {
        embeddings = await embedTexts(batch.map((b) => `${b.title}\n\n${b.content}`));
      } catch (err) {
        console.warn(
          "[ingest] OpenAI embeddings failed — remaining chunks use empty vectors (keyword search only). Fix OPENAI_API_KEY and run ingest again for semantic search.",
          err instanceof Error ? err.message : err,
        );
        embeddingUnavailable = true;
        embeddings = batch.map(() => []);
      }
    }
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
