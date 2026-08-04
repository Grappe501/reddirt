import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";

export const STATUSES = ["new", "contacted", "placed", "follow_up", "declined", "duplicate"];

export function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export function getManagePassword() {
  return process.env.KICKOFF_MANAGE_PASSWORD?.trim() || "";
}

export function getManageSecret() {
  return process.env.KICKOFF_MANAGE_SECRET?.trim() || process.env.KICKOFF_MANAGE_PASSWORD?.trim() || "";
}

export function signToken() {
  const secret = getManageSecret();
  if (!secret) return null;
  const day = new Date().toISOString().slice(0, 10);
  return createHmac("sha256", secret).update(`kickoff-manage:${day}`).digest("hex");
}

export function verifyToken(token) {
  const expected = signToken();
  if (!expected || !token) return false;
  try {
    const a = Buffer.from(String(token));
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function requireAuth(request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!verifyToken(token)) {
    return json(401, { ok: false, error: "unauthorized" });
  }
  return null;
}

export function signupsStore() {
  return getStore({ name: "kickoff-volunteers", consistency: "strong" });
}

export async function readSignups() {
  const store = signupsStore();
  const raw = await store.get("signups.json", { type: "json" });
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.items)) {
    return { items: [] };
  }
  return raw;
}

export async function writeSignups(data) {
  const store = signupsStore();
  await store.setJSON("signups.json", data);
}

export function normalizeSignup(input) {
  const now = new Date().toISOString();
  return {
    id: input.id || randomUUID(),
    createdAt: input.createdAt || now,
    updatedAt: now,
    source: input.source || "kickoff-form",
    name: String(input.name || "").trim().slice(0, 120),
    email: String(input.email || "").trim().toLowerCase().slice(0, 200),
    phone: String(input.phone || "").trim().slice(0, 40),
    county: String(input.county || "").trim().slice(0, 80),
    city: String(input.city || "").trim().slice(0, 120),
    pathway: String(input.pathway || "").trim().slice(0, 40),
    roles: String(input.roles || "").trim().slice(0, 500),
    primaryTeam: String(input.primaryTeam || "").trim().slice(0, 80),
    availability: String(input.availability || "").trim().slice(0, 500),
    notes: String(input.notes || "").trim().slice(0, 3000),
    eventInterest: String(input.eventInterest || "").trim().slice(0, 200),
    status: STATUSES.includes(input.status) ? input.status : "new",
    assignee: String(input.assignee || "").trim().slice(0, 120),
    staffNotes: String(input.staffNotes || "").trim().slice(0, 4000),
  };
}
