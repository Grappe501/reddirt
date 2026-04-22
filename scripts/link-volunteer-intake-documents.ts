/**
 * Create SignupSheetDocument rows for owned media from `ingest-volunteer-signup-heic.ts`.
 * Safe to re-run (skips if document already exists).
 *
 * Usage: npx tsx scripts/link-volunteer-intake-documents.ts
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SignupSheetDocumentStatus } from "@prisma/client";
import { prisma } from "../src/lib/db";
import { loadRedDirtEnv } from "./load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

const items: { id: string; notes: string }[] = [
  {
    id: "f97e01e0-8c79-4243-8b19-028786d4d4f1",
    notes: "IMG_1281 — contact (Cross County). Not KGSOS checkboxes; map rows as contacts/organizers.",
  },
  {
    id: "50fa840d-ddd2-4b38-9b86-3a6f9ada9343",
    notes: "IMG_1282 — contact (Mont Co. Dems Name/Email/County).",
  },
  {
    id: "cf28b4bf-dc11-4c39-85b0-bde02022ca8a",
    notes: "IMG_1283 — KGSOS form: use Volunteer and Email list columns per row (mixed Y/N).",
  },
  {
    id: "93870a05-90cc-46b2-bc87-5f87158a9aed",
    notes: "IMG_1284 — KGSOS: email list opt-ins; Volunteer unchecked. Segment as email list.",
  },
  {
    id: "ca5065c5-7b12-4e70-a195-30e01edf959d",
    notes: "IMG_1285 — duplicate capture of 1284; dedupe rows.",
  },
];

async function main() {
  for (const { id, notes } of items) {
    const ex = await prisma.signupSheetDocument.findUnique({ where: { ownedMediaId: id } });
    if (ex) {
      // eslint-disable-next-line no-console
      console.log("exists", id, ex.id);
      continue;
    }
    const doc = await prisma.signupSheetDocument.create({
      data: { ownedMediaId: id, status: SignupSheetDocumentStatus.DRAFT, notes },
    });
    // eslint-disable-next-line no-console
    console.log("created", id, "doc", doc.id);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
