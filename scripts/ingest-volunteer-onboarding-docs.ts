/**
 * Ingest volunteer onboarding / org reference files into owned media (community-training lane) +
 * `volunteer-onboarding` tag for product work: onboarding flows, workflow templates, volunteer management.
 *
 * Default sources: project owner Downloads. Override:
 *   set VOL_ONBOARDING_DOC_PPTX, VOL_ONBOARDING_DOC_PDF
 *
 * Usage (from RedDirt): npx tsx scripts/ingest-volunteer-onboarding-docs.ts
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Prisma } from "@prisma/client";
import { VOLUNTEER_ONBOARDING_TAG } from "../src/lib/campaign-briefings/briefing-queries";
import { prisma } from "../src/lib/db";
import { ingestCampaignFileBuffer } from "./ingest-campaign-files-core";
import { loadRedDirtEnv } from "./load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

const DEFAULT_PPTX = "c:/Users/User/Downloads/Vol organization (3).pptx";
const DEFAULT_PDF = "c:/Users/User/Downloads/Volunteer Welcome Kit.pdf";

const DOCS: Array<{
  pathEnv: "VOL_ONBOARDING_DOC_PPTX" | "VOL_ONBOARDING_DOC_PDF";
  defaultAbs: string;
  rel: string;
  title: string;
  operatorNotes: string;
}> = [
  {
    pathEnv: "VOL_ONBOARDING_DOC_PPTX",
    defaultAbs: DEFAULT_PPTX,
    rel: "volunteer-onboarding/Vol-organization-3.pptx",
    title: "Volunteer organization structure (deck)",
    operatorNotes:
      "Reference: volunteer org model for onboarding/workflow design. PowerPoint: full text extraction is limited in ingest; open file in /admin/owned-media or export to PDF for search coverage.",
  },
  {
    pathEnv: "VOL_ONBOARDING_DOC_PDF",
    defaultAbs: DEFAULT_PDF,
    rel: "volunteer-onboarding/Volunteer-Welcome-Kit.pdf",
    title: "Volunteer Welcome Kit",
    operatorNotes:
      "Reference: welcome kit for volunteer onboarding and comms. Use when designing site copy, workbench comms, and task templates.",
  },
];

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    // eslint-disable-next-line no-console
    console.error("DATABASE_URL required");
    process.exit(1);
  }

  const out: { id: string; title: string; fileName: string; skipped?: string }[] = [];

  for (const d of DOCS) {
    const abs = (process.env[d.pathEnv]?.trim() || d.defaultAbs).replace(/\\/g, "/");
    let buf: Buffer;
    try {
      buf = await readFile(abs);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`[skip] cannot read ${abs}:`, e);
      out.push({ id: "", title: d.title, fileName: path.basename(abs), skipped: "file not found" });
      continue;
    }
    const fileName = path.basename(abs);
    const result = await ingestCampaignFileBuffer(buf, fileName, {
      publish: false,
      sourceBundle: "volunteer-onboarding",
      relativePath: d.rel,
      preset: "community-training",
      ingestFrom: "folder",
      extraIssueTags: [VOLUNTEER_ONBOARDING_TAG, "volunteer-welcome", "product-reference"],
    });
    if (!result.id) {
      out.push({ id: "", title: d.title, fileName, skipped: result.skipped });
      // eslint-disable-next-line no-console
      console.warn("ingest skip", fileName, result.skipped);
      continue;
    }
    const meta: Prisma.InputJsonValue = {
      volunteerOnboarding: true,
      useCase: "onboarding_workflow_volunteer_management",
      sourcePathHint: d.rel,
    };
    await prisma.ownedMediaAsset.update({
      where: { id: result.id },
      data: {
        title: d.title,
        operatorNotes: d.operatorNotes,
        enrichmentMetadata: meta,
      },
    });
    // eslint-disable-next-line no-console
    console.log("ingested", result.id, d.title);
    out.push({ id: result.id, title: d.title, fileName });
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ok: true, results: out }, null, 2));
  await prisma.$disconnect();
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
