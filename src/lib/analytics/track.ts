"use client";

import { useEffect } from "react";

function sessionId(): string {
  if (typeof window === "undefined") return "";
  const key = "reddirt_sid";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(key, id);
  }
  return id;
}

export async function trackEvent(
  name: string,
  payload?: Record<string, unknown>,
  path?: string,
): Promise<void> {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        path: path ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
        sessionId: sessionId(),
        payload,
      }),
    });
  } catch {
    /* non-blocking */
  }
}

export function usePageView(pathname: string | null) {
  useEffect(() => {
    if (!pathname) return;
    void trackEvent("page_view", { pathname }, pathname);
  }, [pathname]);
}

export function trackCtaClick(label: string, href?: string) {
  void trackEvent("cta_click", { label, href });
}

export function trackFormStart(formType: string) {
  void trackEvent("form_start", { formType });
}

export function trackFormComplete(formType: string, submissionId?: string) {
  void trackEvent("form_complete", { formType, submissionId });
}

export function trackPathwaySelect(pathway: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("reddirt_pathway", pathway);
  }
  void trackEvent("pathway_select", { pathway });
}
