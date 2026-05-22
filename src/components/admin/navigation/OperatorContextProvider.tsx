"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  DEFAULT_OPERATOR_CONTEXT,
  OPERATOR_CONTEXT_STORAGE_KEY,
  mergeOperatorContext,
  parseMonthFromPath,
  parseOperatorContextSession,
  recordPathVisit,
  recordPaletteQuery,
  type OperatorContextSession,
} from "@/lib/dashboard-orchestration/operator-context-session";
import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";

type OperatorContextValue = {
  session: OperatorContextSession;
  setActiveMonth: (month: string) => void;
  pinWorkflow: (id: string) => void;
  toggleFocusMode: () => void;
  recordQuery: (q: string) => void;
  toggleSectionCollapsed: (sectionId: string) => void;
  isSectionCollapsed: (sectionId: string) => boolean;
};

const Ctx = createContext<OperatorContextValue | null>(null);

export function OperatorContextProvider({
  children,
  defaultMonth = "2026-03",
  rolePreference,
}: {
  children: ReactNode;
  defaultMonth?: string;
  rolePreference?: CampaignUserRole;
}) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : "";

  const [session, setSession] = useState<OperatorContextSession>(() => ({
    ...DEFAULT_OPERATOR_CONTEXT,
    activeMonth: defaultMonth,
    rolePreference: rolePreference ?? null,
  }));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(OPERATOR_CONTEXT_STORAGE_KEY);
      if (raw) {
        setSession(parseOperatorContextSession(JSON.parse(raw)));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(OPERATOR_CONTEXT_STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* ignore */
    }
  }, [session]);

  useEffect(() => {
    const month = parseMonthFromPath(pathname, search) ?? session.activeMonth;
    setSession((prev) => {
      let next = recordPathVisit(prev, pathname);
      if (month && month !== prev.activeMonth) {
        next = mergeOperatorContext(next, { activeMonth: month });
      }
      return next;
    });
  }, [pathname, search, session.activeMonth]);

  const setActiveMonth = useCallback((month: string) => {
    setSession((prev) => mergeOperatorContext(prev, { activeMonth: month }));
  }, []);

  const pinWorkflow = useCallback((id: string) => {
    setSession((prev) => {
      const pinned = prev.pinnedWorkflows.includes(id)
        ? prev.pinnedWorkflows.filter((p) => p !== id)
        : [id, ...prev.pinnedWorkflows].slice(0, 8);
      return mergeOperatorContext(prev, { pinnedWorkflows: pinned, lastWorkflow: id });
    });
  }, []);

  const toggleFocusMode = useCallback(() => {
    setSession((prev) => mergeOperatorContext(prev, { focusMode: !prev.focusMode }));
  }, []);

  const recordQuery = useCallback((q: string) => {
    setSession((prev) => recordPaletteQuery(prev, q));
  }, []);

  const toggleSectionCollapsed = useCallback((sectionId: string) => {
    setSession((prev) => {
      const collapsed = prev.collapsedSections.includes(sectionId)
        ? prev.collapsedSections.filter((s) => s !== sectionId)
        : [...prev.collapsedSections, sectionId];
      return mergeOperatorContext(prev, { collapsedSections: collapsed });
    });
  }, []);

  const isSectionCollapsed = useCallback(
    (sectionId: string) => session.collapsedSections.includes(sectionId),
    [session.collapsedSections],
  );

  const value = useMemo(
    () => ({
      session,
      setActiveMonth,
      pinWorkflow,
      toggleFocusMode,
      recordQuery,
      toggleSectionCollapsed,
      isSectionCollapsed,
    }),
    [session, setActiveMonth, pinWorkflow, toggleFocusMode, recordQuery, toggleSectionCollapsed, isSectionCollapsed],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOperatorContext(): OperatorContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      session: { ...DEFAULT_OPERATOR_CONTEXT, updatedAt: new Date().toISOString() },
      setActiveMonth: () => {},
      pinWorkflow: () => {},
      toggleFocusMode: () => {},
      recordQuery: () => {},
      toggleSectionCollapsed: () => {},
      isSectionCollapsed: () => false,
    };
  }
  return ctx;
}
