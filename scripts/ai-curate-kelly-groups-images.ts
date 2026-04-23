/**
 * Vision pass: score imported images for “Kelly interacting with groups / crowds / community”
 * and store results on OwnedMediaAsset.enrichmentMetadata.aiGroupCuration for the public gallery.
 *
 * Usage (RedDirt/):
 *   npx tsx scripts/ai-curate-kelly-groups-images.ts              # dry-run
 *   npx tsx scripts/ai-curate-kelly-groups-images.ts --apply       # write metadata
 *   npx tsx scripts/ai-curate-kelly-groups-images.ts --apply --limit 25
 *   npx tsx scripts/ai-curate-kelly-groups-images.ts --apply --force  # re-score even if aiGroupCuration exists
 *
 * Uses OPENAI_API_KEY and OPENAI_VISION_MODEL (default: gpt-4o-mini).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Prisma } from "@prisma/client";
import { OwnedMediaKind, OwnedMediaReviewStatus } from "@prisma/client";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { prisma } from "../src/lib/db";
import { readOwnedMediaFile } from "../src/lib/owned-media/storage";
import { getOpenAIClient } from "../src/lib/openai/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
loadRedDirtEnv(root);

const MAX_BYTES = 18 * 1024 * 1024;
const VISION_DETAIL: "low" | "high" = "low";

type VisionResult = {
  group_interaction_score: number;
  kelly_likely_present: boolean;
  crowd_or_group_likely: boolean;
  suggested_alt_text: string;
  scene_summary: string;
  rationale: string;
};

function parseArgs() {
  const argv = process.argv.slice(2);
  return {
    apply: argv.includes("--apply"),
    force: argv.includes("--force"),
    limit: (() => {
      const i = argv.indexOf("--limit");
      if (i === -1 || !argv[i + 1]) return undefined;
      const n = parseInt(argv[i + 1]!, 10);
      return Number.isFinite(n) && n > 0 ? n : undefined;
    })(),
  };
}

function mergeMeta(existing: unknown, patch: Record<string, unknown>): Prisma.InputJsonValue {
  const base =
    existing && typeof existing === "object" && !Array.isArray(existing) ? { ...(existing as object) } : {};
  return { ...base, ...patch } as Prisma.InputJsonValue;
}

async function scoreImage(buffer: Buffer, mime: string, fileName: string): Promise<VisionResult> {
  const model = process.env.OPENAI_VISION_MODEL?.trim() || "gpt-4o-mini";
  const client = getOpenAIClient();
  const b64 = buffer.toString("base64");
  const dataUrl = `data:${mime};base64,${b64}`;

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You curate photos for an Arkansas Secretary of State campaign website.
Score how well this image shows the candidate (Kelly Grappe — often in field / community settings) visibly engaging with **groups**: meetings, crowds, roundtables, listening sessions, rallies, porch gatherings, or several people in frame (not a lone headshot or empty graphic).

Return STRICT JSON:
{
  "group_interaction_score": number from 0 to 1 (use decimals),
  "kelly_likely_present": boolean,
  "crowd_or_group_likely": boolean,
  "suggested_alt_text": string max 140 chars, accessible, e.g. "Kelly Grappe speaks with voters at a community gathering in Arkansas",
  "scene_summary": string max 200 chars, voter-facing caption,
  "rationale": string brief
}

Score guidance:
- 0.75–1.0: clear multi-person interaction, event energy, candidate appears engaged with others
- 0.5–0.74: group context but candidate unclear or partially visible; still usable with caption
- Below 0.5: logos, screenshots, documents, single portrait, back turned with no context, stock abstract, or no people`,
      },
      {
        role: "user",
        content: [
          { type: "text", text: `File name: ${fileName}\nRespond with JSON only.` },
          {
            type: "image_url",
            image_url: { url: dataUrl, detail: VISION_DETAIL },
          },
        ],
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error("Empty vision response");
  const parsed = JSON.parse(raw) as VisionResult;
  if (typeof parsed.group_interaction_score !== "number") {
    throw new Error("Invalid response: group_interaction_score");
  }
  parsed.group_interaction_score = Math.max(0, Math.min(1, parsed.group_interaction_score));
  return parsed;
}

async function main() {
  const { apply, force, limit } = parseArgs();

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL required");
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY?.trim()) {
    console.error("OPENAI_API_KEY required");
    process.exit(1);
  }

  const model = process.env.OPENAI_VISION_MODEL?.trim() || "gpt-4o-mini";

  const rows = await prisma.ownedMediaAsset.findMany({
    where: {
      kind: OwnedMediaKind.IMAGE,
      isPublic: true,
      reviewStatus: OwnedMediaReviewStatus.APPROVED,
      mimeType: { startsWith: "image/" },
    },
    select: {
      id: true,
      fileName: true,
      title: true,
      mimeType: true,
      storageKey: true,
      fileSizeBytes: true,
      enrichmentMetadata: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit ?? 500,
  });

  console.log(
    `[kelly-groups-vision] ${apply ? "APPLY" : "DRY-RUN"} — ${rows.length} approved public image(s), model=${model}\n`,
  );

  let processed = 0;
  let skipped = 0;

  for (const row of rows) {
    const meta = row.enrichmentMetadata as Record<string, unknown> | null;
    if (!force && meta?.aiGroupCuration && typeof meta.aiGroupCuration === "object") {
      skipped += 1;
      continue;
    }

    if (row.mimeType.includes("heic") || row.mimeType.includes("heif")) {
      console.log(`[skip] ${row.id} HEIC not sent to vision in this pass: ${row.fileName}`);
      skipped += 1;
      continue;
    }

    if (row.fileSizeBytes > MAX_BYTES) {
      console.log(`[skip] ${row.id} too large (${row.fileSizeBytes} bytes): ${row.fileName}`);
      skipped += 1;
      continue;
    }

    let buffer: Buffer;
    try {
      buffer = await readOwnedMediaFile(row.storageKey);
    } catch {
      console.warn(`[skip] ${row.id} read failed: ${row.fileName}`);
      skipped += 1;
      continue;
    }

    let vision: VisionResult;
    try {
      vision = await scoreImage(buffer, row.mimeType, row.fileName);
    } catch (e) {
      console.error(`[error] ${row.id} ${row.fileName}:`, e instanceof Error ? e.message : e);
      continue;
    }

    processed += 1;
    const curation = {
      scannedAt: new Date().toISOString(),
      model,
      groupInteractionScore: vision.group_interaction_score,
      kellyLikelyPresent: vision.kelly_likely_present,
      crowdOrGroupLikely: vision.crowd_or_group_likely,
      suggestedAltText: vision.suggested_alt_text?.slice(0, 200) ?? "",
      sceneSummary: vision.scene_summary?.slice(0, 300) ?? "",
      rationale: vision.rationale?.slice(0, 500) ?? "",
    };

    console.log(
      `[${vision.group_interaction_score.toFixed(2)}] ${row.fileName} — ${vision.scene_summary.slice(0, 80)}`,
    );

    if (apply) {
      await prisma.ownedMediaAsset.update({
        where: { id: row.id },
        data: {
          enrichmentMetadata: mergeMeta(row.enrichmentMetadata, { aiGroupCuration: curation }),
        },
      });
    }

    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\n[kelly-groups-vision] done. scored=${processed}, skipped=${skipped}${apply ? "" : " (no writes)"}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => {});
  });
