import Link from "next/link";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminCountiesPage() {
  await requireAdminAction();
  const rows = await prisma.county.findMany({
    orderBy: { sortOrder: "asc" },
    include: { campaignStats: true, demographics: true },
  });
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-deep-soil">County command pages</h1>
      <p className="mt-2 max-w-2xl text-sm text-deep-soil/70">
        Public county intelligence at <code className="rounded bg-deep-soil/5 px-1">/counties/[slug]</code>. Edit copy,
        campaign metrics, and demographics here; elected rosters are database-backed and should be filled via an import
        pipeline or direct DB until the elected editor ships.
      </p>
      <ul className="mt-8 divide-y divide-deep-soil/10 border-y border-deep-soil/10" role="list">
        {rows.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-bold text-deep-soil">{c.displayName}</p>
              <p className="text-xs text-deep-soil/55">
                {c.slug} · FIPS {c.fips} · {c.published ? "Published" : "Draft"}
              </p>
            </div>
            <div className="flex gap-3">
              <Link className="text-sm font-semibold text-red-dirt" href={`/counties/${c.slug}`} target="_blank" rel="noreferrer">
                View public
              </Link>
              <Link className="text-sm font-semibold text-deep-soil" href={`/admin/counties/${c.slug}`}>
                Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
