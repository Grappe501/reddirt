import { NextResponse } from "next/server";
import { z } from "zod";
import {
  loadKellyDebatePackageProgress,
  saveKellyDebatePackageProgress,
  togglePackageStepProgress,
} from "@/lib/intelligence/v4/kellyDebatePackageProgress";

const toggleSchema = z.object({
  action: z.literal("toggle-step"),
  stepId: z.string().min(1),
});

const bodySchema = z.discriminatedUnion("action", [toggleSchema]);

export function getDebatePrepPackageProgressPayload() {
  const progress = loadKellyDebatePackageProgress();
  return {
    ok: true as const,
    progress,
    completedCount: progress.completedStepIds.length,
  };
}

export async function handleDebatePrepPackageProgressPost(req: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation", details: parsed.error.flatten() }, { status: 400 });
  }

  const current = loadKellyDebatePackageProgress();
  if (parsed.data.action === "toggle-step") {
    const next = togglePackageStepProgress(current, parsed.data.stepId);
    saveKellyDebatePackageProgress(next);
    return NextResponse.json({
      ok: true,
      progress: next,
      completedCount: next.completedStepIds.length,
    });
  }

  return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 });
}
