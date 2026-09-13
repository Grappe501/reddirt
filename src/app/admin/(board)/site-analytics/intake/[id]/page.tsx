import Link from "next/link";
import { notFound } from "next/navigation";
import { sanitizeNeighborDisplayName } from "@/lib/analytics/visitor-signals";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function metaText(meta: Record<string, unknown>, key: string): string | null {
  const value = meta[key];
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 120) : null;
}

export default async function SiteAnalyticsIntakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(id)) notFound();

  const intake = await prisma.workflowIntake.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      source: true,
      status: true,
      createdAt: true,
      metadata: true,
      county: { select: { displayName: true, slug: true } },
      submission: {
        select: {
          id: true,
          type: true,
          createdAt: true,
          user: { select: { name: true, email: true, phone: true } },
        },
      },
    },
  });
  if (!intake) notFound();

  const meta = asRecord(intake.metadata);
  const name = sanitizeNeighborDisplayName(intake.submission?.user?.name) ?? intake.title ?? "Neighbor";
  const email = intake.submission?.user?.email ?? null;
  const phone = intake.submission?.user?.phone ?? null;
  const county = intake.county?.displayName ?? metaText(meta, "county");
  const role = metaText(meta, "preferredRole") ?? metaText(meta, "primaryTeam") ?? metaText(meta, "pathway");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="font-body text-sm">
        <Link href="/admin/site-analytics?days=1" className="font-semibold text-kelly-navy hover:underline">
          ← Visitor desk
        </Link>
      </p>
      <header>
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">
          Operator queue · from visitor card
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-ink">{name}</h1>
        <p className="mt-2 font-body text-sm text-kelly-slate">
          This is the intake created when they finished a public form. Email is here so you can follow up — it stays off
          the visitor cards.
        </p>
      </header>

      <section className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm">
        <dl className="grid gap-3 font-body text-sm sm:grid-cols-2">
          <Item label="Status" value={intake.status.replaceAll("_", " ")} />
          <Item label="Form" value={intake.source ?? intake.submission?.type ?? "public form"} />
          <Item label="County" value={county} />
          <Item label="Role / path" value={role} />
          <Item
            label="Submitted"
            value={intake.createdAt.toLocaleString("en-US", {
              timeZone: "America/Chicago",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          />
          <Item label="Title" value={intake.title} />
          <Item label="Email" value={email} />
          <Item label="Phone" value={phone} />
        </dl>
      </section>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wider text-kelly-slate/70">{label}</dt>
      <dd className="mt-1 font-semibold text-kelly-ink">{value?.trim() || "—"}</dd>
    </div>
  );
}
