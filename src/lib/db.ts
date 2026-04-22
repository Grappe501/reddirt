import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * After `prisma generate` adds models, Next dev can keep a cached PrismaClient on `globalThis` that
 * predates the new schema — delegates like `externalMediaMention` are then missing and calls throw.
 */
function clientHasExternalMediaMonitor(client: PrismaClient): boolean {
  return (
    typeof (client as unknown as { externalMediaMention?: { findMany?: unknown } }).externalMediaMention?.findMany ===
    "function"
  );
}

function getOrCreatePrisma(): PrismaClient {
  const existing = globalForPrisma.prisma;
  if (existing && clientHasExternalMediaMonitor(existing)) return existing;
  if (existing) {
    void existing.$disconnect().catch(() => {});
    globalForPrisma.prisma = undefined;
  }
  const next = createPrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = next;
  return next;
}

export const prisma = getOrCreatePrisma();
