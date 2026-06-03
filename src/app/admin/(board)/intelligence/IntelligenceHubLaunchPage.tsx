import Link from "next/link";
import { loadDebateIntelligenceV3Packet } from "@/lib/intelligence/v3/debateIntelligenceV3";
import { V3BackLinks, V3PageHeader } from "@/components/admin/intelligence/v3/V3PageHeader";
import { V3MarkdownSectionList } from "@/components/admin/intelligence/v3/V3SectionStack";

const card =
  "flex flex-col rounded-xl border-2 border-kelly-navy/15 bg-white p-4 shadow-sm transition hover:border-kelly-navy/40";

/**
 * Intelligence v3 hub — JSON index + opposition markdown research layers.
 */
export default function IntelligenceHubLaunchPage() {
  const v3 = loadDebateIntelligenceV3Packet();
  const { hub } = v3;
  const topTheme = hub.highConfidenceThemes[0];

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V3PageHeader
        eyebrow="Kelly · debate intelligence v3"
        title="Tonight's overview"
        description="Deep opposition packet: election-law index, legislative narratives, debate profile, and claims review. Internal draft only — verify before any public setting."
      >
        <V3BackLinks />
      </V3PageHeader>

      <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-violet-900">
        Packet v{v3.version} · generated {new Date(v3.generatedAt).toLocaleString()}
      </p>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Bills indexed</p>
          <p className="mt-1 font-heading text-3xl font-bold">{hub.totalBills}</p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Enacted acts</p>
          <p className="mt-1 font-heading text-3xl font-bold">{hub.enactedActs}</p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Claims needing research</p>
          <p className="mt-1 font-heading text-3xl font-bold text-amber-800">{hub.claims.needsResearch.length}</p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Narrative depth</p>
          <p className="mt-1 font-heading text-3xl font-bold">{v3.billNarratives.length}</p>
          <p className="mt-1 text-xs text-kelly-muted">KH-0B legislative narrative cards</p>
        </div>
      </section>

      <section className="mb-8">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Your path</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[
            { href: "/admin/intelligence", label: "Start here", step: "1", desc: "You are here" },
            {
              href: "/admin/intelligence/kim-hammer/debate-prep",
              label: "Debate prep",
              step: "2",
              desc: "14-section v3 briefing",
            },
            {
              href: "/admin/intelligence/debate-command",
              label: "Debate command",
              step: "3",
              desc: "Readiness + lanes",
            },
            {
              href: "/admin/intelligence/kim-hammer",
              label: "Opponent record",
              step: "4",
              desc: "Module research map",
            },
            {
              href: "/admin/intelligence/claims",
              label: "Verify claims",
              step: "5",
              desc: `${hub.claims.needsResearch.length} need review`,
            },
          ].map((item) => (
            <Link key={item.href} href={item.href} className={card}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-800">Step {item.step}</span>
              <h2 className="mt-2 font-heading text-lg font-bold text-kelly-navy">{item.label}</h2>
              <p className="mt-2 text-xs text-kelly-muted">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Top theme driver</h2>
          <p className="mt-2 text-sm text-kelly-muted">
            {topTheme
              ? `${topTheme.theme.replaceAll("_", " ")} (${topTheme.billCount} bills in theme matrix)`
              : "Theme matrix unavailable"}
          </p>
          <h3 className="mt-4 text-xs font-bold uppercase text-kelly-navy">Mock debate drill</h3>
          <ul className="mt-2 space-y-2 text-xs text-kelly-muted">
            {hub.debateDrillQueue.map((cardItem) => (
              <li key={cardItem.billNumber}>
                <Link
                  href={`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(cardItem.billNumber)}`}
                  className="font-bold text-kelly-navy underline"
                >
                  {cardItem.billNumber}
                </Link>
                : {cardItem.prompt}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Do not say</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {hub.riskClaims.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-violet-200/40 bg-violet-50/30 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-violet-950">Research background (v3)</h2>
        <p className="mt-1 text-xs text-violet-900/90">
          Excerpts from opposition markdown — debate profile, likely arguments, and dossier. Expand any module from the
          opponent record hub.
        </p>
        <div className="mt-4">
          <V3MarkdownSectionList
            sections={[
              ...v3.researchLayers.debateProfile.slice(0, 2),
              ...v3.researchLayers.likelyArguments.slice(0, 2),
            ]}
          />
        </div>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-kelly-page/40 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Opponent record modules</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {v3.opponentModules.map((mod) => (
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
