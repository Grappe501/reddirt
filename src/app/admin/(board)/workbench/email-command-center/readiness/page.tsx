import { EmailCommandCenterReadinessView } from "@/components/admin/email-command-center/EmailCommandCenterReadinessView";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

export const dynamic = "force-dynamic";

export default async function EmailCommandCenterReadinessPage() {
  const snapshot = await getEmailCommandCenterSnapshot();
  return <EmailCommandCenterReadinessView snapshot={snapshot} />;
}
