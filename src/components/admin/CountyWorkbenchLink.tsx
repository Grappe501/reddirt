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
      {bundle.workbenchDashboardV2Href ? (
        <a
          href={bundle.workbenchDashboardV2Href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-[10px] font-bold text-kelly-subtle hover:text-kelly-navy"
          title="Open County Workbench Dashboard V2"
        >
          WB ↗
        </a>
      ) : null}
    </span>
  );
}
