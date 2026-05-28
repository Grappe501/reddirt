import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";

export default async function KimHammerDirectDemocracyPage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">KH-3 Direct Democracy File</p>
        <h1 className="font-heading text-2xl font-bold">Initiative + Ballot Process File</h1>
      </header>
      <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <p className="text-kelly-muted">{data.directDemocracyFile.summary}</p>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {data.directDemocracyFile.lanes.map((lane) => (
            <li key={lane.lane}>{lane.lane}: {lane.status} ({lane.evidenceStatus})</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

