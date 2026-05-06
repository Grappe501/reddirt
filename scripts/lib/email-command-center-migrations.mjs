/**
 * Email Command Center — migration folder names (Prisma `_prisma_migrations.migration_name`).
 * Shared by preflight + db-diagnose (no secrets).
 * Keep in sync with `src/lib/email-command-center/ecc-migration-gate.ts`.
 */

import { Prisma } from "@prisma/client";

export const EMAIL_COMMAND_CENTER_MIGRATION_DIRS = [
  "20260505190000_staff_gmail_sync_state",
  "20260505203000_email_contact_profile_graph",
  "20260505220000_email_audience_studio_foundation",
  "20260506120000_email_sendgrid_foundation",
  "20260507180000_email_contact_import_staging",
  "20260508120000_message_studio_server_drafts",
  "20260509120000_sendgrid_contact_sync_run",
  "20260510140000_email_send_execution",
];

/**
 * @param {import("@prisma/client").PrismaClient} prisma
 * @returns {Promise<{ name: string; applied: boolean }[]>}
 */
export async function queryEmailCommandCenterMigrationsApplied(prisma) {
  const names = EMAIL_COMMAND_CENTER_MIGRATION_DIRS;
  const rows = await prisma.$queryRaw`
    SELECT m.migration_name AS name,
           (m.finished_at IS NOT NULL) AS applied
    FROM "_prisma_migrations" m
    WHERE m.migration_name IN (${Prisma.join(names)})
    ORDER BY m.migration_name;
  `;
  const list = Array.isArray(rows) ? rows : [];
  const byName = new Map(list.map((r) => [String(r.name), Boolean(r.applied)]));
  return names.map((name) => ({
    name,
    applied: byName.get(name) === true,
  }));
}
