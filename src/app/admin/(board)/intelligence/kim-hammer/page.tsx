import Link from "next/link";
import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";

const card = "rounded-md border border-kelly-text/10 bg-kelly-page px-3 py-2 text-sm";

export default async function KimHammerCommandCenterPage() {
  const data = loadKimHammerWorkbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Kim Hammer Opposition Command Center</p>
        <h1 className="font-heading text-2xl font-bold">Opposition Research + Debate Prep</h1>
        <p className="mt-2 max-w-4xl font-body text-sm leading-relaxed text-kelly-muted">
          Source-backed command view for candidate prep: pattern, verified claims, risk controls, debate frames, and research gaps.
        </p>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Bills indexed</p>
          <p className="mt-1 font-heading text-2xl font-bold">{data.totalBills}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Enacted acts</p>
          <p className="mt-1 font-heading text-2xl font-bold">{data.enactedActs}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">High-confidence themes</p>
          <p className="mt-1 font-heading text-2xl font-bold">{data.highConfidenceThemes.length}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Claims follow-up</p>
          <p className="mt-1 font-heading text-2xl font-bold">{data.claimBuckets.needsResearch.length}</p>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Candidate Contrast Panel</h2>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div className="rounded border border-kelly-text/10 bg-kelly-page p-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Pattern risk side</p>
              <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
                <li>Control / regulation / enforcement expansion pattern questions.</li>
                <li>County burden and implementation pressure points.</li>
                <li>Direct democracy and petition process tightening themes.</li>
              </ul>
            </div>
            <div className="rounded border border-kelly-text/10 bg-kelly-page p-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Campaign doctrine side</p>
              <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
                <li>Trust, transparency, participation.</li>
                <li>Support counties and election workers.</li>
                <li>Balls-and-strikes Secretary of State office.</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Open Sections</h2>
          <div className="mt-2 flex flex-col gap-2 text-xs">
            <Link href="/admin/intelligence/kim-hammer/debate-prep" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Debate prep</Link>
            <Link href="/admin/intelligence/kim-hammer/claims-review" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Claims review</Link>
            <Link href="/admin/intelligence/kim-hammer/themes" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Themes</Link>
            <Link href="/admin/intelligence/kim-hammer/timeline" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Timeline</Link>
            <Link href="/admin/intelligence/kim-hammer/research-gaps" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Research gaps</Link>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Debate Prep Snapshot</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.topQuestions.slice(0, 5).map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Do Not Say / Risky Claims</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.riskClaims.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">What Kelly Should Say</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.safeLanguage.slice(0, 5).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">What To Drill Next</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.recommendedNextPass.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Bill Table</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-kelly-text/10 text-kelly-muted">
                <th className="py-1.5 pr-3 font-semibold">Bill</th>
                <th className="py-1.5 pr-3 font-semibold">Act</th>
                <th className="py-1.5 pr-3 font-semibold">Year</th>
                <th className="py-1.5 pr-3 font-semibold">Theme</th>
                <th className="py-1.5 pr-3 font-semibold">Role</th>
                <th className="py-1.5 pr-3 font-semibold">Confidence</th>
                <th className="py-1.5 font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody>
              {data.bills.map((bill) => (
                <tr key={bill.billNumber} className="border-b border-kelly-text/5">
                  <td className="py-1.5 pr-3">{bill.billNumber}</td>
                  <td className="py-1.5 pr-3">{bill.actNumber ?? "MISSING"}</td>
                  <td className="py-1.5 pr-3">{bill.sessionYear}</td>
                  <td className="py-1.5 pr-3">{bill.topicCategory.join(", ")}</td>
                  <td className="py-1.5 pr-3">{bill.hammerRole}</td>
                  <td className="py-1.5 pr-3">{bill.confidenceLevel}</td>
                  <td className="py-1.5">
                    <Link className="font-semibold text-kelly-navy underline" href={`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(bill.billNumber)}`}>
                      open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

