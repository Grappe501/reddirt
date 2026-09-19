import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DefinedText } from "@/components/election-advisory/DefinedText";
import { aeacMeetings, aeacMeetingStatusLabel, getAeacMeeting } from "@/content/election-advisory/meetings";
import { aeacHref } from "@/lib/election-advisory/public-origin";
import { getAeacBase } from "@/lib/election-advisory/public-origin-server";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return aeacMeetings.map((meeting) => ({ slug: meeting.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meeting = getAeacMeeting(slug);
  if (!meeting) return { title: "Meeting" };
  return { title: meeting.title, description: meeting.summary };
}

export default async function ElectionAdvisoryMeetingPage({ params }: Props) {
  const { slug } = await params;
  const meeting = getAeacMeeting(slug);
  if (!meeting) notFound();
  const base = await getAeacBase();

  return (
    <article>
      <p className="aeac-kicker">Meeting record</p>
      <h1 className="aeac-display">{meeting.title}</h1>
      <span className="aeac-status">{aeacMeetingStatusLabel(meeting.status)}</span>
      <p className="aeac-lede">
        <DefinedText text={meeting.summary} base={base} />
      </p>
      <p className="aeac-prose">
        <strong>When:</strong> {meeting.timingLabel}
        <br />
        <strong>Where:</strong> {meeting.locationLabel}
      </p>
      <section className="aeac-section">
        <h2>Notes</h2>
        <p className="aeac-prose">
          <DefinedText text={meeting.notes} base={base} />
        </p>
      </section>
      <section className="aeac-section">
        <h2>Documents</h2>
        {meeting.documents.length === 0 ? (
          <div className="aeac-empty">
            <p>Agenda, minutes, and supporting files will be posted here after they exist.</p>
          </div>
        ) : (
          <ul>
            {meeting.documents.map((doc) => (
              <li key={doc.href}>
                <a href={doc.href}>{doc.title}</a>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="aeac-actions">
        <Link className="aeac-btn" href={aeacHref(base, "meetings")}>
          All meetings
        </Link>
        <Link className="aeac-btn aeac-btn-ghost" href={aeacHref(base, "updates")}>
          Get notices
        </Link>
      </div>
    </article>
  );
}
