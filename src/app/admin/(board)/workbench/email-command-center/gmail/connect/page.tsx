import { redirect } from "next/navigation";

const DEFAULT_RETURN = "/admin/workbench/email-command-center";

type Props = {
  searchParams: Promise<{ return?: string }>;
};

function safeReturnPath(raw: string | undefined): string {
  const v = raw?.trim();
  if (!v || !v.startsWith("/") || v.startsWith("//")) return DEFAULT_RETURN;
  return v;
}

/**
 * Starts the Google OAuth consent flow (redirects to `/api/gmail/oauth/start`).
 */
export default async function GmailConnectRedirectPage({ searchParams }: Props) {
  const sp = await searchParams;
  const ret = safeReturnPath(sp.return);
  redirect(`/api/gmail/oauth/start?return=${encodeURIComponent(ret)}`);
}
