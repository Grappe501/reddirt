import Link from "next/link";
import { OpportunitiesShell } from "@/components/admin/calendar-command-center/OpportunitiesShell";
import {
  communityOpportunitiesDataPresent,
  loadCommunityOpportunitiesNormalized,
  loadWeekendRoutePlansFile,
} from "@/lib/opportunities/load-community-opportunities-data";

export const dynamic = "force-dynamic";

export default function CommunityOpportunitiesPage() {
  const rows = loadCommunityOpportunitiesNormalized();
  const has = communityOpportunitiesDataPresent();
  const plansFile = loadWeekendRoutePlansFile();

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-6">
      <div className="font-body text-xs text-kelly-muted">
        <Link href="/admin/calendar-command-center" className="text-kelly-text underline-offset-2 hover:underline">
          ← Command center
        </Link>
        {" · "}
        <Link href="/admin/calendar-command-center/kelly" className="text-kelly-text underline-offset-2 hover:underline">
          Schedule settlement (Kelly)
        </Link>
        {" · "}
        <span className="text-kelly-text/80">Community opportunities + routing (staff)</span>
      </div>

      <header className="rounded-lg border border-kelly-text/15 bg-[#f7f2e8] px-5 py-5 shadow-sm">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Statewide opportunity engine</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">Where should Kelly be?</h1>
        <p className="mt-2 max-w-3xl font-body text-sm text-kelly-text/75">
          File-staged pipeline: <code className="rounded bg-white/80 px-1">opportunities:scrape</code>,{" "}
          <code className="rounded bg-white/80 px-1">normalize</code>, <code className="rounded bg-white/80 px-1">route-matrix</code>,{" "}
          <code className="rounded bg-white/80 px-1">plan-weekends</code>, <code className="rounded bg-white/80 px-1">ai-rank</code>. No Google
          Calendar writes from this page. <code className="rounded bg-white/80 px-1">GOOGLE_MAPS_API_KEY</code> is server-side only.
        </p>
      </header>

      {!has ? (
        <div className="rounded-lg border border-amber-600/40 bg-amber-50 px-4 py-3 font-body text-sm text-amber-950">
          <p className="font-semibold">No normalized opportunity file yet.</p>
          <p className="mt-1">
            From the RedDirt folder run{" "}
            <code className="rounded bg-amber-100/80 px-1 text-xs">
              npm run opportunities:scrape && npm run opportunities:normalize && npm run opportunities:route-matrix && npm run
              opportunities:plan-weekends
            </code>
          </p>
        </div>
      ) : (
        <OpportunitiesShell opportunities={rows} plans={plansFile?.plans ?? []} />
      )}
    </div>
  );
}
