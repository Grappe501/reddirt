import {
  MSN_AP_ARKANSAS_RUNOFF_NOTES,
  MSN_AR_SOS_RUNOFF_RECOUNT,
  NBC_NEWS_AR_SOS_PRIMARY_2026,
  JONESBORO_RN_CRAIGHEAD_PRIMARY_2026,
  POLITICS1_ARKANSAS,
  TALK_BUSINESS_ELECTION_2026,
  VOTE_USA_KELLY_2026,
  WIKIPEDIA_AR_SOS_2026,
} from "@/config/campaign-partners";

/**
 * Curated third-party election guides and results pages — shown only on /press-coverage (not voter-registration).
 */
export function PressCoverageThirdPartyResources() {
  return (
    <section
      className="mx-auto mt-16 max-w-3xl border-t border-kelly-ink/10 pt-14"
      aria-labelledby="press-third-party-resources"
    >
      <h2 id="press-third-party-resources" className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">
        Election references &amp; third-party guides
      </h2>
      <p className="mt-3 font-body text-sm leading-relaxed text-kelly-slate/90">
        Independent directories, press summaries, and results pages—not the Secretary of State’s office. Useful context
        alongside the earned-media listings above; always confirm ballots and registration with official sources.
      </p>
      <div className="mt-8 space-y-4">
        <p className="font-body text-sm leading-relaxed text-kelly-slate/90">
          <span className="font-semibold text-kelly-ink">Compare on the issues (third party):</span>{" "}
          {VOTE_USA_KELLY_2026.orgName} publishes an independent biographical and issue profile for the Secretary of State
          race—helpful if you want side-by-side context beyond social feeds.{" "}
          <a
            href={VOTE_USA_KELLY_2026.href}
            className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {VOTE_USA_KELLY_2026.linkLabel}
          </a>{" "}
          (opens in a new tab)
        </p>
        <p className="font-body text-sm leading-relaxed text-kelly-slate/90">
          <span className="font-semibold text-kelly-ink">Candidate list (Arkansas press):</span>{" "}
          {TALK_BUSINESS_ELECTION_2026.orgName} maintains a statewide 2026 candidate list (business and politics coverage;
          not an official filing list).{" "}
          <a
            href={TALK_BUSINESS_ELECTION_2026.href}
            className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {TALK_BUSINESS_ELECTION_2026.linkLabel}
          </a>{" "}
          (new tab)
        </p>
        <p className="font-body text-sm leading-relaxed text-kelly-slate/90">
          <span className="font-semibold text-kelly-ink">Candidate guide (national directory):</span>{" "}
          {POLITICS1_ARKANSAS.orgName} lists federal and Arkansas statewide candidates with an election calendar—handy for
          scanning the field; always confirm who’s on the ballot with the{" "}
          <strong className="font-semibold text-kelly-ink/95">Secretary of State</strong>.{" "}
          <a
            href={POLITICS1_ARKANSAS.href}
            className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {POLITICS1_ARKANSAS.linkLabel}
          </a>{" "}
          (new tab)
        </p>
        <p className="font-body text-sm leading-relaxed text-kelly-slate/90">
          <span className="font-semibold text-kelly-ink">Local guide (Northeast Arkansas):</span>{" "}
          {JONESBORO_RN_CRAIGHEAD_PRIMARY_2026.orgName} published a Craighead County–specific list of who is on 2026 primary
          ballots, including Secretary of State—useful for Jonesboro-area readers; confirm your own ballot with the county
          clerk or <strong className="font-semibold text-kelly-ink/95">VoterView</strong>.{" "}
          <a
            href={JONESBORO_RN_CRAIGHEAD_PRIMARY_2026.href}
            className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {JONESBORO_RN_CRAIGHEAD_PRIMARY_2026.linkLabel}
          </a>{" "}
          (new tab)
        </p>
        <p className="font-body text-sm leading-relaxed text-kelly-slate/90">
          <span className="font-semibold text-kelly-ink">Race overview (encyclopedia):</span> {WIKIPEDIA_AR_SOS_2026.orgName}{" "}
          hosts a community-edited article on the 2026 race—handy for chronology and context. Anyone can edit Wikipedia;
          check candidates, dates, and results against the{" "}
          <strong className="font-semibold text-kelly-ink/95">Secretary of State</strong> and local election officials.{" "}
          <a
            href={WIKIPEDIA_AR_SOS_2026.href}
            className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {WIKIPEDIA_AR_SOS_2026.linkLabel}
          </a>{" "}
          (new tab)
        </p>
        <p className="font-body text-sm leading-relaxed text-kelly-slate/90">
          <span className="font-semibold text-kelly-ink">Primary results (news desk):</span>{" "}
          {NBC_NEWS_AR_SOS_PRIMARY_2026.orgName} publishes live Arkansas Secretary of State primary results (county views,
          AP-sourced) as part of its{" "}
          <a
            href="https://www.nbcnews.com/politics/2026-primary-elections"
            className="font-semibold text-kelly-navy/95 underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Decision 2026
          </a>{" "}
          coverage. <strong className="font-semibold text-kelly-ink/95">Official certification</strong> still comes from
          Arkansas election authorities.{" "}
          <a
            href={NBC_NEWS_AR_SOS_PRIMARY_2026.href}
            className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {NBC_NEWS_AR_SOS_PRIMARY_2026.linkLabel}
          </a>{" "}
          (new tab)
        </p>
        <p className="font-body text-sm leading-relaxed text-kelly-slate/90">
          <span className="font-semibold text-kelly-ink">Primary runoffs (AP explainer):</span>{" "}
          {MSN_AP_ARKANSAS_RUNOFF_NOTES.orgName} decision-desk notes on what to expect when Arkansas goes to a primary
          runoff—useful for timing and process context (syndicated on MSN).{" "}
          <a
            href={MSN_AP_ARKANSAS_RUNOFF_NOTES.href}
            className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {MSN_AP_ARKANSAS_RUNOFF_NOTES.linkLabel}
          </a>{" "}
          (new tab)
        </p>
        <p className="font-body text-sm leading-relaxed text-kelly-slate/90">
          <span className="font-semibold text-kelly-ink">Runoff &amp; recount (news):</span> For coverage of the Secretary of
          State Republican runoff and any recount process, {MSN_AR_SOS_RUNOFF_RECOUNT.orgName} carries syndicated political
          reporting (not a substitute for the Secretary of State’s office or county clerks).{" "}
          <a
            href={MSN_AR_SOS_RUNOFF_RECOUNT.href}
            className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {MSN_AR_SOS_RUNOFF_RECOUNT.linkLabel}
          </a>{" "}
          (new tab)
        </p>
      </div>
    </section>
  );
}
