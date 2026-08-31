import { NextResponse } from "next/server";

/** Origins allowed to POST public forms cross-origin (kickoff static site → RedDirt API). */
const DEFAULT_FORM_ORIGINS = [
  "https://kelly-volunteer-kickoff.netlify.app",
  "https://foundry-os.netlify.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function allowedFormOrigins(): string[] {
  const extra = (process.env.FORMS_CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim();
  return Array.from(new Set([...DEFAULT_FORM_ORIGINS, ...extra, ...(site ? [site] : [])]));
}

export function resolveFormCorsOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  return allowedFormOrigins().includes(origin) ? origin : null;
}

export function withFormCors(request: Request, response: NextResponse): NextResponse {
  const origin = resolveFormCorsOrigin(request);
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    response.headers.set("Vary", "Origin");
  }
  return response;
}

export function formCorsPreflight(request: Request): NextResponse {
  const origin = resolveFormCorsOrigin(request);
  const res = new NextResponse(null, { status: origin ? 204 : 403 });
  if (origin) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
    res.headers.set("Access-Control-Max-Age", "86400");
    res.headers.set("Vary", "Origin");
  }
  return res;
}
