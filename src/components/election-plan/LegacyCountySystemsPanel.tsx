import { buildCountyEventLinkBundle } from "@/lib/county/county-workbench-event-links";

type Props = {
  countyName: string;
};

/** Reference-only — never the primary county path inside Election Plan. No navigable legacy URLs. */
export function LegacyCountySystemsPanel({ countyName }: Props) {
  const bundle = buildCountyEventLinkBundle(`${countyName} County`);
  if (!bundle) return null;

  const archivedPaths = [
    bundle.redDirtCountyHref,
    bundle.organizingIntelligenceHref,
    bundle.redDirtBriefingV2Href,
    bundle.workbenchLeaderHref,
    bundle.workbenchCalendarHref,
    bundle.workbenchDashboardV2Href,
  ].filter(Boolean) as string[];

  return (
    <details className="ep-card mt-10 border-dashed text-sm">
      <summary className="cursor-pointer select-none font-semibold text-[var(--ep-navy-muted)]">
        Archived county systems (reference only — not linked)
      </summary>
      <p className="mt-3 text-xs leading-relaxed text-[var(--ep-navy-muted)]">
        County operating center lives on this page at{" "}
        <code className="text-[10px]">{bundle.electionPlanCountyHref}</code>. Legacy{" "}
        <code className="text-[10px]">/counties</code>,{" "}
        <code className="text-[10px]">/county-briefings/*/v2</code>, and the external countyWorkbench portal are
        retired for daily operator use — paths listed below for audit only.
      </p>
      {archivedPaths.length > 0 ? (
        <ul className="mt-3 space-y-1 font-mono text-[10px] text-[var(--ep-navy-muted)]">
          {archivedPaths.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      ) : null}
      <p className="mt-3 text-[10px] text-[var(--ep-navy-muted)]">
        Admin bridge (staff): <code>{bundle.adminBridgeHref}</code>
      </p>
    </details>
  );
}
