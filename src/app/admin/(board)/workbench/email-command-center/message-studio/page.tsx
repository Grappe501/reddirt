import { MessageStudioView } from "@/components/admin/email-command-center/MessageStudioView";
import { listMessageStudioDrafts } from "@/lib/email-command-center/message-studio-drafts";
import { isOpenAIConfigured } from "@/lib/openai/client";

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
  const serverDraftRows = await listMessageStudioDrafts().catch(() => []);
  return (
    <MessageStudioView
      querySource={q("source")}
      queryId={q("id")}
      queryAudienceDefinitionId={q("audienceDefinitionId")}
      queryImportBatchId={q("importBatchId")}
      openAiServerConfigured={isOpenAIConfigured()}
      serverDraftRows={serverDraftRows}
    />
  );
}
