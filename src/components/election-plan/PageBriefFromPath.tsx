"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { PageBrief } from "@/components/election-plan/PageBrief";
import { getPageBriefForPath } from "@/lib/election-plan/load-page-briefs";
import type { PageBrief as PageBriefType } from "@/lib/election-plan/load-page-briefs";

type Props = {
  /** Override auto-detected brief (e.g. dynamic county title) */
  override?: Partial<PageBriefType> & { id?: string };
  compact?: boolean;
  /** Skip on hub home */
  hideOnHub?: boolean;
};

export function PageBriefFromPath({ override, compact, hideOnHub = true }: Props) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  if (hideOnHub && pathname === "/election-plan/search") return null;
  if (hideOnHub && pathname === "/election-plan" && !tab) return null;
  if (pathname.startsWith("/election-plan/executive-book/")) return null;

  const base = getPageBriefForPath(pathname, tab);
  if (!base && !override) return null;

  const brief = base
    ? {
        ...base,
        ...override,
        title: override?.title ?? base.title,
        answers: override?.answers ?? base.answers,
        keyMetrics: override?.keyMetrics ?? base.keyMetrics,
        bestFor: override?.bestFor ?? base.bestFor,
        relatedLinks: override?.relatedLinks ?? base.relatedLinks,
      }
    : ({
        id: override?.id ?? "custom",
        title: override?.title ?? "This page",
        answers: override?.answers ?? "",
        keyMetrics: override?.keyMetrics ?? [],
        bestFor: override?.bestFor ?? [],
        relatedLinks: override?.relatedLinks ?? [],
      } satisfies PageBriefType);

  if (!brief.answers) return null;

  return <PageBrief brief={brief} compact={compact} />;
}
