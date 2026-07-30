/**
 * Event-night pack — bind a Confirmed calendar row to candidate photos + speeches
 * using existing cues only. Never invents geography matches.
 */
import "server-only";

import { CAMPAIGN_MEDIA_REGISTRY } from "@/content/media/campaign-media-registry";
import { applyPhotoEvidenceOverlay } from "@/lib/campaign-media/apply-evidence-overlay";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import {
  loadCalendarPresenceStore,
  loadPhotoEvidenceStore,
  loadSpeechEvidenceStore,
} from "@/lib/campaign-media/evidence-store";
import { buildSpeechReadinessMatrix } from "@/lib/campaign-media/speech-readiness";

export type EventNightPack = {
  calendarRowId: string;
  date: string;
  summary: string;
  status: string;
  places: Array<{ city: string; county: string }>;
  matchQuality: "strong" | "soft" | "none";
  warnings: string[];
  photos: Array<{
    id: string;
    score: number;
    county: string;
    city: string;
    eventName: string;
    eventDate: string;
    why: string[];
  }>;
  speeches: Array<{
    id: string;
    title: string;
    score: number;
    counties: string[];
    why: string[];
    nextAction?: string;
  }>;
  recommendedClicks: Array<{ label: string; href: string }>;
};

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+county$/i, "").trim();
}

function tokens(s: string): string[] {
  return norm(s)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);
}

export function proposeEventNightPack(input: {
  calendarRowId: string;
  photoLimit?: number;
  speechLimit?: number;
}): EventNightPack | { ok: false; error: string } {
  const row = loadCalendarPresenceStore().rows.find((r) => r.id === input.calendarRowId);
  if (!row) return { ok: false, error: `Calendar row not found: ${input.calendarRowId}` };

  const places =
    Array.isArray(row.places) && row.places.length
      ? row.places.map((p) => ({ city: p.city || "", county: p.county || "" }))
      : [{ city: row.city || "", county: row.county || "" }];

  const warnings: string[] = [];
  if (row.status !== "Confirmed") {
    warnings.push(
      `Row status is "${row.status}" — only Confirmed geography may support Identify. Soft matches only.`,
    );
  }
  if (!places.some((p) => p.city || p.county)) {
    warnings.push("No city/county on this row — photo/speech matches will be event/date cues only.");
  }

  const date = row.date;
  const summaryTokens = tokens(`${row.summary} ${row.location}`);
  const countySet = new Set(places.map((p) => norm(p.county)).filter(Boolean));
  const citySet = new Set(places.map((p) => norm(p.city)).filter(Boolean));

  const photoStore = loadPhotoEvidenceStore();
  const photoLimit = Math.min(Math.max(input.photoLimit ?? 12, 1), 24);
  const photos = CAMPAIGN_PHOTO_REGISTRY.map((p) => {
    const live = applyPhotoEvidenceOverlay(p, photoStore.photos?.[p.id]);
    const c = live.campaign;
    const why: string[] = [];
    let score = 0;
    if (c.eventDate && date && c.eventDate.slice(0, 10) === date.slice(0, 10)) {
      score += 40;
      why.push("eventDate matches calendar date");
    }
    const county = norm(c.county);
    const city = norm(c.city);
    if (county && county !== "unknown" && countySet.has(county)) {
      score += row.status === "Confirmed" ? 35 : 15;
      why.push(row.status === "Confirmed" ? "county matches Confirmed place" : "county matches (soft — not Confirmed)");
    }
    if (city && citySet.has(city)) {
      score += row.status === "Confirmed" ? 20 : 8;
      why.push("city matches place");
    }
    const hay = tokens(`${c.eventName} ${p.id} ${p.accessibility.caption}`);
    const overlap = summaryTokens.filter((t) => hay.includes(t));
    if (overlap.length) {
      score += Math.min(18, overlap.length * 4);
      why.push(`summary cue overlap: ${overlap.slice(0, 4).join(", ")}`);
    }
    return {
      id: p.id,
      score,
      county: c.county,
      city: c.city,
      eventName: c.eventName,
      eventDate: c.eventDate,
      why,
    };
  })
    .filter((p) => p.score >= 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, photoLimit);

  const speechStore = loadSpeechEvidenceStore();
  const readiness = buildSpeechReadinessMatrix();
  const readyById = new Map(readiness.rows.map((r) => [r.id, r]));
  const speechLimit = Math.min(Math.max(input.speechLimit ?? 8, 1), 16);
  const speeches = CAMPAIGN_MEDIA_REGISTRY.map((m) => {
    const overlay = speechStore.speeches[m.id];
    const counties = (overlay?.counties?.length ? overlay.counties : m.counties ?? []).map(String);
    const why: string[] = [];
    let score = 0;
    for (const c of counties) {
      const n = norm(c);
      if (n && countySet.has(n)) {
        score += row.status === "Confirmed" ? 30 : 12;
        why.push(`speech county ${c}`);
      }
    }
    const hay = tokens(`${m.title} ${m.id} ${overlay?.eventName ?? ""} ${overlay?.venue ?? ""}`);
    const overlap = summaryTokens.filter((t) => hay.includes(t));
    if (overlap.length) {
      score += Math.min(16, overlap.length * 4);
      why.push(`title/summary overlap: ${overlap.slice(0, 4).join(", ")}`);
    }
    if (overlay?.eventDate && date && String(overlay.eventDate).slice(0, 10) === date.slice(0, 10)) {
      score += 25;
      why.push("speech eventDate matches");
    }
    return {
      id: m.id,
      title: m.title,
      score,
      counties,
      why,
      nextAction: readyById.get(m.id)?.nextAction,
    };
  })
    .filter((s) => s.score >= 16)
    .sort((a, b) => b.score - a.score)
    .slice(0, speechLimit);

  let matchQuality: EventNightPack["matchQuality"] = "none";
  if (photos.some((p) => p.score >= 50) || speeches.some((s) => s.score >= 40)) matchQuality = "strong";
  else if (photos.length || speeches.length) matchQuality = "soft";
  if (matchQuality === "none") {
    warnings.push("No cue-aligned assets found — do not invent links; Confirm calendar or label stills first.");
  }

  const recommendedClicks: EventNightPack["recommendedClicks"] = [
    { label: "Open calendar row context", href: "/admin/evidence-workbench?tab=calendar" },
  ];
  if (photos.length) {
    recommendedClicks.push({
      label: `Review ${photos.length} candidate still(s)`,
      href: `/admin/evidence-workbench?tab=photos&id=${encodeURIComponent(photos[0].id)}`,
    });
  }
  if (speeches.length) {
    recommendedClicks.push({
      label: `Review ${speeches.length} candidate speech(es)`,
      href: `/admin/evidence-workbench?tab=speeches&id=${encodeURIComponent(speeches[0].id)}`,
    });
  }
  recommendedClicks.push({
    label: "Publish queue",
    href: "/admin/evidence-workbench?tab=queue",
  });

  return {
    calendarRowId: row.id,
    date: row.date,
    summary: row.summary,
    status: row.status,
    places,
    matchQuality,
    warnings,
    photos,
    speeches,
    recommendedClicks,
  };
}
