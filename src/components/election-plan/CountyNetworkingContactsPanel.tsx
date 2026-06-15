"use client";

import { useCallback, useState } from "react";

import type { CountyNetworkingContact } from "@/lib/election-plan/county-networking-contacts-types";
import {
  loadCountyContacts,
  newContactId,
  saveCountyContacts,
  exportCountyContactsJson,
} from "@/lib/election-plan/county-networking-contacts-storage";

type Props = {
  countySlug: string;
  countyName: string;
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  hasFacebook: false,
  referredBy: "",
  notes: "",
};

export function CountyNetworkingContactsPanel({ countySlug, countyName }: Props) {
  const [contacts, setContacts] = useState<CountyNetworkingContact[]>(() => loadCountyContacts(countySlug));
  const [form, setForm] = useState(emptyForm);
  const [exportOpen, setExportOpen] = useState(false);

  const persist = useCallback(
    (next: CountyNetworkingContact[]) => {
      setContacts(next);
      saveCountyContacts(countySlug, next);
    },
    [countySlug],
  );

  const addContact = () => {
    if (!form.name.trim()) return;
    const entry: CountyNetworkingContact = {
      id: newContactId(),
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      hasFacebook: form.hasFacebook,
      referredBy: form.referredBy.trim(),
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
    };
    persist([entry, ...contacts]);
    setForm(emptyForm);
  };

  const removeContact = (id: string) => {
    persist(contacts.filter((c) => c.id !== id));
  };

  return (
    <div className="ep-card">
      <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Kelly outreach contacts</h2>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        Networking list for call time, personal invites, and relationship building in {countyName} County. Saved in
        this browser until exported.
      </p>

      <div className="mt-6 rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)]/40 p-4">
        <h3 className="text-sm font-semibold text-[var(--ep-navy)]">Add contact</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Name</span>
            <input
              className="mt-1 w-full rounded-md border border-[var(--ep-border)] bg-white px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-[var(--ep-border)] bg-white px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Phone</span>
            <input
              type="tel"
              className="mt-1 w-full rounded-md border border-[var(--ep-border)] bg-white px-3 py-2 text-sm"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.hasFacebook}
              onChange={(e) => setForm({ ...form, hasFacebook: e.target.checked })}
            />
            <span className="font-medium">On Facebook (yes)</span>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Who gave this contact?</span>
            <input
              className="mt-1 w-full rounded-md border border-[var(--ep-border)] bg-white px-3 py-2 text-sm"
              value={form.referredBy}
              onChange={(e) => setForm({ ...form, referredBy: e.target.value })}
              placeholder="Referrer name, org, or how Kelly got the lead"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Notes (optional)</span>
            <textarea
              className="mt-1 w-full rounded-md border border-[var(--ep-border)] bg-white px-3 py-2 text-sm"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Call time angle, invite context, relationship notes"
            />
          </label>
        </div>
        <button
          type="button"
          className="mt-4 rounded-md bg-[var(--ep-navy)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          onClick={addContact}
        >
          Add to outreach list
        </button>
      </div>

      {contacts.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--ep-navy-muted)]">No contacts yet — add the first person Kelly should reach.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--ep-border)] text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                <th className="pb-2 pr-3">Name</th>
                <th className="pb-2 pr-3">Email</th>
                <th className="pb-2 pr-3">Phone</th>
                <th className="pb-2 pr-3">Facebook</th>
                <th className="pb-2 pr-3">Who gave contact</th>
                <th className="pb-2 pr-3">Notes</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-[var(--ep-border)] align-top last:border-0">
                  <td className="py-2.5 pr-3 font-medium">{c.name}</td>
                  <td className="py-2.5 pr-3 text-[var(--ep-navy-muted)]">{c.email || "—"}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap text-[var(--ep-navy-muted)]">{c.phone || "—"}</td>
                  <td className="py-2.5 pr-3">{c.hasFacebook ? "Yes" : "No"}</td>
                  <td className="py-2.5 pr-3 text-[var(--ep-navy-muted)]">{c.referredBy || "—"}</td>
                  <td className="py-2.5 pr-3 max-w-[12rem] text-xs text-[var(--ep-navy-muted)]">{c.notes || "—"}</td>
                  <td className="py-2.5">
                    <button
                      type="button"
                      className="text-xs font-semibold text-red-700 hover:underline"
                      onClick={() => removeContact(c.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-md border border-[var(--ep-border)] bg-white px-3 py-2 text-xs font-semibold"
          onClick={() => setExportOpen((v) => !v)}
        >
          {exportOpen ? "Hide export" : "Export JSON"}
        </button>
        <span className="self-center text-xs text-[var(--ep-navy-muted)]">{contacts.length} contact(s)</span>
      </div>

      {exportOpen ? (
        <textarea
          readOnly
          className="mt-3 w-full rounded-md border border-[var(--ep-border)] bg-white p-3 font-mono text-xs"
          rows={8}
          value={exportCountyContactsJson(countySlug, countyName)}
        />
      ) : null}
    </div>
  );
}
