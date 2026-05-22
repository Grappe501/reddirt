import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";

export type OperatorContextSession = {
  lastWorkflow?: string | null;
  activeMonth: string;
  activeCounty?: string | null;
  lastPathname?: string | null;
  pinnedWorkflows: string[];
  recentPaths: string[];
  commandPaletteHistory: string[];
  collapsedSections: string[];
  focusMode: boolean;
  rolePreference?: CampaignUserRole | null;
  updatedAt: string;
};

export const OPERATOR_CONTEXT_STORAGE_KEY = "campaign-os-operator-context-v1";

export const DEFAULT_OPERATOR_CONTEXT: OperatorContextSession = {
  activeMonth: "2026-03",
  pinnedWorkflows: [],
  recentPaths: [],
  commandPaletteHistory: [],
  collapsedSections: [],
  focusMode: false,
  updatedAt: new Date(0).toISOString(),
};

export function parseOperatorContextSession(raw: unknown): OperatorContextSession {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_OPERATOR_CONTEXT, updatedAt: new Date().toISOString() };
  const o = raw as Partial<OperatorContextSession>;
  return {
    lastWorkflow: o.lastWorkflow ?? null,
    activeMonth: typeof o.activeMonth === "string" ? o.activeMonth : DEFAULT_OPERATOR_CONTEXT.activeMonth,
    activeCounty: o.activeCounty ?? null,
    lastPathname: o.lastPathname ?? null,
    pinnedWorkflows: Array.isArray(o.pinnedWorkflows) ? o.pinnedWorkflows.filter((x) => typeof x === "string") : [],
    recentPaths: Array.isArray(o.recentPaths) ? o.recentPaths.filter((x) => typeof x === "string").slice(0, 12) : [],
    commandPaletteHistory: Array.isArray(o.commandPaletteHistory)
      ? o.commandPaletteHistory.filter((x) => typeof x === "string").slice(0, 20)
      : [],
    collapsedSections: Array.isArray(o.collapsedSections) ? o.collapsedSections.filter((x) => typeof x === "string") : [],
    focusMode: Boolean(o.focusMode),
    rolePreference: o.rolePreference ?? null,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : new Date().toISOString(),
  };
}

export function mergeOperatorContext(
  prev: OperatorContextSession,
  patch: Partial<OperatorContextSession>,
): OperatorContextSession {
  return {
    ...prev,
    ...patch,
    pinnedWorkflows: patch.pinnedWorkflows ?? prev.pinnedWorkflows,
    recentPaths: patch.recentPaths ?? prev.recentPaths,
    commandPaletteHistory: patch.commandPaletteHistory ?? prev.commandPaletteHistory,
    collapsedSections: patch.collapsedSections ?? prev.collapsedSections,
    updatedAt: new Date().toISOString(),
  };
}

export function recordPathVisit(ctx: OperatorContextSession, pathname: string): OperatorContextSession {
  const recent = [pathname, ...ctx.recentPaths.filter((p) => p !== pathname)].slice(0, 12);
  return mergeOperatorContext(ctx, { lastPathname: pathname, recentPaths: recent });
}

export function recordPaletteQuery(ctx: OperatorContextSession, query: string): OperatorContextSession {
  const q = query.trim();
  if (!q) return ctx;
  const history = [q, ...ctx.commandPaletteHistory.filter((h) => h !== q)].slice(0, 20);
  return mergeOperatorContext(ctx, { commandPaletteHistory: history });
}

export function parseMonthFromPath(pathname: string, search?: string): string | null {
  const fromSearch = search?.match(/[?&]month=(\d{4}-\d{2})/)?.[1];
  if (fromSearch) return fromSearch;
  const fromPath = pathname.match(/(\d{4}-\d{2})/)?.[1];
  return fromPath ?? null;
}
