import Link from "next/link";
import type { EmailCommandCenterOperatorGate } from "@/lib/email-command-center/read-model";

/**
 * Shown when Prisma Email Command Center migrations are not verified on the active DATABASE_URL
 * (e.g. missing tables/columns — not “wrong batch id”).
 */
export function EccMigrationRequiredBanner({
  gate,
  context,
}: {
  gate: EmailCommandCenterOperatorGate;
  context?: string;
}) {
  if (gate.allEmailCommandCenterMigrationsApplied === true) return null;

  return (
    <div
      role="alert"
      className="rounded-lg border-2 border-amber-400/60 bg-amber-50/95 px-3 py-2.5 font-body text-[11px] text-amber-950"
    >
      <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-amber-900">
        Migration required
      </p>
      <p className="mt-1 leading-snug">
        This page needs{" "}
        <strong>Email Command Center workspace migrations</strong> on the database your app is using. Tables or columns are
        missing (for example <code className="text-[9px]">StaffGmailAccount.gmailSyncState</code> or contact import staging).
        {context ? ` ${context}` : ""}
      </p>
      <p className="mt-1 leading-snug">
        {gate.migrationGateNote ?? "Run the documented migrate steps on the correct DATABASE_URL, then refresh."}
      </p>
      <ul className="mt-2 list-inside list-disc text-[10px] opacity-95">
        <li>
          From <code className="text-[9px]">RedDirt/</code>: <code className="text-[9px]">{gate.dbDiagnoseCliHint}</code> (safe — no secret
          values)
        </li>
        <li>
          Then: <code className="text-[9px]">npx prisma migrate deploy</code> (operator confirms target DB — see runbook in{" "}
          <code className="text-[9px]">docs/EMAIL_PRODUCTION_MIGRATION_RUNBOOK.md</code>)
        </li>
        <li>
          Then: <code className="text-[9px]">{gate.preflightCliHint}</code>
        </li>
      </ul>
      <p className="mt-2">
        <Link href="/admin/workbench/email-command-center/readiness" className="font-bold text-kelly-forest underline">
          Open readiness checklist
        </Link>{" "}
        ·{" "}
        <Link href="/admin/workbench/email-command-center" className="font-bold text-kelly-navy underline">
          Today cockpit
        </Link>
      </p>
    </div>
  );
}
