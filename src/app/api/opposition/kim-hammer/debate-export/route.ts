import { NextResponse } from "next/server";
import {
  buildKimHammerDebateExportMarkdown,
  buildKimHammerDebateExportPayload,
} from "@/lib/opposition/kimHammerDebateExport";

function parseFormatParam(value: string | null): "json" | "markdown" | null {
  if (value === null || value === "json") return "json";
  if (value === "markdown") return "markdown";
  return null;
}

export async function GET(request: Request) {
  const format = parseFormatParam(new URL(request.url).searchParams.get("format"));

  if (!format) {
    return NextResponse.json(
      { error: "unsupported_format", allowed: ["json", "markdown"] },
      { status: 400 },
    );
  }

  const payload = buildKimHammerDebateExportPayload();

  if (format === "markdown") {
    return new NextResponse(buildKimHammerDebateExportMarkdown(payload), {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  return NextResponse.json(payload);
}
