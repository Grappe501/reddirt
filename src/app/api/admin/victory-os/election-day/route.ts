import { assertAdminApi } from "@/lib/admin/require-admin";
import { composeElectionDayViewModel } from "@/lib/victory-os/election-day/compose-election-day-view-model";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;
  const viewModel = composeElectionDayViewModel();
  return Response.json({ ok: true, viewModel });
}
