import type { Metadata } from "next";
import Link from "next/link";

import { DefinedText } from "@/components/election-advisory/DefinedText";
import {
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
import { aeacHref } from "@/lib/election-advisory/public-origin";
import { getAeacBase } from "@/lib/election-advisory/public-origin-server";

export const metadata: Metadata = {
  title: "Founding Charter",
  description: `Founding charter of the ${AEAC_NAME}.`,
};

export default async function ElectionAdvisoryCharterPage() {
  const base = await getAeacBase();
  return (
    <article>
      <p className="aeac-kicker">Founding document</p>
      <h1 className="aeac-display">Founding Charter</h1>
      <p className="aeac-lede">
        <DefinedText
          text="This is the public charter. It is the standard the Commission will work from as members are identified and the first meeting is called."
          base={base}
        />
      </p>

      <section className="aeac-section">
        <h2>Definition</h2>
        <p className="aeac-prose">
          <DefinedText text={aeacDefinition} base={base} />
        </p>
      </section>

      <section className="aeac-section">
        <h2>Mission</h2>
        <p className="aeac-prose">
          <DefinedText text={aeacMission} base={base} />
        </p>
      </section>

      <section className="aeac-section">
        <h2>Our Goal</h2>
        <p className="aeac-prose">
          <DefinedText text={aeacGoal} base={base} />
        </p>
      </section>

      <section className="aeac-section">
        <h2>Our Charge</h2>
        <p className="aeac-prose">
          <DefinedText
            text="The Commission will examine Arkansas election administration from voter registration through final certification, including:"
            base={base}
          />
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
                  <li key={item.id}>
                    <DefinedText text={item.title} base={base} />
                  </li>
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
              <p>
                <DefinedText text={principle.body} base={base} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="aeac-section">
        <h2>The Bottom Line</h2>
        <p className="aeac-prose">
          <DefinedText text={aeacBottomLine} base={base} />
        </p>
        <p className="aeac-motto">
          {AEAC_MOTTO_LATIN} — {AEAC_MOTTO_EN}
        </p>
      </section>

      <div className="aeac-actions">
        <Link className="aeac-btn" href={aeacHref(base, "charge")}>
          See the charge in full
        </Link>
        <Link className="aeac-btn aeac-btn-ghost" href={aeacHref(base, "participate")}>
          Take part
        </Link>
      </div>
    </article>
  );
}
