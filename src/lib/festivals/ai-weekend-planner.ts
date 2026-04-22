import { FestivalIngestReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import { formatAllCountiesForPrompt } from "@/lib/festivals/arkansas-county-event-directory";
import type { FestivalCoveragePayloadV1 } from "./types";

const HORIZON_DAYS = 84;

function horizonRange(): { from: Date; to: Date } {
  const from = new Date();
  const to = new Date(from.getTime() + HORIZON_DAYS * 24 * 60 * 60 * 1000);
  return { from, to };
}

/**
 * Builds a draft multi-weekend field plan: where the candidate might go vs where to send teams.
 * Requires OPENAI_API_KEY. Stores a `FestivalCoveragePlanSnapshot` row.
 */
export async function runFestivalCoverageAiPlanner(): Promise<{
  ok: boolean;
  id?: string;
  message: string;
}> {
  if (!isOpenAIConfigured()) {
    return { ok: false, message: "OPENAI_API_KEY not set." };
  }

  const { from, to } = horizonRange();
  const festivals = await prisma.arkansasFestivalIngest.findMany({
    where: {
      reviewStatus: FestivalIngestReviewStatus.APPROVED,
      isVisibleOnSite: true,
      endAt: { gte: from },
      startAt: { lte: to },
    },
    orderBy: { startAt: "asc" },
    include: { county: { select: { displayName: true, slug: true, regionLabel: true } } },
  });

  const counties = await prisma.county.findMany({
    where: { published: true },
    select: { id: true, displayName: true, slug: true, regionLabel: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  });

  const { model } = getOpenAIConfigFromEnv();
  const client = getOpenAIClient();

  const festivalBrief = festivals.map((f) => ({
    id: f.id,
    name: f.name,
    startAt: f.startAt.toISOString(),
    endAt: f.endAt.toISOString(),
    city: f.city,
    county: f.county?.displayName ?? null,
    region: f.county?.regionLabel ?? null,
  }));

  const system = `You are a campaign field director for a statewide Arkansas race. 
Given community festivals and county regions, produce a JSON object ONLY matching this shape:
{ "version": 1, "horizonNote": string, "weekends": array of { "label": string, "windowStart": string (ISO), "windowEnd": string (ISO), "candidatePriority": { "festivalId", "name", "countyOrCity", "rationale" }, "parallelTeamTargets": array of { "festivalId", "name", "countyOrCity", "task" } (0-4 items), "coverageGaps"?: string[] } }
Rules:
- Use fair geography: no honest plan can be at two distant festivals the same day; pick one primary stop per weekend for the candidate.
- Assign other visible festivals that weekend to volunteer/organizing "parallel" work (tabling, literature, sign-up) without implying the candidate is there unless it is a separate listed task.
- Prefer spreading across regions of Arkansas across consecutive weekends when data allows.
- If festival list is empty, return horizonNote explaining that no approved events are on the public feed yet, and weekends as [].`;

  const user = [
    "COUNTY_LATTICE_75 (fips, name, region label, county seats) — for geographic coverage and gaps:\n",
    formatAllCountiesForPrompt(12_000),
    "\n\nFESTIVALS_APPROVED (id, time, place):\n",
    JSON.stringify(
      { festivals: festivalBrief, counties: counties.map((c) => ({ id: c.id, name: c.displayName, region: c.regionLabel })) },
      null,
      2,
    ),
  ].join("");

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  let payload: FestivalCoveragePayloadV1;
  try {
    payload = JSON.parse(raw) as FestivalCoveragePayloadV1;
    if (payload.version !== 1) {
      return { ok: false, message: "Model returned wrong schema version." };
    }
  } catch {
    return { ok: false, message: "Model output was not valid JSON." };
  }

  const saved = await prisma.festivalCoveragePlanSnapshot.create({
    data: {
      validFrom: from,
      validTo: to,
      modelName: model,
      payload: payload as object,
    },
  });

  return { ok: true, id: saved.id, message: "Coverage plan stored." };
}
