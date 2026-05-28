import Link from "next/link";
import {
  draftCandidateTalkingPoints,
  draftDebatePrepBlocks,
  draftVolunteerTalkingPoints,
  draftSocialMediaOptions,
  draftSurrogateBrief,
  extractKeyWordsAndPhrases,
  summarizeWhatNotToSay,
} from "@/lib/intelligence/aiWritingToolbox";

export const dynamic = "force-dynamic";

function DraftPanel({
  title,
  draft,
}: {
  title: string;
  draft: ReturnType<typeof draftCandidateTalkingPoints>;
}) {
  return (
    <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">{title}</h2>
        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
          {draft.draftStatus}
        </span>
      </div>
      {draft.sections.map((section) => (
        <div key={section.heading} className="mt-3">
          <p className="text-xs font-semibold text-kelly-navy">{section.heading}</p>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {section.bullets.map((bullet) => (
              <li key={bullet.slice(0, 48)}>{bullet}</li>
            ))}
          </ul>
        </div>
      ))}
      <p className="mt-3 text-[10px] font-semibold uppercase text-rose-800">Safety warnings</p>
      <ul className="list-inside list-disc text-[10px] text-rose-900">
        {draft.safetyWarnings.map((line) => (
          <li key={line.slice(0, 48)}>{line}</li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] font-semibold uppercase text-kelly-subtle">Evidence required before use</p>
      <ul className="list-inside list-disc text-[10px] text-kelly-muted">
        {draft.evidenceDependencies.map((line) => (
          <li key={line.slice(0, 48)}>{line}</li>
        ))}
      </ul>
    </section>
  );
}

export default async function WritingToolboxPage() {
  const candidateDraft = draftCandidateTalkingPoints("trust and transparency");
  const debateDraft = draftDebatePrepBlocks("SB487");
  const volunteerDraft = draftVolunteerTalkingPoints("pulaski");
  const socialDraft = draftSocialMediaOptions("narrative-trust-transparency");
  const surrogateDraft = draftSurrogateBrief("county chairs");
  const keywordsDraft = extractKeyWordsAndPhrases();
  const notToSayDraft = summarizeWhatNotToSay();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          NSI-7 · AI Writing Toolbox
        </p>
        <h1 className="font-heading text-2xl font-bold">Governed Writing Helpers</h1>
        <p className="mt-2 max-w-4xl font-body text-sm leading-relaxed text-kelly-muted">
          Deterministic draft composition only. All outputs marked INTERNAL_DRAFT — never export-ready automatically.
          No microtargeted persuasion. No individual voter personalization.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence/morning-brief" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Morning brief
          </Link>
          <Link href="/admin/intelligence/kim-hammer/evidence-command" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Evidence Command
          </Link>
        </div>
      </header>

      <section className="mb-6 rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-xs text-amber-950">
        <p className="font-bold uppercase tracking-wider">Evidence required before use</p>
        <p className="mt-1">
          Every draft below depends on export-ready claims and human review. Approved evidence is listed per section.
          Interpretation is separated from sourced claims.
        </p>
      </section>

      <DraftPanel title="Candidate talking points" draft={candidateDraft} />
      <DraftPanel title="Debate answers" draft={debateDraft} />
      <DraftPanel title="Social media drafts" draft={socialDraft} />
      <DraftPanel title="Volunteer scripts" draft={volunteerDraft} />
      <DraftPanel title="Surrogate brief" draft={surrogateDraft} />
      <DraftPanel title="Key words / phrases" draft={keywordsDraft} />
      <DraftPanel title="What not to say" draft={notToSayDraft} />
    </div>
  );
}
