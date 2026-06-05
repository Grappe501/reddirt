import Link from "next/link";
import { buildDebateAgentToolingPageData } from "@/lib/intelligence/debateAgentToolingPackage";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { DebateAgentToolingClient } from "@/components/admin/intelligence/agent-tooling/DebateAgentToolingClient";
import { NsiStaffResearchNavPanel } from "@/components/admin/intelligence/NsiStaffResearchNavPanel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function DebateAgentToolingPage() {
  const data = buildDebateAgentToolingPageData();

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-sm text-rose-900">
        Debate agent tooling package file missing — check data/intelligence/debate-agent-tooling-package.json
      </div>
    );
  }

  const guide = getSurfaceGuide("agent-tooling-index");

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="NSI-11 · debate-week agent tooling"
        title="AI agent tooling package"
        description="Governed copilot runs, operator sequences, and readiness signals for debate week. All outputs are internal drafts — pair with Claims and SOS question bank before stage."
        guide={guide}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/sos-debate-questions"
          className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-950"
        >
          SOS questions
        </Link>
        <Link
          href="/admin/intelligence/ai-tools"
          className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Full registry
        </Link>
      </V4PageHeader>

      {guide ? (
        <div className="mb-6">
          <V4OperatorGuide guide={guide} />
        </div>
      ) : null}

      <section className="mb-6 rounded-xl border-2 border-amber-300/50 bg-amber-50 p-4 text-xs text-amber-950">
        <p className="font-bold uppercase">Safety rules</p>
        <ul className="mt-2 list-inside list-disc">
          <li>No autonomous claim, citation, task, or export creation</li>
          <li>Never read LLM drafts on stage — staff reviews NSI-12 queue only</li>
          <li>Kelly uses Claims + SOS bank live; this hub is prep and staff debrief</li>
          <li>Agree-plus-fresh-add required — never close on agreement alone</li>
        </ul>
      </section>

      <DebateAgentToolingClient data={data} />
      <NsiStaffResearchNavPanel compact />
    </div>
  );
}
