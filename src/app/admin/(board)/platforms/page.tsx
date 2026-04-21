import Link from "next/link";
import { ContentPlatform } from "@prisma/client";
import { runPlatformSyncAction } from "@/app/admin/orchestrator-actions";
import { prisma } from "@/lib/db";
import { ensurePlatformConnections } from "@/lib/orchestrator/ensure-platforms";

type Props = { searchParams: Promise<{ sync?: string }> };

function envConfigured(platform: ContentPlatform, settings: { substackFeedUrl: string | null } | null): boolean {
  switch (platform) {
    case ContentPlatform.SUBSTACK:
      return Boolean(
        settings?.substackFeedUrl?.trim() || process.env.SUBSTACK_FEED_URL?.trim(),
      );
    case ContentPlatform.FACEBOOK:
      return Boolean(process.env.FACEBOOK_PAGE_ID?.trim() && process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim());
    case ContentPlatform.INSTAGRAM:
      return Boolean(process.env.INSTAGRAM_USER_ID?.trim() && process.env.INSTAGRAM_ACCESS_TOKEN?.trim());
    case ContentPlatform.YOUTUBE:
      return Boolean(process.env.YOUTUBE_CHANNEL_ID?.trim() && process.env.YOUTUBE_API_KEY?.trim());
    default:
      return false;
  }
}

function modeLabel(connectionConfigured: boolean, status: string): string {
  if (!connectionConfigured) return "inactive";
  if (status === "OK") return "syncing / ok";
  if (status === "ERROR") return "error";
  if (status === "SYNCING") return "syncing";
  if (status === "CONFIGURED") return "configured";
  return "inactive";
}

export default async function AdminPlatformsPage({ searchParams }: Props) {
  await ensurePlatformConnections();
  const sp = await searchParams;
  const [connections, counts, settings] = await Promise.all([
    prisma.platformConnection.findMany({ orderBy: { platform: "asc" } }),
    prisma.inboundContentItem.groupBy({ by: ["sourcePlatform"], _count: { _all: true } }),
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
  ]);

  const countBy = new Map(counts.map((c) => [c.sourcePlatform, c._count._all] as const));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-deep-soil">Platforms</h1>
      <p className="mt-3 font-body text-sm text-deep-soil/75">
        Connection status, inbound volume, and manual sync. Secrets stay in environment variables — see{" "}
        <Link href="/admin/settings/platforms" className="font-semibold text-red-dirt hover:underline">
          platform settings
        </Link>
        .
      </p>

      {sp.sync ? (
        <p className="mt-4 rounded-lg border border-field-green/35 bg-field-green/10 px-3 py-2 font-body text-sm text-deep-soil">
          Sync requested for <strong>{sp.sync}</strong>. Check connection status and inbox.
        </p>
      ) : null}

      <ul className="mt-10 space-y-6">
        {connections.map((c) => {
          const configured = envConfigured(c.platform, settings);
          const count = countBy.get(c.platform) ?? 0;
          return (
            <li
              key={c.id}
              className="rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl font-bold text-deep-soil">{c.accountName ?? c.platform}</h2>
                  <p className="mt-1 font-body text-xs text-deep-soil/60">
                    Status: <strong>{c.status}</strong> · Mode: {modeLabel(configured, c.status)} · Inbound items:{" "}
                    <strong>{count}</strong>
                  </p>
                  {c.lastSyncedAt ? (
                    <p className="mt-1 font-body text-xs text-deep-soil/55">
                      Last sync: {c.lastSyncedAt.toLocaleString()}
                    </p>
                  ) : null}
                  {c.lastSyncError ? (
                    <p className="mt-2 rounded-md border border-red-dirt/25 bg-red-dirt/5 px-3 py-2 font-body text-xs text-red-dirt">
                      {c.lastSyncError}
                    </p>
                  ) : null}
                </div>
                <form action={runPlatformSyncAction} className="flex flex-col gap-2">
                  <input type="hidden" name="platform" value={c.platform} />
                  <button
                    type="submit"
                    className="rounded-btn bg-red-dirt px-4 py-2 text-xs font-bold text-cream-canvas disabled:opacity-50"
                    disabled={c.platform !== ContentPlatform.SUBSTACK && !configured}
                  >
                    Run sync
                  </button>
                  {c.platform !== ContentPlatform.SUBSTACK && !configured ? (
                    <span className="max-w-[12rem] text-[10px] text-deep-soil/50">
                      Configure env vars before syncing.
                    </span>
                  ) : null}
                </form>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-10 font-body text-xs text-deep-soil/55">
        Substack sync also remains available from{" "}
        <Link href="/admin/blog" className="text-red-dirt hover:underline">
          Blog sync
        </Link>
        .
      </p>
    </div>
  );
}
