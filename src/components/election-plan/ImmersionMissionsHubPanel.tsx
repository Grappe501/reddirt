import Link from "next/link";

import { ImmersionCountyMissionCard } from "@/components/election-plan/ImmersionCountyMissionCard";
import {
  getAllImmersionCountyMissions,
  getImmersionDoctrineHref,
  getImmersionOperatingPrinciple,
} from "@/lib/election-plan/load-immersion-county-missions";

export function ImmersionMissionsHubPanel() {
  const missions = getAllImmersionCountyMissions();

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Campaign Doctrine</p>
      <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Immersion County Missions</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ep-navy-muted)]">
        {getImmersionOperatingPrinciple()}
      </p>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
        People remember missions. They do not remember dashboards.{" "}
        <Link href={getImmersionDoctrineHref()} className="font-semibold text-[var(--ep-navy)] hover:underline">
          Read full doctrine →
        </Link>
      </p>

      <div className="mt-8 space-y-8">
        {missions.map((m) => (
          <ImmersionCountyMissionCard key={m.id} mission={m} />
        ))}
      </div>
    </section>
  );
}
