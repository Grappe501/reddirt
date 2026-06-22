/**
 * Election Plan — opposition research module drill-down registry.
 */
import {
  buildKimHammerCommandCenterNavModules,
  buildKimHammerTier3NavGroups,
} from "@/lib/intelligence/v4/kimHammerOpponentModuleNav";
import type { DebateIntelligenceV4Packet } from "@/lib/intelligence/v4/debateIntelligenceV4Types";
import {
  EP_OPPOSITION_RESEARCH_HREF,
  epOppositionResearchModuleHref,
} from "@/lib/election-plan/debate-prep-links";
import { getKimHammerV4ModuleEntry } from "@/lib/intelligence/kimHammerV4ModuleRegistry";
import { getKimHammerModuleHref } from "@/lib/opposition/kimHammerBriefingRegistry";

export type OppositionResearchModule = {
  id: string;
  title: string;
  summary: string;
  href: string;
  epHref: string;
};

export const OPPOSITION_RESEARCH_EXTRA_MODULES: OppositionResearchModule[] = [
  {
    id: "debate-night",
    title: "Debate night card",
    summary: "Kelly's 5-minute pre-stage card — export-ready Hammer lines, top rebuttals, Pakko respect pivots.",
    href: "/election-plan/opposition-research/debate-night",
    epHref: "/election-plan/opposition-research/debate-night",
  },
  {
    id: "dossier-pakko",
    title: "Michael Pakko dossier",
    summary: "Third-candidate dossier — economist/LP chair, reform themes, contrast gate, lead stories.",
    href: "/admin/intelligence/opponents/dossiers/michael-packo",
    epHref: epOppositionResearchModuleHref("dossier-pakko"),
  },
  {
    id: "pakko-quotes",
    title: "Pakko sourced quotes",
    summary: "Verified quote ledger with Kelly response frames and do-not-misquote guardrails.",
    href: "/admin/intelligence/opponents/michael-packo/quotes",
    epHref: epOppositionResearchModuleHref("pakko-quotes"),
  },
  {
    id: "three-way-geometry",
    title: "Three-way debate geometry",
    summary: "Hammer vs Pakko vs Kelly — respect rules, reform pivots, ACCA panel patterns.",
    href: "/admin/intelligence/kelly-debate-coaching",
    epHref: epOppositionResearchModuleHref("three-way-geometry"),
  },
  {
    id: "export-ready-lines",
    title: "Export-ready debate lines",
    summary: "Tier-1 cited Hammer claims cleared for Kelly stage use — staff verified.",
    href: "/admin/intelligence/kim-hammer/evidence-command",
    epHref: epOppositionResearchModuleHref("export-ready-lines"),
  },
  {
    id: "claims-ledger",
    title: "Claims to verify",
    summary: "Claims ledger — supported, partial, and needs-research before broadcast.",
    href: "/admin/intelligence/claims",
    epHref: epOppositionResearchModuleHref("claims-ledger"),
  },
];

export function listOppositionResearchModules(v4: DebateIntelligenceV4Packet): OppositionResearchModule[] {
  const highlights = buildKimHammerCommandCenterNavModules(v4).map((mod) => ({
    ...mod,
    epHref: epOppositionResearchModuleHref(mod.id),
  }));
  const seen = new Set(highlights.map((m) => m.id));
  const merged: OppositionResearchModule[] = [...highlights];

  for (const group of buildKimHammerTier3NavGroups()) {
    for (const mod of group.modules) {
      if (seen.has(mod.id)) continue;
      merged.push({
        ...mod,
        epHref: epOppositionResearchModuleHref(mod.id),
      });
      seen.add(mod.id);
    }
  }

  for (const mod of OPPOSITION_RESEARCH_EXTRA_MODULES) {
    if (seen.has(mod.id)) continue;
    merged.push(mod);
    seen.add(mod.id);
  }

  return merged;
}

export function getOppositionResearchModule(
  v4: DebateIntelligenceV4Packet,
  moduleId: string,
): OppositionResearchModule | undefined {
  const found = listOppositionResearchModules(v4).find((m) => m.id === moduleId);
  if (found) return found;

  const entry = getKimHammerV4ModuleEntry(moduleId);
  if (!entry) return undefined;

  return {
    id: moduleId,
    title: entry.title,
    summary: entry.eyebrow,
    href: getKimHammerModuleHref(moduleId),
    epHref: epOppositionResearchModuleHref(moduleId),
  };
}

export function oppositionResearchModuleIds(v4: DebateIntelligenceV4Packet): string[] {
  return listOppositionResearchModules(v4).map((m) => m.id);
}

/** Map legacy admin KH hrefs to Election Plan opposition drill-down routes. */
export function resolveOppositionResearchHref(adminHref: string, v4: DebateIntelligenceV4Packet): string {
  const path = adminHref.split("?")[0] ?? adminHref;
  const modules = listOppositionResearchModules(v4);
  const exact = modules.find((m) => m.href === path);
  if (exact) return exact.epHref;

  const khSegment = path.match(/\/admin\/intelligence\/kim-hammer\/([^/]+)/)?.[1];
  if (khSegment) {
    const byId = modules.find((m) => m.id === khSegment);
    if (byId) return byId.epHref;
    if (getKimHammerV4ModuleEntry(khSegment)) {
      return epOppositionResearchModuleHref(khSegment);
    }
  }

  if (path.includes("/opponents/dossiers/kim-hammer")) {
    return epOppositionResearchModuleHref("dossier-hammer");
  }
  if (path.includes("/opponents/dossiers/michael-packo")) {
    return epOppositionResearchModuleHref("dossier-pakko");
  }
  if (path.includes("/claims")) {
    return epOppositionResearchModuleHref("claims-ledger");
  }

  return EP_OPPOSITION_RESEARCH_HREF;
}
