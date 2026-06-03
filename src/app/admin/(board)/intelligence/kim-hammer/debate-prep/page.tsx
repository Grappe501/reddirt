export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

/** v3 debate prep — JSON + markdown research packet (dynamic import keeps cold path small). */
export default async function KimHammerDebatePrepPage() {
  const { default: DebatePrepV3Page } = await import("./DebatePrepV3Page");
  return <DebatePrepV3Page />;
}
