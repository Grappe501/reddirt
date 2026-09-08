"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrderSide } from "@prisma/client";
import { requireMarketLabUser } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_COMPETITION_SLUG, ensureDefaultCompetition } from "@/lib/competition/ensureDefaultCompetition";
import { executeMarketOrder } from "@/lib/trading/executeMarketOrder";

export async function placeMarketOrder(formData: FormData) {
  const user = await requireMarketLabUser();
  const competition = await ensureDefaultCompetition();
  const player = await prisma.player.findUnique({
    where: { authSubject: user.id },
    include: { portfolios: { where: { competitionId: competition.id }, take: 1 } },
  });
  const portfolio = player?.portfolios[0];
  if (!portfolio) redirect("/dashboard");

  const symbol = String(formData.get("symbol") || "").trim().toUpperCase();
  const quantity = String(formData.get("quantity") || "").trim();
  const sideRaw = String(formData.get("side") || "BUY").toUpperCase();
  const side = sideRaw === "SELL" ? OrderSide.SELL : OrderSide.BUY;
  const idempotencyKey = String(formData.get("idempotencyKey") || "").trim();

  try {
    await executeMarketOrder({
      portfolioId: portfolio.id,
      symbol,
      quantity,
      side,
      idempotencyKey,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Order failed";
    redirect(`/trade?symbol=${encodeURIComponent(symbol)}&error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/trade");
  revalidatePath("/leaderboard");
  redirect(`/trade?symbol=${encodeURIComponent(symbol)}&filled=1&competition=${DEFAULT_COMPETITION_SLUG}`);
}
