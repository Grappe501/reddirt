import { updateVisitorIntakeAction } from "@/app/admin/site-analytics-intake-actions";

export function SiteAnalyticsIntakeActions({
  intakeId,
  notice,
}: {
  intakeId: string;
  notice?: string | null;
}) {
  return (
    <section className="rounded-card border border-kelly-navy/20 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-xl font-bold text-kelly-ink">Do the next step</h2>
      <p className="mt-2 font-body text-sm text-kelly-slate">
        In review, needs follow-up, or done. Add a note if you called or emailed them.
      </p>
      {notice === "saved" ? (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-body text-sm text-emerald-950">
          Status saved.
        </p>
      ) : null}
      {notice === "noted" ? (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-body text-sm text-emerald-950">
          Note saved.
        </p>
      ) : null}
      {notice === "empty" ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-body text-sm text-amber-950">
          Pick a status or write a note.
        </p>
      ) : null}
      <form action={updateVisitorIntakeAction} className="mt-4 space-y-3">
        <input type="hidden" name="intakeId" value={intakeId} />
        <label className="block font-body text-sm text-kelly-ink">
          Note
          <textarea
            name="note"
            rows={3}
            maxLength={500}
            className="mt-1 w-full rounded-lg border border-kelly-ink/15 px-3 py-2 font-body text-sm"
            placeholder="Called, left voicemail, assigned to county lead…"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            name="status"
            value="IN_REVIEW"
            className="rounded-btn bg-kelly-navy px-4 py-2 font-body text-sm font-semibold text-white"
          >
            In review
          </button>
          <button
            type="submit"
            name="status"
            value="AWAITING_INFO"
            className="rounded-btn border border-kelly-navy/20 px-4 py-2 font-body text-sm font-semibold text-kelly-navy"
          >
            Needs follow-up
          </button>
          <button
            type="submit"
            name="status"
            value="CONVERTED"
            className="rounded-btn bg-kelly-gold px-4 py-2 font-body text-sm font-semibold text-kelly-navy"
          >
            Done
          </button>
          <button
            type="submit"
            className="rounded-btn border border-kelly-ink/15 px-4 py-2 font-body text-sm font-semibold text-kelly-slate"
          >
            Save note only
          </button>
        </div>
      </form>
    </section>
  );
}
