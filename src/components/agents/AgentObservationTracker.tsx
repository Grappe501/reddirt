"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { recordAgentObservationAction } from "@/app/admin/agent-observations/actions";
import type { UserUxObservationEvent } from "@/lib/agents/user-intelligence/user-observations";
import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";

type TrackerContext = {
  role: string;
  pathname: string;
  period?: string;
  recordId?: string | null;
  track: (event: UserUxObservationEvent, meta?: Record<string, string | number | boolean | null>) => void;
};

const Ctx = createContext<TrackerContext | null>(null);

export function useAgentObservation() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      track: (_event: UserUxObservationEvent, _meta?: Record<string, string | number | boolean | null>) => {},
    };
  }
  return { track: ctx.track };
}

export function AgentObservationTracker({
  role,
  pathname,
  period,
  recordId,
  trackPageView = true,
  children,
}: {
  role: CampaignUserRole | string;
  pathname: string;
  period?: string;
  recordId?: string | null;
  trackPageView?: boolean;
  children: ReactNode;
}) {
  const viewedRef = useRef(false);

  const track = useCallback(
    (event: UserUxObservationEvent, meta?: Record<string, string | number | boolean | null>) => {
      const baseMeta = period ? { ...meta, month: period } : meta;
      void recordAgentObservationAction({
        event,
        role: String(role),
        pathname,
        recordId: recordId ?? null,
        meta: baseMeta,
      }).catch(() => {});
    },
    [role, pathname, period, recordId],
  );

  useEffect(() => {
    if (!trackPageView || viewedRef.current) return;
    viewedRef.current = true;
    track("page_viewed");
  }, [trackPageView, track]);

  return <Ctx.Provider value={{ role: String(role), pathname, period, recordId, track }}>{children}</Ctx.Provider>;
}
