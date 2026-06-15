"use client";

import { usePathname } from "next/navigation";

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
  if (hideOnHub && (pathname === "/election-plan" || pathname === "/election-plan/search")) return null;
  if (pathname.startsWith("/election-plan/executive-book/")) return null;

  const base = getPageBriefForPath(pathname);
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
