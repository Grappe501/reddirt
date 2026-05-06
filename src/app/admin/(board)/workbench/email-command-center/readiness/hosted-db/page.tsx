import { HostedDbReadinessAssistantView } from "@/components/admin/email-command-center/HostedDbReadinessAssistantView";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

export const dynamic = "force-dynamic";

export default async function HostedDbReadinessAssistantPage() {
  const snapshot = await getEmailCommandCenterSnapshot();
  return <HostedDbReadinessAssistantView gate={snapshot.operatorGate} variant="page" />;
}
