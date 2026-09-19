import type { Metadata } from "next";
import Link from "next/link";

import {
  AEAC_BASE,
  AEAC_MOTTO_EN,
  AEAC_MOTTO_LATIN,
  AEAC_NAME,
  aeacBottomLine,
  aeacChargeItems,
  aeacChargePhases,
  aeacDefinition,
  aeacGoal,
  aeacMission,
  aeacPrinciples,
} from "@/content/election-advisory/catalog";

export const metadata: Metadata = {
  title: "Founding Charter",
  description: `Founding charter of the ${AEAC_NAME}.`,
};

export default function ElectionAdvisoryCharterPage() {
  return (
    <article>
      <p className="aeac-kicker">Founding document</p>
      <h1 className="aeac-display">Founding Charter</h1>
      <p className="aeac-lede">
        This is the public charter. It is the standard the Commission will work from as members are identified
        and the first meeting is called.
      </p>

      <section className="aeac-section">
        <h2>Definition</h2>
        <p className="aeac-prose">{aeacDefinition}</p>
      </section>

      <section className="aeac-section">
        <h2>Mission</h2>
        <p className="aeac-prose">{aeacMission}</p>
      </section>

      <section className="aeac-section">
        <h2>Our Goal</h2>
        <p className="aeac-prose">{aeacGoal}</p>
      </section>

      <section className="aeac-section">
        <h2>Our Charge</h2>
        <p className="aeac-prose">
          The Commission will examine Arkansas election administration from voter registration through final
          certification, including:
        </p>
        {aeacChargePhases.map((phase) => (
          <div key={phase.id} className="aeac-section">
            <h3 style={{ fontFamily: "var(--aeac-serif)", fontSize: "1.4rem", margin: "0 0 0.6rem" }}>
              {phase.label}
            </h3>
            <ul className="aeac-prose">
              {aeacChargeItems
                .filter((item) => item.phase === phase.id)
                .map((item) => (
                  <li key={item.id}>{item.title}</li>
                ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="aeac-section">
        <h2>How We Will Work</h2>
        <div className="aeac-principles">
          {aeacPrinciples.map((principle) => (
            <div key={principle.id} className="aeac-principle">
              <strong>{principle.title}</strong>
              <p>{principle.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="aeac-section">
        <h2>The Bottom Line</h2>
        <p className="aeac-prose">{aeacBottomLine}</p>
        <p className="aeac-motto">
          {AEAC_MOTTO_LATIN} — {AEAC_MOTTO_EN}
        </p>
      </section>

      <div className="aeac-actions">
        <Link className="aeac-btn" href={`${AEAC_BASE}/charge`}>
          See the charge in full
        </Link>
        <Link className="aeac-btn aeac-btn-ghost" href={`${AEAC_BASE}/participate`}>
          Take part
        </Link>
      </div>
    </article>
  );
}
