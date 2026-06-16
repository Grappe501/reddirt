import { prisma } from "@/lib/db";

import { COMMUNITY_LEADERSHIP_ROLES } from "./constants";
import { communityWorkbenchHref } from "./links";
import { listCommunityWorkbenches } from "./load-workbench";
import { ensureCommunityWorkbenchesSynced } from "./sync-workbenches";
import type { CommunityWorkbenchDeepSearchHit } from "./types";

function tokenize(q: string): string[] {
  return [
    ...new Set(
      q
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((t) => t.length > 1),
    ),
  ].slice(0, 12);
}

function scoreBlob(blob: string, qLower: string, terms: string[]): number {
  const lower = blob.toLowerCase();
  let score = 0;
  if (lower.includes(qLower)) score += 0.5;
  for (const term of terms) {
    if (lower.includes(term)) score += 0.15;
  }
  return score;
}

function parseJsonText(raw: string | null | undefined): string {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") return JSON.stringify(item);
          return "";
        })
        .join(" ");
    }
  } catch {
    return raw;
  }
  return raw;
}

function leadershipLabel(roleKey: string): string {
  return COMMUNITY_LEADERSHIP_ROLES.find((r) => r.key === roleKey)?.label ?? roleKey;
}

export async function deepSearchCommunityWorkbenches(
  query: string,
  limit = 12,
): Promise<CommunityWorkbenchDeepSearchHit[]> {
  const q = query.trim();
  if (!q) return [];

  await ensureCommunityWorkbenchesSynced();
  const qLower = q.toLowerCase();
  const terms = tokenize(q);
  const hits: CommunityWorkbenchDeepSearchHit[] = [];

  const shallow = await listCommunityWorkbenches();
  for (const wb of shallow) {
    const blob = [wb.name, wb.tagline ?? "", wb.kind, wb.countySlug ?? ""].join(" ");
    const score = scoreBlob(blob, qLower, terms);
    if (score > 0.08) {
      hits.push({
        slug: wb.slug,
        name: wb.name,
        kind: wb.kind,
        href: communityWorkbenchHref(wb.slug),
        score: Math.min(1, score + 0.2),
        matchKind: "workbench",
        matchLabel: wb.name,
        excerpt: wb.tagline ?? `${wb.kind} workbench`,
      });
    }
  }

  try {
    const rows = await prisma.communityWorkbench.findMany({
      where: { active: true },
      select: {
        slug: true,
        name: true,
        kind: true,
        leadership: { select: { roleKey: true, personName: true, contact: true, notes: true } },
        committees: { select: { name: true, goals: true, membersJson: true, notes: true } },
        events: {
          select: {
            title: true,
            location: true,
            leadName: true,
            runOfShowJson: true,
            assignmentsJson: true,
            aarBody: true,
          },
        },
        relationships: { select: { personName: true, roleLabel: true, knowsWho: true, notes: true } },
        notes: { select: { title: true, body: true, noteType: true } },
      },
    });

    for (const wb of rows) {
      const base = { slug: wb.slug, name: wb.name, kind: wb.kind, href: communityWorkbenchHref(wb.slug) };

      for (const l of wb.leadership) {
        const blob = [leadershipLabel(l.roleKey), l.personName, l.contact ?? "", l.notes ?? ""].join(" ");
        const score = scoreBlob(blob, qLower, terms);
        if (score > 0.1) {
          hits.push({
            ...base,
            score: Math.min(1, score + 0.35),
            matchKind: "leadership",
            matchLabel: `${leadershipLabel(l.roleKey)} · ${l.personName}`,
            excerpt: l.contact ?? l.notes ?? "Leadership assignment",
          });
        }
      }

      for (const c of wb.committees) {
        const blob = [c.name, c.goals ?? "", parseJsonText(c.membersJson), c.notes ?? ""].join(" ");
        const score = scoreBlob(blob, qLower, terms);
        if (score > 0.1) {
          hits.push({
            ...base,
            score: Math.min(1, score + 0.3),
            matchKind: "committee",
            matchLabel: c.name,
            excerpt: c.goals ?? "Committee",
          });
        }
      }

      for (const ev of wb.events) {
        const blob = [
          ev.title,
          ev.location ?? "",
          ev.leadName ?? "",
          parseJsonText(ev.runOfShowJson),
          parseJsonText(ev.assignmentsJson),
          ev.aarBody ?? "",
        ].join(" ");
        const score = scoreBlob(blob, qLower, terms);
        if (score > 0.1) {
          hits.push({
            ...base,
            score: Math.min(1, score + 0.35),
            matchKind: "event",
            matchLabel: ev.title,
            excerpt: ev.location ?? ev.leadName ?? "Event",
          });
        }
      }

      for (const r of wb.relationships) {
        const blob = [r.personName, r.roleLabel ?? "", r.knowsWho ?? "", r.notes ?? ""].join(" ");
        const score = scoreBlob(blob, qLower, terms);
        if (score > 0.1) {
          hits.push({
            ...base,
            score: Math.min(1, score + 0.25),
            matchKind: "relationship",
            matchLabel: r.personName,
            excerpt: r.roleLabel ?? r.knowsWho ?? "Relationship map",
          });
        }
      }

      for (const n of wb.notes) {
        const blob = [n.title, n.body, n.noteType].join(" ");
        const score = scoreBlob(blob, qLower, terms);
        if (score > 0.1) {
          hits.push({
            ...base,
            score: Math.min(1, score + 0.25),
            matchKind: "notebook",
            matchLabel: n.title,
            excerpt: n.body.slice(0, 120),
          });
        }
      }
    }
  } catch {
    // shallow hits only
  }

  const byKey = new Map<string, CommunityWorkbenchDeepSearchHit>();
  for (const hit of hits) {
    const key = `${hit.slug}:${hit.matchKind}:${hit.matchLabel}`;
    const existing = byKey.get(key);
    if (!existing || hit.score > existing.score) byKey.set(key, hit);
  }

  return [...byKey.values()]
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function deepSearchAsElectionPlanHits(hits: CommunityWorkbenchDeepSearchHit[]) {
  const matchTypeLabel: Record<CommunityWorkbenchDeepSearchHit["matchKind"], string> = {
    workbench: "Community Workbench",
    leadership: "Workbench Leader",
    committee: "Workbench Committee",
    event: "Workbench Event",
    relationship: "Workbench Relationship",
    notebook: "Workbench Notebook",
  };

  return hits.map((h) => ({
    id: `workbench-deep:${h.slug}:${h.matchKind}:${h.matchLabel}`,
    title: `${h.name} · ${h.matchLabel}`,
    href: h.href,
    excerpt: h.excerpt,
    type: matchTypeLabel[h.matchKind] as
      | "Community Workbench"
      | "Workbench Leader"
      | "Workbench Committee"
      | "Workbench Event"
      | "Workbench Relationship"
      | "Workbench Notebook",
    sourcePath: "community-workbench-deep",
    keywords: [h.name, h.matchKind, h.matchLabel],
    score: h.score,
    confidence: h.score >= 0.75 ? ("high" as const) : h.score >= 0.4 ? ("medium" as const) : ("low" as const),
  }));
}
