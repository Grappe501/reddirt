"use client";

import { useEffect } from "react";

/** Registers a minimal service worker (shell only; no sensitive caching). Safe no-op if file missing. */
export function KellyPwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/kelly/calendar-sw.js", { scope: "/kelly/" }).catch(() => {});
  }, []);
  return null;
}
