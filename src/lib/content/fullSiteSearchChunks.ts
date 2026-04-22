/**
 * Additional searchable text from src/content (and related) not covered by the core structured loader.
 * Keeps route:/ paths aligned with public URLs where possible.
 */
import type { DocChunk } from "./parse";
import { heardItems, movementBeliefs, pathwayCards, storyPreviews } from "../../content/homepage";
import {
  TRUST_RIBBON_ITEMS,
  FIGHT_FOR,
  PROOF_SECTION,
  STATEWIDE_SECTION,
  VIDEO_SECTION,
  VOICES_SECTION,
  PLACEHOLDER_VOICES,
  JOURNAL_SECTION,
  PLACEHOLDER_JOURNAL,
  GET_INVOLVED_SECTION,
} from "../../content/home/homepagePremium";
import { JOURNEY_BEAT_DEFINITIONS } from "../../content/home/journey";
import { KELLY_ABOUT_CHAPTERS } from "../../content/about/kelly-about-chapters";
import { circulatingInitiatives2026, CIRCULATING_DISCLAIMER } from "../../content/direct-democracy/circulating-initiatives";
import { allToolkitGuides } from "../../content/resources/toolkit-guides";
import { kellyFriendInviteScripts } from "../../content/resources/kelly-friend-invite-scripts";
import { publishedMediaEarlier, publishedMediaSince2025_11 } from "../../content/editorial/external-media";
import { listMovementRegionInfo } from "../../content/arkansas-movement-regions";
import { campaignTrailPhotos } from "../../content/media/campaign-trail-photos";

const MAX = 12_000;

function cap(text: string): string {
  const t = text.trim();
  if (t.length <= MAX) return t;
  return `${t.slice(0, MAX)}…`;
}

function nextChunkIndex(path: string, used: Map<string, number>): number {
  const n = used.get(path) ?? 0;
  used.set(path, n + 1);
  return n;
}

export function loadFullSiteSearchChunks(): DocChunk[] {
  const out: DocChunk[] = [];
  const idx = new Map<string, number>();

  const homeLines: string[] = ["# Homepage — what we’re hearing", ""];
  for (const h of heardItems) {
    homeLines.push(`## ${h.title}`, h.body, "");
  }
  homeLines.push("# Movement beliefs");
  for (const m of movementBeliefs) {
    homeLines.push(`## ${m.title}`, m.body, "");
  }
  homeLines.push("# Pathways on the homepage");
  for (const p of pathwayCards) {
    homeLines.push(`## ${p.title}`, p.description, `Link: ${p.href}`, "");
  }
  homeLines.push("# Story previews");
  for (const s of storyPreviews) {
    homeLines.push(s.title, s.meta, s.excerpt, s.href, "");
  }
  out.push({
    path: "route:/",
    title: "Homepage — narratives & pathways",
    chunkIndex: nextChunkIndex("route:/", idx),
    content: cap(homeLines.join("\n")),
  });

  const prem: string[] = ["# Homepage — trust ribbon", ""];
  for (const t of TRUST_RIBBON_ITEMS) {
    prem.push(`## ${t.label}`, t.detail, "");
  }
  prem.push("# What we’re fighting for");
  for (const f of FIGHT_FOR) {
    prem.push(`## ${f.title}`, f.body, "");
  }
  prem.push(`# ${PROOF_SECTION.title}`, PROOF_SECTION.intro);
  for (const b of PROOF_SECTION.blocks) {
    prem.push(`## ${b.title}`, b.body, "");
  }
  prem.push(
    `# ${STATEWIDE_SECTION.title}`,
    STATEWIDE_SECTION.body,
    "",
    `# ${VIDEO_SECTION.title}`,
    VIDEO_SECTION.intro,
    "",
    `# ${VOICES_SECTION.title}`,
    VOICES_SECTION.intro,
    "",
    `# ${JOURNAL_SECTION.title}`,
    JOURNAL_SECTION.intro,
    "",
    `# ${GET_INVOLVED_SECTION.title}`,
    GET_INVOLVED_SECTION.subtitle,
    "",
    "# Placeholder voice cards (site filler copy)",
  );
  for (const v of PLACEHOLDER_VOICES) {
    prem.push(v.title, v.excerpt, v.meta, "");
  }
  prem.push("# Placeholder journal cards");
  for (const j of PLACEHOLDER_JOURNAL) {
    prem.push(j.title, j.excerpt, j.meta, j.href, "");
  }
  for (const c of VIDEO_SECTION.secondaryClips) {
    prem.push(`Clip: ${c.category} — ${c.title}`, "");
  }
  out.push({
    path: "route:/",
    title: "Homepage — premium bands & placeholders",
    chunkIndex: nextChunkIndex("route:/", idx),
    content: cap(prem.join("\n")),
  });

  const journeyText = [
    "# Site journey beats (navigation / assistant)",
    ...JOURNEY_BEAT_DEFINITIONS.map((b) => `## ${b.navLabel} (${b.id})\n${b.description}`),
  ].join("\n\n");
  out.push({
    path: "route:/",
    title: "Homepage journey beats",
    chunkIndex: nextChunkIndex("route:/", idx),
    content: cap(journeyText),
  });

  for (const c of KELLY_ABOUT_CHAPTERS) {
    const text = [
      c.title,
      c.eyebrow,
      c.summary,
      c.description,
      `Meet Kelly chapter — read more at /about/${c.slug}`,
    ].join("\n\n");
    out.push({
      path: `route:/about/${c.slug}`,
      title: `${c.title} — Meet Kelly`,
      chunkIndex: 0,
      content: cap(text),
    });
  }

  const circHeader = ["# Circulating ballot measures (education snapshot)", CIRCULATING_DISCLAIMER, ""].join("\n\n");
  for (const init of circulatingInitiatives2026) {
    const text = [
      circHeader,
      `## ${init.name}`,
      init.shortLabel,
      `Category: ${init.category} · ${init.format}`,
      init.statusLine,
      init.summary,
      init.whatItWouldDo,
      init.organizing,
      init.sosStewardship,
      init.verify,
      `Learn more: ${init.directWebsite.label} ${init.directWebsite.href}`,
    ].join("\n\n");
    out.push({
      path: "route:/resources/direct-democracy-guide",
      title: init.shortLabel,
      chunkIndex: nextChunkIndex("route:/resources/direct-democracy-guide", idx),
      content: cap(text),
    });
  }

  for (const g of allToolkitGuides) {
    const lines: string[] = [
      g.title,
      g.tag,
      g.shortDescription,
      g.intro,
      "",
      ...(g.anyOneCan?.length ? ["## Who can do this", ...g.anyOneCan.map((x) => `• ${x}`), ""] : []),
    ];
    for (const sec of g.sections) {
      lines.push(`## ${sec.heading}`, ...sec.paragraphs);
      if (sec.bullets?.length) lines.push(...sec.bullets.map((b) => `• ${b}`));
      if (sec.callout) lines.push(`Note: ${sec.callout}`);
      lines.push("");
    }
    if (g.goDeeper.length) {
      lines.push("## Go deeper");
      for (const l of g.goDeeper) lines.push(`${l.label}: ${l.href}`);
    }
    out.push({
      path: `route:/resources/${g.slug}`,
      title: g.title,
      chunkIndex: 0,
      content: cap(lines.join("\n")),
    });
  }

  for (const s of kellyFriendInviteScripts) {
    const text = [
      s.title,
      s.blurb,
      `Channel: ${s.channel}`,
      s.emailSubject ? `Subject: ${s.emailSubject}` : "",
      s.body.replace(/##SITE_URL##/g, "(campaign site URL)"),
    ]
      .filter(Boolean)
      .join("\n\n");
    out.push({
      path: "route:/resources/talking-about-kelly",
      title: `Friend invite — ${s.title}`,
      chunkIndex: nextChunkIndex("route:/resources/talking-about-kelly", idx),
      content: cap(text),
    });
  }

  const mediaItems = [...publishedMediaSince2025_11, ...publishedMediaEarlier];
  for (const item of mediaItems) {
    const linkLines = item.links.map((l) => `${l.label}: ${l.href}`).join("\n");
    const text = [item.title, item.outlet, item.summary, `Kind: ${item.kind}`, linkLines].join("\n\n");
    out.push({
      path: "route:/press-coverage",
      title: `Press / editorial link — ${item.title}`,
      chunkIndex: nextChunkIndex("route:/press-coverage", idx),
      content: cap(text),
    });
  }

  const regions = listMovementRegionInfo();
  const regText = [
    "# Arkansas movement regions (events & field)",
    ...regions.map((r) => `## ${r.label}\n${r.blurb}`),
  ].join("\n\n");
  out.push({
    path: "route:/events",
    title: "Movement regions — Arkansas",
    chunkIndex: nextChunkIndex("route:/events", idx),
    content: cap(regText),
  });

  for (const ph of campaignTrailPhotos) {
    const text = [
      ph.alt,
      ph.caption,
      "Kelly for Arkansas Secretary of State — campaign trail photography from the field.",
      `Public image path: ${ph.src}`,
    ]
      .filter(Boolean)
      .join("\n\n");
    out.push({
      path: "route:/from-the-road",
      title: `Trail photo — ${ph.alt}`,
      chunkIndex: nextChunkIndex("route:/from-the-road", idx),
      content: cap(text),
    });
  }

  return out.filter((c) => c.content.length >= 40);
}
