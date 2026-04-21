import Link from "next/link";

const rows: { env: string; platforms: string; note: string }[] = [
  {
    env: "SUBSTACK_FEED_URL or admin Site settings → Substack feed",
    platforms: "Substack",
    note: "RSS ingestion; mirrored to SyncedPost and InboundContentItem.",
  },
  {
    env: "FACEBOOK_PAGE_ID, FACEBOOK_PAGE_ACCESS_TOKEN",
    platforms: "Facebook",
    note: "Graph API read of Page feed (ingestion-only).",
  },
  {
    env: "INSTAGRAM_USER_ID, INSTAGRAM_ACCESS_TOKEN",
    platforms: "Instagram",
    note: "Instagram Business/Creator media via Graph.",
  },
  {
    env: "YOUTUBE_CHANNEL_ID, YOUTUBE_API_KEY",
    platforms: "YouTube",
    note: "Data API v3 search by channel (public videos).",
  },
];

export default function AdminPlatformSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-deep-soil">Platform settings</h1>
      <p className="mt-3 font-body text-sm text-deep-soil/75">
        Non-secret configuration lives in the database (`PlatformConnection` metadata) when needed. Access tokens and API
        keys must stay in deployment environment variables — never in the admin UI.
      </p>
      <p className="mt-4 font-body text-sm text-deep-soil/75">
        Copy variable names from <code className="rounded bg-deep-soil/10 px-1.5 text-xs">.env.example</code>. Outbound
        posting is intentionally not implemented in this script.
      </p>

      <div className="mt-10 overflow-x-auto rounded-card border border-deep-soil/10 bg-white shadow-[var(--shadow-soft)]">
        <table className="min-w-full divide-y divide-deep-soil/10 font-body text-sm">
          <thead className="bg-deep-soil/[0.04] text-left text-xs font-bold uppercase tracking-wider text-deep-soil/55">
            <tr>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Environment</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-deep-soil/10 text-deep-soil/85">
            {rows.map((r) => (
              <tr key={r.env}>
                <td className="px-4 py-3 font-semibold">{r.platforms}</td>
                <td className="px-4 py-3 font-mono text-xs text-deep-soil/75">{r.env}</td>
                <td className="px-4 py-3 text-xs text-deep-soil/70">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/platforms" className="rounded-btn bg-red-dirt px-4 py-2 text-sm font-bold text-cream-canvas">
          Back to platforms
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-btn border border-deep-soil/20 px-4 py-2 text-sm font-semibold text-deep-soil"
        >
          Site settings
        </Link>
      </div>
    </div>
  );
}
