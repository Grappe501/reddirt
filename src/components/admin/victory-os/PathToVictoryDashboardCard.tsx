import Link from "next/link";
import { vos } from "./victory-os-ui/victory-os-tokens";

/** Strategic entry to Victory OS — doctrine-locked until Sprint 0 map review. */
export function PathToVictoryDashboardCard() {
  return (
    <section className={`${vos.hero} p-8`} aria-labelledby="path-to-victory-heading">
      <div className={vos.heroGlow} />
      <div className={vos.heroGlowAlt} />
      <div className="relative">
        <p className={vos.eyebrowOnDark}>Victory OS · Strategic command</p>
        <h2 id="path-to-victory-heading" className="mt-2 font-heading text-2xl font-bold md:text-3xl">
          Path to Victory
        </h2>
        <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-white/85">
          Governance command surface — six leadership locks, Victory Map review, and the path to 50% + 1. Priority 2
          unlocks after sign-off.
        </p>
        <div className="mt-6">
          <Link href="/admin/mission-brief" className={vos.btnCopper}>
            Open Path to Victory
          </Link>
        </div>
      </div>
    </section>
  );
}
