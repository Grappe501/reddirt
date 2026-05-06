import { MessageStudioView } from "@/components/admin/email-command-center/MessageStudioView";
import {
  getEmailAudienceDefinitionById,
  listAudienceBuildingBlocks,
  listSuggestedAudienceClusters,
} from "@/lib/email-command-center/audience-studio";
import { buildAudienceStrategySummaryForDefinition } from "@/lib/email-command-center/ai-audience-strategist";
import { listMessageStudioDrafts } from "@/lib/email-command-center/message-studio-drafts";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";
import { isOpenAIConfigured } from "@/lib/openai/client";
import { getCampaignMemoryReadiness } from "@/lib/email-command-center/ai-campaign-memory-readiness";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MessageStudioPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const q = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v : undefined;
  };
  const audienceDefinitionId = q("audienceDefinitionId");

  const [serverDraftRows, snapshot, audienceStrategySummary, campaignMemoryReadiness] = await Promise.all([
    listMessageStudioDrafts({ includeArchived: true }).catch(() => []),
    getEmailCommandCenterSnapshot(),
    (async () => {
      if (!audienceDefinitionId) return null;
      try {
        const def = await getEmailAudienceDefinitionById(audienceDefinitionId);
        if (!def) return null;
        const [bb, cl] = await Promise.all([listAudienceBuildingBlocks(), listSuggestedAudienceClusters()]);
        return buildAudienceStrategySummaryForDefinition(
          {
            id: def.id,
            name: def.name,
            description: def.description,
            status: def.status,
            criteriaJson: def.criteriaJson,
          },
          bb,
          cl,
        );
      } catch {
        return null;
      }
    })(),
    getCampaignMemoryReadiness(),
  ]);

  return (
    <MessageStudioView
      querySource={q("source")}
      queryId={q("id")}
      queryAudienceDefinitionId={audienceDefinitionId}
      queryImportBatchId={q("importBatchId")}
      openAiServerConfigured={isOpenAIConfigured()}
      serverDraftRows={serverDraftRows}
      snapshot={snapshot}
      audienceStrategySummary={audienceStrategySummary}
      campaignMemoryReadiness={campaignMemoryReadiness}
    />
  );
}
