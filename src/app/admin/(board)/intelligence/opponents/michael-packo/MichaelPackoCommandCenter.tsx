import Link from "next/link";
import { PackoContrastGateBanner } from "@/components/admin/intelligence/PackoContrastGateBanner";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { loadMichaelPackoScaffold, packoOpenTaskCount } from "@/lib/intelligence/opponents/loadMichaelPackoScaffold";
import { loadMichaelPackoQuotes } from "@/lib/intelligence/opponents/loadMichaelPackoQuotes";
import {
  loadMichaelPackoBioTimeline,
  loadMichaelPackoCandidateDossier,
  loadMichaelPackoStrengths,
  loadMichaelPackoWeaknesses,
} from "@/lib/intelligence/v4/loadOpponentCandidateDossier";
import { PACKO_COMMAND_CENTER_ROUTES } from "@/lib/intelligence/opponents/packoCommandCenterRoutes";
import { getPackoContrastGateStatus } from "@/lib/intelligence/v4/packoContrastGate";

const MODULES = [
  {
    href: PACKO_COMMAND_CENTER_ROUTES.dossier,
    title: "Executive dossier",
    summary: "Eight narrative sections — strengths, weaknesses, claims ledger, lead stories, three-way geometry.",
    tag: "Production",
  },
  {
    href: PACKO_COMMAND_CENTER_ROUTES.quotes,
    title: "Quote ledger",
    summary: "PACKO-02 sourced statements with Kelly response frames — debate and clerk-room use per quote.",
    tag: "PARTIAL",
  },
  {
    href: PACKO_COMMAND_CENTER_ROUTES.contrast,
    title: "Contrast vs Kelly",
    summary: "Do/don't list and four contrast frames — respectful third-party positioning.",
    tag: "Governed",
  },
  {
    href: PACKO_COMMAND_CENTER_ROUTES.finance,
    title: "Finance & filings",
    summary: "Ballot qualification and ethics filing slots — research-question-only until counsel review.",
    tag: "PARTIAL",
  },
  {
    href: PACKO_COMMAND_CENTER_ROUTES.diligence,
    title: "Court diligence",
    summary: "Five-search checklist — same Phase A protocol as Kelly and Hammer.",
    tag: "Phase A",
  },
  {
    href: PACKO_COMMAND_CENTER_ROUTES.coaching,
    title: "Kelly debate coaching",
    summary: "Three-way cross lanes, Packo bridges, speak-order drills linked from here.",
    tag: "Kelly lane",
  },
  {
    href: PACKO_COMMAND_CENTER_ROUTES.media,
    title: "Film & media",
    summary: "Video archive room — opponent media catalog PACKO-06 harvest.",
    tag: "Staff",
  },
] as const;

export default function MichaelPackoCommandCenter() {
  const scaffold = loadMichaelPackoScaffold();
  const dossier = loadMichaelPackoCandidateDossier();
  const bio = loadMichaelPackoBioTimeline();
  const strengths = loadMichaelPackoStrengths();
  const weaknesses = loadMichaelPackoWeaknesses();
  const quotes = loadMichaelPackoQuotes();
  const gate = getPackoContrastGateStatus();
  const openTasks = scaffold ? packoOpenTaskCount(scaffold) : 7;

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Phase 0 · third candidate command center"
        title="Dr. Michael Pakko (Libertarian)"
        description="One front door for Pakko research — dossier, quotes, contrast, diligence, and coaching. In clerk rooms: do not elevate unless asked. On stage: respect reform goals; differentiate administrator readiness."
      >
        <V4BackLinks />
        <Link
          href={PACKO_COMMAND_CENTER_ROUTES.dossier}
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Full dossier
        </Link>
        <Link
          href={PACKO_COMMAND_CENTER_ROUTES.diligence}
          className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-950"
        >
          Diligence checklist
        </Link>
        <Link
          href={PACKO_COMMAND_CENTER_ROUTES.coaching}
          className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-950"
        >
          Kelly coaching
        </Link>
      </V4PageHeader>

      <PackoContrastGateBanner />

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
          <p className="text-[10px] font-bold uppercase text-amber-900">Quote ledger</p>
          <p className="font-heading text-2xl font-bold text-kelly-navy">{quotes.quotes.length}</p>
          <p className="mt-1 text-xs text-kelly-muted">sourced entries</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
          <p className="text-[10px] font-bold uppercase text-amber-900">Strengths</p>
          <p className="font-heading text-2xl font-bold text-kelly-navy">{strengths.strengths.length}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
          <p className="text-[10px] font-bold uppercase text-amber-900">Weaknesses</p>
          <p className="font-heading text-2xl font-bold text-kelly-navy">{weaknesses.weaknesses.length}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
          <p className="text-[10px] font-bold uppercase text-amber-900">Open tasks</p>
          <p className="font-heading text-2xl font-bold text-amber-900">{openTasks}</p>
          <p className="mt-1 text-xs text-kelly-muted">
            contrast gate {gate.blocked ? "locked" : "open"}
          </p>
        </div>
      </section>

      <article className="mb-8 rounded-xl border-2 border-amber-200/80 bg-white p-6 text-sm leading-relaxed">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-900">Executive profile</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">{dossier.displayName}</h2>
        <p className="mt-1 text-xs text-kelly-subtle">{bio.spellingNote}</p>
        <p className="mt-4 text-kelly-text">{dossier.executiveSummary}</p>
        <p className="mt-4 text-kelly-muted">
          Dr. Pakko is an economist and communicator — Fed research economist (1993–2009), then Arkansas Economic
          Development Institute chief economist, LPAR chair, and 2024 Libertarian treasurer candidate before the 2026 SOS
          nomination. His campaign emphasizes election competitiveness, fiscal transparency, and independence from the
          two-party duopoly. Kelly&apos;s frame: acknowledge reform goals; contrast daily SOS administration, county
          partnership, and published funding rules — never attack Libertarian voters.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
          <Link href={PACKO_COMMAND_CENTER_ROUTES.dossier} className="text-kelly-navy underline">
            Read full dossier →
          </Link>
          <Link href={PACKO_COMMAND_CENTER_ROUTES.quotes} className="text-amber-900 underline">
            Quote ledger →
          </Link>
        </div>
      </article>

      <section className="mb-8">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Command modules</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="flex flex-col rounded-xl border border-amber-200/60 bg-white p-4 transition hover:border-amber-500"
            >
              <span className="text-[9px] font-bold uppercase text-amber-900">{mod.tag}</span>
              <h3 className="mt-1 font-bold text-kelly-navy">{mod.title}</h3>
              <p className="mt-2 flex-1 text-xs text-kelly-muted">{mod.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      {scaffold ? (
        <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
          <h2 className="text-sm font-bold uppercase text-kelly-navy">Research queue</h2>
          <ul className="mt-3 space-y-2 text-xs">
            {scaffold.researchPriorities.map((t) => (
              <li key={t.id} className="flex flex-wrap gap-2 rounded border border-kelly-text/10 px-3 py-2">
                <span className="font-mono font-bold text-kelly-navy">{t.id}</span>
                <span>{t.task}</span>
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                  {t.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 text-sm">
        <h2 className="text-sm font-bold uppercase text-slate-800">Bio timeline (highlights)</h2>
        <ul className="mt-3 space-y-3 text-xs">
          {bio.timeline.slice(0, 5).map((row) => (
            <li key={row.year} className="border-l-2 border-amber-300 pl-3">
              <span className="font-bold text-kelly-navy">{row.year}</span>
              <span className="text-kelly-muted"> — {row.event}</span>
            </li>
          ))}
        </ul>
        <Link href={PACKO_COMMAND_CENTER_ROUTES.dossier} className="mt-4 inline-block text-xs font-bold text-kelly-navy underline">
          Full timeline in dossier →
        </Link>
      </section>
    </div>
  );
}
