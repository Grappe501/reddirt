export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function MichaelPackoCommandCenterPage() {
  const { default: MichaelPackoCommandCenter } = await import("./MichaelPackoCommandCenter");
  return <MichaelPackoCommandCenter />;
}
