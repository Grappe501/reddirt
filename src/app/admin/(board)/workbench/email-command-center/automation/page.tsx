import { AutomationStudioView } from "@/components/admin/email-command-center/AutomationStudioView";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

export const dynamic = "force-dynamic";

export default async function AutomationStudioPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const notice = typeof sp.notice === "string" ? sp.notice : undefined;
  const snapshot = await getEmailCommandCenterSnapshot();
  return <AutomationStudioView snapshot={snapshot} evalNotice={notice} />;
}
