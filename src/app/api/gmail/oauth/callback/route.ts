import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { exchangeGmailCodeForTokens } from "@/lib/integrations/gmail/oauth";
import { fetchGmailUserEmail } from "@/lib/integrations/gmail/gmail-api";
import { verifyGmailOAuthState } from "@/lib/gmail/oauth-state";
import { buildStaffGmailSealedRecord } from "@/lib/gmail/staff-oauth-storage";

export const dynamic = "force-dynamic";

const DEFAULT_RETURN = "/admin/workbench/email-command-center";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");
  const err = url.searchParams.get("error");

  const fail = (returnPath: string, codeSuffix: string) =>
    NextResponse.redirect(new URL(`${returnPath}?gmail_error=${encodeURIComponent(codeSuffix)}`, origin));

  if (err) {
    return fail(DEFAULT_RETURN, err);
  }

  const st = verifyGmailOAuthState(stateRaw);
  if (!code || !st) {
    return fail(DEFAULT_RETURN, "gmail_oauth");
  }

  const user = await prisma.user.findUnique({ where: { id: st.uid } });
  if (!user) {
    return fail(st.ret, "gmail_user");
  }

  try {
    const tokens = await exchangeGmailCodeForTokens(code);
    let oauthJson: object;
    try {
      oauthJson = buildStaffGmailSealedRecord(tokens) as unknown as object;
    } catch {
      return fail(st.ret, "gmail_no_encrypt_key");
    }

    await prisma.staffGmailAccount.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        sendAsEmail: user.email,
        oauthJson: oauthJson as Prisma.InputJsonValue,
        isActive: true,
        lastError: null,
      },
      update: {
        oauthJson: oauthJson as Prisma.InputJsonValue,
        isActive: true,
        lastError: null,
      },
    });

    try {
      const profileEmail = await fetchGmailUserEmail(user.id);
      if (profileEmail) {
        await prisma.staffGmailAccount.update({
          where: { userId: user.id },
          data: { sendAsEmail: profileEmail },
        });
      }
    } catch {
      /* profile lookup is optional; connection still valid */
    }
  } catch {
    return fail(st.ret, "gmail_token");
  }

  const nextUrl = new URL(st.ret, origin);
  nextUrl.searchParams.set("gmail", "1");
  return NextResponse.redirect(nextUrl);
}
