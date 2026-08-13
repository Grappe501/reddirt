import Link from "next/link";
import { contactIntelLibraryStats, searchContactIntelPeople } from "@/lib/contact-intel/queries";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function ContactIntelLibraryPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const [stats, people] = await Promise.all([
    contactIntelLibraryStats(),
    searchContactIntelPeople(q, 75),
  ]);

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-4">
        <Stat label="People" value={stats.people} />
        <Stat label="Emails" value={stats.emailCount} />
        <Stat label="Phones" value={stats.phoneCount} />
        <Stat label="Imports" value={stats.jobs} />
      </section>

      <form className="flex flex-wrap gap-2" action="/admin/contact-intel" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search email, phone, or name"
          className="min-w-[240px] flex-1 rounded border border-kelly-text/20 bg-white px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded border border-kelly-forest/40 bg-kelly-fog/80 px-3 py-2 text-sm font-bold text-kelly-navy">
          Search
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-kelly-text/12 bg-white/95">
        <table className="min-w-full border-collapse font-body text-[13px]">
          <thead>
            <tr className="border-b border-kelly-text/10 bg-kelly-page/80 text-left text-[10px] font-bold uppercase tracking-wide text-kelly-muted">
              <th className="px-3 py-2">Person</th>
              <th className="px-3 py-2">Emails</th>
              <th className="px-3 py-2">Phones</th>
            </tr>
          </thead>
          <tbody>
            {people.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-sm text-kelly-muted">
                  {q ? "No matches." : "No contacts yet. Import a spreadsheet to start."}
                </td>
              </tr>
            ) : (
              people.map((person) => {
                const emails = person.methods.filter((m) => m.kind === "EMAIL");
                const phones = person.methods.filter((m) => m.kind === "PHONE");
                return (
                  <tr key={person.id} className="border-b border-kelly-text/8">
                    <td className="px-3 py-2">
                      <Link className="font-semibold text-kelly-navy underline" href={`/admin/contact-intel/contacts/${person.id}`}>
                        {person.displayName}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-kelly-text/90">{emails.map((m) => m.normalizedValue).join(", ") || "—"}</td>
                    <td className="px-3 py-2 text-kelly-text/90">{phones.map((m) => m.originalValue).join(", ") || "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-kelly-text/12 bg-white px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-kelly-muted">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-kelly-navy">{value}</p>
    </div>
  );
}
