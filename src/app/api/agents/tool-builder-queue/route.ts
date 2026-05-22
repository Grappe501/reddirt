import { NextResponse } from "next/server";
import {
  detectToolGapsFromObservations,
  loadToolBuildQueue,
  saveToolBuildQueue,
  updateToolBuildTicketStatus,
} from "@/lib/agents/tool-builder/tool-builder-queue";
import type { ToolBuildTicketStatus } from "@/lib/agents/tool-builder/tool-builder-types";

export async function GET() {
  return NextResponse.json({ tickets: loadToolBuildQueue() });
}

export async function POST() {
  const existing = loadToolBuildQueue();
  const gaps = detectToolGapsFromObservations();
  const merged = [...gaps.filter((g) => !existing.some((e) => e.id === g.id)), ...existing];
  saveToolBuildQueue(merged);
  return NextResponse.json({ tickets: merged });
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as { id: string; status: ToolBuildTicketStatus; reviewerNotes?: string };
  const ticket = updateToolBuildTicketStatus(body.id, body.status, body.reviewerNotes);
  if (!ticket) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ticket });
}
