import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const eventSchema = z.object({
  name: z.string().min(1).max(80),
  path: z.string().max(500).optional(),
  sessionId: z.string().max(120).optional(),
  payload: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`analytics:${ip}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = eventSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const body = parsed.data;
  try {
    await prisma.analyticsEvent.create({
      data: {
        name: body.name,
        path: body.path,
        sessionId: body.sessionId,
        payload: {
          ...(body.payload ?? {}),
          ip,
        } as object,
      },
    });
  } catch (e) {
    console.error(e);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
