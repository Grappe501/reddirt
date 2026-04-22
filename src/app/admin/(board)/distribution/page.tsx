import Link from "next/link";
import { InboundReviewStatus } from "@prisma/client";
import { updateInboundDistributionAction } from "@/app/admin/orchestrator-actions";
import { prisma } from "@/lib/db";
import { ensurePlatformConnections } from "@/lib/orchestrator/ensure-platforms";
import { platformLabel, sourceTypeLabel } from "@/lib/orchestrator/public-feed";

type Props = { searchParams: Promise<{ saved?: string }> };

export default async function AdminDistributionPage({ searchParams }: Props) {
  await ensurePlatformConnections();
  const sp = await searchParams;
  const items = await prisma.inboundContentItem
    .findMany({
      where: {
        reviewStatus: { in: [InboundReviewStatus.REVIEWED, InboundReviewStatus.FEATURED] },
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 60,
    })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-3xl font-bold text-deep-soil">Distribution</h1>
      <p className="mt-3 font-body text-sm text-deep-soil/75">
        Human-controlled routing to the public site. Only items marked reviewed or featured appear here. Substack blog
        landing can still follow <code className="text-xs">SyncedPost</code>; toggling “Blog” updates the linked post
        when present.
      </p>

      {sp.saved ? (
        <p className="mt-4 rounded-lg border border-field-green/35 bg-field-green/10 px-3 py-2 text-sm text-deep-soil">
          Saved routing for item <code className="text-xs">{sp.saved}</code>.
        </p>
      ) : null}

      <p className="mt-6 font-body text-sm">
        <Link href="/admin/inbox" className="font-semibold text-red-dirt hover:underline">
          Inbox
        </Link>{" "}
        ·{" "}
        <Link href="/admin/review-queue" className="font-semibold text-red-dirt hover:underline">
          Review queue
        </Link>
      </p>

      <div className="mt-10 space-y-8">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-deep-soil/10 pb-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-deep-soil">
                  <Link href={`/admin/inbox/${item.id}`} className="text-red-dirt hover:underline">
                    {item.title ?? "(untitled)"}
                  </Link>
                </h2>
                <p className="mt-1 font-body text-xs text-deep-soil/55">
                  {platformLabel(item.sourcePlatform)} · {sourceTypeLabel(item.sourceType)} · {item.reviewStatus}
                </p>
              </div>
              {item.canonicalUrl ? (
                <a
                  href={item.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-civic-slate underline-offset-2 hover:underline"
                >
                  Open source ↗
                </a>
              ) : null}
            </div>
            <form action={updateInboundDistributionAction} className="mt-4 grid gap-4 md:grid-cols-2">
              <input type="hidden" name="id" value={item.id} />
              <label className="flex items-center gap-2 font-body text-sm">
                <input type="checkbox" name="visibleOnUpdatesPage" defaultChecked={item.visibleOnUpdatesPage} />
                Public <code className="text-xs">/from-the-road</code> feed
              </label>
              <label className="flex items-center gap-2 font-body text-sm">
                <input type="checkbox" name="visibleOnHomepageRail" defaultChecked={item.visibleOnHomepageRail} />
                Homepage “From the movement” rail
              </label>
              <label className="flex items-center gap-2 font-body text-sm">
                <input type="checkbox" name="routeToBlog" defaultChecked={item.routeToBlog} />
                Blog landing (linked Substack post)
              </label>
              <label className="flex items-center gap-2 font-body text-sm">
                <input type="checkbox" name="storySeed" defaultChecked={item.storySeed} />
                Story seed
              </label>
              <label className="flex items-center gap-2 font-body text-sm">
                <input type="checkbox" name="editorialSeed" defaultChecked={item.editorialSeed} />
                Editorial follow-up seed
              </label>
              <label className="flex items-center gap-2 font-body text-sm text-deep-soil/60">
                <input type="checkbox" name="publishCandidate" defaultChecked={item.publishCandidate} />
                Publish candidate (outbound — not enabled)
              </label>
              <label className="md:col-span-2 block text-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Notes</span>
                <textarea
                  name="notes"
                  rows={2}
                  className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-body text-sm"
                  placeholder="Optional routing note"
                />
              </label>
              <label className="md:col-span-2 block text-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Editor initials</span>
                <input
                  name="editor"
                  className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-body text-sm"
                  placeholder="Who approved this route"
                />
              </label>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-btn bg-deep-soil px-5 py-2.5 text-sm font-bold text-cream-canvas"
                >
                  Save routing
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-center text-sm text-deep-soil/55">
          No reviewed items yet. Clear the review queue first.
        </p>
      ) : null}
    </div>
  );
}

