import Link from "next/link";
import { AiCommandCenterDisclosure } from "@/components/admin/campaign-events/AiCommandCenterDisclosure";
import { listAllRoleCopilots } from "@/lib/agents/role-copilots/role-copilot-engine";
import { countTrainingModules } from "@/lib/agents/training/training-module-registry";
import { loadToolBuildQueue } from "@/lib/agents/tool-builder/tool-builder-queue";
import { buildProgressionSummary } from "@/lib/agents/progression/progression-summary";
import { recommendNextTrainingModule } from "@/lib/agents/training/training-recommendation-engine";
import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";

type Props = {
  presentationScore: number;
  presentationLabel: string;
};

export function KellyOsIntelligencePanels({ presentationScore, presentationLabel }: Props) {
  const copilots = listAllRoleCopilots();
  const moduleCount = countTrainingModules();
  const tickets = loadToolBuildQueue();
  const proposed = tickets.filter((t) => t.status === "proposed").length;
  const role: RoleCopilotId = "campaign_manager";
  const progression = buildProgressionSummary(role);
  const nextTraining = recommendNextTrainingModule(role, []);

  return (
    <div className="space-y-3">
      <AiCommandCenterDisclosure title={`Role copilots (${copilots.length} roles)`} defaultOpen>
        <p className="mb-2 text-xs text-kelly-muted">Missions, tasks, and human gates per Kelly role.</p>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          {copilots.slice(0, 8).map((c) => (
            <li key={c.id} className="rounded-lg border px-3 py-2">
              <strong>{c.label}</strong>
              <p className="text-xs text-kelly-muted line-clamp-2">{c.mission}</p>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex gap-3">
          <Link href="/admin/ai-command-center/copilots" className="text-xs font-bold text-kelly-navy underline">
            Copilot command center →
          </Link>
          <Link href="/admin/training" className="text-xs font-bold text-kelly-navy underline">
            Training center →
          </Link>
        </div>
      </AiCommandCenterDisclosure>

      <AiCommandCenterDisclosure title={`Training progress (${moduleCount} modules)`}>
        <p className="text-sm text-kelly-muted">
          Next: {nextTraining?.title ?? "path complete"} · Progress stored locally per operator until auth profile ships.
        </p>
        <Link href="/admin/training" className="text-xs font-bold text-kelly-navy underline">
          Open training center
        </Link>
      </AiCommandCenterDisclosure>

      <AiCommandCenterDisclosure title={`Dashboard modules (L${progression.level})`}>
        <p className="text-xs text-kelly-muted">{progression.unlockedModules.join(", ")}</p>
        <Link href="/admin/ai-command-center/dashboard-builder/preview" className="text-xs font-bold text-kelly-navy underline">
          Module preview renderer
        </Link>
      </AiCommandCenterDisclosure>

      <AiCommandCenterDisclosure title={`Tool builder queue (${proposed} proposed)`}>
        <Link href="/admin/ai-command-center/tool-builder" className="text-xs font-bold text-kelly-navy underline">
          Review tool specs (human only)
        </Link>
      </AiCommandCenterDisclosure>

      <AiCommandCenterDisclosure title="System learning opportunities">
        <p className="text-xs text-kelly-muted">Use Detect gaps in tool builder after repeated abandoned flows or finance friction events.</p>
      </AiCommandCenterDisclosure>

      <AiCommandCenterDisclosure title="Operator progression">
        <p className="text-xs text-kelly-muted">Guidance tiers only — not permission enforcement.</p>
      </AiCommandCenterDisclosure>

      <AiCommandCenterDisclosure title="Recommended next training">
        {nextTraining ? (
          <Link href={`/admin/training?role=${role}&module=${nextTraining.moduleId}`} className="text-sm font-bold text-kelly-navy underline">
            {nextTraining.title}
          </Link>
        ) : (
          <p className="text-sm text-kelly-muted">Complete onboarding to personalize.</p>
        )}
      </AiCommandCenterDisclosure>

      <AiCommandCenterDisclosure title={`Presentation readiness (${presentationScore}%)`} defaultOpen>
        <p className="text-xs text-kelly-muted">{presentationLabel} — see PRESENTATION_READINESS_CHECKLIST.md</p>
        <Link href="/admin/onboarding" className="text-xs font-bold text-kelly-navy underline">
          Onboarding V2
        </Link>
      </AiCommandCenterDisclosure>
    </div>
  );
}
