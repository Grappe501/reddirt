import type { Metadata } from "next";
import Link from "next/link";

import {
  AEAC_BASE,
  AEAC_MOTTO_EN,
  AEAC_MOTTO_LATIN,
  AEAC_NAME,
  aeacChargePhases,
  aeacDefinition,
  aeacGoal,
  aeacHomePaths,
  aeacMission,
  aeacPrinciples,
} from "@/content/election-advisory/catalog";
import { aeacMeetingHref, aeacMeetings, aeacMeetingStatusLabel } from "@/content/election-advisory/meetings";

export const metadata: Metadata = {
  title: AEAC_NAME,
  description: aeacDefinition,
};

export default function ElectionAdvisoryHomePage() {
  const kickoff = aeacMeetings[0];

  return (
    <>
      <section className="aeac-hero-panel">
        <div>
          <p className="aeac-kicker">Founding charter · Public working home</p>
          <h1 className="aeac-display">{AEAC_NAME}</h1>
          <p className="aeac-lede">{aeacDefinition}</p>
          <div className="aeac-actions">
            <Link className="aeac-btn" href={`${AEAC_BASE}/charter`}>
              Read the charter
            </Link>
            <Link className="aeac-btn aeac-btn-ghost" href={`${AEAC_BASE}/participate`}>
              Take part
            </Link>
            <Link className="aeac-btn aeac-btn-ghost" href={`${AEAC_BASE}/concerns`}>
              Share a concern
            </Link>
          </div>
        </div>
        <aside className="aeac-aside">
          <h2>Where this stands</h2>
          <p>
            This public home is live so people can read the mission, send concerns, and raise a hand before the
            press announcement and kickoff meeting.
          </p>
          <ol>
            <li>Charter is published here.</li>
            <li>Founding members are being identified — Arkansas people only.</li>
            <li>Official seats are reserved for after the election.</li>
            <li>Kickoff follows once the right people are in the room.</li>
          </ol>
        </aside>
      </section>

      <section className="aeac-section">
        <h2>Mission</h2>
        <p className="aeac-prose">{aeacMission}</p>
      </section>

      <section className="aeac-section">
        <h2>Our goal</h2>
        <p className="aeac-prose">{aeacGoal}</p>
      </section>

      <section className="aeac-section">
        <h2>The charge</h2>
        <p className="aeac-prose">
          The Commission will examine Arkansas election administration from voter registration through final
          certification.
        </p>
        <div className="aeac-grid" style={{ marginTop: "1.2rem" }}>
          {aeacChargePhases.map((phase) => (
            <Link key={phase.id} className="aeac-card-link" href={`${AEAC_BASE}/charge#${phase.id}`}>
              <p className="aeac-kicker">{phase.id}</p>
              <h3>{phase.label}</h3>
              <p>{phase.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="aeac-section">
        <h2>How we will work</h2>
        <div className="aeac-principles">
          {aeacPrinciples.map((principle) => (
            <div key={principle.id} className="aeac-principle">
              <strong>{principle.title}</strong>
              <p>{principle.body}</p>
            </div>
          ))}
        </div>
        <div className="aeac-actions">
          <Link className="aeac-btn aeac-btn-ghost" href={`${AEAC_BASE}/how-we-work`}>
            Full working principles
          </Link>
        </div>
      </section>

      <section className="aeac-section">
        <h2>Use this site</h2>
        <div className="aeac-grid">
          {aeacHomePaths.map((path) => (
            <Link key={path.href} className="aeac-card-link" href={path.href}>
              <p className="aeac-kicker">{path.kicker}</p>
              <h3>{path.title}</h3>
              <p>{path.body}</p>
            </Link>
          ))}
        </div>
      </section>

      {kickoff ? (
        <section className="aeac-section">
          <h2>Next meeting</h2>
          <article className="aeac-card">
            <span className="aeac-status">{aeacMeetingStatusLabel(kickoff.status)}</span>
            <h3>{kickoff.title}</h3>
            <p>
              {kickoff.timingLabel} · {kickoff.locationLabel}
            </p>
            <p style={{ marginTop: "0.7rem" }}>{kickoff.summary}</p>
            <div className="aeac-actions">
              <Link className="aeac-btn" href={aeacMeetingHref(kickoff.slug)}>
                Meeting page
              </Link>
              <Link className="aeac-btn aeac-btn-ghost" href={`${AEAC_BASE}/updates`}>
                Get the notice
              </Link>
            </div>
          </article>
        </section>
      ) : null}

      <p className="aeac-motto">
        {AEAC_MOTTO_LATIN} — {AEAC_MOTTO_EN}
      </p>
    </>
  );
}
