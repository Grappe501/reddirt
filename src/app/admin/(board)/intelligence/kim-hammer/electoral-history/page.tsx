import { loadKimHammerProfileWorkbench } from "@/lib/opposition/kimHammerProfileWorkbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerElectoralHistoryPage() {
  const data = loadKimHammerProfileWorkbench();
  return (
    <KimHammerBriefingPageShell moduleId="electoral-history">
<section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-kelly-text/10 text-kelly-muted">
                <th className="py-1.5 pr-3 font-semibold">Year</th>
                <th className="py-1.5 pr-3 font-semibold">Office</th>
                <th className="py-1.5 pr-3 font-semibold">District</th>
                <th className="py-1.5 pr-3 font-semibold">Stage</th>
                <th className="py-1.5 pr-3 font-semibold">Result</th>
                <th className="py-1.5 font-semibold">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {data.electoralHistory.rows.map((row) => (
                <tr key={`${row.year}-${row.office}-${row.stage}`} className="border-b border-kelly-text/5">
                  <td className="py-1.5 pr-3">{row.year}</td>
                  <td className="py-1.5 pr-3">{row.office}</td>
                  <td className="py-1.5 pr-3">{row.district}</td>
                  <td className="py-1.5 pr-3">{row.stage}</td>
                  <td className="py-1.5 pr-3">{row.result}</td>
                  <td className="py-1.5">{row.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </KimHammerBriefingPageShell>
  );
}

