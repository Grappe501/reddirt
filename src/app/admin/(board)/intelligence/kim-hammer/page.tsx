export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

export default async function KimHammerCommandCenterPage() {
  const { default: KimHammerCommandCenterV3 } = await import("./KimHammerCommandCenterV3");
  return <KimHammerCommandCenterV3 />;
}
