import {
  MOCK_SPEAKING_OPPORTUNITIES,
  SPEAKING_OPPORTUNITY_TRACKING_HINTS,
  SPEAKING_VENUE_LABELS,
} from "@/lib/dashboard/speaking-opportunities-workspace";

export function SpeakingOpportunitiesWorkspace() {
  return (
    <div className="space-y-6" id="speaking-opportunities">
      <section className="rounded-2xl border border-kelly-blue/30 bg-kelly-blue/[0.06] p-6 md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy/65">Mature lane · Events</p>
        <h3 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Find local speaking opportunities for Kelly</h3>
        <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">
          Downstream work once your pipeline is moving: civic clubs, chambers, party bodies, campuses, faith and business tables,
          issue forums, town halls — anywhere Kelly can listen and speak with voters respectfully.
        </p>
        <p className="mt-3 font-body text-xs font-bold uppercase text-kelly-text/50">Where to look</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
          {SPEAKING_OPPORTUNITY_TRACKING_HINTS.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 md:p-8">
        <h4 className="font-heading text-base font-bold text-kelly-navy">Speaking tracker</h4>
        <p className="mt-2 font-body text-xs text-kelly-text/70">
          Fields: group name, contact, meeting date, audience size, format, Kelly requested, scheduled, follow-up.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-kelly-text/10 bg-kelly-page/50">
          <table className="min-w-[900px] w-full border-collapse font-body text-left text-xs">
            <thead>
              <tr className="border-b border-kelly-text/15 bg-kelly-fog/60">
                <th className="px-3 py-2 font-bold text-kelly-deep">Group</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Type</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Contact</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Meeting / cadence</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Audience</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Format</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Kelly requested</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Scheduled</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SPEAKING_OPPORTUNITIES.map((row) => (
                <tr key={row.id} className="border-b border-kelly-text/10">
                  <td className="px-3 py-2 font-semibold text-kelly-deep">{row.groupName}</td>
                  <td className="px-3 py-2">{SPEAKING_VENUE_LABELS[row.venueKind]}</td>
                  <td className="px-3 py-2 font-mono text-[11px]">{row.contact ?? "—"}</td>
                  <td className="px-3 py-2">{row.meetingDate ?? "—"}</td>
                  <td className="px-3 py-2">{row.audienceSize ?? "—"}</td>
                  <td className="px-3 py-2">{row.speakingFormat ?? "—"}</td>
                  <td className="px-3 py-2">{row.kellyRequested ? "Yes" : "—"}</td>
                  <td className="px-3 py-2">{row.scheduled ? "Yes" : "—"}</td>
                  <td className="px-3 py-2">{row.followUpNeeded ? "Yes" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
