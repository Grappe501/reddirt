import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerRapidResponsePage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="rapid-response">
<section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Evidence Locker</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {data.rapidResponseAppendix.evidenceLocker.map((item) => (
            <li key={item.id}>{item.category}: {item.asset} ({item.verificationStatus})</li>
          ))}
        </ul>
      </section>
      <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Quote Verification Rules</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {data.rapidResponseAppendix.quoteVerificationRules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>
    </KimHammerBriefingPageShell>
  );
}

