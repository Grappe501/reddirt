/**
 * Incremental pull for Kelly Tentative + Confirmed Google calendars into CampaignOS.
 *
 *   npm run calendar:google:sync-kelly
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "../../src/lib/db";
import { runIncrementalIngestForSource } from "../../src/lib/calendar/google-sync-engine";
import {
  findKellyConfirmedCalendarSource,
  findKellyTentativeCalendarSource,
} from "../../src/lib/calendar/kelly-google-calendar-policy";
import { loadRedDirtEnv } from "../load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..", "..");
loadRedDirtEnv(REPO);

async function main() {
  const t = await findKellyTentativeCalendarSource();
  const c = await findKellyConfirmedCalendarSource();
  if (!t || !c) {
    console.error("Kelly calendar sources missing. Run: npm run calendar:google:ensure");
    process.exit(1);
  }
  const rt = await runIncrementalIngestForSource(t.id);
  const rc = await runIncrementalIngestForSource(c.id);
  console.log(JSON.stringify({ ok: true, tentativeSourceId: t.id, confirmedSourceId: c.id, tentative: rt, confirmed: rc }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
