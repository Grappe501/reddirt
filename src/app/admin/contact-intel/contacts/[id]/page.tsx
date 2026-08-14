import { Fragment } from "react";
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

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-kelly-text/15 bg-white px-4 py-4">
          <h3 className="font-heading text-base font-bold text-kelly-navy">Addresses</h3>
          <p className="mt-1 text-xs text-kelly-muted">Imported source values. Not used to match or merge people.</p>
          <ul className="mt-2 space-y-2 text-sm">
            {person.addresses.length === 0 ? <li className="text-kelly-muted">None</li> : null}
            {person.addresses.map((a) => (
              <li key={a.id}>
                {[a.line, a.city, a.state, a.postalCode].filter(Boolean).join(", ") || "Partial address"}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-kelly-text/15 bg-white px-4 py-4">
          <h3 className="font-heading text-base font-bold text-kelly-navy">Tags</h3>
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">
            {person.personTags.length === 0 ? <li className="text-kelly-muted">None</li> : null}
            {person.personTags.map((pt) => (
              <li key={pt.id} className="rounded border border-kelly-text/15 px-2 py-0.5">
                {pt.tag.name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-lg border border-kelly-text/15 bg-white px-4 py-4">
        <h3 className="font-heading text-base font-bold text-kelly-navy">Custom fields</h3>
        <p className="mt-1 text-xs text-kelly-muted">Current values from imports. Earlier observations stay on source rows.</p>
        <ul className="mt-2 space-y-1 text-sm">
          {person.customValues.length === 0 ? <li className="text-kelly-muted">None</li> : null}
          {person.customValues.map((v) => (
            <li key={v.id}>
              <span className="font-semibold">{v.definition.label}</span>
              <span className="ml-2">{v.originalValue}</span>
            </li>
          ))}
        </ul>
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
                <Fragment key={row.id}>
                  <tr className="border-b border-kelly-text/8">
                    <td className="px-2 py-1.5">
                      <Link className="text-kelly-navy underline" href={`/admin/contact-intel/import/${row.job.id}`}>
                        {row.job.originalFilename}
                      </Link>
                    </td>
                    <td className="px-2 py-1.5">{row.rowNumber}</td>
                    <td className="px-2 py-1.5">{row.status}</td>
                    <td className="px-2 py-1.5 text-kelly-muted">{row.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                  </tr>
                  <tr className="border-b border-kelly-text/8">
                    <td colSpan={4} className="px-2 py-1.5 font-mono text-[11px] text-kelly-muted">
                      {summarizeRaw(row.rawJson)}
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function summarizeRaw(json: unknown): string {
  if (!json || typeof json !== "object") return "—";
  try {
    return JSON.stringify(json);
  } catch {
    return "—";
  }
}
