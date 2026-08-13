import Link from "next/link";
import { notFound } from "next/navigation";
import { getContactIntelPerson } from "@/lib/contact-intel/queries";

type Props = { params: Promise<{ id: string }> };

export default async function ContactIntelPersonPage({ params }: Props) {
  const { id } = await params;
  const person = await getContactIntelPerson(id);
  if (!person) notFound();

  const emails = person.methods.filter((m) => m.kind === "EMAIL");
  const phones = person.methods.filter((m) => m.kind === "PHONE");

  return (
    <div className="space-y-6">
      <p className="text-sm">
        <Link href="/admin/contact-intel" className="text-kelly-navy underline">
          ← Library
        </Link>
      </p>

      <section className="rounded-lg border border-kelly-text/15 bg-white px-4 py-4">
        <h2 className="font-heading text-2xl font-bold text-kelly-navy">{person.displayName}</h2>
        <p className="mt-1 text-sm text-kelly-muted">
          {[person.firstName, person.lastName].filter(Boolean).join(" ") || "Name parts unknown"}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-kelly-text/15 bg-white px-4 py-4">
          <h3 className="font-heading text-base font-bold text-kelly-navy">Emails</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {emails.length === 0 ? <li className="text-kelly-muted">None</li> : null}
            {emails.map((m) => (
              <li key={m.id}>
                <span className="font-semibold">{m.normalizedValue}</span>
                {m.originalValue !== m.normalizedValue ? (
                  <span className="ml-2 text-kelly-muted">as {m.originalValue}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-kelly-text/15 bg-white px-4 py-4">
          <h3 className="font-heading text-base font-bold text-kelly-navy">Phones</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {phones.length === 0 ? <li className="text-kelly-muted">None</li> : null}
            {phones.map((m) => (
              <li key={m.id}>
                <span className="font-semibold">{m.originalValue}</span>
                <span className="ml-2 text-kelly-muted">({m.normalizedValue})</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-lg border border-kelly-text/15 bg-white px-4 py-4">
        <h3 className="font-heading text-base font-bold text-kelly-navy">Source rows</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-kelly-text/10 text-left text-[10px] font-bold uppercase tracking-wide text-kelly-muted">
                <th className="px-2 py-1.5">File</th>
                <th className="px-2 py-1.5">Row</th>
                <th className="px-2 py-1.5">Status</th>
                <th className="px-2 py-1.5">Imported</th>
              </tr>
            </thead>
            <tbody>
              {person.sourceRows.map((row) => (
                <tr key={row.id} className="border-b border-kelly-text/8">
                  <td className="px-2 py-1.5">
                    <Link className="text-kelly-navy underline" href={`/admin/contact-intel/import/${row.job.id}`}>
                      {row.job.originalFilename}
                    </Link>
                  </td>
                  <td className="px-2 py-1.5">{row.rowNumber}</td>
                  <td className="px-2 py-1.5">{row.status}</td>
                  <td className="px-2 py-1.5 text-kelly-muted">{row.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
