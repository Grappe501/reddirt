import Link from "next/link";
import { createSignupDocumentFromOwnedMediaAction } from "@/app/admin/volunteer-intake-actions";
import { prisma } from "@/lib/db";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function VolunteerIntakeListPage({ searchParams }: Props) {
  const sp = await searchParams;
  const docs = await prisma.signupSheetDocument.findMany({
    orderBy: { updatedAt: "desc" },
    take: 80,
    include: {
      ownedMedia: { select: { id: true, title: true, fileName: true, mimeType: true } },
      _count: { select: { entries: true } },
    },
  });
  const pendingRows = await prisma.signupSheetEntry.count({ where: { approvalStatus: "PENDING_REVIEW" } });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link href="/admin/workbench" className="text-sm text-washed-denim hover:underline">
          ← Workbench
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-bold text-deep-soil">Volunteer signup sheet intake</h1>
        <p className="mt-2 max-w-2xl text-sm text-deep-soil/75">
          Link a campaign-owned image or PDF, run AI extraction (review every row), match to the voter file when name/phone
          columns exist in imports, then approve into users and volunteer profiles.
        </p>
        <p className="mt-2 text-sm text-deep-soil/60">
          Pending review rows (all documents): <strong>{pendingRows}</strong>
        </p>
        {sp.error ? (
          <p className="mt-2 rounded-md border border-red-600/20 bg-red-50 px-3 py-2 text-sm text-red-800">
            Something was missing or invalid. Check the owned media id.
          </p>
        ) : null}
      </div>

      <section className="rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Start from owned media</h2>
        <p className="mt-1 text-xs text-deep-soil/60">
          Upload the sheet in <Link href="/admin/owned-media" className="text-washed-denim underline">Owned media</Link>{" "}
          first, then paste the asset id here.
        </p>
        <form action={createSignupDocumentFromOwnedMediaAction} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="block flex-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Owned media id</span>
            <input
              name="ownedMediaId"
              required
              placeholder="cuid from owned media detail URL"
              className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-mono text-sm"
            />
          </label>
          <button type="submit" className="rounded-btn bg-red-dirt px-5 py-2.5 text-sm font-bold text-cream-canvas">
            Create intake
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-heading text-lg font-bold text-deep-soil">Documents</h2>
        <ul className="mt-3 space-y-2">
          {docs.map((d) => (
            <li key={d.id}>
              <Link
                href={`/admin/volunteers/intake/${d.id}`}
                className="flex flex-col rounded-lg border border-deep-soil/10 bg-white/80 px-4 py-3 shadow-sm transition hover:border-deep-soil/25 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-deep-soil">{d.ownedMedia.title}</p>
                  <p className="text-xs text-deep-soil/55">
                    {d.status} · {d._count.entries} rows · {d.ownedMedia.mimeType}
                  </p>
                  <p className="font-mono text-[10px] text-deep-soil/45">{d.id}</p>
                </div>
                <span className="mt-2 text-xs font-semibold text-washed-denim sm:mt-0">Open →</span>
              </Link>
            </li>
          ))}
        </ul>
        {docs.length === 0 ? (
          <p className="rounded-md border border-deep-soil/10 bg-white/60 px-4 py-6 text-sm text-deep-soil/70">No intake documents yet.</p>
        ) : null}
      </section>
    </div>
  );
}
