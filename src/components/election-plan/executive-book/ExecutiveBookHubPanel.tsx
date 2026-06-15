import Link from "next/link";

import type { ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";
import {
  campusNetworkHref,
  directDemocracyElectionPlanHref,
  phase18MasterPlanHref,
} from "@/lib/election-plan/phase-18-movement-infrastructure";
import { EXECUTIVE_BOOK_EDITION } from "@/lib/election-plan/executiveBookNav";

type Props = {
  data: ElectionPlanWorkbenchSnapshot;
  /** Standalone hub page shows full-width layout without workbench chrome hints */
  standalone?: boolean;
};

type ChapterCard = ElectionPlanWorkbenchSnapshot["executiveBookHub"]["chapters"][number];

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{subtitle}</p> : null}
    </div>
  );
}

function ChapterCardArticle({ chapter }: { chapter: ChapterCard }) {
  return (
    <article className="ep-card ep-chapter-card flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-gold)]">
            Chapter {chapter.number}
          </p>
          <h3 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{chapter.title}</h3>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{chapter.subtitle}</p>
        </div>
      </div>

      {chapter.metrics.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {chapter.metrics.map((m) => (
            <span
              key={m.label}
              className="rounded-full bg-[var(--ep-cream)] px-2.5 py-1 text-xs font-medium text-[var(--ep-navy)]"
            >
              {m.label}: <strong>{m.value}</strong>
            </span>
          ))}
        </div>
      ) : null}

      {chapter.statusLines.length > 0 ? (
        <ul className="mt-4 space-y-1 text-sm text-[var(--ep-navy-muted)]">
          {chapter.statusLines.map((line) => (
            <li key={line} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ep-gold)]" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto pt-5">
        <Link href={chapter.href} className="ep-chapter-link">
          Open Chapter →
        </Link>
      </div>
    </article>
  );
}

export function ExecutiveBookHubPanel({ data, standalone = false }: Props) {
  const hub = data.executiveBookHub;
  const edition = hub.edition ?? hub.version ?? EXECUTIVE_BOOK_EDITION.version;
  const pillarGroups =
    hub.pillars && hub.pillars.length > 0
      ? hub.pillars
      : [{ id: "all", label: "All chapters", chapters: hub.chapters }];

  return (
    <section className={standalone ? "ep-executive-book-standalone" : undefined}>
      <SectionTitle
        title={EXECUTIVE_BOOK_EDITION.label}
        subtitle={EXECUTIVE_BOOK_EDITION.tagline}
      />

      <div className="ep-warning mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="ep-edition-badge">Edition {edition}</span>
          <p className="text-sm font-medium">
            {hub.status.replace(/_/g, " ")} · Labor Day gate {hub.laborDayDeadline}
          </p>
        </div>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          For Kelly, Ernie, donors, validators, and coalition partners. Each chapter has a shareable URL at{" "}
          <code className="text-[0.65rem]">/election-plan/executive-book/[chapter]</code>. Operators continue in War
          Room, Field Calendar, and Coverage Reality tabs.
        </p>
        {hub.readOrderNote ? (
          <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
            <strong className="text-[var(--ep-navy)]">Suggested read order:</strong> {hub.readOrderNote}
          </p>
        ) : null}
        {!standalone ? (
          <p className="mt-2 text-xs">
            <Link href="/election-plan/executive-book" className="ep-chapter-link">
              Open shareable Executive Book hub →
            </Link>
          </p>
        ) : null}
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{hub.chapters.length}</div>
          <div className="ep-stat-label">Chapters</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{hub.completenessEstimate}</div>
          <div className="ep-stat-label">Completeness</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">V{edition}</div>
          <div className="ep-stat-label">Edition</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{pillarGroups.length}</div>
          <div className="ep-stat-label">Pillar groups</div>
        </div>
      </div>

      {hub.companionPillars && hub.companionPillars.length > 0 ? (
        <div className="mb-10">
          <h3 className="mb-3 font-heading text-lg font-bold text-[var(--ep-navy)]">People Power companions</h3>
          <p className="mb-4 text-sm text-[var(--ep-navy-muted)]">
            These programs extend the Executive Book field chapters — live metrics in the People Power tab.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {hub.companionPillars.map((pillar) => (
              <Link key={pillar.id} href={pillar.href} className="ep-card ep-companion-pillar block hover:border-[var(--ep-gold)]">
                <h4 className="font-heading font-bold text-[var(--ep-navy)]">{pillar.title}</h4>
                <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{pillar.description}</p>
                <span className="ep-chapter-link mt-3 inline-flex">Open in People Power →</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-10">
        <h3 className="mb-3 font-heading text-lg font-bold text-[var(--ep-navy)]">Phase 18 · Movement Infrastructure</h3>
        <p className="mb-4 text-sm text-[var(--ep-navy-muted)]">
          Statewide overlay — campus network, trust building, direct democracy, story corps, Mobilize rules, thank-you doctrine.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href={phase18MasterPlanHref()} className="ep-card block text-sm hover:border-[var(--ep-gold)]">
            <span className="font-heading font-bold">Phase 18 master plan</span>
          </Link>
          <Link href={campusNetworkHref()} className="ep-card block text-sm hover:border-[var(--ep-gold)]">
            <span className="font-heading font-bold">Campus network</span>
          </Link>
          <Link href={directDemocracyElectionPlanHref()} className="ep-card block text-sm hover:border-[var(--ep-gold)]">
            <span className="font-heading font-bold">Direct democracy</span>
          </Link>
        </div>
      </div>

      {hub.chapters.length === 0 ? (
        <div className="ep-card-glass text-sm text-[var(--ep-navy-muted)]">
          Executive Book not built. Run{" "}
          <code className="text-xs">npm run campaign-brain:executive-book:completion</code> then{" "}
          <code className="text-xs">npm run election-plan:build</code>.
        </div>
      ) : (
        <div className="space-y-10">
          {pillarGroups.map((group) => (
            <div key={group.id}>
              <h3 className="ep-pillar-heading mb-4 font-heading text-lg font-bold text-[var(--ep-navy)]">
                {group.label}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {group.chapters.map((chapter) => (
                  <ChapterCardArticle key={chapter.slug} chapter={chapter} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {standalone ? (
        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/election-plan?tab=executiveBook" className="ep-chapter-link">
            Open in Command Center →
          </Link>
          <Link href="/election-plan" className="font-medium text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
            Election Plan home
          </Link>
        </div>
      ) : null}
    </section>
  );
}
