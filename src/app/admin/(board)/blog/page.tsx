import Link from "next/link";
import { BlogDisplayMode } from "@prisma/client";
import { prisma } from "@/lib/db";
import { triggerSubstackSyncAction } from "@/app/admin/actions";

type Props = { searchParams: Promise<{ sync?: string }> };

export default async function AdminBlogPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [posts, settings] = await Promise.all([
    prisma.syncedPost.findMany({ orderBy: { publishedAt: "desc" } }).catch(() => []),
    prisma.siteSettings.findUnique({ where: { id: "default" } }).catch(() => null),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-3xl font-bold text-deep-soil">Blog · Substack sync</h1>
      <p className="mt-3 font-body text-sm text-deep-soil/75">
        Posts ingest from RSS. Editorial controls (feature, hide, teasers, placement) never write back to Substack.
      </p>

      {sp.sync ? (
        <p className="mt-4 rounded-lg border border-field-green/35 bg-field-green/10 px-3 py-2 text-sm text-deep-soil">
          Sync finished. Review timestamps in settings for status.
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-4">
        <form action={triggerSubstackSyncAction}>
          <button type="submit" className="rounded-btn bg-red-dirt px-5 py-2.5 text-sm font-bold text-cream-canvas">
            Run Substack sync now
          </button>
        </form>
        <Link href="/blog" className="rounded-btn border border-deep-soil/20 px-5 py-2.5 text-sm font-semibold text-deep-soil">
          View public notebook →
        </Link>
      </div>

      <div className="mt-10 rounded-card border border-deep-soil/10 bg-cream-canvas p-5 text-sm text-deep-soil/75 shadow-[var(--shadow-soft)]">
        <p>
          <strong className="text-deep-soil">Feed URL:</strong>{" "}
          {settings?.substackFeedUrl?.trim() || process.env.SUBSTACK_FEED_URL?.trim() || "— not set —"}
        </p>
        <p className="mt-2">
          <strong className="text-deep-soil">Last sync:</strong>{" "}
          {settings?.lastSubstackSyncAt
            ? settings.lastSubstackSyncAt.toLocaleString("en-US")
            : "Never recorded"}
          {settings?.lastSubstackSyncOk === false && settings.lastSubstackSyncError ? (
            <span className="mt-2 block text-red-dirt">Error: {settings.lastSubstackSyncError}</span>
          ) : null}
        </p>
      </div>

      <h2 className="mt-12 font-heading text-xl font-bold text-deep-soil">Synced posts ({posts.length})</h2>
      <ul className="mt-4 divide-y divide-deep-soil/10 rounded-card border border-deep-soil/10 bg-cream-canvas shadow-[var(--shadow-soft)]">
        {posts.map((p) => (
          <li key={p.id} className="flex flex-col gap-2 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-heading text-base font-bold text-deep-soil">{p.title}</p>
              <p className="font-mono text-xs text-deep-soil/55">
                {p.slug} · {p.displayMode.replace(/_/g, " ").toLowerCase()}
              </p>
              <p className="mt-1 text-xs text-deep-soil/50">
                {p.hidden ? "Hidden" : "Visible"} · {p.featured ? "Featured" : "Standard"} ·{" "}
                {p.showOnHomepage ? "Homepage rail" : "Not on homepage"} ·{" "}
                {p.showOnBlogLanding ? "Blog index" : "Off blog index"}
              </p>
            </div>
            <Link href={`/admin/blog/${p.slug}`} className="text-sm font-semibold text-red-dirt">
              Edit →
            </Link>
          </li>
        ))}
      </ul>
      {posts.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-deep-soil/25 bg-white/60 p-6 text-center text-sm text-deep-soil/65">
          No posts yet. Configure a feed URL and run sync.
        </p>
      ) : null}

      <p className="mt-10 font-body text-xs text-deep-soil/50">
        Display modes:{" "}
        {Object.values(BlogDisplayMode)
          .map((m) => m.replace(/_/g, " "))
          .join(" · ")}
        . <strong>Internal mirror</strong> is a placeholder for a future full HTML mirror — always link to canonical
        Substack for now.
      </p>
    </div>
  );
}
