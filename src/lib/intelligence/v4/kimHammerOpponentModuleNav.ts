import {
  KIM_HAMMER_BRIEFING_DOMAINS,
  KIM_HAMMER_COMMAND_CENTER_HREF,
  getKimHammerModuleHref,
} from "@/lib/opposition/kimHammerBriefingRegistry";
import { KIM_HAMMER_V4_MODULES } from "@/lib/intelligence/kimHammerV4ModuleRegistry";
import type { DebateIntelligenceV4Packet } from "@/lib/intelligence/v4/debateIntelligenceV4Types";

export type KimHammerNavModule = {
  id: string;
  title: string;
  summary: string;
  href: string;
};

export type KimHammerNavGroup = {
  id: string;
  layer: string;
  title: string;
  description: string;
  modules: KimHammerNavModule[];
};

export type KimHammerTier3NavItem = {
  href: string;
  label: string;
  description: string;
};

const TIER_3_SIDEBAR_EXCLUDE_HREFS = new Set([
  KIM_HAMMER_COMMAND_CENTER_HREF,
  `${KIM_HAMMER_COMMAND_CENTER_HREF}/evidence-command`,
  `${KIM_HAMMER_COMMAND_CENTER_HREF}/debate-prep`,
  `${KIM_HAMMER_COMMAND_CENTER_HREF}/debate-ai-workbench`,
  `${KIM_HAMMER_COMMAND_CENTER_HREF}/county-administration-burden`,
]);

function moduleNavEntry(moduleId: string, summaryOverride?: string): KimHammerNavModule {
  const entry = KIM_HAMMER_V4_MODULES[moduleId];
  return {
    id: moduleId,
    title: entry?.title ?? moduleId.replace(/-/g, " "),
    summary: summaryOverride ?? entry?.eyebrow ?? "Kim Hammer research module",
    href: getKimHammerModuleHref(moduleId),
  };
}

/** All Tier-3 modules grouped by KH domain (KH-0 … KH-4). */
export function buildKimHammerTier3NavGroups(): KimHammerNavGroup[] {
  return KIM_HAMMER_BRIEFING_DOMAINS.map((domain) => ({
    id: domain.id,
    layer: domain.layer,
    title: domain.title,
    description: domain.description,
    modules: domain.moduleIds.map((moduleId) => moduleNavEntry(moduleId, domain.eyebrow)),
  }));
}

/** Flat Tier-3 list for sidebar / link audit (deduped by href). */
export function buildKimHammerTier3NavItems(): KimHammerTier3NavItem[] {
  const seen = new Set<string>();
  const items: KimHammerTier3NavItem[] = [];
  for (const group of buildKimHammerTier3NavGroups()) {
    for (const mod of group.modules) {
      if (seen.has(mod.href)) continue;
      seen.add(mod.href);
      items.push({
        href: mod.href,
        label: mod.title,
        description: `${group.layer} · ${mod.summary}`,
      });
    }
  }
  return items;
}

/** Sidebar extended nav — skip modules already in primary/extended seeds. */
export function buildKimHammerTier3SidebarNavItems(): KimHammerTier3NavItem[] {
  return buildKimHammerTier3NavItems().filter((item) => !TIER_3_SIDEBAR_EXCLUDE_HREFS.has(item.href));
}

export function getKimHammerTier3LinkAuditRoutes(): string[] {
  return [
    KIM_HAMMER_COMMAND_CENTER_HREF,
    ...buildKimHammerTier3NavItems().map((i) => i.href),
    `${KIM_HAMMER_COMMAND_CENTER_HREF}/debate-prep`,
  ];
}

export function getKimHammerNavGroupForPath(pathname: string): KimHammerNavGroup | undefined {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
  for (const group of buildKimHammerTier3NavGroups()) {
    if (group.modules.some((m) => path === m.href || path.startsWith(`${m.href}/`))) {
      return group;
    }
  }
  if (path.startsWith(`${KIM_HAMMER_COMMAND_CENTER_HREF}/bills`)) {
    return buildKimHammerTier3NavGroups().find((g) => g.id === "domain-kh0-record");
  }
  if (path.startsWith(`${KIM_HAMMER_COMMAND_CENTER_HREF}/counties`)) {
    return buildKimHammerTier3NavGroups().find((g) => g.id === "domain-kh4-governance");
  }
  return undefined;
}

/** Command-center highlights — dynamic stats from v4 packet + full domain catalog below. */
export function buildKimHammerCommandCenterNavModules(v4: DebateIntelligenceV4Packet): KimHammerNavModule[] {
  const gapCount = v4.intelligenceGaps.length;
  const layers = v4.researchLayers;

  const highlights: KimHammerNavModule[] = [
    {
      id: "debate-prep",
      title: "Debate prep packet",
      summary: `${v4.debatePrepSectionsV4.length || v4.debatePrepSections.length} rehearsal sections — Kelly's primary debate-night path.`,
      href: "/admin/intelligence/kim-hammer/debate-prep",
    },
    {
      id: "dossier-hammer",
      title: "Hammer candidate dossier",
      summary: "8 narrative sections, claims ledger, ACCA panel tactics.",
      href: "/admin/intelligence/opponents/dossiers/kim-hammer",
    },
    {
      id: "debate-profile",
      title: "Debate profile (KH-2)",
      summary: `${layers.debateProfile.length} sections — argument lanes and response architecture.`,
      href: "/admin/intelligence/kim-hammer/debate-profile",
    },
    {
      id: "themes",
      title: "Election record themes",
      summary: `${v4.themeMatrix.length} bill-linked theme clusters.`,
      href: "/admin/intelligence/kim-hammer/themes",
    },
    {
      id: "timeline",
      title: "Legislative timeline",
      summary: `${v4.timeline.length} continuity rows by year and act.`,
      href: "/admin/intelligence/kim-hammer/timeline",
    },
    {
      id: "integrity-foundation-2021",
      title: "2021 integrity foundation",
      summary: v4.integrity2021
        ? `${v4.integrity2021.billNumbers.length}-bill package anchor.`
        : "Six-bill package — architecture debate anchor.",
      href: "/admin/intelligence/kim-hammer/integrity-foundation-2021",
    },
    {
      id: "intelligence-gaps",
      title: "Intelligence gaps",
      summary: `${gapCount} open retrieval items before export.`,
      href: "/admin/intelligence/kim-hammer/intelligence-gaps",
    },
    {
      id: "evidence-command",
      title: "Evidence command",
      summary: "Citation locker, export gate, retrieval tasks.",
      href: "/admin/intelligence/kim-hammer/evidence-command",
    },
    {
      id: "dossier-pakko",
      title: "Pakko candidate dossier",
      summary: "Three-way geometry, bio timeline — partial verified.",
      href: "/admin/intelligence/opponents/dossiers/michael-packo",
    },
  ];

  if (v4.opponentModules.length) {
    const seen = new Set(highlights.map((m) => m.href));
    for (const mod of v4.opponentModules) {
      if (!seen.has(mod.href)) {
        highlights.push({ id: mod.id, title: mod.title, summary: mod.summary, href: mod.href });
      }
    }
  }

  return highlights;
}
