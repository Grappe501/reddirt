import type { Metadata } from "next";
import Link from "next/link";

import {
  AEAC_CONTACT_EMAIL,
  AEAC_NAME,
  AEAC_ORGANIZER_NAME,
  AEAC_ORGANIZER_ROLE,
  AEAC_PUBLIC_DOMAIN,
} from "@/content/election-advisory/catalog";
import { aeacHref, getAeacBase } from "@/lib/election-advisory/public-origin";

export const metadata: Metadata = {
  title: "About",
  description: `How the ${AEAC_NAME} is being organized, who it is for, and what it is not.`,
};

export default async function ElectionAdvisoryAboutPage() {
  const base = await getAeacBase();
  return (
    <article>
      <p className="aeac-kicker">Organizing now</p>
      <h1 className="aeac-display">About the Commission</h1>
      <p className="aeac-lede">
        {AEAC_NAME} is being stood up as a continuing, nonpartisan advisory body. It is not a state agency and
        it is not a substitute for the legal duties of county election officials or other authorities.
      </p>

      <section className="aeac-section">
        <h2>Who is organizing this</h2>
        <p className="aeac-prose">
          {AEAC_ORGANIZER_NAME}, {AEAC_ORGANIZER_ROLE}, is organizing the Commission now. If elected, this work
          is intended to become part of the transition. The Commission itself is meant to outlast a campaign
          calendar: a place where Arkansans with different views can examine the system together.
        </p>
        <p className="aeac-prose">
          Contact: <a href={`mailto:${AEAC_CONTACT_EMAIL}`}>{AEAC_CONTACT_EMAIL}</a>
        </p>
      </section>

      <section className="aeac-section">
        <h2>Who belongs in the room</h2>
        <p className="aeac-prose">
          Arkansas people only: experts, county practitioners, and people who care enough to disagree in public.
          The “who” is being built carefully. Seats are being left for county and state officials who should not
          participate before the election because the organizer is a candidate.
        </p>
      </section>

      <section className="aeac-section">
        <h2>How the first meeting will happen</h2>
        <p className="aeac-prose">
          After a public announcement, it is expected to take a couple of weeks to identify the right people,
          then hold a kickoff. A third-party, nonpartisan facilitator is being sought so the first conversation
          can hold both the paper-ballot concern and the security-confidence concern without collapsing into a
          predetermined answer.
        </p>
      </section>

      <section className="aeac-section">
        <h2>This website</h2>
        <p className="aeac-prose">
          The public address is {AEAC_PUBLIC_DOMAIN}. The same pages also exist on the campaign site at
          /election-advisory, unlinked from that navigation.
        </p>
      </section>

      <div className="aeac-actions">
        <Link className="aeac-btn" href={aeacHref(base, "charter")}>
          Read the charter
        </Link>
        <Link className="aeac-btn aeac-btn-ghost" href={aeacHref(base, "participate")}>
          Ask to take part
        </Link>
      </div>
    </article>
  );
}
