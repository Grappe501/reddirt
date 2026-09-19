import type { Metadata } from "next";
import Link from "next/link";

import { DefinedText } from "@/components/election-advisory/DefinedText";
import { aeacMeetingHref, aeacMeetings, aeacMeetingStatusLabel } from "@/content/election-advisory/meetings";
import { aeacHref } from "@/lib/election-advisory/public-origin";
import { getAeacBase } from "@/lib/election-advisory/public-origin-server";

export const metadata: Metadata = {
  title: "Meetings",
  description: "Schedule, notes, and supporting materials for the Arkansas Election Advisory Commission.",
};

export default async function ElectionAdvisoryMeetingsPage() {
  const base = await getAeacBase();
  return (
    <article>
      <p className="aeac-kicker">Public record</p>
      <h1 className="aeac-display">Meetings, notes, and materials</h1>
      <p className="aeac-lede">
        <DefinedText
          text="The Commission’s work will be transparent. Minutes, findings, supporting information, and recommendations will be posted as they exist. The first meeting is being planned now."
          base={base}
        />
      </p>

      <div className="aeac-section" style={{ display: "grid", gap: "1rem" }}>
        {aeacMeetings.map((meeting) => (
          <article key={meeting.slug} className="aeac-card">
            <span className="aeac-status">{aeacMeetingStatusLabel(meeting.status)}</span>
            <h2>{meeting.title}</h2>
            <p>
              {meeting.timingLabel} · {meeting.locationLabel}
            </p>
            <p style={{ marginTop: "0.7rem" }}>
              <DefinedText text={meeting.summary} base={base} />
            </p>
            <div className="aeac-actions">
              <Link className="aeac-btn" href={aeacMeetingHref(meeting.slug, base)}>
                Open meeting page
              </Link>
            </div>
          </article>
        ))}
      </div>

      <section className="aeac-section aeac-empty">
        <h2>After kickoff</h2>
        <p>
          <DefinedText
            text="Each later meeting will have its own page for agenda, notes, attendance summary, and linked findings. Nothing is hidden in a private drive once the public record starts."
            base={base}
          />
        </p>
        <div className="aeac-actions">
          <Link className="aeac-btn aeac-btn-ghost" href={aeacHref(base, "updates")}>
            Get meeting notices
          </Link>
        </div>
      </section>
    </article>
  );
}
