"use client";

import { useEffect } from "react";
import {
  classifyViewport,
  isCampaignAnalyticsPath,
  isPublicConversionHref,
  sanitizeLocale,
  sanitizeReferrerHost,
  sanitizeTimezone,
} from "@/lib/analytics/visitor-signals";

function visitorId(): string {
  if (typeof window === "undefined") return "";
  const key = "reddirt_sid";
  try {
    let id = window.localStorage.getItem(key);
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `ephemeral-${Date.now()}`;
  }
}

function returningFlag(): "0" | "1" {
  try {
    const key = "reddirt_first_seen";
    const existing = window.localStorage.getItem(key);
    const now = Date.now();
    if (!existing) {
      window.localStorage.setItem(key, String(now));
      return "0";
    }
    const first = Number(existing);
    if (!Number.isFinite(first)) {
      window.localStorage.setItem(key, String(now));
      return "0";
    }
    return now - first > 30 * 60 * 1000 ? "1" : "0";
  } catch {
    return "0";
  }
}

function clientSignals(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const locale = sanitizeLocale(window.navigator.language);
  const viewport = classifyViewport(window.innerWidth);
  let timezone: string | undefined;
  try {
    timezone = sanitizeTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    timezone = undefined;
  }
  return {
    device: viewport,
    viewport,
    returning: returningFlag(),
    ...(locale ? { locale } : {}),
    ...(timezone ? { timezone } : {}),
  };
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
        sessionId: visitorId(),
        payload,
      }),
    });
  } catch {
    /* non-blocking */
  }
}

function publicReferrer(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const raw = document.referrer?.trim();
  if (!raw) return undefined;
  try {
    const u = new URL(raw);
    if (u.origin === window.location.origin) return undefined;
    return `${u.hostname}${u.pathname}`.slice(0, 200);
  } catch {
    return undefined;
  }
}

function campaignParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const q = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = q.get(key)?.trim();
    if (v && v.length <= 80) out[key] = v;
  }
  return out;
}

export function usePageView(pathname: string | null) {
  useEffect(() => {
    if (!pathname) return;
    if (!isCampaignAnalyticsPath(pathname)) return;
    void trackEvent(
      "page_view",
      {
        pathname,
        referrer: publicReferrer(),
        ...campaignParams(),
        ...clientSignals(),
      },
      pathname,
    );

    const engagedKey = `reddirt_engage:${pathname}`;
    if (sessionStorage.getItem(engagedKey) === "1") return undefined;
    const timer = window.setTimeout(() => {
      if (document.visibilityState !== "visible") return;
      try {
        sessionStorage.setItem(engagedKey, "1");
      } catch {
        /* private mode */
      }
      void trackEvent("engage", { pathname, ...clientSignals() }, pathname);
    }, 15_000);
    return () => window.clearTimeout(timer);
  }, [pathname]);
}

export function usePublicCtaCapture() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const href = link.getAttribute("href") ?? "";
      if (!isPublicConversionHref(href)) return;
      const path = window.location.pathname;
      if (!isCampaignAnalyticsPath(path)) return;
      const label = (link.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80) || href;
      void trackEvent("cta_click", { label, href: href.slice(0, 200), ...clientSignals() }, path);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

export function useScrollDepth(pathname: string | null) {
  useEffect(() => {
    if (!pathname || !isCampaignAnalyticsPath(pathname)) return undefined;
    const seen = new Set<number>();
    const mark = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      const pct = total <= 0 ? 100 : Math.round((el.scrollTop / total) * 100);
      for (const milestone of [25, 50, 75, 100]) {
        if (pct < milestone || seen.has(milestone)) continue;
        seen.add(milestone);
        void trackEvent("scroll_depth", { scroll: String(milestone), pathname, ...clientSignals() }, pathname);
      }
    };
    mark();
    window.addEventListener("scroll", mark, { passive: true });
    return () => window.removeEventListener("scroll", mark);
  }, [pathname]);
}

export function useOutboundClicks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const href = link.getAttribute("href") ?? "";
      if (!href || isPublicConversionHref(href)) return;
      const path = window.location.pathname;
      if (!isCampaignAnalyticsPath(path)) return;
      let host: string | undefined;
      try {
        const url = href.startsWith("http") ? new URL(href) : null;
        if (!url || url.origin === window.location.origin) return;
        host = sanitizeReferrerHost(url.hostname);
      } catch {
        return;
      }
      if (!host) return;
      void trackEvent("outbound", { host, href: href.slice(0, 200), ...clientSignals() }, path);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

export function usePageTiming(pathname: string | null) {
  useEffect(() => {
    if (!pathname || !isCampaignAnalyticsPath(pathname)) return undefined;
    const started = Date.now();
    let sent = false;
    const flush = () => {
      if (sent) return;
      sent = true;
      const seconds = Math.max(0, Math.round((Date.now() - started) / 1000));
      void trackEvent("page_timing", { seconds: String(seconds), pathname, ...clientSignals() }, pathname);
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [pathname]);
}

export function trackCtaClick(label: string, href?: string) {
  void trackEvent("cta_click", { label, href, ...clientSignals() });
}

export function trackFormStart(formType: string) {
  void trackEvent("form_start", { formType, ...clientSignals() });
}

export function trackFormComplete(formType: string, submissionId?: string) {
  void trackEvent("form_complete", { formType, submissionId, ...clientSignals() });
}

export function trackPathwaySelect(pathway: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("reddirt_pathway", pathway);
  }
  void trackEvent("pathway_select", { pathway, ...clientSignals() });
}
