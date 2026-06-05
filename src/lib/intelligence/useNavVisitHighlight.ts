"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAllTrackedNewNavHrefs,
  isTrackedNewNavHref,
  normalizeNavHref,
} from "@/lib/intelligence/navLinkReleaseManifest";

const STORAGE_KEY = "reddirt-intelligence-nav-visits-v1";

type NavVisitStore = {
  version: 1;
  visited: string[];
};

function readStore(): NavVisitStore {
  if (typeof window === "undefined") {
    return { version: 1, visited: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, visited: [] };
    const parsed = JSON.parse(raw) as NavVisitStore;
    if (parsed.version !== 1 || !Array.isArray(parsed.visited)) {
      return { version: 1, visited: [] };
    }
    return { version: 1, visited: parsed.visited.map(normalizeNavHref) };
  } catch {
    return { version: 1, visited: [] };
  }
}

function writeStore(store: NavVisitStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function ancestorHrefs(path: string): string[] {
  const normalized = normalizeNavHref(path);
  const parts = normalized.split("/").filter(Boolean);
  const hrefs = [normalized];
  for (let i = parts.length; i > 2; i -= 1) {
    hrefs.push(`/${parts.slice(0, i).join("/")}`);
  }
  return hrefs;
}

export function markNavHrefVisited(href: string) {
  const store = readStore();
  const visited = new Set(store.visited);
  for (const candidate of ancestorHrefs(href)) {
    visited.add(candidate);
  }
  writeStore({ version: 1, visited: [...visited] });
  window.dispatchEvent(new CustomEvent("intelligence-nav-visit", { detail: { href: normalizeNavHref(href) } }));
}

export function useNavVisitHighlight() {
  const [visited, setVisited] = useState<string[]>(() => readStore().visited);

  useEffect(() => {
    const sync = () => setVisited(readStore().visited);
    window.addEventListener("storage", sync);
    window.addEventListener("intelligence-nav-visit", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("intelligence-nav-visit", sync);
    };
  }, []);

  const visitedSet = useMemo(() => new Set(visited), [visited]);

  const isNewUnvisited = useCallback(
    (href: string) => {
      const normalized = normalizeNavHref(href);
      if (!isTrackedNewNavHref(normalized)) return false;
      return !visitedSet.has(normalized);
    },
    [visitedSet],
  );

  const markVisited = useCallback((href: string) => {
    markNavHrefVisited(href);
    setVisited(readStore().visited);
  }, []);

  const newUnvisitedCount = useMemo(
    () => getAllTrackedNewNavHrefs().filter((href) => !visitedSet.has(href)).length,
    [visitedSet],
  );

  return { isNewUnvisited, markVisited, newUnvisitedCount, visitedSet };
}

export const NAV_LINK_NEW_CHIP_CLASS =
  "border-teal-500 bg-teal-50 text-teal-950 ring-1 ring-teal-300/80 shadow-sm shadow-teal-100";

export const NAV_LINK_NEW_SIDEBAR_CLASS =
  "ring-1 ring-teal-300/90 bg-teal-950/50 text-teal-100 font-semibold";

export const NAV_LINK_NEW_IPAD_CLASS = "text-teal-700 font-extrabold";
