"use client";

import Link from "next/link";
import { buildCountyEventLinkBundle } from "@/lib/county/county-workbench-event-links";

export function CountyWorkbenchLink({
  countyLabel,
  className = "",
}: {
  countyLabel: string | null | undefined;
  className?: string;
}) {
  const bundle = buildCountyEventLinkBundle(countyLabel);
  if (!bundle) {
    return countyLabel ? <span className={className}>{countyLabel}</span> : <span className={className}>—</span>;
  }

  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      <Link href={bundle.adminBridgeHref} className="font-semibold text-kelly-navy underline underline-offset-2">
        {bundle.displayName}
      </Link>
      {bundle.workbenchLeaderHref ? (
        <a
          href={bundle.workbenchLeaderHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-[10px] font-bold text-kelly-subtle hover:text-kelly-navy"
          title="Open county playbook (leader workbench)"
        >
          Playbook ↗
        </a>
      ) : bundle.redDirtBriefingV2Href ? (
        <Link href={bundle.redDirtBriefingV2Href} className="font-body text-[10px] font-bold text-kelly-subtle hover:text-kelly-navy">
          Playbook
        </Link>
      ) : null}
    </span>
  );
}
