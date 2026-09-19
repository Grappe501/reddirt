import type { Metadata } from "next";
import Link from "next/link";

import { AEAC_BASE } from "@/content/election-advisory/catalog";
import { aeacFindings } from "@/content/election-advisory/findings";

export const metadata: Metadata = {
  title: "Findings",
  description: "Public findings and recommendations of the Arkansas Election Advisory Commission.",
};

export default function ElectionAdvisoryFindingsPage() {
  return (
    <article>
      <p className="aeac-kicker">Public library</p>
      <h1 className="aeac-display">Findings and recommendations</h1>
      <p className="aeac-lede">
        The Commission will publish what it learns: supporting information, findings, and practical
        recommendations. Nothing is posted yet because the body has not held its first working meeting.
      </p>

      {aeacFindings.length === 0 ? (
        <div className="aeac-empty aeac-section">
          <h2>The shelf is ready</h2>
          <p>
            When the first finding is ready, it will appear here with the topic it covers, the evidence it used,
            and a plain-language summary. The point is that the public can see the work, not just hear that work
            happened.
          </p>
        </div>
      ) : (
        <div className="aeac-grid aeac-section">
          {aeacFindings.map((finding) => (
            <article key={finding.slug} className="aeac-card">
              <h3>{finding.title}</h3>
              <p>{finding.summary}</p>
            </article>
          ))}
        </div>
      )}

      <div className="aeac-actions">
        <Link className="aeac-btn" href={`${AEAC_BASE}/concerns`}>
          Suggest a question for the record
        </Link>
        <Link className="aeac-btn aeac-btn-ghost" href={`${AEAC_BASE}/charter`}>
          Read the charter
        </Link>
      </div>
    </article>
  );
}
