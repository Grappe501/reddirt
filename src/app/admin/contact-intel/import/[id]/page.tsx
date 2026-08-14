import Link from "next/link";
import { notFound } from "next/navigation";
import {
  commitContactIntelImportAction,
  previewContactIntelMappingAction,
} from "@/app/admin/contact-intel-actions";
import {
  CONTACT_INTEL_FIELD_TARGETS,
  customKeyFromTarget,
  parseContactIntelTarget,
  type ContactIntelFieldTarget,
} from "@/lib/contact-intel/mapping";
import { getContactIntelJob, listContactIntelCustomFieldDefinitions } from "@/lib/contact-intel/queries";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ committed?: string; error?: string }> };

const STAT_LABELS: Record<string, string> = {
  total: "Total rows",
  newCount: "New",
  updateCount: "Update",
  invalid: "Invalid",
  conflictCount: "Conflict",
  skippedCount: "Skipped",
  createdPeople: "People created",
  updatedPeople: "People updated",
  addedMethods: "Methods added",
  addedAddresses: "Addresses added",
  addedTagJoins: "Tag links added",
  addedCustomValues: "Custom values added",
  committedRows: "Rows committed",
  conflictRows: "Conflicts",
  invalidRows: "Invalid rows",
  previewNew: "Preview new",
  previewUpdate: "Preview update",
  previewInvalid: "Preview invalid",
  previewConflict: "Preview conflict",
  uploadedRows: "Uploaded rows",
};

function asStringArray(json: unknown): string[] {
  return Array.isArray(json) ? json.map((v) => String(v)) : [];
}

function asMapping(json: unknown): Record<string, ContactIntelFieldTarget> {
  if (!json || typeof json !== "object") return {};
  const columns = (json as { columns?: Record<string, string> }).columns ?? {};
  const out: Record<string, ContactIntelFieldTarget> = {};
  for (const [k, v] of Object.entries(columns)) {
    out[k] = parseContactIntelTarget(v);
  }
  return out;
}

function asStats(json: unknown): Record<string, number> {
  if (!json || typeof json !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(json as Record<string, unknown>)) {
    if (typeof v === "number") out[k] = v;
  }
  return out;
}

function asMessages(json: unknown): string[] {
  return Array.isArray(json) ? json.map((v) => String(v)) : [];
}

export default async function ContactIntelImportJobPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { committed, error } = await searchParams;
  const [job, customDefs] = await Promise.all([getContactIntelJob(id), listContactIntelCustomFieldDefinitions()]);
  if (!job) notFound();

  const headers = asStringArray(job.headerJson);
  const mapping = asMapping(job.mappingJson);
  const stats = asStats(job.statsJson);
  const customPlan = asCustomPlan(job.previewJson);
  const previewRows = job.rows.slice(0, 8);
  const canCommit = job.status === "PREVIEWED";

  return (
    <div className="space-y-6">
      <p className="text-sm">
        <Link href="/admin/contact-intel/import" className="text-kelly-navy underline">
          ← All imports
        </Link>
      </p>

      {committed ? (
        <p className="rounded border border-kelly-forest/30 bg-kelly-fog/70 px-3 py-2 text-sm text-kelly-navy">
          Import committed. Invalid and conflict rows were left out of the library.
        </p>
      ) : null}
      {error === "commit" || job.status === "FAILED" ? (
        <p className="rounded border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-950">
          Commit failed. No people or contact methods from this attempt were saved.
          {job.errorSummary ? ` ${job.errorSummary}` : " Preview again, then retry."}
        </p>
      ) : null}

      <section className="rounded-lg border border-kelly-text/15 bg-white px-4 py-4">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">{job.originalFilename}</h2>
        <p className="mt-1 text-sm text-kelly-muted">
          Status <strong className="text-kelly-navy">{job.status}</strong> · {job._count.rows} rows · {job._count.conflicts}{" "}
          conflicts
        </p>
        <p className="mt-1 font-mono text-[11px] text-kelly-muted">Import ID {job.id}</p>
      </section>

      {job.status !== "COMMITTED" ? (
        <section className="rounded-lg border border-kelly-text/15 bg-white px-4 py-4">
          <h3 className="font-heading text-base font-bold text-kelly-navy">Map columns</h3>
          <p className="mt-1 text-sm text-kelly-text/80">
            Assign each source column. Addresses, tags, and custom fields enrich a person after email/phone
            matching. They never merge people. Unmapped columns stay on the original row.
          </p>
          <form action={previewContactIntelMappingAction} className="mt-4 space-y-3">
            <input type="hidden" name="jobId" value={job.id} />
            <input type="hidden" name="headers" value={JSON.stringify(headers)} />
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-kelly-text/10 text-left text-[10px] font-bold uppercase tracking-wide text-kelly-muted">
                    <th className="px-2 py-1.5">Source column</th>
                    <th className="px-2 py-1.5">Maps to</th>
                    <th className="px-2 py-1.5">Sample</th>
                  </tr>
                </thead>
                <tbody>
                  {headers.map((header) => {
                    const sample = previewRows
                      .map((r) => String((r.rawJson as Record<string, string> | null)?.[header] ?? ""))
                      .filter(Boolean)
                      .slice(0, 2)
                      .join(" · ");
                    const target = mapping[header] ?? "ignore";
                    const customKey = customKeyFromTarget(target);
                    return (
                      <tr key={header} className="border-b border-kelly-text/8 align-top">
                        <td className="px-2 py-1.5 font-semibold">{header}</td>
                        <td className="px-2 py-1.5">
                          <select
                            name={`map:${header}`}
                            defaultValue={customKey ? "custom" : target}
                            className="rounded border border-kelly-text/20 px-2 py-1 text-sm"
                          >
                            {CONTACT_INTEL_FIELD_TARGETS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                            <option value="custom">custom field</option>
                          </select>
                          <div className="mt-1 space-y-1">
                            <select
                              name={`customExisting:${header}`}
                              defaultValue={customKey ?? ""}
                              className="w-full rounded border border-kelly-text/20 px-2 py-1 text-xs"
                            >
                              <option value="">New custom field…</option>
                              {customDefs.map((d) => (
                                <option key={d.id} value={d.key}>
                                  {d.label} ({d.key})
                                </option>
                              ))}
                            </select>
                            <input
                              name={`customKey:${header}`}
                              defaultValue={customKey ?? ""}
                              placeholder="key e.g. employer"
                              className="w-full rounded border border-kelly-text/20 px-2 py-1 text-xs"
                            />
                            <input
                              name={`customLabel:${header}`}
                              defaultValue={customDefs.find((d) => d.key === customKey)?.label ?? header}
                              placeholder="Label e.g. Employer"
                              className="w-full rounded border border-kelly-text/20 px-2 py-1 text-xs"
                            />
                          </div>
                        </td>
                        <td className="max-w-xs truncate px-2 py-1.5 text-kelly-muted">{sample || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button type="submit" className="rounded border border-kelly-forest/40 bg-kelly-fog/80 px-3 py-2 text-sm font-bold text-kelly-navy">
              Apply mapping and preview
            </button>
          </form>
        </section>
      ) : null}

      {job.status === "PREVIEWED" || job.status === "COMMITTED" ? (
        <section className="rounded-lg border border-kelly-text/15 bg-white px-4 py-4">
          <h3 className="font-heading text-base font-bold text-kelly-navy">Preview</h3>
          {customPlan.length > 0 ? (
            <ul className="mt-2 text-sm text-kelly-text/80">
              {customPlan.map((item) => (
                <li key={item.key}>
                  Custom field <strong>{item.label}</strong> ({item.key}) will be{" "}
                  {item.action === "reuse" ? "reused" : "created on commit"}.
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {Object.entries(stats).map(([k, v]) => (
              <div key={k} className="rounded border border-kelly-text/10 px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-wide text-kelly-muted">
                  {STAT_LABELS[k] ?? k}
                </div>
                <div className="font-heading text-xl font-bold text-kelly-navy">{v}</div>
              </div>
            ))}
          </div>

          {canCommit ? (
            <form action={commitContactIntelImportAction} className="mt-4">
              <input type="hidden" name="jobId" value={job.id} />
              <button type="submit" className="rounded bg-kelly-navy px-3 py-2 text-sm font-bold text-white">
                Commit import
              </button>
            </form>
          ) : null}

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-kelly-text/10 text-left text-[10px] font-bold uppercase tracking-wide text-kelly-muted">
                  <th className="px-2 py-1.5">Row</th>
                  <th className="px-2 py-1.5">Status</th>
                  <th className="px-2 py-1.5">Name</th>
                  <th className="px-2 py-1.5">Emails</th>
                  <th className="px-2 py-1.5">Phones</th>
                  <th className="px-2 py-1.5">Address</th>
                  <th className="px-2 py-1.5">Tags</th>
                  <th className="px-2 py-1.5">Custom</th>
                  <th className="px-2 py-1.5">Notes</th>
                </tr>
              </thead>
              <tbody>
                {job.rows.map((row) => (
                  <tr key={row.id} className="border-b border-kelly-text/8 align-top">
                    <td className="px-2 py-1.5">{row.rowNumber}</td>
                    <td className="px-2 py-1.5">{row.status}</td>
                    <td className="px-2 py-1.5">{row.displayName || "—"}</td>
                    <td className="px-2 py-1.5">{summarizeMethods(row.emailsJson)}</td>
                    <td className="px-2 py-1.5">{summarizeMethods(row.phonesJson)}</td>
                    <td className="px-2 py-1.5">{summarizeEnrichment(row.enrichmentJson, "address")}</td>
                    <td className="px-2 py-1.5">{summarizeEnrichment(row.enrichmentJson, "tags")}</td>
                    <td className="px-2 py-1.5">{summarizeEnrichment(row.enrichmentJson, "custom")}</td>
                    <td className="px-2 py-1.5 text-kelly-muted">{asMessages(row.messagesJson).join(" ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {job._count.rows > job.rows.length ? (
            <p className="mt-2 text-xs text-kelly-muted">Showing first {job.rows.length} of {job._count.rows} rows.</p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function asCustomPlan(json: unknown): { key: string; label: string; action: string }[] {
  if (!json || typeof json !== "object") return [];
  const raw = (json as { customFields?: unknown }).customFields;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rec = item as { key?: unknown; label?: unknown; action?: unknown };
      if (typeof rec.key !== "string") return null;
      return { key: rec.key, label: String(rec.label ?? rec.key), action: String(rec.action ?? "create") };
    })
    .filter((v): v is { key: string; label: string; action: string } => Boolean(v));
}

function summarizeEnrichment(json: unknown, part: "address" | "tags" | "custom"): string {
  if (!json || typeof json !== "object") return "—";
  const rec = json as {
    addressPreview?: unknown;
    tags?: { name?: string }[];
    custom?: { key?: string; original?: string }[];
  };
  if (part === "address") return typeof rec.addressPreview === "string" && rec.addressPreview ? rec.addressPreview : "—";
  if (part === "tags") {
    const names = Array.isArray(rec.tags) ? rec.tags.map((t) => t.name).filter(Boolean) : [];
    return names.join(", ") || "—";
  }
  const fields = Array.isArray(rec.custom)
    ? rec.custom.map((c) => (c.key && c.original ? `${c.key}=${c.original}` : "")).filter(Boolean)
    : [];
  return fields.join("; ") || "—";
}

function summarizeMethods(json: unknown): string {
  if (!Array.isArray(json) || json.length === 0) return "—";
  return json
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const rec = item as { original?: string; normalized?: string };
      return rec.normalized || rec.original || "";
    })
    .filter(Boolean)
    .join(", ");
}
