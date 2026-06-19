import Link from "next/link";

import {
  getCityVoterFileRollup,
  getCountyVoterFileRollup,
  getParticipationForContest,
  getVoterFileRollupsMeta,
  participationRate,
  partyShare,
} from "@/lib/election-plan/load-voter-file-location-rollups";
import type {
  ParticipationRollup,
  RegistrationRollup,
  VoterFileCityRollup,
  VoterFileCountyRollup,
} from "@/lib/voter-file/location-rollups-types";
import { cityLocationBriefHref, countyPlaybookHref } from "@/lib/election-plan/location-links";
import { cn } from "@/lib/utils";

type CountyProps = {
  variant: "county";
  countySlug: string;
  countyName: string;
  rollup: VoterFileCountyRollup;
};

type CityProps = {
  variant: "city";
  citySlug: string;
  cityName: string;
  countySlug: string;
  countyName: string;
  rollup: VoterFileCityRollup;
};

type Props = CountyProps | CityProps;

function fmt(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US");
}

function pct(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n}%`;
}

function RegistrationStats({ registration }: { registration: RegistrationRollup }) {
  const { party } = registration;
  return (
    <div className="ep-stat-grid">
      <div className="ep-stat">
        <div className="ep-stat-value">{fmt(registration.total)}</div>
        <div className="ep-stat-label">On SOS roll</div>
      </div>
      <div className="ep-stat">
        <div className="ep-stat-value">{fmt(registration.active)}</div>
        <div className="ep-stat-label">Active</div>
      </div>
      <div className="ep-stat">
        <div className="ep-stat-value">{fmt(party.democrat)}</div>
        <div className="ep-stat-label">Democrat ({pct(partyShare(party.democrat, registration.total))})</div>
      </div>
      <div className="ep-stat">
        <div className="ep-stat-value">{fmt(party.republican)}</div>
        <div className="ep-stat-label">Republican ({pct(partyShare(party.republican, registration.total))})</div>
      </div>
      <div className="ep-stat">
        <div className="ep-stat-value">{fmt(party.other + party.blank)}</div>
        <div className="ep-stat-label">Other / blank</div>
      </div>
    </div>
  );
}

function FeaturedParticipation({ participation, registrationTotal }: { participation: ParticipationRollup[]; registrationTotal: number }) {
  const meta = getVoterFileRollupsMeta();
  const contests = meta?.featuredContests ?? ["2024_GENERAL", "2024_PRIMARY", "2022_GENERAL"];

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--ep-border)] text-xs uppercase text-[var(--ep-navy-muted)]">
            <th className="py-2 pr-3 font-bold">Election</th>
            <th className="py-2 pr-3 font-bold">Voted</th>
            <th className="py-2 pr-3 font-bold">Turnout</th>
            <th className="py-2 font-bold">Primary ballot (D / R)</th>
          </tr>
        </thead>
        <tbody>
          {contests.map((key) => {
            const row = getParticipationForContest(participation, key);
            if (!row) return null;
            const rate = participationRate(row.participated, registrationTotal);
            const dem = row.demPrimaryBallot;
            const rep = row.repPrimaryBallot;
            const primaryNote =
              dem != null || rep != null
                ? `${fmt(dem ?? 0)} / ${fmt(rep ?? 0)}`
                : "—";
            return (
              <tr key={key} className="border-b border-[var(--ep-border)]/60">
                <td className="py-2 pr-3 font-medium text-[var(--ep-navy)]">{row.label}</td>
                <td className="py-2 pr-3">{fmt(row.participated)}</td>
                <td className="py-2 pr-3">{pct(rate)}</td>
                <td className="py-2">{primaryNote}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CountyCityTable({
  cities,
  countyName,
  countySlug,
}: {
  cities: VoterFileCountyRollup["cities"];
  countyName: string;
  countySlug: string;
}) {
  const priority = cities.filter((c) => c.isPriorityCity).slice(0, 12);
  const topOther = cities.filter((c) => !c.isPriorityCity).slice(0, 8);
  const rows = [...priority, ...topOther];

  if (rows.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">By city (SOS residence)</p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-xs uppercase text-[var(--ep-navy-muted)]">
              <th className="py-2 pr-3 font-bold">City</th>
              <th className="py-2 pr-3 font-bold">Registered</th>
              <th className="py-2 pr-3 font-bold">D</th>
              <th className="py-2 pr-3 font-bold">R</th>
              <th className="py-2 font-bold">2024 general</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((city) => {
              const g2024 = getParticipationForContest(city.participation, "2024_GENERAL");
              const href = city.isPriorityCity && city.citySlug ? cityLocationBriefHref(city.citySlug) : null;
              return (
                <tr key={`${city.citySlug ?? city.cityName}`} className="border-b border-[var(--ep-border)]/60">
                  <td className="py-2 pr-3">
                    {href ? (
                      <Link href={href} className="font-semibold text-[var(--ep-navy)] hover:text-[var(--ep-gold)]">
                        {city.cityName}
                      </Link>
                    ) : (
                      <span className="text-[var(--ep-navy-muted)]">{city.cityName}</span>
                    )}
                    {city.isPriorityCity ? (
                      <span className="ml-2 rounded bg-[var(--ep-cream)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--ep-gold)]">
                        Priority
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-3">{fmt(city.registration.total)}</td>
                  <td className="py-2 pr-3">{fmt(city.registration.party.democrat)}</td>
                  <td className="py-2 pr-3">{fmt(city.registration.party.republican)}</td>
                  <td className="py-2">{fmt(g2024?.participated)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
        Residence city from SOS file · priority cities link to location briefs ·{" "}
        <Link href={countyPlaybookHref(countyName, countySlug)} className="underline">
          {countyName} County intelligence
        </Link>
      </p>
    </div>
  );
}

export function VoterFileLocationIntelPanel(props: Props) {
  const meta = getVoterFileRollupsMeta();
  const builtLabel = meta?.builtAt ? new Date(meta.builtAt).toLocaleDateString() : "—";

  const title =
    props.variant === "county"
      ? `${props.countyName} County · SOS voter file`
      : `${props.cityName} · SOS voter file`;

  return (
    <div className={cn("ep-card mb-8 border-l-4 border-emerald-700")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-800">SOS voter registration & history</p>
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">{title}</h2>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
            Aggregate counts only · no individual voter records · built {builtLabel}
          </p>
        </div>
        {props.variant === "city" ? (
          <Link
            href={countyPlaybookHref(props.countyName, props.countySlug)}
            className="rounded-full border border-[var(--ep-border)] px-3 py-1 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
          >
            County roll-up →
          </Link>
        ) : null}
      </div>

      <RegistrationStats registration={props.rollup.registration} />
      <FeaturedParticipation
        participation={props.rollup.participation}
        registrationTotal={props.rollup.registration.total}
      />

      {props.variant === "county" ? (
        <CountyCityTable cities={props.rollup.cities} countyName={props.countyName} countySlug={props.countySlug} />
      ) : null}

      <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
        Party registration from <code className="text-[10px]">CDE_PARTY</code> · participation from statewide voter history file ·
        attributed to SOS residence city/county, not ballot cast location.
      </p>
    </div>
  );
}

export function VoterFileCountyIntelSection({ countySlug, countyName }: { countySlug: string; countyName: string }) {
  const rollup = getCountyVoterFileRollup(countySlug);
  if (!rollup) return null;
  return <VoterFileLocationIntelPanel variant="county" countySlug={countySlug} countyName={countyName} rollup={rollup} />;
}

export function VoterFileCityIntelSection({
  citySlug,
  cityName,
  countySlug,
  countyName,
}: {
  citySlug: string;
  cityName: string;
  countySlug: string;
  countyName: string;
}) {
  const rollup = getCityVoterFileRollup(citySlug);
  if (!rollup) return null;
  return (
    <VoterFileLocationIntelPanel
      variant="city"
      citySlug={citySlug}
      cityName={cityName}
      countySlug={countySlug}
      countyName={countyName}
      rollup={rollup}
    />
  );
}
