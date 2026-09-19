import type { Metadata } from "next";

import { DefinedText } from "@/components/election-advisory/DefinedText";
import { ParticipateForm } from "@/components/election-advisory/ParticipateForm";
import { AEAC_NAME } from "@/content/election-advisory/catalog";
import { getAeacBase } from "@/lib/election-advisory/public-origin-server";

export const metadata: Metadata = {
  title: "Participate",
  description: `Ask to join a ${AEAC_NAME} committee or offer expertise on a topic.`,
};

export default async function ElectionAdvisoryParticipatePage() {
  const base = await getAeacBase();
  return (
    <article>
      <p className="aeac-kicker">Committee and expertise</p>
      <h1 className="aeac-display">Take part</h1>
      <p className="aeac-lede">
        <DefinedText
          text="This will include Arkansas people, experts, and people who are passionate about elections who likely disagree on the “how” and still agree on the mission. Official seats for county and state officers who should not participate before the election are being reserved."
          base={base}
        />
      </p>
      <div className="aeac-grid" style={{ margin: "1.6rem 0 2rem" }}>
        <article className="aeac-card">
          <h3>Committee interest</h3>
          <p>Raise your hand if you want to be considered for the working body itself.</p>
        </article>
        <article className="aeac-card">
          <h3>Topic expertise</h3>
          <p>If you know a lane — audits, accessibility, ballots, county operations — say so.</p>
        </article>
        <article className="aeac-card">
          <h3>Facilitation</h3>
          <p>
            <DefinedText
              text="A third-party, nonpartisan facilitator is being sought for a kickoff that can hold disagreement."
              base={base}
            />
          </p>
        </article>
        <article className="aeac-card">
          <h3>After the election</h3>
          <p>If you hold an election office now, mark that. The seat can wait until it is appropriate.</p>
        </article>
      </div>
      <ParticipateForm />
    </article>
  );
}
