import type { Metadata } from "next";
import Link from "next/link";

import { AEAC_BASE } from "@/content/election-advisory/catalog";
import { aeacMeetingHref, aeacMeetings, aeacMeetingStatusLabel } from "@/content/election-advisory/meetings";

export const metadata: Metadata = {
  title: "Meetings",
  description: "Schedule, notes, and supporting materials for the Arkansas Election Advisory Commission.",
};

export default function ElectionAdvisoryMeetingsPage() {
  return (
    <article>
      <p className="aeac-kicker">Public record</p>
      <h1 className="aeac-display">Meetings, notes, and materials</h1>
      <p className="aeac-lede">
        The Commission’s work will be transparent. Minutes, findings, supporting information, and recommendations
        will be posted as they exist. The first meeting is being planned now.
      </p>

      <div className="aeac-section" style={{ display: "grid", gap: "1rem" }}>
        {aeacMeetings.map((meeting) => (
          <article key={meeting.slug} className="aeac-card">
            <span className="aeac-status">{aeacMeetingStatusLabel(meeting.status)}</span>
            <h2>{meeting.title}</h2>
            <p>
              {meeting.timingLabel} · {meeting.locationLabel}
            </p>
            <p style={{ marginTop: "0.7rem" }}>{meeting.summary}</p>
            <div className="aeac-actions">
              <Link className="aeac-btn" href={aeacMeetingHref(meeting.slug)}>
                Open meeting page
              </Link>
            </div>
          </article>
        ))}
      </div>

      <section className="aeac-section aeac-empty">
        <h2>After kickoff</h2>
        <p>
          Each later meeting will have its own page for agenda, notes, attendance summary, and linked findings.
          Nothing is hidden in a private drive once the public record starts.
        </p>
        <div className="aeac-actions">
          <Link className="aeac-btn aeac-btn-ghost" href={`${AEAC_BASE}/updates`}>
            Get meeting notices
          </Link>
        </div>
      </section>
    </article>
  );
}
