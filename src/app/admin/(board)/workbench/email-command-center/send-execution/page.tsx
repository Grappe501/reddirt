import { SendExecutionGovernanceView } from "@/components/admin/email-command-center/SendExecutionGovernanceView";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

export const dynamic = "force-dynamic";

export default async function SendExecutionGovernancePage() {
  const snapshot = await getEmailCommandCenterSnapshot();
  return <SendExecutionGovernanceView snapshot={snapshot} />;
}
