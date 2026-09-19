import type { Metadata } from "next";
import Link from "next/link";

import {
  AEAC_BASE,
  aeacChargeItems,
  aeacChargePhases,
} from "@/content/election-advisory/catalog";

export const metadata: Metadata = {
  title: "Our Charge",
  description:
    "The Arkansas Election Advisory Commission examines election administration from voter registration through final certification.",
};

export default function ElectionAdvisoryChargePage() {
  return (
    <article>
      <p className="aeac-kicker">From registration to certification</p>
      <h1 className="aeac-display">Our Charge</h1>
      <p className="aeac-lede">
        These are the questions the Commission is organized to take seriously. People who disagree on methods
        should still be able to work this list together.
      </p>

      {aeacChargePhases.map((phase) => (
        <section key={phase.id} id={phase.id} className="aeac-section">
          <h2>{phase.label}</h2>
          <p className="aeac-prose">{phase.summary}</p>
          <div className="aeac-grid" style={{ marginTop: "1rem" }}>
            {aeacChargeItems
              .filter((item) => item.phase === phase.id)
              .map((item) => (
                <article key={item.id} className="aeac-card">
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              ))}
          </div>
        </section>
      ))}

      <div className="aeac-actions">
        <Link className="aeac-btn" href={`${AEAC_BASE}/concerns`}>
          Send a concern on one of these topics
        </Link>
        <Link className="aeac-btn aeac-btn-ghost" href={`${AEAC_BASE}/participate`}>
          Offer expertise
        </Link>
      </div>
    </article>
  );
}
