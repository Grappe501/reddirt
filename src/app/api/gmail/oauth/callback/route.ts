import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exchangeGmailCodeForTokens } from "@/lib/integrations/gmail/oauth";
import { fetchGmailUserEmail } from "@/lib/integrations/gmail/gmail-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error");
  if (err) {
    return NextResponse.redirect(new URL(`/admin/workbench?error=${encodeURIComponent(err)}`, origin));
  }
  if (!code || !state) {
    return NextResponse.redirect(new URL("/admin/workbench?error=gmail_oauth", origin));
  }
  const user = await prisma.user.findUnique({ where: { id: state } });
  if (!user) {
    return NextResponse.redirect(new URL("/admin/workbench?error=gmail_user", origin));
  }
  try {
    const tokens = await exchangeGmailCodeForTokens(code);
    await prisma.staffGmailAccount.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        sendAsEmail: user.email,
        oauthJson: tokens as object,
        isActive: true,
        lastError: null,
      },
      update: {
        oauthJson: tokens as object,
        isActive: true,
        lastError: null,
      },
    });
    const profileEmail = await fetchGmailUserEmail(user.id);
    if (profileEmail) {
      await prisma.staffGmailAccount.update({
        where: { userId: user.id },
        data: { sendAsEmail: profileEmail },
      });
    }
  } catch {
    return NextResponse.redirect(new URL("/admin/workbench?error=gmail_token", origin));
  }
  return NextResponse.redirect(new URL("/admin/workbench?gmail=1", origin));
}
