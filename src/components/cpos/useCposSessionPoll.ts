"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { MeetingSessionPublic } from "@/lib/cpos/session-types";

const DEFAULT_POLL_MS = 2000;

type SessionPollState = {
  session: MeetingSessionPublic | null;
  loading: boolean;
  error: string | null;
};

export function useCposSessionPoll(meetingId: string, pollMs = DEFAULT_POLL_MS): SessionPollState {
  const [session, setSession] = useState<MeetingSessionPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/cpos/session/${meetingId}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Session poll failed (${res.status})`);
      const data = (await res.json()) as { session: MeetingSessionPublic };
      if (mounted.current) {
        setSession(data.session);
        setError(null);
        setLoading(false);
      }
    } catch (e) {
      if (mounted.current) {
        setError(e instanceof Error ? e.message : "Poll failed");
        setLoading(false);
      }
    }
  }, [meetingId]);

  useEffect(() => {
    mounted.current = true;
    fetchSession();
    const id = setInterval(fetchSession, pollMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [fetchSession, pollMs]);

  return { session, loading, error };
}

export async function postSessionAdvance(
  meetingId: string,
  payload: import("@/lib/cpos/session-types").SessionAdvancePayload,
): Promise<MeetingSessionPublic> {
  const res = await fetch(`/api/cpos/session/${meetingId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Advance failed (${res.status})`);
  }
  const data = (await res.json()) as { session: MeetingSessionPublic };
  return data.session;
}
