/**
 * Election Plan — opposition research module drill-down registry.
 */
import { buildKimHammerCommandCenterNavModules } from "@/lib/intelligence/v4/kimHammerOpponentModuleNav";
import type { DebateIntelligenceV4Packet } from "@/lib/intelligence/v4/debateIntelligenceV4Types";
import {
  EP_OPPOSITION_RESEARCH_HREF,
  epOppositionResearchModuleHref,
} from "@/lib/election-plan/debate-prep-links";

export type OppositionResearchModule = {
  id: string;
  title: string;
  summary: string;
  href: string;
  epHref: string;
};

export const OPPOSITION_RESEARCH_EXTRA_MODULES: OppositionResearchModule[] = [
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
  const extra = OPPOSITION_RESEARCH_EXTRA_MODULES.filter((m) => !seen.has(m.id));
  return [...highlights, ...extra];
}

export function getOppositionResearchModule(
  v4: DebateIntelligenceV4Packet,
  moduleId: string,
): OppositionResearchModule | undefined {
  return listOppositionResearchModules(v4).find((m) => m.id === moduleId);
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
