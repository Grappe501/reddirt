import { EmailCommandCenterContent } from "@/components/admin/email-command-center/EmailCommandCenterContent";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ gmail?: string; gmail_error?: string; missing?: string }>;
};

export default async function EmailCommandCenterPage({ searchParams }: Props) {
  const snapshot = await getEmailCommandCenterSnapshot();
  const sp = await searchParams;
  return (
    <EmailCommandCenterContent
      snapshot={snapshot}
      query={{ gmail: sp.gmail, gmail_error: sp.gmail_error, missing: sp.missing }}
    />
  );
}
