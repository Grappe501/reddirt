import Link from "next/link";
import type { BioNarrativeChapter } from "@/lib/intelligence/v4/candidateDossierBriefingBook";

export type DossierSectionNavItem = {
  sectionId: string;
  title: string;
  href: string;
};

function ReadAloudBlock({
  label,
  script,
  variant,
}: {
  label: string;
  script: string;
  variant: "clerk" | "debate";
}) {
  const styles =
    variant === "clerk"
      ? "border-sky-200 bg-sky-50/60 text-sky-950"
      : "border-violet-200 bg-violet-50/60 text-violet-950";

  return (
    <blockquote className={`rounded-lg border p-3 text-xs leading-relaxed italic ${styles}`}>
      <p className="not-italic text-[10px] font-bold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2">{script}</p>
    </blockquote>
  );
}

export function BioNarrativeChapterPanel({ chapter }: { chapter: BioNarrativeChapter }) {
  return (
    <article className="rounded-xl border-2 border-kelly-gold/50 bg-gradient-to-br from-amber-50/40 to-white p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-950">{chapter.eyebrow}</p>
      <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">{chapter.displayName} — biography</h3>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-kelly-text">
        {chapter.paragraphs.map((p) => (
          <p key={p.slice(0, 56)}>{p}</p>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ReadAloudBlock label="Read aloud · clerk room (30s)" script={chapter.readAloudClerkRoom} variant="clerk" />
        <ReadAloudBlock label="Read aloud · debate (60s)" script={chapter.readAloudDebate} variant="debate" />
      </div>
      {chapter.sourceNote ? (
        <p className="mt-3 text-[10px] text-kelly-subtle">{chapter.sourceNote}</p>
      ) : null}
    </article>
  );
}

export function DossierStickySectionNav({
  sections,
  currentSectionId,
}: {
  sections: DossierSectionNavItem[];
  currentSectionId?: string;
}) {
  if (!sections.length) return null;

  return (
    <nav
      aria-label="Dossier sections"
      className="sticky top-0 z-10 -mx-1 mb-6 overflow-x-auto rounded-xl border border-kelly-text/10 bg-white/95 px-2 py-2 shadow-sm backdrop-blur"
    >
      <p className="mb-1.5 px-1 text-[9px] font-bold uppercase tracking-[0.18em] text-kelly-subtle">
        Briefing book · jump to section
      </p>
      <div className="flex flex-wrap gap-1.5">
        {sections.map((s) => {
          const active = currentSectionId === s.sectionId;
          return (
            <Link
              key={s.sectionId}
              href={s.href}
              className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold transition ${
                active
                  ? "border-kelly-navy bg-kelly-navy text-white"
                  : "border-kelly-text/15 bg-kelly-page/30 text-kelly-navy hover:border-kelly-navy/40"
              }`}
            >
              {s.title.length > 36 ? `${s.title.slice(0, 34)}…` : s.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SectionReadAloudPanel({
  clerkRoom,
  debate,
}: {
  clerkRoom: string;
  debate: string;
}) {
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      <ReadAloudBlock label="Rehearse · clerk room" script={clerkRoom} variant="clerk" />
      <ReadAloudBlock label="Rehearse · debate / panel" script={debate} variant="debate" />
    </div>
  );
}

export function BriefingBookOrientationBanner() {
  return (
    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs text-emerald-950">
      <p className="font-bold uppercase tracking-wide">Phase 1 · briefing book mode</p>
      <p className="mt-2 leading-relaxed">
        Read the biography chapter first, then each section&apos;s full narrative. Use the read-aloud blocks to rehearse
        before ACCA, debates, and clerk rooms. Evidence tables and do-not-say lists follow the narrative — not instead of
        it.
      </p>
    </div>
  );
}
