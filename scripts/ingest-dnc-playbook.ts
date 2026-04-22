/**
 * Ingest the DNC Playbook (or override path) as staff-only owned media for coordination / ideas.
 * Tags: admin-strategy-reference, dnc-playbook, staff-coordination (searchable in campaign brain).
 *
 *   set DNC_PLAYBOOK_PDF=...   (default: user Downloads DNC Playbook _ 3.30.26.pdf)
 *
 * Usage: npx tsx scripts/ingest-dnc-playbook.ts
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Prisma } from "@prisma/client";
import {
  ADMIN_STRATEGY_REFERENCE_TAG,
  DNC_PLAYBOOK_TAG,
} from "../src/lib/campaign-briefings/briefing-queries";
import { prisma } from "../src/lib/db";
import { ingestCampaignFileBuffer } from "./ingest-campaign-files-core";
import { loadRedDirtEnv } from "./load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

const DEFAULT_PDF = "c:/Users/User/Downloads/DNC Playbook _ 3.30.26.pdf";
const REL = "admin-strategy/DNC-Playbook-3.30.26.pdf";
const TITLE = "DNC Playbook (Mar 2026)";

const OPERATOR_NOTES =
  "Staff reference: coordination, messaging, and tactical ideas. Not for public release. " +
  "Open in owned media; search the campaign brain with tags dnc-playbook or admin-strategy-reference.";

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    // eslint-disable-next-line no-console
    console.error("DATABASE_URL required");
    process.exit(1);
  }

  const abs = (process.env.DNC_PLAYBOOK_PDF?.trim() || DEFAULT_PDF).replace(/\\/g, "/");
  let buf: Buffer;
  try {
    buf = await readFile(abs);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Cannot read playbook file:", abs, e);
    process.exit(1);
  }

  const fileName = path.basename(abs);
  const result = await ingestCampaignFileBuffer(buf, fileName, {
    publish: false,
    sourceBundle: "dnc-playbook",
    relativePath: REL,
    preset: "comms",
    ingestFrom: "folder",
    extraIssueTags: [ADMIN_STRATEGY_REFERENCE_TAG, DNC_PLAYBOOK_TAG, "staff-coordination"],
  });

  if (!result.id) {
    // eslint-disable-next-line no-console
    console.error("ingest failed:", result.skipped);
    process.exit(1);
  }

  const meta: Prisma.InputJsonValue = {
    adminStrategyReference: true,
    dncPlaybook: true,
    useCase: "staff_coordination_messaging_ideas",
    sourcePathHint: REL,
  };

  await prisma.ownedMediaAsset.update({
    where: { id: result.id },
    data: {
      title: TITLE,
      operatorNotes: OPERATOR_NOTES,
      enrichmentMetadata: meta,
    },
  });

  // eslint-disable-next-line no-console
  console.log("ingested", result.id, TITLE);
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ok: true, id: result.id, title: TITLE, fileName }, null, 2));
  await prisma.$disconnect();
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
