import Link from "next/link";

import { buildCountyEventLinkBundle } from "@/lib/county/county-workbench-event-links";

type Props = {
  countyName: string;
};

/** Reference-only — never the primary county path inside Election Plan. */
export function LegacyCountySystemsPanel({ countyName }: Props) {
  const bundle = buildCountyEventLinkBundle(`${countyName} County`);
  if (!bundle) return null;

  const legacyLinks: { label: string; href: string; external?: boolean }[] = [
    { label: "Public county command (legacy `/counties`)", href: bundle.redDirtCountyHref },
    { label: "Organizing intelligence placeholder", href: bundle.organizingIntelligenceHref },
    { label: "Admin county bridge", href: bundle.adminBridgeHref },
  ];

  if (bundle.redDirtBriefingV2Href) {
    legacyLinks.push({ label: "County briefing v2 (legacy shell)", href: bundle.redDirtBriefingV2Href });
  }
  if (bundle.workbenchLeaderHref) {
    legacyLinks.push({
      label: "External countyWorkbench portal · leader",
      href: bundle.workbenchLeaderHref,
      external: true,
    });
  }
  if (bundle.workbenchCalendarHref) {
    legacyLinks.push({
      label: "External countyWorkbench portal · calendar",
      href: bundle.workbenchCalendarHref,
      external: true,
    });
  }
  if (bundle.workbenchDashboardV2Href) {
    legacyLinks.push({
      label: "External countyWorkbench portal · dashboard v2",
      href: bundle.workbenchDashboardV2Href,
      external: true,
    });
  }

  return (
    <details className="ep-card mt-10 border-dashed text-sm">
      <summary className="cursor-pointer select-none font-semibold text-[var(--ep-navy-muted)]">
        Legacy county systems / reference only
      </summary>
      <p className="mt-3 text-xs leading-relaxed text-[var(--ep-navy-muted)]">
        Election Plan county intelligence lives on this page. Links below are archived bridges — not the primary
        operator path.
      </p>
      <ul className="mt-3 space-y-2">
        {legacyLinks.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-[var(--ep-gold)] underline">
                {link.label} ↗
              </a>
            ) : (
              <Link href={link.href} className="text-[var(--ep-gold)] underline">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}
