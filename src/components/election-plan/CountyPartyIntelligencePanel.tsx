import Link from "next/link";

import {
  countyPartiesHubHref,
  countyPartyDetailHref,
  countyPartyMeetingEventId,
  getCountyPartyIntelligenceRollup,
  getCountyPartyProfiles,
  getProposedCountyPartyMeetingsForCounty,
  getRecommendedCountyPartyAction,
  getTopCountyMeetingQueue,
  type CountyPartyProfile,
} from "@/lib/election-plan/load-county-party-intelligence";
import { forwardMotionStopHref } from "@/lib/election-plan/forward-motion-links";
import { getCountyMeetingAssignment } from "@/lib/election-plan/load-county-meeting-assignments";
import { countyPlaybookHref } from "@/lib/election-plan/location-links";

function ConfidenceBadge({ profile }: { profile: CountyPartyProfile }) {
  const colors = {
    high: "bg-emerald-100 text-emerald-900",
    medium: "bg-amber-100 text-amber-900",
    low: "bg-slate-100 text-slate-700",
    none: "bg-red-100 text-red-900",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${colors[profile.confidence]}`}>
      {profile.confidence} confidence
    </span>
  );
}

type Props = {
  profile: CountyPartyProfile;
  variant?: "panel" | "compact";
  /** When true, omit self-link back to county playbook (e.g. already on county page). */
  hidePlaybookLink?: boolean;
};

export function CountyPartyIntelligencePanel({ profile, variant = "panel", hidePlaybookLink = false }: Props) {
  const proposedMeetings = getProposedCountyPartyMeetingsForCounty(profile.slug);
  const action = getRecommendedCountyPartyAction(profile);
  const assignment = getCountyMeetingAssignment(profile.slug);

  if (variant === "compact") {
    return (
      <p className="text-sm text-[var(--ep-navy-muted)]">
        Chair: <strong>{profile.countyChair ?? "TBD"}</strong>
        {profile.meetingInfoRaw ? (
          <>
            {" "}
            · Meeting: {profile.meetingInfoRaw.slice(0, 60)}
            {profile.meetingInfoRaw.length > 60 ? "…" : ""}
          </>
        ) : null}
      </p>
    );
  }

  return (
    <div className="ep-card border-l-4 border-blue-600">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">Phase 18.7I · County Party Intelligence</p>
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Arkansas Dems · {profile.county} County</h2>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
            Public source ·{" "}
            {profile.lastFetchedAt ? new Date(profile.lastFetchedAt).toLocaleDateString() : "—"} ·{" "}
            <a href={profile.sourceUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="underline">
              ArkDems page ↗
            </a>
          </p>
        </div>
        <ConfidenceBadge profile={profile} />
      </div>

      {profile.needsHumanVerification ? (
        <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <strong>Needs human verification.</strong> Call the county chair before scheduling Kelly or a surrogate.
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">County chair</p>
          <p className="font-semibold">{profile.countyChair ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Election commissioner</p>
          <p className="font-semibold">{profile.electionCommissioner ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Meeting info</p>
          <p className="font-medium">{profile.meetingInfoRaw ?? "—"}</p>
        </div>
      </div>

      {proposedMeetings.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Next possible meeting dates (proposed)</p>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
            Parsed from public ArkDems meeting rules · confirm by phone before locking Kelly or a surrogate on calendar
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {proposedMeetings.map((m) => (
              <li key={`${m.date}-${m.slug}`} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--ep-border)] pb-2 last:border-0">
                <span>
                  <strong>{m.date}</strong> · {m.timeLocal ?? "time TBD"} · {m.location ?? "location TBD"}
                </span>
                <Link
                  href={forwardMotionStopHref(countyPartyMeetingEventId(m.slug, m.date))}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  Calendar queue →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : profile.meetingInfoRaw ? (
        <p className="mt-3 text-sm italic text-[var(--ep-navy-muted)]">Meeting rule not parseable — status: needs human call</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {profile.website ? (
          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="rounded-full border px-3 py-1 font-semibold hover:bg-slate-50">
            Website ↗
          </a>
        ) : null}
        {profile.facebook ? (
          <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="rounded-full border px-3 py-1 font-semibold hover:bg-slate-50">
            Facebook ↗
          </a>
        ) : null}
        {profile.contactUrl && !profile.contactUrl.includes("email-protection") ? (
          <a href={profile.contactUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border px-3 py-1 font-semibold hover:bg-slate-50">
            Contact ↗
          </a>
        ) : null}
        <Link href={countyPartyDetailHref(profile.slug)} className="rounded-full bg-blue-700 px-3 py-1 font-semibold text-white">
          Full county party page →
        </Link>
        {hidePlaybookLink ? null : (
          <Link href={countyPlaybookHref(profile.county, profile.slug)} className="rounded-full border px-3 py-1 font-semibold">
            County operating center →
          </Link>
        )}
      </div>

      <div className="mt-4 rounded-lg bg-[var(--ep-cream)] px-3 py-2 text-sm">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Recommended action</p>
        <p className="mt-1">{action}</p>
      </div>

      {assignment ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Meeting plan</p>
            <p className="font-semibold">{assignment.meetingAttendanceLabel}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Volunteer captain</p>
            <p className="font-semibold">{assignment.volunteerCaptain}</p>
          </div>
          {assignment.countyMissionHeadline ? (
            <div>
              <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">County mission</p>
              <p className="font-semibold">{assignment.countyMissionHeadline}</p>
            </div>
          ) : null}
          {assignment.lastKellyVisit ? (
            <div>
              <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Last Kelly visit</p>
              <p className="font-semibold">{assignment.lastKellyVisit}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {profile.sourceQuote ? (
        <p className="mt-3 text-[10px] italic text-[var(--ep-navy-muted)]">Source quote: {profile.sourceQuote}</p>
      ) : null}
    </div>
  );
}

export function CountyPartiesHubPanel() {
  const profiles = getCountyPartyProfiles();
  const rollup = getCountyPartyIntelligenceRollup();
  const topMeetings = getTopCountyMeetingQueue(10);
  const needsVerify = profiles.filter((p) => p.needsHumanVerification);

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Phase 18.7I</p>
      <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">County Party Intelligence</h1>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        Public ArkDems.org data · ingested · flagged for verification · not live outreach
      </p>

      <div className="my-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.fetchedOk}/75</div>
          <div className="ep-stat-label">Pages fetched</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.chairsFound}</div>
          <div className="ep-stat-label">Chairs found</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.parseableMeetings}</div>
          <div className="ep-stat-label">Parseable meetings</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value text-amber-700">{rollup.needsVerification}</div>
          <div className="ep-stat-label">Need verification</div>
        </div>
      </div>

      <div className="mb-8 ep-card">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">Top 10 county meeting opportunities (proposed)</h2>
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Parsed from public meeting rules · confirm by phone before locking calendar</p>
        <ul className="mt-3 space-y-2 text-sm">
          {topMeetings.map((m) => (
            <li key={`${m.slug}-${m.date}`} className="flex flex-wrap justify-between gap-2 border-b border-[var(--ep-border)] pb-2">
              <span>
                <Link href={countyPartyDetailHref(m.slug)} className="font-semibold hover:underline">
                  {m.county}
                </Link>
                {" · "}
                {m.date} · {m.timeLocal ?? "TBD"}
              </span>
              <span className="text-xs uppercase text-[var(--ep-navy-muted)]">{m.routingRecommendation.replace(/_/g, " ")}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((p) => (
          <Link
            key={p.slug}
            href={countyPartyDetailHref(p.slug)}
            className="ep-card block transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-heading font-bold">{p.county}</h3>
              {p.needsHumanVerification ? (
                <span className="text-[10px] font-bold uppercase text-amber-700">Verify</span>
              ) : (
                <span className="text-[10px] font-bold uppercase text-emerald-700">OK</span>
              )}
            </div>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{p.countyChair ?? "Chair TBD"}</p>
            <p className="mt-1 line-clamp-2 text-xs">{p.meetingInfoRaw ?? "No meeting info"}</p>
          </Link>
        ))}
      </div>

      {needsVerify.length > 0 ? (
        <div className="mt-8 ep-card border border-dashed">
          <h2 className="font-heading font-bold text-[var(--ep-navy)]">Needs human follow-up ({needsVerify.length})</h2>
          <ul className="mt-3 max-h-48 overflow-y-auto text-sm">
            {needsVerify.slice(0, 20).map((p) => (
              <li key={p.slug}>
                <Link href={countyPartyDetailHref(p.slug)} className="hover:underline">
                  {p.county}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
