/**
 * Shared-event clustering for Evidence Workbench photo selections.
 * Pure heuristics — no inventing geography; labels stay descriptive only.
 */

export type PhotoClusterInput = {
  id: string;
  src?: string;
  caption?: string;
  county?: string;
  city?: string;
  venue?: string;
  eventDate?: string;
  eventName?: string;
  filename?: string;
};

export type PhotoSelectionCluster = {
  id: string;
  label: string;
  reason: string;
  photoIds: string[];
};

export type PhotoSelectionClusterResult = {
  photoIds: string[];
  clusters: PhotoSelectionCluster[];
  summary: string;
  dominantEventName: string | null;
  dominantCounty: string | null;
  dominantEventDate: string | null;
  mixedGeography: boolean;
};

function norm(s: string | undefined | null): string {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function isUnknown(s: string | undefined | null): boolean {
  const v = norm(s);
  return !v || v === "unknown";
}

/** Pull YYYYMMDD / YYYY-MM-DD style cues from ids and filenames. */
export function extractDateCue(text: string): string | null {
  const compact = text.replace(/[^0-9]/g, " ");
  const m1 = text.match(/(20\d{2})[-_]?(\d{2})[-_]?(\d{2})/);
  if (m1) return `${m1[1]}-${m1[2]}-${m1[3]}`;
  const m2 = compact.match(/\b(20\d{2})\s+(\d{2})\s+(\d{2})\b/);
  if (m2) return `${m2[1]}-${m2[2]}-${m2[3]}`;
  return null;
}

function clusterKey(p: PhotoClusterInput): string {
  const eventName = !isUnknown(p.eventName) ? `e:${norm(p.eventName)}` : "";
  const eventDate = !isUnknown(p.eventDate)
    ? `d:${norm(p.eventDate).slice(0, 10)}`
    : extractDateCue(`${p.id} ${p.filename ?? ""}`)
      ? `d:${extractDateCue(`${p.id} ${p.filename ?? ""}`)}`
      : "";
  const county = !isUnknown(p.county) ? `c:${norm(p.county)}` : "";
  const city = !isUnknown(p.city) ? `y:${norm(p.city)}` : "";

  if (eventName && (eventDate || county)) return [eventName, eventDate, county].filter(Boolean).join("|");
  if (eventName) return eventName;
  if (eventDate && county) return `${eventDate}|${county}`;
  if (eventDate) return eventDate;
  if (county && city) return `${county}|${city}`;
  if (county) return county;
  return `solo:${p.id}`;
}

function labelForKey(key: string, members: PhotoClusterInput[]): string {
  if (key.startsWith("solo:")) return `Ungrouped · ${members[0]?.id ?? "photo"}`;
  const names = members.map((m) => m.eventName).filter((n) => !isUnknown(n));
  const counties = members.map((m) => m.county).filter((n) => !isUnknown(n));
  const dates = members
    .map((m) => m.eventDate || extractDateCue(`${m.id} ${m.filename ?? ""}`))
    .filter((n) => n && !isUnknown(n));
  const parts = [
    names[0] ? String(names[0]) : null,
    counties[0] ? String(counties[0]) : null,
    dates[0] ? String(dates[0]).slice(0, 10) : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Possible shared event (weak cues)";
}

function reasonForKey(key: string, members: PhotoClusterInput[]): string {
  if (key.startsWith("solo:")) return "No shared event/date/county cues with other selected stills.";
  const bits: string[] = [];
  if (key.includes("e:")) bits.push("matching event name");
  if (key.includes("d:")) bits.push("matching/nearby date cue");
  if (key.includes("c:")) bits.push("matching county");
  if (key.includes("y:")) bits.push("matching city");
  return `Grouped by ${bits.join(" + ") || "shared cues"} (${members.length} stills).`;
}

function modeValue(values: string[]): string | null {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (isUnknown(v)) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best: string | null = null;
  let n = 0;
  for (const [k, c] of counts) {
    if (c > n) {
      best = k;
      n = c;
    }
  }
  return best;
}

export function clusterPhotoSelection(
  photos: PhotoClusterInput[],
  opts?: { maxPhotos?: number },
): PhotoSelectionClusterResult {
  const max = opts?.maxPhotos ?? 80;
  const list = photos.slice(0, max);
  const buckets = new Map<string, PhotoClusterInput[]>();
  for (const p of list) {
    const key = clusterKey(p);
    const arr = buckets.get(key) ?? [];
    arr.push(p);
    buckets.set(key, arr);
  }

  const clusters: PhotoSelectionCluster[] = [...buckets.entries()]
    .map(([key, members], i) => ({
      id: `cluster-${i + 1}`,
      label: labelForKey(key, members),
      reason: reasonForKey(key, members),
      photoIds: members.map((m) => m.id),
    }))
    .sort((a, b) => b.photoIds.length - a.photoIds.length || a.label.localeCompare(b.label));

  const counties = list.map((p) => p.county ?? "Unknown");
  const knownCounties = new Set(counties.filter((c) => !isUnknown(c)).map((c) => norm(c)));
  const mixedGeography = knownCounties.size > 1;

  const dominantEventName = modeValue(list.map((p) => p.eventName ?? ""));
  const dominantCounty = modeValue(list.map((p) => p.county ?? ""));
  const dominantEventDate = modeValue(
    list.map((p) => p.eventDate || extractDateCue(`${p.id} ${p.filename ?? ""}`) || ""),
  );

  const multi = clusters.filter((c) => c.photoIds.length > 1).length;
  const summary =
    list.length === 0
      ? "No photos selected."
      : mixedGeography
        ? `${list.length} stills → ${clusters.length} cluster(s); mixed counties detected — do not force one geography.`
        : multi > 0
          ? `${list.length} stills → ${clusters.length} cluster(s) (${multi} shared-event group(s)).`
          : `${list.length} stills → no strong shared-event cluster; treat as separate labels.`;

  return {
    photoIds: list.map((p) => p.id),
    clusters,
    summary,
    dominantEventName,
    dominantCounty,
    dominantEventDate,
    mixedGeography,
  };
}
