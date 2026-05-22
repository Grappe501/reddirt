import path from "node:path";
import { fileURLToPath } from "node:url";

import { prisma } from "../../src/lib/db";
import { loadRedDirtEnv } from "../load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..", "..");
loadRedDirtEnv(REPO);

function hasRefreshToken(oauthJson: unknown): boolean {
  const oauth = (oauthJson ?? {}) as { refresh_token?: unknown };
  return typeof oauth.refresh_token === "string" && oauth.refresh_token.trim().length > 0;
}

async function main() {
  const sources = await prisma.calendarSource.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      label: true,
      displayName: true,
      sourceType: true,
      externalCalendarId: true,
      syncEnabled: true,
      oauthJson: true,
    },
  });

  console.log(JSON.stringify({
    ok: true,
    sources: sources.map((source) => ({
      id: source.id,
      name: source.displayName ?? source.label,
      sourceType: source.sourceType,
      externalCalendarId: source.externalCalendarId,
      syncEnabled: source.syncEnabled,
      hasOauthJson: Boolean(source.oauthJson && Object.keys(source.oauthJson as Record<string, unknown>).length > 0),
      hasRefreshToken: hasRefreshToken(source.oauthJson),
    })),
  }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
