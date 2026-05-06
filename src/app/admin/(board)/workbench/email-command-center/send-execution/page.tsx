import { SendExecutionGovernanceView } from "@/components/admin/email-command-center/SendExecutionGovernanceView";
import { SendExecutionOperationsPanel } from "@/components/admin/email-command-center/SendExecutionOperationsPanel";
import { prisma } from "@/lib/db";
import { listMessageStudioDrafts } from "@/lib/email-command-center/message-studio-drafts";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";
import { getEmailSendExecution, listEmailSendExecutions } from "@/lib/email-command-center/send-execution";

export const dynamic = "force-dynamic";

type Search = Record<string, string | string[] | undefined>;

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return undefined;
}

export default async function SendExecutionGovernancePage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const snapshot = await getEmailCommandCenterSnapshot();
  const og = snapshot.operatorGate;

  const id = firstString(sp.id);
  const draftId = firstString(sp.draftId);
  const audienceDefinitionId = firstString(sp.audienceDefinitionId);
  const sendGridContactSyncRunId = firstString(sp.sendGridContactSyncRunId);
  const error = firstString(sp.error);
  const notice = firstString(sp.notice);

  let executions: Awaited<ReturnType<typeof listEmailSendExecutions>> = [];
  let drafts: Awaited<ReturnType<typeof listMessageStudioDrafts>> = [];
  let audiences: { id: string; name: string; status: string }[] = [];
  let syncedRunsRaw: { id: string; audienceDefinitionId: string | null; candidateCount: number; createdAt: Date }[] = [];

  if (og.cockpitDbReachable) {
    const loaded = await Promise.all([
      listEmailSendExecutions(60),
      listMessageStudioDrafts(),
      prisma.emailAudienceDefinition
        .findMany({
          where: { status: "ACTIVE" },
          orderBy: { name: "asc" },
          select: { id: true, name: true, status: true },
        })
        .catch(() => []),
      prisma.sendGridContactSyncRun
        .findMany({
          where: { status: "SYNCED" },
          orderBy: { createdAt: "desc" },
          take: 60,
          select: { id: true, audienceDefinitionId: true, candidateCount: true, createdAt: true },
        })
        .catch(() => []),
    ]);
    executions = loaded[0];
    drafts = loaded[1];
    audiences = loaded[2];
    syncedRunsRaw = loaded[3];
  }

  const syncedRuns = syncedRunsRaw.map((r) => ({
    id: r.id,
    audienceDefinitionId: r.audienceDefinitionId,
    candidateCount: r.candidateCount,
    createdAt: r.createdAt.toISOString(),
  }));

  const detail = id && og.cockpitDbReachable ? await getEmailSendExecution(id) : null;

  return (
    <div className="space-y-8">
      <SendExecutionGovernanceView snapshot={snapshot} />
      <SendExecutionOperationsPanel
        snapshot={snapshot}
        executions={executions}
        drafts={drafts}
        audiences={audiences}
        syncedRuns={syncedRuns}
        detail={detail}
        query={{ draftId, audienceDefinitionId, sendGridContactSyncRunId, id, error, notice }}
      />
    </div>
  );
}
