import Link from "next/link";
import { Phase15P7UpgradePassPanel } from "@/components/admin/intelligence/Phase15P7UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase15P7Bar,
  computePhase15P7UpgradePass,
  IPAD_POLISH_HUB_HREF,
} from "@/lib/intelligence/v4/phase15P7Closure";
import { listIpadBottomNavTabs } from "@/lib/intelligence/v4/phase15P7IpadPolish";

export const dynamic = "force-dynamic";

export default function Phase15P7UpgradePage() {
  const report = computePhase15P7UpgradePass();
  const bar = assertPhase15P7Bar();
  const tabs = listIpadBottomNavTabs("CANDIDATE");

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 15 P7"
        title="iPad polish"
        description="Five CCE section bottom nav on candidate iPad deploy — touch-safe sheets, safe areas, stage-side Kelly default."
      >
        <V4BackLinks />
        <Link
          href={IPAD_POLISH_HUB_HREF}
          className="rounded-full border border-sky-400 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-950"
        >
          iPad polish hub
        </Link>
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
      </V4PageHeader>

      <Phase15P7UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 15 P7 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase15-p7-ipad-polish.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Bottom nav tabs ({tabs.length})</h2>
        {tabs.map((tab) => (
          <article key={tab.sectionId} className="rounded-xl border border-sky-100 bg-white p-4 text-sm">
            <p className="font-bold text-kelly-navy">
              {tab.shortLabel} — {tab.label}
            </p>
            <p className="mt-1 text-[10px] text-kelly-muted">
              {tab.linkCount} links · primary {tab.primaryHref}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
