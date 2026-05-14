import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export const gotvHelpWayValues = [
  "host_house_party",
  "bring_5_commitments",
  "make_calls",
  "write_postcards",
  "help_at_events",
  "drive_people",
  "translation_access",
  "local_guide",
  "photos_video",
  "fundraiser_host",
] as const;

export const gotvCommitmentCardSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().transform((v) => (v?.trim() ? v.trim() : undefined)),
  county: z.string().min(1).max(80),
  city: z.string().max(120).optional().transform((v) => (v?.trim() ? v.trim() : undefined)),
  zip: z.string().min(3).max(12),
  commitmentConfirmed: z.boolean().refine((v) => v === true, "Please confirm the commitment."),
  waysToHelp: z.array(z.enum(gotvHelpWayValues)).default([]),
  optInEmail: z.boolean().default(false),
  optInSms: z.boolean().default(false),
  optInPhone: z.boolean().default(false),
  languageAccessSkills: z.string().max(1000).optional().transform((v) => (v?.trim() ? v.trim() : undefined)),
  notes: z.string().max(2000).optional().transform((v) => (v?.trim() ? v.trim() : undefined)),
  website: z.string().optional().refine((v) => !v || v.length === 0, "Spam detected."),
});

export type GotvCommitmentCardInput = z.infer<typeof gotvCommitmentCardSchema>;

export type GotvCommitmentCardPersistResult =
  | { ok: true; mode: "db"; workflowIntakeId: string; submissionId: string; userId: string }
  | { ok: true; mode: "staged"; stagedId: string };

function summary(input: GotvCommitmentCardInput): string {
  return [
    `${input.name} committed to help 5 people make a plan to vote.`,
    `County: ${input.county}`,
    input.city ? `City: ${input.city}` : null,
    `ZIP: ${input.zip}`,
    input.phone ? `Phone: ${input.phone}` : null,
    `Ways to help: ${input.waysToHelp.join(", ") || "unspecified"}`,
    `Opt-ins: email=${input.optInEmail}; sms=${input.optInSms}; phone=${input.optInPhone}`,
    input.languageAccessSkills ? `Language/access skills: ${input.languageAccessSkills}` : null,
    input.notes ? `Notes: ${input.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

async function findCountyId(county: string): Promise<string | null> {
  const clean = county.replace(/\s+County$/i, "").trim();
  const row = await prisma.county.findFirst({
    where: {
      OR: [
        { displayName: { equals: clean, mode: "insensitive" } },
        { displayName: { equals: `${clean} County`, mode: "insensitive" } },
      ],
    },
    select: { id: true },
  });
  return row?.id ?? null;
}

async function stageCard(input: GotvCommitmentCardInput): Promise<GotvCommitmentCardPersistResult> {
  const dir = path.join(process.cwd(), "data/field-ops");
  const file = path.join(dir, "gotv-commitment-cards.staged.json");
  await mkdir(dir, { recursive: true });
  const existing = existsSync(file) ? JSON.parse(await readFile(file, "utf8")) as { rows?: unknown[] } : { rows: [] };
  const stagedId = `gotv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  existing.rows = [
    ...(existing.rows ?? []),
    {
      id: stagedId,
      createdAt: new Date().toISOString(),
      formType: "gotv_commitment_card",
      commitmentMessage: "I commit to help 5 people make a plan to vote.",
      ...input,
      website: undefined,
    },
  ];
  await writeFile(file, JSON.stringify(existing, null, 2), "utf8");
  return { ok: true, mode: "staged", stagedId };
}

export async function persistGotvCommitmentCard(input: GotvCommitmentCardInput): Promise<GotvCommitmentCardPersistResult> {
  try {
    const email = input.email.toLowerCase().trim();
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: input.name,
        phone: input.phone ?? null,
        zip: input.zip,
        county: input.county,
        interests: ["gotv_commitment_card", ...input.waysToHelp],
      },
      update: {
        name: input.name,
        phone: input.phone ?? undefined,
        zip: input.zip,
        county: input.county,
        interests: ["gotv_commitment_card", ...input.waysToHelp],
      },
    });

    const structured = {
      formType: "gotv_commitment_card",
      commitmentMessage: "I commit to help 5 people make a plan to vote.",
      county: input.county,
      city: input.city ?? null,
      zip: input.zip,
      waysToHelp: input.waysToHelp,
      optIns: {
        email: input.optInEmail,
        sms: input.optInSms,
        phone: input.optInPhone,
      },
      languageAccessSkills: input.languageAccessSkills ?? null,
      notes: input.notes ?? null,
      compliance: {
        noAutomatedSendFromThisSlice: true,
        requiresHumanApprovalBeforeOutreach: true,
      },
    };

    const sub = await prisma.submission.create({
      data: {
        userId: user.id,
        type: "gotv_commitment_card",
        content: summary(input),
        structuredData: structured as Prisma.InputJsonValue,
      },
    });

    const countyId = await findCountyId(input.county);
    const intake = await prisma.workflowIntake.create({
      data: {
        submissionId: sub.id,
        countyId,
        status: "PENDING",
        title: `GOTV commitment card — ${input.name} (${input.county})`,
        source: "gotv_commitment_card",
        metadata: structured as Prisma.InputJsonValue,
      },
      select: { id: true },
    });

    await prisma.commitment.create({
      data: {
        userId: user.id,
        type: "gotv_commitment_card",
        metadata: structured as Prisma.InputJsonValue,
      },
    });

    return { ok: true, mode: "db", workflowIntakeId: intake.id, submissionId: sub.id, userId: user.id };
  } catch {
    return stageCard(input);
  }
}
