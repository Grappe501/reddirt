import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/require-admin";
import { getYouTubeOAuthConfigStatus } from "@/lib/media/youtube-transcripts/oauth-config";
import { getYouTubeConnectionPublicStatus } from "@/lib/media/youtube-transcripts/oauth-store";
import { loadDiscoveredVideos, listWorkspaceRecords } from "@/lib/media/youtube-transcripts/workspace-store";
import { loadNotifications } from "@/lib/media/youtube-transcripts/notifications";
import { YouTubeSyncButton } from "@/components/admin/media/YouTubeSyncButton";
import { YouTubeDisconnectButton } from "@/components/admin/media/YouTubeDisconnectButton";
import { CampaignMediaImportLookup } from "@/components/admin/media/CampaignMediaImportLookup";
import { getCampaignMediaByYoutubeId } from "@/content/media/campaign-media-registry";

type Props = { searchParams: Promise<{ yt?: string; yt_error?: string; missing?: string }> };

export default async function AdminYouTubeMediaPage({ searchParams }: Props) {
  await requireAdminPage();
  const sp = await searchParams;
  const cfg = getYouTubeOAuthConfigStatus();
  const connection = getYouTubeConnectionPublicStatus();
  const discovered = loadDiscoveredVideos();
  const workspace = listWorkspaceRecords();
  const notifications = loadNotifications().slice(0, 8);

  const missingTranscripts = discovered.videos.filter(
    (v) => v.captionStatus === "NONE" || v.transcriptState === "UNAVAILABLE" || v.transcriptState === "NOT_REQUESTED",
  );
  const needingReview = workspace.filter((w) => w.status === "REVIEW_REQUIRED" || w.status === "DRAFT");

  return (
    <div className="mx-auto max-w-5xl">
      <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-kelly-muted">
        Admin · Media · YouTube
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-text">YouTube transcript pipeline</h1>
      <p className="mt-3 max-w-2xl font-body text-sm text-kelly-text/75">
        Connect the campaign YouTube channel, sync captions into draft transcripts, and review before any public publish.
        Nothing is published automatically.
      </p>

      <div className="mt-4 flex flex-wrap gap-3 font-body text-sm">
        <Link href="/admin/media" className="underline">
          ← Media library
        </Link>
        <Link href="/kelly-speaks" className="underline">
          Public Kelly Speaks
        </Link>
      </div>

      {sp.yt === "1" ? (
        <p className="mt-4 rounded-md border border-emerald-700/30 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          YouTube channel connected.
        </p>
      ) : null}
      {sp.yt_error ? (
        <p className="mt-4 rounded-md border border-red-700/30 bg-red-50 px-3 py-2 text-sm text-red-900">
          OAuth error: {sp.yt_error}
          {sp.missing ? ` (missing: ${sp.missing})` : ""}
        </p>
      ) : null}

      <section className="mt-8 rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-xl font-bold text-kelly-text">Connected account</h2>
        {!cfg.isConfigured ? (
          <p className="mt-2 font-body text-sm text-kelly-text/80">
            Configure <code className="font-mono text-xs">YOUTUBE_OAUTH_*</code> redirect URI, client credentials, and{" "}
            <code className="font-mono text-xs">YOUTUBE_TOKEN_ENCRYPTION_KEY</code> (see docs).
          </p>
        ) : null}
        {connection.connected ? (
          <dl className="mt-4 grid gap-2 font-body text-sm text-kelly-text/85 md:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-kelly-muted">Channel</dt>
              <dd>{connection.channelTitle ?? "Connected"} ({connection.channelId ?? "—"})</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-kelly-muted">Last updated</dt>
              <dd>{connection.updatedAtIso ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-kelly-muted">Refresh token</dt>
              <dd>{connection.hasRefreshToken ? "Present (encrypted at rest)" : "Missing — reconnect"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-kelly-muted">Last sync</dt>
              <dd>{discovered.lastSyncAt ?? "Never"}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 font-body text-sm text-kelly-text/80">No YouTube channel connected.</p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="/api/admin/youtube/oauth/start?return=/admin/media/youtube"
            className="rounded-md bg-kelly-text px-4 py-2 font-body text-sm font-semibold text-kelly-page"
          >
            {connection.connected ? "Reconnect YouTube channel" : "Connect YouTube channel"}
          </a>
          {connection.connected ? <YouTubeDisconnectButton /> : null}
          {connection.connected ? <YouTubeSyncButton /> : null}
        </div>
      </section>

      <CampaignMediaImportLookup />

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Videos discovered" value={String(discovered.videos.length)} />
        <StatCard label="Missing transcripts / captions" value={String(missingTranscripts.length)} />
        <StatCard label="Needing review" value={String(needingReview.length)} />
      </section>

      <section className="mt-4 rounded-card border border-kelly-text/10 bg-white px-4 py-3 font-body text-sm text-kelly-text/80">
        <strong>Registry uniqueness:</strong>{" "}
        {getCampaignMediaByYoutubeId("72oKVAwfzZw")
          ? "Canonical example 72oKVAwfzZw is registered once (CampaignVideoCard · DRAFT). Duplicate URL pastes open that record."
          : "Typed campaign media registry loaded."}{" "}
        Unique registered assets remain authoritative — do not create a second row for the same YouTube id.
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-xl font-bold text-kelly-text">Videos</h2>
        <div className="mt-4 overflow-x-auto rounded-card border border-kelly-text/10">
          <table className="min-w-full font-body text-sm">
            <thead className="bg-kelly-text/5 text-left text-xs uppercase tracking-wider text-kelly-muted">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Caption</th>
                <th className="px-3 py-2">Transcript</th>
                <th className="px-3 py-2">Format</th>
              </tr>
            </thead>
            <tbody>
              {(discovered.videos.length ? discovered.videos : workspace.map((w) => ({
                videoId: w.youtubeVideoId,
                title: w.title ?? w.youtubeVideoId,
                captionStatus: w.caption.downloadStatus,
                transcriptState: w.status,
                isShort: false,
              }))).map((v) => (
                <tr key={v.videoId} className="border-t border-kelly-text/10">
                  <td className="px-3 py-2">
                    <Link className="font-semibold text-kelly-blue underline" href={`/admin/media/youtube/${v.videoId}`}>
                      {v.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{v.videoId}</td>
                  <td className="px-3 py-2">{v.captionStatus ?? "—"}</td>
                  <td className="px-3 py-2">{v.transcriptState}</td>
                  <td className="px-3 py-2">{"isShort" in v && v.isShort ? "SHORT" : "VIDEO"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!discovered.videos.length && !workspace.length ? (
            <p className="px-3 py-6 text-kelly-muted">Run a sync after connecting YouTube to discover videos.</p>
          ) : null}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-xl font-bold text-kelly-text">Notifications</h2>
        <ul className="mt-3 space-y-2 font-body text-sm">
          {notifications.map((n) => (
            <li key={n.id} className="rounded-md border border-kelly-text/10 px-3 py-2">
              <span className="font-semibold">{n.type}</span>
              <span className="ml-2 text-kelly-text/75">{n.message}</span>
            </li>
          ))}
          {!notifications.length ? <li className="text-kelly-muted">No notifications yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-kelly-text/10 bg-kelly-page p-4 shadow-[var(--shadow-soft)]">
      <p className="font-body text-xs uppercase tracking-wider text-kelly-muted">{label}</p>
      <p className="mt-2 font-heading text-3xl font-bold text-kelly-text">{value}</p>
    </div>
  );
}
