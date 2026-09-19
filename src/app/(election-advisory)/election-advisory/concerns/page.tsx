import type { Metadata } from "next";

import { ConcernForm } from "@/components/election-advisory/ConcernForm";
import { DefinedText } from "@/components/election-advisory/DefinedText";
import { getAeacBase } from "@/lib/election-advisory/public-origin-server";

export const metadata: Metadata = {
  title: "Share a Concern",
  description:
    "Send a concern or question the Arkansas Election Advisory Commission should be prepared to answer with facts.",
};

export default async function ElectionAdvisoryConcernsPage() {
  const base = await getAeacBase();
  return (
    <article>
      <p className="aeac-kicker">Questions the Commission should answer</p>
      <h1 className="aeac-display">Share a concern</h1>
      <p className="aeac-lede">
        <DefinedText
          text="Trust is not demanded. It is earned by taking legitimate questions seriously and answering them with Arkansas facts. Use this form for a concern, a gap in public understanding, or a question you want the Commission to put on the record."
          base={base}
        />
      </p>
      <p className="aeac-prose" style={{ marginBottom: "1.5rem" }}>
        <DefinedText
          text="This is not a tip line for accusations and it is not a campaign inbox. It is a working intake for the questions the Commission exists to examine."
          base={base}
        />
      </p>
      <ConcernForm />
    </article>
  );
}
