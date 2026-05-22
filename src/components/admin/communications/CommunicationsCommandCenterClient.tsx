"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CommunicationsBundle } from "@/lib/campaign-events/communications/load-communications-bundle";
import type { CampaignContact, ContactList, ContactSegment } from "@/lib/campaign-events/communications/communications-types";

export function CommunicationsCommandCenterClient({ bundle }: { bundle: CommunicationsBundle }) {
  const [contacts, setContacts] = useState(bundle.store.contacts);
  const [lists, setLists] = useState(bundle.store.lists);
  const [segments] = useState(bundle.store.segments);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<CampaignContact["roleTags"][0]>("volunteer");

  const suppressedCount = useMemo(() => contacts.filter((c) => c.suppressed).length, [contacts]);

  function addContact() {
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) return;
    const now = new Date().toISOString();
    const row: CampaignContact = {
      id: `ct-${Date.now()}`,
      email,
      displayName: newName.trim() || undefined,
      roleTags: [newRole],
      source: "manual:communications-center",
      consent: "import_review",
      suppressed: false,
      createdAt: now,
      updatedAt: now,
    };
    setContacts((prev) => [row, ...prev]);
    setNewEmail("");
    setNewName("");
  }

  function toggleSuppress(id: string) {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, suppressed: !c.suppressed, updatedAt: new Date().toISOString() } : c)),
    );
  }

  function createList() {
    const list: ContactList = {
      id: `list-${Date.now()}`,
      name: `List ${lists.length + 1}`,
      description: "Static list created in communications center",
      contactIds: contacts.filter((c) => !c.suppressed).slice(0, 5).map((c) => c.id),
      static: true,
      createdAt: new Date().toISOString(),
    };
    setLists((prev) => [list, ...prev]);
  }

  const { readiness: r } = bundle;

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6 pb-16 font-body">
      <header className="rounded-3xl border border-kelly-navy/20 bg-kelly-navy/[0.05] p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-kelly-slate">Kelly Campaign OS</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-navy">Communications command center</h1>
        <p className="mt-3 max-w-2xl text-sm text-kelly-text/75">
          Unified view of email providers, contact sources, lists, templates, and safety gates. All mass sends require human
          approval. No hidden automation.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/workbench/email-command-center" className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white">
            Email Command Center →
          </Link>
          <Link href="/admin/workbench/comms" className="rounded-full border border-kelly-navy/25 px-4 py-2 text-xs font-bold text-kelly-navy">
            Comms workbench
          </Link>
          <Link href="/admin/campaign-events/ai-tools" className="rounded-full border px-4 py-2 text-xs font-bold">
            Comms AI tools
          </Link>
          <Link href="/admin/communications/intelligence" className="rounded-full border border-kelly-navy/25 px-4 py-2 text-xs font-bold text-kelly-navy">
            Communications intelligence
          </Link>
          <Link href="/admin/communications/studio" className="rounded-full border border-kelly-navy/25 px-4 py-2 text-xs font-bold text-kelly-navy">
            Message Studio
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border border-kelly-text/10 p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">1. Email provider status</h2>
        <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
          <div>
            <dt className="font-bold">SendGrid broadcast</dt>
            <dd>{r.sendGrid.broadcastAllowed ? "Configured" : "Blocked — see notes"}</dd>
          </div>
          <div>
            <dt className="font-bold">Approval email send</dt>
            <dd>{r.approvalEmail.readyToSend ? "Ready (gated)" : `Disabled — ${r.approvalEmail.missingConfig.join(", ")}`}</dd>
          </div>
          <div>
            <dt className="font-bold">Gmail (ECC)</dt>
            <dd>{r.gmail.clientIdConfigured ? "OAuth configured" : "Not configured"}</dd>
          </div>
          <div>
            <dt className="font-bold">Mass email</dt>
            <dd className="font-bold text-amber-800">{bundle.massEmailStatus} — human approval required</dd>
          </div>
        </dl>
        {r.sendGrid.notes.length ? (
          <ul className="mt-2 list-inside list-disc text-[10px] text-kelly-muted">
            {r.sendGrid.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="rounded-2xl border border-kelly-text/10 p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">2. Contact sources ({bundle.unifiedSourceCount} unified)</h2>
        <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-xs">
          {bundle.sources.map((s) => (
            <li key={s.id} className="rounded border border-kelly-text/10 px-3 py-2">
              <span className="font-bold">{s.label}</span>
              <span className="text-kelly-subtle"> · {s.lane} · {s.importReadiness}</span>
              <p className="text-[10px] text-kelly-muted">{s.recommendedMapping}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">3. Contacts & lists (V1 JSON)</h2>
        <p className="text-xs text-kelly-muted">
          Local session preview — persist via import/ECC for production. Suppressed: {suppressedCount}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            className="rounded border px-2 py-1 text-xs"
            placeholder="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <input
            className="rounded border px-2 py-1 text-xs"
            placeholder="name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <select className="rounded border px-2 py-1 text-xs" value={newRole} onChange={(e) => setNewRole(e.target.value as CampaignContact["roleTags"][0])}>
            <option value="volunteer">volunteer</option>
            <option value="host">host</option>
            <option value="campaign_team">campaign_team</option>
            <option value="county_lead">county_lead</option>
          </select>
          <button type="button" className="rounded-full bg-kelly-navy px-3 py-1 text-xs font-bold text-white" onClick={addContact}>
            Add contact (session)
          </button>
          <button type="button" className="rounded-full border px-3 py-1 text-xs font-bold" onClick={createList}>
            Create demo list
          </button>
        </div>
        <ul className="mt-3 max-h-36 space-y-1 overflow-y-auto text-xs">
          {contacts.map((c) => (
            <li key={c.id} className="flex justify-between gap-2 rounded border border-kelly-text/10 px-2 py-1">
              <span>
                {c.email} {c.displayName ? `(${c.displayName})` : ""} · {c.roleTags.join(",")}
              </span>
              <button type="button" className="text-[10px] font-bold underline" onClick={() => toggleSuppress(c.id)}>
                {c.suppressed ? "Unsuppress" : "Suppress"}
              </button>
            </li>
          ))}
        </ul>
        {lists.length ? (
          <p className="mt-2 text-[10px] text-kelly-muted">
            Lists: {lists.map((l) => `${l.name} (${l.contactIds.length})`).join(" · ")}
          </p>
        ) : null}
        {segments.length ? (
          <p className="text-[10px] text-kelly-muted">Segments: {segments.map((s) => s.name).join(" · ")}</p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-kelly-text/10 p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">4. Templates ({bundle.templates.length})</h2>
        <ul className="mt-3 space-y-2 text-xs">
          {bundle.templates.map((t) => (
            <li key={t.id} className="rounded border border-kelly-text/10 px-3 py-2">
              <span className="font-bold">{t.name}</span>
              <span className="text-kelly-subtle">
                {" "}
                · {t.workflowType} · {t.riskLevel} · {t.status}
                {t.unsubscribeRequired ? " · unsub required" : ""}
              </span>
              <p className="text-[10px] text-kelly-muted">Subject: {t.subject}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-amber-600/25 bg-amber-600/5 p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Safety gates</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-text/75">
          {r.safety.massEmailBlockReasons.map((x) => (
            <li key={x}>{x}</li>
          ))}
          {bundle.risks.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] text-kelly-muted">
          Volunteer workflow: {bundle.volunteerWorkflowReadiness} · Team workflow: {bundle.teamWorkflowReadiness}
        </p>
      </section>
    </div>
  );
}
