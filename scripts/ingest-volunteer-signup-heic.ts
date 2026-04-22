/**
 * One-off: ingest hand-shot HEIC signup photos with signup-field designations
 * (matches printed columns: contact lists vs. KGSOS Volunteer + Email list).
 *
 * Usage: npx tsx scripts/ingest-volunteer-signup-heic.ts
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/db";
import { ingestCampaignFileBuffer } from "./ingest-campaign-files-core";
import { loadRedDirtEnv } from "./load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
loadRedDirtEnv(root);

type FieldDesignation = "contact" | "kgsos_volunteer_and_email_list" | "kgsos_email_list_only";

const FILES: Array<{
  name: string;
  title: string;
  fieldDesignation: FieldDesignation;
  operatorNotes: string;
  description: string;
  extraTags: string[];
  enrichment: Record<string, unknown>;
}> = [
  {
    name: "IMG_1281.HEIC",
    title: "Signup photo — Cross County (contact & organizer phone/email list)",
    fieldDesignation: "contact",
    operatorNotes:
      "Handwritten “Cross County” list; phone and email for organizers/roles (not the printed KGSOS volunteer sheet). Treat as contact / leadership directory for intake, not the bilingual Volunteer+Email list columns.",
    description:
      "Field photo: Cross County contact sheet (handwritten). Designation: **contact** — no Volunteer / Email list checkboxes; use for CRM contact records.",
    extraTags: ["volunteer-signup-intake", "signup-field:contact", "source:cross-county"],
    enrichment: { signupIntake: { kgsosPrintedForm: false, designation: "contact" as const } },
  },
  {
    name: "IMG_1282.HEIC",
    title: "Signup photo — Mont Co. Dems (Name, Email, County table)",
    fieldDesignation: "contact",
    operatorNotes:
      "Mont Co. Dems header; columns Name, Email, County. Designation: **contact** list (separate from KGSOS bilingual Volunteer/Email list sheet).",
    description:
      "Field photo: Montgomery County Dems sign-in table. Designation: **contact** (Name/Email/County).",
    extraTags: ["volunteer-signup-intake", "signup-field:contact", "source:montgomery-county-dems"],
    enrichment: { signupIntake: { kgsosPrintedForm: false, designation: "contact" as const } },
  },
  {
    name: "IMG_1283.HEIC",
    title: "KGSOS volunteer & contact sheet (Volunteer + Email list — mixed rows)",
    fieldDesignation: "kgsos_volunteer_and_email_list",
    operatorNotes:
      "Official “Kelly Grappe for Secretary of State — Volunteer & Contact Sign-Up Sheet” with all columns. Rows mix Volunteer Yes/No and Email list Yes. Use this asset when splitting rows by the **Volunteer (Voluntario/a)** and **Email List (Lista de correos)** column values.",
    description:
      "Printed **Volunteer & Contact** signup (bilingual). Designation: **volunteer + email list** — evaluate each row in Volunteer and Email list columns per signer.",
    extraTags: [
      "volunteer-signup-intake",
      "signup-field:volunteer-and-email-list",
      "kgsos-printed-volunteer-form",
    ],
    enrichment: {
      signupIntake: { kgsosPrintedForm: true, designation: "volunteer_and_email_list" as const },
    },
  },
  {
    name: "IMG_1284.HEIC",
    title: "KGSOS signup — email list only (Volunteer column unchecked, Email list Yes)",
    fieldDesignation: "kgsos_email_list_only",
    operatorNotes:
      "Same bilingual KGSOS sheet; visible signers are **email list** opt-ins with Volunteer not checked. Use **Email list** column for segmentation.",
    description:
      "KGSOS volunteer & contact form; these rows are **email list** signups (not volunteering). Designation: **email list** per on-sheet checkmarks.",
    extraTags: [
      "volunteer-signup-intake",
      "signup-field:email-list",
      "kgsos-printed-volunteer-form",
    ],
    enrichment: { signupIntake: { kgsosPrintedForm: true, designation: "email_list_only" as const } },
  },
  {
    name: "IMG_1285.HEIC",
    title: "KGSOS signup — email list only (second capture, same sheet as prior)",
    fieldDesignation: "kgsos_email_list_only",
    operatorNotes:
      "Second photo of the same KGSOS page as the previous file (email-list-only segment). Deduplicate rows against IMG_1284 when building contacts.",
    description:
      "Repeat capture — **email list** signups. Designation: **email list**; possible duplicate of adjacent ingest.",
    extraTags: [
      "volunteer-signup-intake",
      "signup-field:email-list",
      "kgsos-printed-volunteer-form",
      "ingest-duplicate-capture",
    ],
    enrichment: {
      signupIntake: {
        kgsosPrintedForm: true,
        designation: "email_list_only" as const,
        likelyDuplicateOf: "IMG_1284.HEIC",
      },
    },
  },
];

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    // eslint-disable-next-line no-console
    console.error("DATABASE_URL required");
    process.exit(1);
  }

  const baseDir = "c:/Users/User/Downloads";
  const out: { file: string; id?: string; skipped?: string; title?: string }[] = [];

  for (const spec of FILES) {
    const abs = path.join(baseDir, spec.name);
    const buf = await readFile(abs);
    const rel = `manual-heic-volunteer-intake/2026-04/${spec.name}`;
    const result = await ingestCampaignFileBuffer(buf, spec.name, {
      publish: false,
      sourceBundle: "volunteer-signup-heic",
      relativePath: rel,
      preset: "briefing",
      ingestFrom: "device",
      extraIssueTags: [...spec.extraTags, "form-intake-2026-04"],
    });

    if (!result.id) {
      out.push({ file: spec.name, skipped: result.skipped ?? "no id" });
      // eslint-disable-next-line no-console
      console.warn("skip/duplicate", spec.name, result.skipped);
      continue;
    }

    const enr: Prisma.InputJsonValue = {
      ...spec.enrichment,
      fieldDesignation: spec.fieldDesignation,
    };

    await prisma.ownedMediaAsset.update({
      where: { id: result.id },
      data: {
        title: spec.title,
        description: spec.description,
        operatorNotes: spec.operatorNotes,
        enrichmentMetadata: enr,
      },
    });
    // eslint-disable-next-line no-console
    console.log("ingested", spec.name, result.id);
    out.push({ file: spec.name, id: result.id, title: spec.title });
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ok: true, results: out }, null, 2));
  // eslint-disable-next-line no-console
  console.log("Next: npx tsx scripts/link-volunteer-intake-documents.ts  (volunteer sheet intake in admin)");
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
