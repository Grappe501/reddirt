"use client";

import { useEffect } from "react";
import { COMMS_PLAN_SECTION } from "@/lib/comms-workbench/comms-nav";

const known = new Set<string>(Object.values(COMMS_PLAN_SECTION));

/**
 * On plan detail, scroll known section ids into view when the URL has a hash (dashboard / list deep links).
 */
export function CommsPlanScrollToHash() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.location.hash?.replace(/^#/, "") ?? "";
    if (!raw || !known.has(raw)) return;
    const el = document.getElementById(raw);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);
  return null;
}
