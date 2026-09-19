import type { Metadata } from "next";
import Link from "next/link";

import { DefinedText } from "@/components/election-advisory/DefinedText";
import { AEAC_PUBLIC_DOMAIN, aeacPrinciples } from "@/content/election-advisory/catalog";
import { aeacHref } from "@/lib/election-advisory/public-origin";
import { getAeacBase } from "@/lib/election-advisory/public-origin-server";

export const metadata: Metadata = {
  title: "How We Work",
  description:
    "Listen first. Follow evidence. Respect Arkansas election structure. Work in public enough to earn trust.",
};

export default async function ElectionAdvisoryHowWeWorkPage() {
  const base = await getAeacBase();
  return (
    <article>
      <p className="aeac-kicker">Working rules</p>
      <h1 className="aeac-display">How We Work</h1>
      <p className="aeac-lede">
        <DefinedText
          text="The Commission will include people who are passionate about paper ballots and people who are convinced current systems are secure. Open dialogue, focused on Arkansas facts, is how this body intends to make progress."
          base={base}
        />
      </p>

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

      <section className="aeac-section">
        <h2>What the public will be able to see</h2>
        <p className="aeac-prose">
          <DefinedText
            text={`Deliberative meetings may be structured to encourage candid discussion. The work itself will be transparent: meeting minutes, findings, supporting information, and recommendations will be published here and at ${AEAC_PUBLIC_DOMAIN}.`}
            base={base}
          />
        </p>
      </section>

      <div className="aeac-actions">
        <Link className="aeac-btn" href={aeacHref(base, "meetings")}>
          Meeting record
        </Link>
        <Link className="aeac-btn aeac-btn-ghost" href={aeacHref(base, "findings")}>
          Findings library
        </Link>
      </div>
    </article>
  );
}
