import type { CampaignSectionId, CrossDomainLearningHook } from "./cross-domain-orchestrator-types";

export function buildLearningHook(input: {
  playbookId: string;
  sectionId: CampaignSectionId;
  prompt: string;
  lesson: CrossDomainLearningHook["suggestedLessonType"];
  sensitivity?: CrossDomainLearningHook["sensitivity"];
}): CrossDomainLearningHook {
  return {
    id: `hook:${input.playbookId}:${input.sectionId}`.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 140),
    playbookId: input.playbookId,
    sectionId: input.sectionId,
    prompt: input.prompt,
    expectedObservationType: input.sectionId === "events_calendar" ? "event_hot_wash" : "workflow_outcome",
    suggestedLessonType: input.lesson,
    requiresApproval: input.sensitivity === "strategic" || input.sensitivity === "sensitive",
    sensitivity: input.sensitivity ?? "internal",
    improvesCampaignUnderstandingHow: "Captures whether the prepared packet improved campaign reality so future recommendations get sharper.",
  };
}

export function defaultLearningHooksForPlaybook(playbookId: string, sections: CampaignSectionId[]): CrossDomainLearningHook[] {
  return sections.map((sectionId) =>
    buildLearningHook({
      playbookId,
      sectionId,
      prompt: `After ${playbookId}, what changed in ${sectionId.replaceAll("_", " ")} and did the human accept the packet?`,
      lesson:
        sectionId === "county_intelligence"
          ? "county_learning"
          : sectionId === "communications" || sectionId === "email_os_ecc"
            ? "message_learning"
            : sectionId === "events_calendar"
              ? "event_learning"
              : "workflow_learning",
      sensitivity: sectionId === "research_strategy" ? "strategic" : "internal",
    }),
  );
}
