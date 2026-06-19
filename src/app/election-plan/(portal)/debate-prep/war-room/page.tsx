import { DebatePrepWarRoomPanel } from "@/components/election-plan/DebatePrepWarRoomPanel";
import { DebatePrepTonightPackageClient } from "@/components/election-plan/DebatePrepTonightPackageClient";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { buildDebatePrepSystemV8Snapshot } from "@/lib/election-plan/debate-prep-system-v8";
import { DEBATE_PREP_PACKAGE_LABEL } from "@/lib/election-plan/debate-prep-links";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "War Room | Debate Prep | Election Plan",
  description: "World-class debate prep command center — readiness radar, prep modes, simulations, and psychology stack.",
  robots: { index: false, follow: false },
};

export default function ElectionPlanDebatePrepWarRoomPage() {
  const snapshot = buildDebatePrepSystemV8Snapshot();

  return (
    <>
      <div className="ep-classification">Internal · War room · {DEBATE_PREP_PACKAGE_LABEL}</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepSubnav />

          <header className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--ep-gold)]">
              {snapshot.worldClass.countdownLabel} · world-class engine
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">Debate prep war room</h1>
            <p className="mt-3 max-w-3xl text-sm text-[var(--ep-navy-muted)]">{snapshot.intro}</p>
          </header>

          <DebatePrepTonightPackageClient
            tonightPackage={snapshot.tonightPackage}
            packageCompletenessPct={snapshot.packageCompletenessPct}
            packageLabel={DEBATE_PREP_PACKAGE_LABEL}
          />

          <DebatePrepWarRoomPanel snapshot={snapshot} />
        </div>
      </div>
    </>
  );
}
