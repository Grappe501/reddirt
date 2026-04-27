import { AdminBoardShell } from "@/components/admin/AdminBoardShell";
import { NarrativeDistributionCommandCenter } from "@/components/narrative-distribution/admin";
import { requireAdminPage } from "@/lib/admin/require-admin";

export const dynamic = "force-dynamic";

/**
 * Narrative distribution admin prototype — demo data only.
 * Lives outside the `(board)` segment but reuses the same gate + shell as board routes.
 */
export default async function AdminNarrativeDistributionPage() {
  await requireAdminPage();

  return (
    <AdminBoardShell>
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-kelly-text">Narrative distribution — command center</h1>
        <p className="mt-3 max-w-3xl text-sm text-kelly-text/75">
          Orchestration prototype for stories, packets, and channel posture. Scoped to the typed narrative distribution module and static demo registry —
          not a publish surface.
        </p>
        <div className="mt-10">
          <NarrativeDistributionCommandCenter />
        </div>
      </div>
    </AdminBoardShell>
  );
}
