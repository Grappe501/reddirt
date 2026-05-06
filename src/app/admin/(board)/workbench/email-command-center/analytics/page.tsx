import { AnalyticsDeliverabilityView } from "@/components/admin/email-command-center/AnalyticsDeliverabilityView";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";
import { listSendGridSuppressionSummary } from "@/lib/email-command-center/sendgrid-foundation";

export const dynamic = "force-dynamic";

type Search = Record<string, string | string[] | undefined>;

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return undefined;
}

export default async function EmailCommandCenterAnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<Search>;
}) {
  const sp = (await searchParams) ?? {};
  const snapshot = await getEmailCommandCenterSnapshot();
  const suppressionByType = snapshot.sendGridFoundation.dbReachable
    ? await listSendGridSuppressionSummary()
    : [];
  return (
    <AnalyticsDeliverabilityView
      snapshot={snapshot}
      suppressionByType={suppressionByType}
      reconcileNotice={firstString(sp.reconcileNotice)}
      reconcileError={firstString(sp.error)}
    />
  );
}
