import { z } from "zod";
import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { allEditorial } from "@/content/editorial/index";
import { allExplainers } from "@/content/explainers/index";
import { allStories } from "@/content/stories/index";
import type { DocumentBlock } from "@/content/shared/document";
import type { EditorialSection } from "@/content/editorial/types";
import { events } from "@/content/events/index";
import type { EventItem } from "@/content/types";
import { KELLY_PUBLIC_CONTACT_EMAIL } from "@/lib/openai/prompts";

/** Mirrors public /priorities pillar copy — keep in sync with `src/app/(site)/priorities/page.tsx`. */
const OFFICE_PRIORITIES_TEXT = [
  "# Priorities for the office (summary)",
  "Public page: /priorities",
  "",
  "## Protect the vote",
  "Fair, secure elections administered consistently—free from political pressure or favoritism. Voters should see one standard, clearly explained.",
  "",
  "## Serve all 75 counties",
  "Clear guidance, dependable systems, and responsive support for county clerks and local election officials—rural and urban alike.",
  "",
  "## Lead with transparency",
  "Plain-language information, open processes, and accountability in every function of the office—not selective openness.",
  "",
  "## Business & nonprofit confidence",
  "Filings, registrations, and UCC tools should be predictable. When the rules are clear, Arkansas employers and civic organizations spend less time navigating confusion.",
].join("\n");

function blocksToText(blocks: DocumentBlock[]): string {
  const lines: string[] = [];
  for (const b of blocks) {
    if (b.type === "paragraph") lines.push(b.text);
    else if (b.type === "heading") lines.push(`# ${b.text}`);
    else if (b.type === "quote") {
      lines.push(b.attribution ? `“${b.text}” — ${b.attribution}` : `“${b.text}”`);
    }
  }
  return lines.join("\n\n");
}

function editorialToText(sections: EditorialSection[]): string {
  const lines: string[] = [];
  for (const s of sections) {
    if (s.type === "prose") {
      if (s.title) lines.push(`# ${s.title}`);
      lines.push(...s.paragraphs);
    } else if (s.type === "list") {
      if (s.title) lines.push(`# ${s.title}`);
      lines.push(...s.items.map((item) => `• ${item}`));
    } else if (s.type === "quote") {
      lines.push(s.attribution ? `“${s.quote}” — ${s.attribution}` : `“${s.quote}”`);
    } else if (s.type === "callout") {
      lines.push(`# ${s.title}`, s.body);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

function explainerToText(slug: string): string | null {
  const e = allExplainers.find((x) => x.slug === slug);
  if (!e) return null;
  const lines = [
    `TITLE: ${e.title}`,
    `SLUG: ${e.slug}`,
    `PUBLIC_URL: /explainers/${e.slug}`,
    `CATEGORY: ${e.category}`,
    `SUMMARY: ${e.summary}`,
    "",
    e.intro,
    "",
    ...e.steps.flatMap((st) => [`## ${st.title}`, st.body, ""]),
    ...e.faq.flatMap((f) => [`Q: ${f.q}`, `A: ${f.a}`, ""]),
  ];
  return lines.join("\n").trim();
}

function storyToText(slug: string): string | null {
  const s = allStories.find((x) => x.slug === slug);
  if (!s) return null;
  const lines = [
    `TITLE: ${s.title}`,
    `SLUG: ${s.slug}`,
    `PUBLIC_URL: /stories/${s.slug}`,
    `SUMMARY: ${s.summary}`,
    s.dek ? `DEK: ${s.dek}` : "",
    "",
    blocksToText(s.body),
  ].filter(Boolean);
  return lines.join("\n\n").trim();
}

function editorialPieceToText(slug: string): string | null {
  const p = allEditorial.find((x) => x.slug === slug);
  if (!p) return null;
  const lines = [
    `TITLE: ${p.title}`,
    `SLUG: ${p.slug}`,
    `PUBLIC_URL: /editorial/${p.slug}`,
    `SUMMARY: ${p.summary}`,
    `CATEGORY: ${p.category}`,
    "",
    editorialToText(p.sections),
  ];
  return lines.join("\n\n").trim();
}

function eventDetailHref(e: EventItem): string {
  return e.detailHref ?? `/events/${e.slug}`;
}

function listUpcomingEvents(args: {
  region?: string;
  county_slug?: string;
  search_query?: string;
  limit: number;
}): string {
  const now = Date.now();
  const regionLower = args.region?.toLowerCase().trim();
  const countyLower = args.county_slug?.toLowerCase().trim();
  const q = args.search_query?.toLowerCase().trim();

  let rows = events.filter((e) => e.status === "upcoming");
  try {
    rows = rows.filter((e) => new Date(e.startsAt).getTime() >= now - 86_400_000);
  } catch {
    /* keep */
  }

  if (regionLower) {
    rows = rows.filter((e) => e.region.toLowerCase().includes(regionLower) || regionLower.includes(e.region.toLowerCase()));
  }
  if (countyLower) {
    rows = rows.filter((e) => (e.countySlug ?? "").toLowerCase() === countyLower);
  }
  if (q) {
    rows = rows.filter((e) => {
      const blob = `${e.title} ${e.summary} ${e.locationLabel} ${e.addressLine ?? ""}`.toLowerCase();
      return blob.includes(q);
    });
  }

  rows = [...rows].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const slice = rows.slice(0, args.limit);
  if (!slice.length) {
    return JSON.stringify({
      ok: true,
      count: 0,
      events: [],
      note: "No matching upcoming events in the site dataset. Suggest /events or /campaign-calendar.",
    });
  }

  return JSON.stringify({
    ok: true,
    count: slice.length,
    events: slice.map((e) => ({
      title: e.title,
      slug: e.slug,
      starts_at: e.startsAt,
      timezone: e.timezone,
      region: e.region,
      county_slug: e.countySlug ?? null,
      location: e.locationLabel,
      summary: e.summary,
      url_path: eventDetailHref(e),
      type: e.type,
    })),
  });
}

const listEventsSchema = z.object({
  region: z.string().optional().describe("Arkansas region label, e.g. Central Arkansas"),
  county_slug: z.string().optional().describe("Kebab-case county slug, e.g. pulaski-county"),
  search_query: z.string().optional().describe("Free text matched against title, summary, location"),
  limit: z.number().int().min(1).max(10).optional().default(5),
});

const getContentSchema = z.object({
  kind: z.enum(["explainer", "story", "editorial"]).describe("Site content collection"),
  slug: z.string().min(1).describe("URL slug, e.g. what-is-a-referendum"),
});

export const ASSISTANT_TOOL_DEFINITIONS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_upcoming_events",
      description:
        "List upcoming movement/campaign events from the site’s structured calendar. Use when the visitor asks about events near them, this week, or by region/county. Returns ISO dates and internal URL paths—not third-party tickets.",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          region: { type: "string", description: "Arkansas region label, e.g. Central Arkansas" },
          county_slug: { type: "string", description: "Kebab-case county slug, e.g. pulaski-county" },
          search_query: { type: "string", description: "Free text matched against title, summary, location" },
          limit: { type: "integer", minimum: 1, maximum: 10, description: "Max events to return (default 5)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_volunteer_and_involvement_links",
      description:
        "Return canonical on-site paths for volunteering, hosting, and local teams. Use when the visitor wants to help, sign up, or get involved.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "get_content_by_slug",
      description:
        "Fetch full text for an explainer, story, or editorial by slug (same slug as in /explainers/{slug}, /stories/{slug}, /editorial/{slug}). Use for “what’s Kelly’s position” only when the answer lives in that content type.",
      parameters: {
        type: "object",
        additionalProperties: false,
        required: ["kind", "slug"],
        properties: {
          kind: { type: "string", enum: ["explainer", "story", "editorial"] },
          slug: { type: "string", description: "URL slug, e.g. what-is-a-referendum" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_office_priorities_summary",
      description:
        "Return the campaign’s public summary of Secretary of State office priorities (pillars). Use for high-level “what would Kelly focus on in office” when CONTEXT is thin.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "get_public_contact_info",
      description:
        "Return approved public contact email(s) and optional newsletter signup URL from server configuration. Use for press, media, or newsletter requests—never invent addresses.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
];

export function executeAssistantTool(name: string, rawArgs: string): string {
  let args: unknown = {};
  try {
    args = rawArgs ? JSON.parse(rawArgs) : {};
  } catch {
    args = {};
  }

  switch (name) {
    case "list_upcoming_events": {
      const parsed = listEventsSchema.safeParse(args);
      if (!parsed.success) {
        return JSON.stringify({ ok: false, error: "invalid_arguments", detail: parsed.error.flatten() });
      }
      return listUpcomingEvents(parsed.data);
    }
    case "get_volunteer_and_involvement_links": {
      // eslint-disable-next-line no-console
      console.info("[assistant-tool] get_volunteer_and_involvement_links");
      return JSON.stringify({
        ok: true,
        links: [
          { label: "Get involved", href: "/get-involved" },
          { label: "Host a gathering", href: "/host-a-gathering" },
          { label: "Start a local team", href: "/start-a-local-team" },
          { label: "Local organizing", href: "/local-organizing" },
          { label: "Events", href: "/events" },
        ],
        note: "All paths are on this campaign site. Forms on those pages collect signups; there is no separate secret signup URL in this tool.",
      });
    }
    case "get_content_by_slug": {
      const parsed = getContentSchema.safeParse(args);
      if (!parsed.success) {
        return JSON.stringify({ ok: false, error: "invalid_arguments", detail: parsed.error.flatten() });
      }
      const { kind, slug } = parsed.data;
      let text: string | null = null;
      if (kind === "explainer") text = explainerToText(slug);
      else if (kind === "story") text = storyToText(slug);
      else text = editorialPieceToText(slug);
      if (!text) {
        return JSON.stringify({
          ok: false,
          error: "not_found",
          kind,
          slug,
          hint: "Slug may be wrong or content not in this deployment. Fall back to CONTEXT search.",
        });
      }
      return JSON.stringify({ ok: true, kind, slug, full_text: text.slice(0, 14_000) });
    }
    case "get_office_priorities_summary":
      return JSON.stringify({ ok: true, full_text: OFFICE_PRIORITIES_TEXT });
    case "get_public_contact_info": {
      const newsletterUrl = process.env.CAMPAIGN_NEWSLETTER_SIGNUP_URL?.trim() || null;
      const pressEmail = process.env.CAMPAIGN_PRESS_EMAIL?.trim() || KELLY_PUBLIC_CONTACT_EMAIL;
      return JSON.stringify({
        ok: true,
        general_campaign_email: KELLY_PUBLIC_CONTACT_EMAIL,
        press_email: pressEmail,
        newsletter_signup_url: newsletterUrl,
        note:
          newsletterUrl == null
            ? "Newsletter URL is not configured on this server (CAMPAIGN_NEWSLETTER_SIGNUP_URL). Suggest getting updates via Get involved or site footer if CONTEXT mentions one."
            : "Newsletter signup is an external or on-site URL—direct the visitor there; mention double opt-in if the provider uses it.",
      });
    }
    default:
      return JSON.stringify({ ok: false, error: "unknown_tool", name });
  }
}

