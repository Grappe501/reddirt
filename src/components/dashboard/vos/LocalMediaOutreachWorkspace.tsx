import {
  LOCAL_MEDIA_LIST_CHECKLIST,
  LOCAL_MEDIA_OUTLET_TYPE_LABELS,
  MOCK_LOCAL_MEDIA_OUTLETS,
  MOCK_LOCAL_MEDIA_VISITS,
} from "@/lib/dashboard/local-media-workspace";

export function LocalMediaOutreachWorkspace() {
  return (
    <div className="space-y-8" id="local-media-list">
      <section className="rounded-2xl border border-kelly-gold/40 bg-gradient-to-br from-kelly-gold/[0.08] via-white to-kelly-page p-6 shadow-[var(--shadow-soft)] md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-deep/80">Mature lane · Social / Media</p>
        <h3 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Build your local media list</h3>
        <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">
          City teams should identify every local media and advertising outlet where the campaign could appear, advertise, interview,
          or build relationships — before you chase national press. This is <span className="font-semibold text-kelly-deep">downstream work</span>
          : tackle it after your daily rhythm and core weekly social tasks feel solid (typically maturity Level 3+).
        </p>
        <p className="mt-3 rounded-lg border border-kelly-success/30 bg-white/90 px-3 py-2 font-body text-xs text-kelly-deep">
          Steve can visit local media outlets on weekdays when appropriate; coordinate visit windows with upstream so Kelly / staff
          time is protected.
        </p>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 md:p-8">
        <h4 className="font-heading text-base font-bold text-kelly-navy">Outlet categories to inventory</h4>
        <ul className="mt-4 list-disc space-y-1.5 pl-5 font-body text-sm text-kelly-text/85">
          {LOCAL_MEDIA_LIST_CHECKLIST.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 md:p-8">
        <h4 className="font-heading text-base font-bold text-kelly-navy">Local media outlets (working list)</h4>
        <p className="mt-2 font-body text-xs text-kelly-text/70">
          Sample rows show the columns you will fill for your market — outlet, contact, type, interview, advertising, and notes.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-kelly-text/10 bg-white">
          <table className="min-w-[720px] w-full border-collapse font-body text-left text-xs">
            <thead>
              <tr className="border-b border-kelly-text/15 bg-kelly-fog/60">
                <th className="px-3 py-2 font-bold text-kelly-deep">Outlet</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Contact</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Phone / email</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Type</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Interview</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Advertising</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Notes</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LOCAL_MEDIA_OUTLETS.map((row) => (
                <tr key={row.id} className="border-b border-kelly-text/10">
                  <td className="px-3 py-2 font-semibold text-kelly-deep">{row.outletName}</td>
                  <td className="px-3 py-2 text-kelly-text/80">{row.contactPerson ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-kelly-text/70">{row.phoneOrEmail ?? "—"}</td>
                  <td className="px-3 py-2 text-kelly-text/80">{LOCAL_MEDIA_OUTLET_TYPE_LABELS[row.outletType]}</td>
                  <td className="px-3 py-2">{row.interviewOpportunity ?? "—"}</td>
                  <td className="px-3 py-2">{row.advertisingOpportunity ?? "—"}</td>
                  <td className="px-3 py-2 text-kelly-text/75">{row.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-6 md:p-8">
        <h4 className="font-heading text-base font-bold text-kelly-navy">Kelly visit · local media workflow</h4>
        <p className="mt-2 font-body text-sm text-kelly-text/85">
          When Kelly visits a city, the local team helps tee up: newspaper visit, radio interview, TV where available, podcast,
          publication ad conversations, student media, and community newsletter placement.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-kelly-text/10 bg-white">
          <table className="min-w-[880px] w-full border-collapse font-body text-left text-xs">
            <thead>
              <tr className="border-b border-kelly-text/15 bg-kelly-fog/60">
                <th className="px-3 py-2 font-bold text-kelly-deep">Outlet</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Contact</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Phone / email</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Type</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Interview</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Advertising</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Visit requested</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Visit scheduled</th>
                <th className="px-3 py-2 font-bold text-kelly-deep">Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LOCAL_MEDIA_VISITS.map((row) => (
                <tr key={row.id} className="border-b border-kelly-text/10">
                  <td className="px-3 py-2 font-semibold text-kelly-deep">{row.outletName}</td>
                  <td className="px-3 py-2">{row.contactPerson ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-[11px]">{row.phoneOrEmail ?? "—"}</td>
                  <td className="px-3 py-2">{LOCAL_MEDIA_OUTLET_TYPE_LABELS[row.outletType]}</td>
                  <td className="px-3 py-2">{row.interviewOpportunity ?? "—"}</td>
                  <td className="px-3 py-2">{row.advertisingOpportunity ?? "—"}</td>
                  <td className="px-3 py-2">{row.visitRequested ? "Yes" : "—"}</td>
                  <td className="px-3 py-2">{row.visitScheduled ?? "—"}</td>
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
