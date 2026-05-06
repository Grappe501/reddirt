import { DailyOperatorConsoleView } from "@/components/admin/email-command-center/DailyOperatorConsoleView";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

export const dynamic = "force-dynamic";

export default async function DailyOperatorConsolePage() {
  const snapshot = await getEmailCommandCenterSnapshot();
  return (
    <div className="min-w-0 p-3 md:p-4">
      <DailyOperatorConsoleView snapshot={snapshot} />
    </div>
  );
}
