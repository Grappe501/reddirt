import Link from "next/link";
import { loadDebateIntelligenceV4HubPacket } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { getSurfaceGuide, getWorkflowStepByHref } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { V4ExecutiveBriefPanel } from "@/components/admin/intelligence/v4/V4ExecutiveBrief";
import { V4ThemeMatrix } from "@/components/admin/intelligence/v4/V4ThemeMatrix";
import { V4RehearsalDeck } from "@/components/admin/intelligence/v4/V4RehearsalDeck";
import { V4ArgumentMap } from "@/components/admin/intelligence/v4/V4ArgumentMap";
import { V4WorkflowPlaybook } from "@/components/admin/intelligence/v4/V4WorkflowPlaybook";
import { V4AnchorBillsPlaybookIndex } from "@/components/admin/intelligence/v4/V4AnchorBillsPlaybookIndex";
import { V4KellyNarrativeFrame } from "@/components/admin/intelligence/v4/V4KellyNarrativeFrame";
import { V4OpponentContrastPlaybookPanel } from "@/components/admin/intelligence/v4/V4OpponentContrastPlaybookPanel";
import { V3MarkdownSectionList } from "@/components/admin/intelligence/v3/V3SectionStack";
import { V7CountyClerkPrepPath } from "@/components/admin/intelligence/v4/V7CountyClerkPrepPath";
import { V4DebateDepthHub } from "@/components/admin/intelligence/v4/V4DebateDepthHub";
import { V4DebatePrepFinder } from "@/components/admin/intelligence/v4/V4DebatePrepFinder";
import { V4SupremeWorkbenchPanel } from "@/components/admin/intelligence/v4/V4SupremeWorkbenchPanel";
import { V4OppositionStrategyLayerPanel } from "@/components/admin/intelligence/v4/V4OppositionStrategyLayerPanel";
import { loadSupremeWorkbenchPacket } from "@/lib/intelligence/v4/supremeWorkbench";
import {
  loadOppositionStrategyLayerPacket,
  INTEGRITY_2021_PACKAGE_DEPTH,
  PETITION_2025_CLUSTER_DEPTH,
} from "@/lib/intelligence/v4/oppositionStrategyLayer";
import { isCountyClerkPrimaryAudience } from "@/lib/intelligence/v4/debateAudienceMode";

const card =
  "flex flex-col rounded-xl border-2 border-kelly-navy/15 bg-white p-4 shadow-sm transition hover:border-kelly-navy/40";

/**
 * Intelligence v4 hub — v3 markdown/JSON packet plus structured opposition profile JSON.
 */
export default function IntelligenceHubLaunchPage() {
  const v4 = loadDebateIntelligenceV4HubPacket();
  const supreme = loadSupremeWorkbenchPacket();
  const opposition = loadOppositionStrategyLayerPacket();
  const { hub } = v4;
  const clerkWeek = isCountyClerkPrimaryAudience();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow={clerkWeek ? "Kelly · county clerks week" : "Kelly · debate intelligence v4"}
        title={clerkWeek ? "County clerks — start your day here" : "Tonight's command overview"}
        description={
          clerkWeek
            ? "Primary audience: county clerks and election commissioners. Follow the 7-day reading path first — then contrast and bill drills. Internal draft only — verify act numbers before any public use."
            : "Your pre-flight checklist: orient on Hammer's legislative pattern, rehearse top bill drills, and know what is still unsafe to say. Work the five-step path below, then open debate prep for depth. Internal draft only — verify act numbers before any public use."
        }
        guide={getSurfaceGuide("hub")}
      >
        <V4BackLinks />
      </V4PageHeader>

      <div className="mb-6">
        <V4SupremeWorkbenchPanel packet={supreme} variant="compact" />
      </div>

      <div className="mb-6">
        <V4OppositionStrategyLayerPanel
          packet={opposition}
          integrity2021={INTEGRITY_2021_PACKAGE_DEPTH}
          petition2025={PETITION_2025_CLUSTER_DEPTH}
          variant="compact"
        />
      </div>

      <V7CountyClerkPrepPath compact={!clerkWeek} />
      <div className="mb-6">
        <V4DebatePrepFinder compact />
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/intelligence/debate-briefings"
          className="rounded-full border-2 border-violet-300 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-950 hover:bg-violet-100"
        >
          Philosophy & handling briefings →
        </Link>
        <Link
          href="/admin/intelligence/sos-debate-questions"
          className="rounded-full border border-sky-300 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-950"
        >
          SOS question bank (full briefings)
        </Link>
      </div>
      <V4KellyNarrativeFrame />
      <V4OpponentContrastPlaybookPanel />
      <V4AnchorBillsPlaybookIndex />
      <V4WorkflowPlaybook />
      <V4DebateDepthHub />

      <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-violet-900">
        Packet v{v4.version} · {v4.debatePrepSectionsV4.length} prep sections · generated{" "}
        {new Date(v4.generatedAt).toLocaleString()}
      </p>

      <V4ExecutiveBriefPanel brief={v4.executiveBrief} scorecard={v4.readinessScorecard} />

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Bills indexed</p>
          <p className="mt-1 font-heading text-3xl font-bold">{hub.totalBills}</p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Prep sections</p>
          <p className="mt-1 font-heading text-3xl font-bold">{v4.debatePrepSectionsV4.length}</p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Claims need research</p>
          <p className="mt-1 font-heading text-3xl font-bold text-amber-800">{hub.claims.needsResearch.length}</p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Rebuttal cards</p>
          <p className="mt-1 font-heading text-3xl font-bold">{v4.rebuttalPlaybook.length}</p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Timeline rows</p>
          <p className="mt-1 font-heading text-3xl font-bold">{v4.timeline.length}</p>
        </div>
      </section>

      <section className="mb-8">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Your path</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[
            { href: "/admin/intelligence/opposition-strategy", label: "Opposition strategy", step: "0b" },
            { href: "/admin/intelligence/supreme-workbench", label: "Supreme workbench", step: "0" },
            { href: "/admin/intelligence", label: "Start here", step: "1" },
            { href: "/admin/intelligence/kim-hammer/debate-prep", label: "Debate prep", step: "2" },
            { href: "/admin/intelligence/film-room", label: "Film room", step: "2b" },
            { href: "/admin/intelligence/sos-debate-questions", label: "Expected questions", step: "2c" },
            { href: "/admin/intelligence/agent-tooling", label: "Agent tooling", step: "2d" },
            { href: "/admin/intelligence/election-funding", label: "Election funding", step: "2f" },
            { href: "/admin/intelligence/debate-depth", label: "Plain-language depth", step: "2e" },
            { href: "/admin/intelligence/debate-command", label: "Debate command", step: "3" },
            { href: "/admin/intelligence/kim-hammer", label: "Opponent record", step: "4" },
            { href: "/admin/intelligence/claims", label: "Verify claims", step: "5" },
          ].map((item) => {
            const wf = getWorkflowStepByHref(item.href);
            return (
              <Link key={item.href} href={item.href} className={card}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-800">Step {item.step}</span>
                <h2 className="mt-2 font-heading text-lg font-bold text-kelly-navy">{item.label}</h2>
                <p className="mt-2 text-xs text-kelly-muted">
                  {wf?.guide.whenToUse ?? item.label}
                </p>
                {wf ? (
                  <p className="mt-2 line-clamp-4 text-[10px] leading-snug text-kelly-subtle">{wf.guide.howItFitsDebatePrep}</p>
                ) : null}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-kelly-navy">Mock debate rehearsal deck</h2>
        <V4RehearsalDeck cards={v4.rehearsalDeck} />
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Theme matrix (top drivers)</h2>
          <div className="mt-3">
            <V4ThemeMatrix rows={v4.themeMatrix} />
          </div>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Do not say</h2>
          <p className="mt-2 text-xs text-kelly-muted">
            Cross-check every line here against{" "}
            <Link href="/admin/intelligence/claims" className="font-semibold text-kelly-navy underline">
              claims
            </Link>{" "}
            before debate, interviews, or paid media. If a line appears in needs-research, cut it or use research-question framing.
          </p>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {hub.riskClaims.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {v4.integrity2021 ? (
            <p className="mt-4 text-xs text-violet-950">
              <span className="font-bold">2021 package:</span> {v4.integrity2021.billNumbers.join(", ")} — architecture
              debate anchor
            </p>
          ) : null}
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-violet-200/40 bg-violet-50/30 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-violet-950">Argument / rebuttal map</h2>
        <div className="mt-4">
          <V4ArgumentMap arguments={v4.likelyArguments} rebuttals={v4.rebuttalPlaybook} />
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-violet-200/40 bg-violet-50/30 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-violet-950">Research background</h2>
        <div className="mt-4">
          <V3MarkdownSectionList
            sections={[
              ...v4.researchLayers.debateProfile.slice(0, 2),
              ...v4.researchLayers.likelyArguments.slice(0, 2),
            ]}
          />
        </div>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-kelly-page/40 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Opponent record modules</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {v4.opponentModules.map((mod) => (
            <Link key={mod.id} href={mod.href} className="rounded-lg border border-kelly-text/10 bg-white p-3 text-sm hover:border-kelly-navy/30">
              <p className="font-bold text-kelly-navy">{mod.title}</p>
              <p className="mt-1 text-xs text-kelly-muted">{mod.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
