import type { Metadata } from "next";

import { UpdatesForm } from "@/components/election-advisory/UpdatesForm";

export const metadata: Metadata = {
  title: "Updates",
  description: "Sign up for meeting notices, notes, findings, and public communications.",
};

export default function ElectionAdvisoryUpdatesPage() {
  return (
    <article>
      <p className="aeac-kicker">Regular communications</p>
      <h1 className="aeac-display">Stay informed</h1>
      <p className="aeac-lede">
        Meeting schedule, notes, findings, and public communications will be posted here. If you want those
        notices by email, leave your name and address.
      </p>
      <UpdatesForm />
    </article>
  );
}
