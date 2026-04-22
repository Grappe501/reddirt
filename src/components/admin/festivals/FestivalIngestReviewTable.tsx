import { FESTIVAL_REVIEW_FORM_REDIRECT_BASES } from "@/app/admin/workbench-festival-constants";
import {
  approveArkansasFestivalIngestAction,
  hideArkansasFestivalFromPublicFeedAction,
  rejectArkansasFestivalIngestAction,
  resetArkansasFestivalReviewAction,
  showArkansasFestivalOnPublicFeedAction,
} from "@/app/admin/workbench-festival-actions";
import type { FestivalIngestAdminRow } from "@/lib/festivals/admin-queries";

function fmt(d: Date) {
  return d.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SourceCell({ r }: { r: FestivalIngestAdminRow }) {
  if (r.sourceUrl.startsWith("sos:")) {
    return (
      <div className="text-deep-soil/85">
        <span className="font-semibold text-deep-soil">{r.sourceChannel}</span>
        {r.submitterInfoUrl ? (
          <a
            href={r.submitterInfoUrl}
            className="mt-0.5 block break-all text-red-dirt underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Submitter link
          </a>
        ) : (
          <span className="mt-0.5 block text-deep-soil/55">(no public URL)</span>
        )}
      </div>
    );
  }
  return (
    <a href={r.sourceUrl} className="break-all text-red-dirt underline" target="_blank" rel="noopener noreferrer">
      {r.sourceChannel}
    </a>
  );
}

type Props = {
  rows: FestivalIngestAdminRow[];
  formRedirectBase: (typeof FESTIVAL_REVIEW_FORM_REDIRECT_BASES)[number];
};

export function FestivalIngestReviewTable({ rows, formRedirectBase }: Props) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[800px] border-collapse text-left text-[11px]">
        <thead>
          <tr className="border-b border-deep-soil/15 bg-cream-canvas/80">
            <th className="p-1.5 font-semibold">When (Central)</th>
            <th className="p-1.5 font-semibold">Event</th>
            <th className="p-1.5 font-semibold">Place</th>
            <th className="p-1.5 font-semibold">Submitter</th>
            <th className="p-1.5 font-semibold">Status</th>
            <th className="p-1.5 font-semibold">On site</th>
            <th className="p-1.5 font-semibold">Source</th>
            <th className="p-1.5 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-4 text-center text-deep-soil/55">
                No rows for this filter.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-b border-deep-soil/10 align-top">
                <td className="p-1.5 font-mono text-[10px] text-deep-soil/85">
                  {fmt(r.startAt)}
                  <br />
                  <span className="text-deep-soil/50">→ {fmt(r.endAt)}</span>
                </td>
                <td className="p-1.5 font-medium text-deep-soil">{r.name}</td>
                <td className="p-1.5 text-deep-soil/80">
                  {r.city ? `${r.city}` : "—"}
                  {r.county ? (
                    <span className="text-deep-soil/55">
                      <br />({r.county.displayName})
                    </span>
                  ) : null}
                </td>
                <td className="p-1.5 text-[10px] text-deep-soil/80">
                  {r.submitterName || r.submitterEmail ? (
                    <>
                      {r.submitterName ? <span className="block font-medium text-deep-soil">{r.submitterName}</span> : null}
                      {r.submitterEmail ? <span className="text-deep-soil/65">{r.submitterEmail}</span> : null}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-1.5 text-[10px] uppercase tracking-wide text-deep-soil/75">{r.reviewStatus}</td>
                <td className="p-1.5">{r.isVisibleOnSite ? "Yes" : "No"}</td>
                <td className="p-1.5 max-w-[160px]">
                  <SourceCell r={r} />
                </td>
                <td className="p-1.5">
                  <div className="flex flex-col gap-0.5">
                    {r.reviewStatus === "PENDING_REVIEW" ? (
                      <>
                        <form action={approveArkansasFestivalIngestAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="next" value={formRedirectBase} />
                          <button
                            type="submit"
                            className="w-full rounded border border-emerald-700/40 bg-emerald-50 px-1.5 py-0.5 text-left text-[10px] font-bold text-emerald-950 hover:bg-emerald-100"
                          >
                            Approve + show
                          </button>
                        </form>
                        <form action={rejectArkansasFestivalIngestAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="next" value={formRedirectBase} />
                          <button
                            type="submit"
                            className="w-full rounded border border-deep-soil/20 px-1.5 py-0.5 text-left text-[10px] text-deep-soil/80 hover:bg-deep-soil/5"
                          >
                            Reject
                          </button>
                        </form>
                      </>
                    ) : null}
                    {r.reviewStatus === "APPROVED" ? (
                      <>
                        {r.isVisibleOnSite ? (
                          <form action={hideArkansasFestivalFromPublicFeedAction}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="next" value={formRedirectBase} />
                            <button
                              type="submit"
                              className="w-full rounded border border-amber-800/30 bg-amber-50/80 px-1.5 py-0.5 text-left text-[10px] font-semibold text-amber-950"
                            >
                              Hide from site
                            </button>
                          </form>
                        ) : (
                          <form action={showArkansasFestivalOnPublicFeedAction}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="next" value={formRedirectBase} />
                            <button
                              type="submit"
                              className="w-full rounded border border-emerald-700/40 bg-emerald-50 px-1.5 py-0.5 text-left text-[10px] font-bold text-emerald-950"
                            >
                              Show on site
                            </button>
                          </form>
                        )}
                      </>
                    ) : null}
                    {r.reviewStatus !== "PENDING_REVIEW" ? (
                      <form action={resetArkansasFestivalReviewAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="next" value={formRedirectBase} />
                        <button
                          type="submit"
                          className="w-full text-left text-[9px] text-civic-slate underline"
                        >
                          Reset to pending
                        </button>
                      </form>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
