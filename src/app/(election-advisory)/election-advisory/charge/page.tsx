import type { Metadata } from "next";
import Link from "next/link";

import { DefinedText } from "@/components/election-advisory/DefinedText";
import { aeacChargeItems, aeacChargePhases } from "@/content/election-advisory/catalog";
import { aeacHref } from "@/lib/election-advisory/public-origin";
import { getAeacBase } from "@/lib/election-advisory/public-origin-server";

export const metadata: Metadata = {
  title: "Our Charge",
  description:
    "The Arkansas Election Advisory Commission examines election administration from voter registration through final certification.",
};

export default async function ElectionAdvisoryChargePage() {
  const base = await getAeacBase();
  return (
    <article>
      <p className="aeac-kicker">From registration to certification</p>
      <h1 className="aeac-display">Our Charge</h1>
      <p className="aeac-lede">
        <DefinedText
          text="These are the questions the Commission is organized to take seriously. People who disagree on methods should still be able to work this list together."
          base={base}
        />
      </p>

      {aeacChargePhases.map((phase) => (
        <section key={phase.id} id={phase.id} className="aeac-section">
          <h2>{phase.label}</h2>
          <p className="aeac-prose">
            <DefinedText text={phase.summary} base={base} />
          </p>
          <div className="aeac-grid" style={{ marginTop: "1rem" }}>
            {aeacChargeItems
              .filter((item) => item.phase === phase.id)
              .map((item) => (
                <article key={item.id} id={item.id} className="aeac-card">
                  <h3>
                    <DefinedText text={item.title} base={base} />
                  </h3>
                  <p>
                    <DefinedText text={item.detail} base={base} />
                  </p>
                </article>
              ))}
          </div>
        </section>
      ))}

      <div className="aeac-actions">
        <Link className="aeac-btn" href={aeacHref(base, "concerns")}>
          Send a concern on one of these topics
        </Link>
        <Link className="aeac-btn aeac-btn-ghost" href={aeacHref(base, "participate")}>
          Offer expertise
        </Link>
      </div>
    </article>
  );
}
