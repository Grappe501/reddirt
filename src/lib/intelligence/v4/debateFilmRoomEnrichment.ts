import "server-only";

import type { DebateFilmRoomState, FilmRoomItem } from "@/lib/opposition/debateFilmRoomTypes";
import { listOpponentMedia } from "@/lib/intelligence/opponents/loadOpponentMediaCatalog";
import type { OpponentMediaEntry } from "@/lib/intelligence/opponents/opponentMediaCatalogTypes";
import type { FilmRoomMediaDrill } from "@/lib/intelligence/v4/debateFilmRoomEnrichmentTypes";
import { getTranscriptForMedia } from "@/lib/intelligence/opponents/loadOpponentMediaTranscripts";
import type { OpponentMediaTranscriptEntry } from "@/lib/intelligence/opponents/opponentMediaTranscriptTypes";

export type { FilmRoomMediaDrill } from "@/lib/intelligence/v4/debateFilmRoomEnrichmentTypes";

const TRAP_BY_TOPIC: Record<string, string> = {
  direct_democracy: "/admin/intelligence/trap-lanes/integrity-without-participation",
  petition_restrictions: "/admin/intelligence/trap-lanes/fraud-data-dare",
  petition_bills: "/admin/intelligence/trap-lanes/2021-vs-2025-pivot",
  sos_race: "/admin/intelligence/trap-lanes/experience-equals-sos-ready",
  election_integrity: "/admin/intelligence/trap-lanes/county-champion",
};

function trapLaneForTags(tags: string[], notes?: string): string | null {
  for (const tag of tags) {
    if (TRAP_BY_TOPIC[tag]) return TRAP_BY_TOPIC[tag];
  }
  if (notes?.toLowerCase().includes("led the charge")) {
    return "/admin/intelligence/trap-lanes/integrity-without-participation";
  }
  if (notes?.toLowerCase().includes("smooth transition")) {
    return "/admin/intelligence/trap-lanes/experience-equals-sos-ready";
  }
  if (notes?.toLowerCase().includes("petition")) {
    return "/admin/intelligence/trap-lanes/2021-vs-2025-pivot";
  }
  return null;
}

function billHrefsForTags(tags: string[]): string[] {
  const bills: string[] = [];
  if (tags.some((t) => t.includes("petition") || t.includes("direct_democracy"))) {
    bills.push("SB584", "SB207", "HB1222");
  }
  if (tags.some((t) => t.includes("election_integrity") || t.includes("county"))) {
    bills.push("HB1457", "SB487");
  }
  return [...new Set(bills)].map((b) => `/admin/intelligence/kim-hammer/bills/${b}`);
}

function buildKellyPivot(entry: OpponentMediaEntry, transcript?: OpponentMediaTranscriptEntry): string {
  if (transcript?.debateUseNotes) {
    return `Staff-framed pivot (verify acts first): acknowledge press summary → contrast county implementation → cite verified act if time allows. Notes: ${transcript.debateUseNotes.slice(0, 140)}`;
  }
  return `Acknowledge ${entry.topicTags[0]?.replace(/_/g, " ") ?? "integrity goal"} where fair → contrast SOS service desk vs legislator authorship → one county impact line.`;
}

export function buildFilmRoomMediaDrill(entry: OpponentMediaEntry): FilmRoomMediaDrill {
  const transcript = getTranscriptForMedia(entry.id);
  const keySegments = transcript?.segments.slice(0, 6) ?? [];
  const claimsGate =
    entry.speakerVerification === "VERIFIED_QUOTE_TEXT"
      ? "HUMAN_REVIEW — quote text verified from article; still gate before stage"
      : "NEEDS_REVIEW — verify speaker and exact wording before Kelly cites";

  return {
    mediaId: entry.id,
    title: entry.title,
    url: entry.url,
    publisher: entry.publisher ?? entry.platform,
    platform: entry.platform,
    researchValue: entry.researchValue,
    speakerVerification: entry.speakerVerification,
    summary: entry.summary,
    topicTags: entry.topicTags,
    transcript,
    keySegments,
    offensiveUse:
      transcript?.debateUseNotes ??
      `Press framing on ${entry.topicTags.slice(0, 2).join(", ").replace(/_/g, " ")} — pair with theme matrix petition or county rows.`,
    defensiveUse:
      "Kelly does not play clips on stage without staff clip ID. Do not say 'we have video of you saying' unless VERIFIED.",
    kellyPivot30s: buildKellyPivot(entry, transcript),
    drillPrompt: `Watch ${entry.title.slice(0, 48)} → pick one segment → draft 30s: agree → act anchor → county → bridge.`,
    claimsGate,
    trapLaneHref: trapLaneForTags(entry.topicTags, transcript?.debateUseNotes),
    billDrillHrefs: billHrefsForTags(entry.topicTags),
  };
}

/** Add catalog + transcript rows into film room items (launch-safe). */
export function enrichFilmRoomWithMediaCatalog(state: DebateFilmRoomState): DebateFilmRoomState {
  const items = [...state.items];
  const seen = new Set(items.map((i) => i.id));

  for (const entry of listOpponentMedia("kim-hammer").filter((e) => e.researchValue === "HIGH" || e.researchValue === "MEDIUM")) {
    if (seen.has(`media-${entry.id}`)) continue;
    const transcript = getTranscriptForMedia(entry.id);
    items.push({
      id: `media-${entry.id}`,
      title: entry.title,
      dateOrSource: `${entry.publisher ?? entry.platform} · ${entry.researchValue}`,
      topic: entry.topicTags.join(" · "),
      opponentClaimOrAngle: entry.summary,
      vulnerability:
        entry.speakerVerification === "VERIFIED_QUOTE_TEXT"
          ? "Article quote — not committee video; context may omit county burden"
          : "Speaker/timecode not verified — paraphrase only until staff pull",
      recommendedCounter: buildKellyPivot(entry, transcript),
      confidence: entry.researchValue === "HIGH" ? "MEDIUM" : "LOW",
      researchGaps: entry.speakerVerification.includes("NEEDS") ? ["Verify speaker attribution"] : [],
      drillPrompt: `Media drill: ${entry.title.slice(0, 56)} — 30s pivot after claims check`,
      assetType: entry.sourceType === "news_segment" ? "DIRECT_OPPONENT" : "MEDIA_COVERAGE",
      url: entry.url,
      isDirectOpponentClip: entry.sourceType === "news_segment" || entry.sourceType === "news_video",
      governanceLabel: "INTERNAL_DRAFT",
      needsVerification: entry.speakerVerification !== "VERIFIED_FACT",
    });
    seen.add(`media-${entry.id}`);

    if (transcript) {
      for (const seg of transcript.segments.slice(0, 5)) {
        const segId = `quote-${entry.id}-${seg.startTime.replace(/:/g, "")}`;
        if (seen.has(segId)) continue;
        items.push({
          id: segId,
          title: `Excerpt · ${entry.publisher ?? entry.platform}`,
          dateOrSource: `${seg.startTime}–${seg.endTime} · ${seg.speakerLabel}`,
          topic: entry.topicTags[0]?.replace(/_/g, " ") ?? "Media excerpt",
          opponentClaimOrAngle: seg.text,
          vulnerability: `${transcript.speakerVerification} — ${transcript.status}`,
          recommendedCounter: transcript.debateUseNotes ?? "Pivot to county implementation + verified acts",
          confidence: transcript.speakerVerification === "VERIFIED_QUOTE_TEXT" ? "MEDIUM" : "LOW",
          researchGaps: ["Verbatim pull + citation anchor before debate"],
          drillPrompt: `Rehearse 30s on: "${seg.text.slice(0, 80)}…"`,
          assetType: "MEDIA_TRANSCRIPT_EXCERPT",
          url: entry.url,
          isDirectOpponentClip: false,
          governanceLabel: "INTERNAL_DRAFT",
          timestampRange: `${seg.startTime}–${seg.endTime}`,
          needsVerification: true,
        });
        seen.add(segId);
      }
    }
  }

  const mediaExcerptCount = items.filter((i) => i.assetType === "MEDIA_TRANSCRIPT_EXCERPT").length;

  return {
    ...state,
    items,
    directClipCount: Math.max(state.directClipCount, Math.min(listOpponentMedia("kim-hammer").filter((e) => e.sourceType === "news_segment" || e.sourceType === "news_video").length, 6)),
    coverageGaps: [
      ...state.coverageGaps.filter((g) => !g.startsWith("Only one direct")),
      mediaExcerptCount < 3 ? "Transcript excerpts thin — staff should verify KATV/THV11 timestamps" : "",
      "Formal Hammer-vs-Kelly debate footage not indexed — use press excerpts + committee video only",
    ].filter(Boolean),
    archiveHonestyNote: `${Math.max(state.directClipCount, 1)}+ indexed media sources · ${mediaExcerptCount} transcript excerpts · ${state.legislativeClipCount} legislative — human review before stage; Kelly does not play clips live without staff ID.`,
  };
}

export function listFilmRoomMediaDrills(): FilmRoomMediaDrill[] {
  return listOpponentMedia("kim-hammer")
    .filter((e) => e.researchValue === "HIGH" || (e.researchValue === "MEDIUM" && getTranscriptForMedia(e.id)))
    .map(buildFilmRoomMediaDrill)
    .sort((a, b) => (a.researchValue === "HIGH" ? -1 : 1));
}
