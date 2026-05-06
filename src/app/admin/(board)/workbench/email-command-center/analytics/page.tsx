import { AnalyticsDeliverabilityView } from "@/components/admin/email-command-center/AnalyticsDeliverabilityView";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";
import { listSendGridSuppressionSummary } from "@/lib/email-command-center/sendgrid-foundation";

export const dynamic = "force-dynamic";

export default async function EmailCommandCenterAnalyticsPage() {
  const snapshot = await getEmailCommandCenterSnapshot();
  const suppressionByType = snapshot.sendGridFoundation.dbReachable
    ? await listSendGridSuppressionSummary()
    : [];
  return <AnalyticsDeliverabilityView snapshot={snapshot} suppressionByType={suppressionByType} />;
}
