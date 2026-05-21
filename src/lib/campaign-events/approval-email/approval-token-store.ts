import "server-only";

import { randomBytes } from "node:crypto";
import { createJsonRepository } from "@/lib/compliance/persistence/compliance-repository";

export type ApprovalTokenAction = "review" | "approve" | "deny" | "hold" | "request_info";

export type ApprovalTokenStatus = "active" | "used" | "expired" | "revoked";

export type ApprovalPackageToken = {
  id: string;
  recordId: string;
  action: ApprovalTokenAction;
  recipientEmail: string | null;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  createdBy: string;
  status: ApprovalTokenStatus;
  packageLogId: string | null;
};

type ApprovalTokenFile = {
  version: 1;
  tokens: ApprovalPackageToken[];
};

const TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000;

const repo = createJsonRepository<ApprovalTokenFile>("data/campaign-events/approval-package-tokens.json", {
  version: 1,
  tokens: [],
});

export async function loadApprovalTokenFile(): Promise<ApprovalTokenFile> {
  return repo.load();
}

function newTokenId(): string {
  return `apt_${randomBytes(18).toString("hex")}`;
}

function isExpired(t: ApprovalPackageToken, now = Date.now()): boolean {
  return new Date(t.expiresAt).getTime() < now;
}

export function resolveTokenStatus(t: ApprovalPackageToken, now = Date.now()): ApprovalTokenStatus {
  if (t.status === "revoked") return "revoked";
  if (t.usedAt) return "used";
  if (isExpired(t, now)) return "expired";
  return "active";
}

export async function getApprovalTokenById(id: string): Promise<ApprovalPackageToken | null> {
  const file = await loadApprovalTokenFile();
  const t = file.tokens.find((x) => x.id === id);
  if (!t) return null;
  const status = resolveTokenStatus(t);
  return { ...t, status };
}

export async function createApprovalTokenSet(input: {
  recordId: string;
  createdBy: string;
  packageLogId?: string;
  recipientEmail?: string | null;
}): Promise<Record<ApprovalTokenAction, ApprovalPackageToken>> {
  const file = await loadApprovalTokenFile();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
  const createdAt = new Date().toISOString();
  const actions: ApprovalTokenAction[] = ["review", "approve", "deny", "hold", "request_info"];
  const out = {} as Record<ApprovalTokenAction, ApprovalPackageToken>;

  for (const action of actions) {
    const token: ApprovalPackageToken = {
      id: newTokenId(),
      recordId: input.recordId,
      action,
      recipientEmail: input.recipientEmail ?? null,
      expiresAt,
      usedAt: null,
      createdAt,
      createdBy: input.createdBy,
      status: "active",
      packageLogId: input.packageLogId ?? null,
    };
    file.tokens.push(token);
    out[action] = token;
  }

  await repo.save(file);
  return out;
}

export async function markApprovalTokenUsed(id: string): Promise<ApprovalPackageToken | null> {
  const file = await loadApprovalTokenFile();
  const t = file.tokens.find((x) => x.id === id);
  if (!t) return null;
  if (t.action !== "review") {
    t.usedAt = new Date().toISOString();
    t.status = "used";
  }
  await repo.save(file);
  return { ...t, status: resolveTokenStatus(t) };
}

export function approvalTokenUrl(baseUrl: string, tokenId: string): string {
  return `${baseUrl.replace(/\/$/, "")}/campaign-events/approval/${tokenId}`;
}

export async function listTokensForRecord(recordId: string): Promise<ApprovalPackageToken[]> {
  const file = await loadApprovalTokenFile();
  return file.tokens
    .filter((t) => t.recordId === recordId)
    .map((t) => ({ ...t, status: resolveTokenStatus(t) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
