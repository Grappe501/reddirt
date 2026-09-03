import "server-only";
import { ARKANSAS_COUNTIES } from "@/data/kelly-county-visits";
import {
  formatOpenAIErrorForClient,
  getOpenAIClient,
  getOpenAIConfigFromEnv,
  isOpenAIConfigured,
} from "@/lib/openai/client";

const SKIP_TITLES =
  /electd(\.io)?|team meeting|kelly\s*\/\s*erin|campaign prayer|personal block|gotcha day|halloween|weekly french hill|protest caroline|pick up posters|leave for /i;

export type IngestImage = { mime: string; base64: string };

export type OscarProposedStop = {
  title: string;
  publicTitle?: string;
  date: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  city?: string;
  counties: string[];
  includeOnPublicPage: boolean;
  confidence: "confirmed" | "likely" | "uncertain";
  notes: string;
  skipAsPublic: boolean;
  skipReason?: string;
};

export type OscarIngestResult = {
  items: OscarProposedStop[];
  ignored: Array<{ title: string; reason: string }>;
  model: string;
  warning?: string;
};

function stripSensitive(s: string): string {
  return s
    .replace(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi, "[email removed]")
    .replace(/\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g, "[phone removed]")
    .replace(/https?:\/\/\S+/gi, "[link removed]");
}

function normalizeCounty(name: string): string | null {
  const n = name.trim().toLowerCase().replace(/\s+county$/, "");
  return ARKANSAS_COUNTIES.find((c) => c.toLowerCase() === n) ?? null;
}

export async function extractOscarStops(input: {
  text: string;
  images: IngestImage[];
}): Promise<OscarIngestResult> {
  if (!isOpenAIConfigured()) {
    return {
      items: [],
      ignored: [],
      model: "none",
      warning: "OPENAI_API_KEY is not set. Add the key and try OSCAR again.",
    };
  }

  const system = `You extract Arkansas campaign calendar stops for Kelly Grappe for Secretary of State (2026).
Reference day is 2026-09-02. Timezone America/Chicago.

Rules:
- Return JSON only: { "items": [...], "ignored": [{ "title", "reason" }] }
- Do not invent streets, buildings, or last names.
- Infer a county only when the city is obvious (Scott→Pulaski, De Queen→Sevier). Else counties=[].
- Do NOT propose public stops for: Electd.io / Electd Grappe Campaign, weekly Team Meeting Zoom, Kelly/Erin 1:1s, Campaign Prayer, personal/medical, lodging, "leave for", poster pickup, weekly French Hill or Protest Caroline unless a venue is named.
- Never put emails, phones, Zoom links, or passwords in title/publicTitle/city.
- includeOnPublicPage false for private/virtual/internal.
- dates YYYY-MM-DD. times like 17:30 if known.

Each item:
title, publicTitle, date, endDate?, startTime?, endTime?, city?, counties[], includeOnPublicPage, confidence (confirmed|likely|uncertain), notes, skipAsPublic, skipReason?`;

  const userText = stripSensitive(input.text || "").slice(0, 20000);
  const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
    {
      type: "text",
      text: `PASTE / EMAIL:\n${userText || "(no text — read the images)"}\n\nCounties must be exact spellings from: ${ARKANSAS_COUNTIES.join(", ")}`,
    },
  ];
  for (const img of input.images.slice(0, 6)) {
    const mime = img.mime.startsWith("image/") ? img.mime : "image/png";
    content.push({
      type: "image_url",
      image_url: { url: `data:${mime};base64,${img.base64}` },
    });
  }

  const { model } = getOpenAIConfigFromEnv();
  const visionModel = model.includes("mini") ? "gpt-4o" : model;

  try {
    const client = getOpenAIClient();
    const res = await client.chat.completions.create({
      model: visionModel,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content },
      ],
    });
    const raw = res.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw) as {
      items?: Array<Record<string, unknown>>;
      ignored?: Array<{ title?: string; reason?: string }>;
    };
    const items: OscarProposedStop[] = (parsed.items || []).map((row) => {
      const title = stripSensitive(String(row.title || "Untitled")).slice(0, 160);
      const date = String(row.date || "").slice(0, 10);
      const skipTitle = SKIP_TITLES.test(title);
      const counties = Array.isArray(row.counties)
        ? row.counties.map((c) => normalizeCounty(String(c))).filter((c): c is string => Boolean(c))
        : [];
      return {
        title,
        publicTitle: row.publicTitle ? stripSensitive(String(row.publicTitle)).slice(0, 160) : undefined,
        date,
        endDate: row.endDate ? String(row.endDate).slice(0, 10) : undefined,
        startTime: row.startTime ? String(row.startTime) : undefined,
        endTime: row.endTime ? String(row.endTime) : undefined,
        city: row.city ? stripSensitive(String(row.city)).slice(0, 80) : undefined,
        counties,
        includeOnPublicPage: skipTitle ? false : Boolean(row.includeOnPublicPage),
        confidence: (row.confidence as OscarProposedStop["confidence"]) || "uncertain",
        notes: stripSensitive(String(row.notes || "Extracted by OSCAR")),
        skipAsPublic: skipTitle || Boolean(row.skipAsPublic),
        skipReason: skipTitle
          ? "Internal / recurring — keep off the public calendar"
          : row.skipReason
            ? String(row.skipReason)
            : undefined,
      };
    });
    return {
      items,
      ignored: (parsed.ignored || []).map((x) => ({
        title: String(x.title || "Untitled"),
        reason: String(x.reason || "Skipped"),
      })),
      model: visionModel,
    };
  } catch (e) {
    return {
      items: [],
      ignored: [],
      model: visionModel,
      warning: formatOpenAIErrorForClient(e),
    };
  }
}
