import Link from "next/link";
import { notFound } from "next/navigation";

import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import { ElectionPlanOppositionResearchModulePanel } from "@/components/election-plan/ElectionPlanOppositionResearchModulePanel";
import { EP_OPPOSITION_RESEARCH_HREF } from "@/lib/election-plan/debate-prep-links";
import {
  getOppositionResearchModule,
  oppositionResearchModuleIds,
} from "@/lib/election-plan/oppositionResearchModules";
import { loadDebateIntelligenceV4HubPacket } from "@/lib/intelligence/v4/debateIntelligenceV4";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  const v4 = loadDebateIntelligenceV4HubPacket();
  return oppositionResearchModuleIds(v4).map((moduleId) => ({ moduleId }));
}

export async function generateMetadata({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const v4 = loadDebateIntelligenceV4HubPacket();
  const mod = getOppositionResearchModule(v4, moduleId);
  if (!mod) return { title: "Module not found" };
  return {
    title: `${mod.title} | Opposition Research`,
    robots: { index: false, follow: false },
  };
}

export default async function ElectionPlanOppositionResearchModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const v4 = loadDebateIntelligenceV4HubPacket();
  const mod = getOppositionResearchModule(v4, moduleId);
  if (!mod) notFound();

  return (
    <>
      <div className="ep-classification">Internal · Opposition research · {mod.title}</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <header className="mb-8">
            <Link
              href={EP_OPPOSITION_RESEARCH_HREF}
              className="text-xs font-bold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
            >
              ← Opposition research hub
            </Link>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.24em] text-rose-800">
              {moduleId === "gop-primary-election-analysis" ? "Republican primary election analysis" : "Kim Hammer research"}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{mod.title}</h1>
            <p className="mt-3 max-w-3xl text-sm text-[var(--ep-navy-muted)]">{mod.summary}</p>
          </header>
          {(moduleId === "integrity-foundation-2021" || moduleId === "direct-democracy") ? null : (
            <KellyPageSummary
              summary={
                moduleId === "gop-primary-election-analysis"
                  ? "Hammer won by 913 votes statewide — but Norris carried 38 counties. Kelly's path is geographic persuasion, not a GOP pile-on."
                  : mod.summary
              }
            />
          )}
          <ElectionPlanOppositionResearchModulePanel module={mod} />
        </div>
      </div>
    </>
  );
}
