import type { ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";

export function slugifyForwardMotionStop(eventName: string, county?: string): string {
  const base = eventName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!county) return base;
  const countyPart = county
    .replace(/\s+County$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  if (base.includes(countyPart)) return base;
  return `${countyPart}-${base}`.replace(/-+/g, "-");
}

export function forwardMotionHubHref(): string {
  return "/election-plan?tab=forwardMotion";
}

export function forwardMotionStopHref(eventId: string): string {
  return `/election-plan/forward-motion/${encodeURIComponent(eventId)}`;
}

export function forwardMotionStopSlugHref(eventName: string, county: string): string {
  return forwardMotionStopHref(slugifyForwardMotionStop(eventName, county));
}

export type ForwardMotionStop = ElectionPlanWorkbenchSnapshot["forwardMotion"]["stops"][number];

export function resolveForwardMotionStop(
  data: ElectionPlanWorkbenchSnapshot,
  param: string,
): ForwardMotionStop | undefined {
  const decoded = decodeURIComponent(param);
  const stops = data.forwardMotion.stops;
  const byId = stops.find((s) => s.eventId === decoded);
  if (byId) return byId;

  const slug = decoded.toLowerCase();
  return stops.find((s) => {
    const variants = [
      slugifyForwardMotionStop(s.eventName),
      slugifyForwardMotionStop(s.eventName, s.county),
      slugifyForwardMotionStop(`${s.eventName}-${s.county}`),
    ];
    return variants.includes(slug);
  });
}

export function forwardMotionStaticParams(data: ElectionPlanWorkbenchSnapshot): Array<{ eventId: string }> {
  const ids = new Set<string>();
  for (const s of data.forwardMotion.stops) {
    ids.add(s.eventId);
    ids.add(slugifyForwardMotionStop(s.eventName, s.county));
  }
  return [...ids].map((eventId) => ({ eventId }));
}
