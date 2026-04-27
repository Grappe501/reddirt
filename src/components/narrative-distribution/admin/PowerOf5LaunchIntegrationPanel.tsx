import Link from "next/link";
import { CountySectionHeader } from "@/components/county/dashboard/CountySectionHeader";
import { CountySourceBadge } from "@/components/county/dashboard/countyDashboardFormat";
import { countyDashboardCardClass } from "@/components/county/dashboard/countyDashboardClassNames";
import { getPowerOf5LaunchPacket } from "@/lib/narrative-distribution/packet-builder";

/**
 * Bridges narrative distribution admin to the Power of 5 onboarding + volunteer dashboards (links only).
 */
export function PowerOf5LaunchIntegrationPanel() {
  const packet = getPowerOf5LaunchPacket();

  return (
    <section className="space-y-4">
      <CountySectionHeader
        overline="Power of 5 × narrative"
        title="Launch packet (integration)"
        description={
          <span className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <span>
              Same deterministic packet the public message hub surfaces — use it to line up field onboarding with the week’s narrative spine.
            </span>
            <CountySourceBadge source="demo" note="Registry-only — no writes or sends from this panel." />
          </span>
        }
      />
      <div className={`${countyDashboardCardClass} space-y-3 p-4 sm:p-5`}>
        <p className="text-xs font-mono text-kelly-text/50">Packet id · {packet.id}</p>
        <p className="text-sm font-medium leading-relaxed text-kelly-text/90">{packet.coreMessage}</p>
        <dl className="grid gap-2 text-sm text-kelly-text/80 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wide text-kelly-text/50">Feedback question</dt>
            <dd className="mt-0.5">{packet.feedbackQuestion}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wide text-kelly-text/50">Assignment</dt>
            <dd className="mt-0.5">{packet.assignmentSuggestion}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wide text-kelly-text/50">Timing</dt>
            <dd className="mt-0.5">{packet.timingSuggestion}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wide text-kelly-text/50">KPI target</dt>
            <dd className="mt-0.5">{packet.kpiTarget}</dd>
          </div>
        </dl>
        <ul className="flex flex-wrap gap-3 text-sm">
          <li>
            <Link href="/onboarding/power-of-5" className="font-semibold text-kelly-navy underline" target="_blank" rel="noreferrer">
              Power of 5 onboarding
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="font-semibold text-kelly-navy underline" target="_blank" rel="noreferrer">
              Personal dashboard
            </Link>
          </li>
          <li>
            <Link href="/messages" className="font-semibold text-kelly-navy underline" target="_blank" rel="noreferrer">
              Public message hub
            </Link>
          </li>
          <li>
            <Link href="/organizing-intelligence" className="font-semibold text-kelly-navy underline" target="_blank" rel="noreferrer">
              State organizing intelligence
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
