import Link from "next/link";
import { vos } from "./victory-os-ui/victory-os-tokens";

/** Strategic entry to Victory OS — unified Campaign OS home (Sprints 0–5). */
export function PathToVictoryDashboardCard() {
  return (
    <section className={`${vos.hero} p-8`} aria-labelledby="path-to-victory-heading">
      <div className={vos.heroGlow} />
      <div className={vos.heroGlowAlt} />
      <div className="relative">
        <p className={vos.eyebrowOnDark}>Victory OS · Layers 0–5</p>
        <h2 id="path-to-victory-heading" className="mt-2 font-heading text-2xl font-bold md:text-3xl">
          Path to 50% + 1
        </h2>
        <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-white/85">
          Monday decisions, Victory Board, daily Season 5 cadence, tactic linkage, and Election Day ops — the statewide campaign operating system.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/admin/mission-brief" className={vos.btnCopper}>
            Monday brief
          </Link>
          <Link href="/admin/victory-board" className={vos.btnSecondary}>
            Victory Board
          </Link>
          <Link href="/admin/election-day" className={vos.btnSecondary}>
            Election Day
          </Link>
        </div>
      </div>
    </section>
  );
}
