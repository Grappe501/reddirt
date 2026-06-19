import Link from "next/link";

import { DebatePrepOperatorGuideCard } from "@/components/election-plan/DebatePrepOperatorGuideCard";
import { ElectionPlanV4ThemeMatrix } from "@/components/election-plan/ElectionPlanV4ThemeMatrix";
import {
  EP_DEBATE_PREP_HREF,
  EP_DEBATE_TECHNIQUES_HREF,
  EP_EXECUTIVE_BOOK_HREF,
  EP_TRAP_LANES_HREF,
  epOppositionResearchModuleHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import type { OppositionResearchModule } from "@/lib/election-plan/oppositionResearchModules";
import { loadDebateIntelligenceV4HubPacket } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { getPrepSectionGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";
import { loadKimHammerIntegrityFoundation2021 } from "@/lib/opposition/kimHammerLegislativeNarratives";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import {
  OPPONENT_DOSSIER_SECTIONS,
  type OpponentDossierDepthSection,
} from "@/lib/intelligence/v4/opponentCandidateDossierDepth";
import { loadKimHammerCandidateDossier } from "@/lib/intelligence/v4/loadOpponentCandidateDossier";

function DepthSections({ sections }: { sections: OpponentDossierDepthSection[] }) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <article key={section.sectionId} className="ep-card p-5 text-sm">
          <p className="text-xs font-bold uppercase text-rose-800">{section.eyebrow}</p>
          <h3 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{section.title}</h3>
          <p className="mt-3 text-[var(--ep-navy-muted)]">{section.narrativeOverview[0]}</p>
          {section.howToUseInDebate.length > 0 ? (
            <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
              {section.howToUseInDebate.slice(0, 3).map((line) => (
                <li key={line.slice(0, 48)}>{line}</li>
              ))}
            </ul>
          ) : null}
          {section.doNotSay.length > 0 ? (
            <p className="mt-3 text-xs font-bold text-amber-900">Do not say: {section.doNotSay.slice(0, 2).join(" · ")}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function ElectionPlanOppositionResearchModulePanel({ module }: { module: OppositionResearchModule }) {
  const v4 = loadDebateIntelligenceV4HubPacket();

  switch (module.id) {
    case "debate-prep": {
      const guide = getSurfaceGuide("debatePrepPage");
      const sections = v4.debatePrepSectionsV4.length ? v4.debatePrepSectionsV4 : v4.debatePrepSections;
      return (
        <div className="space-y-6">
          {guide ? <DebatePrepOperatorGuideCard title="Debate prep packet — how to use" guide={guide} /> : null}
          <article className="ep-card p-5">
            <p className="text-xs font-bold uppercase text-violet-900">Kelly&apos;s primary path</p>
            <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
              On debate night Kelly stays on{" "}
              <Link href={EP_DEBATE_PREP_HREF} className="font-semibold underline">
                Election Plan debate prep
              </Link>
              , not this staff packet. Staff uses sections below for research and rehearsal setup.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
              <Link href={EP_DEBATE_PREP_HREF} className="rounded-full border border-[var(--ep-navy)] px-3 py-1">
                Debate prep hub →
              </Link>
              <Link href={EP_TRAP_LANES_HREF} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-violet-950">
                Trap lanes →
              </Link>
              <Link href={EP_DEBATE_TECHNIQUES_HREF} className="rounded-full border border-[var(--ep-border)] px-3 py-1">
                Techniques →
              </Link>
            </div>
          </article>
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">
              {sections.length} rehearsal sections
            </h2>
            {sections.map((sec, idx) => (
              <article key={sec.id} className="ep-card p-4 text-sm">
                <p className="font-bold text-[var(--ep-navy)]">
                  {idx + 1}. {sec.title}
                </p>
                {sec.bullets.length > 0 ? (
                  <ul className="mt-2 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
                    {sec.bullets.slice(0, 4).map((b) => (
                      <li key={b.slice(0, 48)}>{b}</li>
                    ))}
                  </ul>
                ) : null}
                {getPrepSectionGuide(sec.id) ? (
                  <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
                    Staff drill-down available — encounter depth wired for this section.
                  </p>
                ) : null}
              </article>
            ))}
          </section>
        </div>
      );
    }

    case "dossier-hammer": {
      const dossier = loadKimHammerCandidateDossier();
      const sections = OPPONENT_DOSSIER_SECTIONS.filter((s) => s.candidateId === "kim-hammer").slice(0, 8);
      return (
        <div className="space-y-6">
          <article className="ep-card border-rose-200 bg-rose-50/40 p-5 text-sm">
            <p className="text-xs font-bold uppercase text-rose-900">Executive summary</p>
            <p className="mt-3 leading-relaxed text-[var(--ep-navy)]">{dossier.executiveSummary}</p>
            <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">Status: {dossier.dossierStatus}</p>
          </article>
          <DepthSections sections={sections} />
          <nav className="ep-card flex flex-wrap gap-2 p-4 text-xs font-bold">
            <Link href={epOppositionResearchModuleHref("debate-profile")} className="underline">
              Debate profile (KH-2) →
            </Link>
            <Link href={epOppositionResearchModuleHref("integrity-foundation-2021")} className="underline">
              2021 integrity foundation →
            </Link>
            <Link href={EP_TRAP_LANES_HREF} className="underline">
              Trap lanes →
            </Link>
          </nav>
        </div>
      );
    }

    case "debate-profile": {
      const data = loadKimHammerKh2Workbench();
      const guide = getSurfaceGuide("debateProfile");
      return (
        <div className="space-y-6">
          {guide ? <DebatePrepOperatorGuideCard title="Debate profile — how to use" guide={guide} /> : null}
          <section className="space-y-4">
            {data.debateProfile.entries.map((entry) => (
              <article key={entry.topic} className="ep-card p-5 text-sm">
                <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">
                  {entry.topic.replaceAll("_", " ")}
                </h3>
                <dl className="mt-3 space-y-2 text-[var(--ep-navy-muted)]">
                  <div>
                    <dt className="font-bold text-rose-900">Likely Hammer argument</dt>
                    <dd>{entry.likelyHammerArgument}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-emerald-900">Kelly response frame</dt>
                    <dd>{entry.kellyResponseFrame}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-[var(--ep-navy)]">Bridge line</dt>
                    <dd className="italic">&ldquo;{entry.bridgeLine}&rdquo;</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-[var(--ep-navy)]">30-second response</dt>
                    <dd>{entry.answer30}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-amber-900">Avoid</dt>
                    <dd>{entry.riskyPhrasingToAvoid}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase">Evidence</dt>
                    <dd>
                      {entry.evidenceStatus} · {entry.sourceConfidence}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </section>
        </div>
      );
    }

    case "themes": {
      const guide = getSurfaceGuide("themeMatrix");
      return (
        <div className="space-y-6">
          {guide ? <DebatePrepOperatorGuideCard title="Election record themes" guide={guide} /> : null}
          <ElectionPlanV4ThemeMatrix rows={v4.themeMatrix} />
        </div>
      );
    }

    case "timeline": {
      const guide = getSurfaceGuide("timeline");
      return (
        <div className="space-y-6">
          {guide ? <DebatePrepOperatorGuideCard title="Legislative timeline" guide={guide} /> : null}
          <div className="ep-card overflow-x-auto p-4">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--ep-border)] text-[var(--ep-navy-muted)]">
                  <th className="py-2 pr-3 font-semibold">Year</th>
                  <th className="py-2 pr-3 font-semibold">Bill/Act</th>
                  <th className="py-2 pr-3 font-semibold">Role</th>
                  <th className="py-2 pr-3 font-semibold">What changed</th>
                  <th className="py-2 font-semibold">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {v4.timeline.map((row) => (
                  <tr key={`${row.year}-${row.billOrAct}`} className="border-b border-[var(--ep-border)]/50">
                    <td className="py-2 pr-3">{row.year}</td>
                    <td className="py-2 pr-3 font-mono">{row.billOrAct}</td>
                    <td className="py-2 pr-3">{row.hammerRole}</td>
                    <td className="max-w-md py-2 pr-3 text-[var(--ep-navy-muted)]">{row.whatChanged}</td>
                    <td className="py-2">{row.sourceConfidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    case "integrity-foundation-2021": {
      const guide = getSurfaceGuide("integrity2021");
      const pkg = v4.integrity2021;
      const detail = loadKimHammerIntegrityFoundation2021();
      return (
        <div className="space-y-6">
          {guide ? <DebatePrepOperatorGuideCard title="2021 integrity foundation" guide={guide} /> : null}
          {pkg ? (
            <article className="ep-card border-violet-200 bg-violet-50/40 p-5 text-sm">
              <p className="text-xs font-bold uppercase text-violet-950">Plain English</p>
              <p className="mt-3 leading-relaxed text-violet-950">{pkg.plainEnglishSummary}</p>
            </article>
          ) : null}
          <article className="ep-card p-5 text-sm">
            <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">Package bills</h3>
            <ul className="mt-3 space-y-2 font-mono text-xs">
              {detail.billNumbers.map((bill, i) => (
                <li key={bill}>
                  {bill}
                  {detail.actNumbers[i] != null ? ` → Act ${detail.actNumbers[i]}` : ""}
                </li>
              ))}
            </ul>
          </article>
          {pkg?.narrativeArc.length ? (
            <article className="ep-card p-5 text-sm">
              <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">Narrative arc</h3>
              <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
                {pkg.narrativeArc.map((line) => (
                  <li key={line.slice(0, 48)}>{line}</li>
                ))}
              </ul>
            </article>
          ) : null}
          {pkg?.strategicBriefing ? (
            <article className="ep-card p-5 text-sm">
              <h3 className="text-xs font-bold uppercase text-emerald-900">Kelly message help</h3>
              <p className="mt-2 text-[var(--ep-navy-muted)]">{pkg.strategicBriefing.kellyMessageHelp}</p>
              <p className="mt-3 text-xs text-amber-900">When not to use: {pkg.strategicBriefing.whenNotToUse}</p>
            </article>
          ) : null}
          <nav className="flex flex-wrap gap-2 text-xs font-bold">
            <Link href={epTrapLaneHref("2021-vs-2025-pivot")} className="rounded-full border border-violet-300 px-3 py-1">
              Trap lane · 2021 vs 2025 →
            </Link>
            <Link href={EP_DEBATE_TECHNIQUES_HREF} className="rounded-full border border-[var(--ep-border)] px-3 py-1">
              Techniques library →
            </Link>
          </nav>
        </div>
      );
    }

    case "claims-ledger": {
      const guide = getSurfaceGuide("claims");
      const { claims } = v4.hub;
      return (
        <div className="space-y-6">
          {guide ? <DebatePrepOperatorGuideCard title="Claims gate" guide={guide} /> : null}
          <ClaimsList title="Needs research before broadcast" items={claims.needsResearch} tone="amber" />
          <ClaimsList title="Partially supported" items={claims.partial} tone="indigo" />
          <ClaimsList title="Supported" items={claims.supported} tone="emerald" />
        </div>
      );
    }

    case "intelligence-gaps": {
      const guide = getSurfaceGuide("intelligenceGaps");
      return (
        <div className="space-y-6">
          {guide ? <DebatePrepOperatorGuideCard title="Intelligence gaps" guide={guide} /> : null}
          <ul className="space-y-3">
            {v4.intelligenceGaps.map((gap) => (
              <li key={gap.id} className="ep-card p-4 text-sm">
                <p className="text-xs font-bold uppercase text-amber-900">{gap.priority}</p>
                <p className="mt-1 text-[var(--ep-navy)]">{gap.description}</p>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Readiness: {gap.externalMessageReadiness}</p>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case "evidence-command": {
      const guide = getSurfaceGuide("evidenceCommand");
      return (
        <div className="space-y-6">
          {guide ? <DebatePrepOperatorGuideCard title="Evidence command" guide={guide} /> : null}
          <article className="ep-card p-5 text-sm text-[var(--ep-navy-muted)]">
            <p>
              Citation locker, export gate, and retrieval tasks — staff governance layer. Kelly does not browse this on
              stage; staff verifies export-ready lines before headset.
            </p>
            <p className="mt-3">
              Open{" "}
              <Link href={epOppositionResearchModuleHref("claims-ledger")} className="font-semibold underline">
                claims ledger
              </Link>{" "}
              before any new line goes to rehearsal or social.
            </p>
          </article>
          <ul className="space-y-2">
            {v4.retrievalQueue.slice(0, 12).map((task) => (
              <li key={task.id} className="ep-card p-3 text-xs">
                <span className="font-bold text-[var(--ep-navy)]">{task.priority}</span> — {task.description}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case "dossier-pakko": {
      const sections = OPPONENT_DOSSIER_SECTIONS.filter((s) => s.candidateId === "michael-packo").slice(0, 6);
      return (
        <div className="space-y-6">
          <article className="ep-card p-5 text-sm">
            <p className="text-[var(--ep-navy-muted)]">
              Three-way geometry — respect line + contrast gate. Do not ask Packo to vote for Kelly on stage.
            </p>
            <Link href={epOppositionResearchModuleHref("debate-profile")} className="mt-3 inline-block text-xs font-bold underline">
              Compare Hammer debate profile →
            </Link>
          </article>
          <DepthSections sections={sections} />
        </div>
      );
    }

    default:
      return (
        <article className="ep-card p-5 text-sm text-[var(--ep-navy-muted)]">
          <p>{module.summary}</p>
          <p className="mt-3">Staff module — full workbench content migrates in a future pass.</p>
          <Link href={EP_EXECUTIVE_BOOK_HREF} className="mt-4 inline-block text-xs font-bold underline">
            Executive Book crosswalk →
          </Link>
        </article>
      );
  }
}

function ClaimsList({
  title,
  items,
  tone,
}: {
  title: string;
  items: Array<{ claim: string; assessment?: string; saferWording?: string }>;
  tone: "amber" | "indigo" | "emerald";
}) {
  if (!items.length) return null;
  const border =
    tone === "amber" ? "border-amber-200" : tone === "emerald" ? "border-emerald-200" : "border-indigo-200";
  return (
    <article className={`ep-card p-5 text-sm ${border}`}>
      <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">{title}</h3>
      <ul className="mt-3 space-y-2 text-[var(--ep-navy-muted)]">
        {items.slice(0, 20).map((item) => (
          <li key={item.claim.slice(0, 48)} className="border-b border-[var(--ep-border)]/40 pb-2">
            {item.claim}
          </li>
        ))}
      </ul>
    </article>
  );
}
