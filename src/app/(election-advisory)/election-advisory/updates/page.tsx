import type { Metadata } from "next";

import { DefinedText } from "@/components/election-advisory/DefinedText";
import { UpdatesForm } from "@/components/election-advisory/UpdatesForm";
import { getAeacBase } from "@/lib/election-advisory/public-origin-server";

export const metadata: Metadata = {
  title: "Updates",
  description: "Sign up for meeting notices, notes, findings, and public communications.",
};

export default async function ElectionAdvisoryUpdatesPage() {
  const base = await getAeacBase();
  return (
    <article>
      <p className="aeac-kicker">Regular communications</p>
      <h1 className="aeac-display">Stay informed</h1>
      <p className="aeac-lede">
        <DefinedText
          text="Meeting schedule, notes, findings, and public communications will be posted here. If you want those notices by email, leave your name and address."
          base={base}
        />
      </p>
      <UpdatesForm />
    </article>
  );
}
