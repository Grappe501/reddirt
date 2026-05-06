import { AutomationStudioView } from "@/components/admin/email-command-center/AutomationStudioView";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

export const dynamic = "force-dynamic";

export default async function AutomationStudioPage() {
  const snapshot = await getEmailCommandCenterSnapshot();
  return <AutomationStudioView cockpitDbReachable={snapshot.operatorGate.cockpitDbReachable} />;
}
