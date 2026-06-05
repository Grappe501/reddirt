"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { markNavHrefVisited } from "@/lib/intelligence/useNavVisitHighlight";

/** Marks the current intelligence route as visited for new-link highlighting. */
export function NavVisitRecorder() {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    if (!pathname.startsWith("/admin/intelligence")) return;
    markNavHrefVisited(pathname);
  }, [pathname]);

  return null;
}
