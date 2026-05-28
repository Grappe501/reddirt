"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { recordKimHammerExportEvent } from "@/lib/opposition/kimHammerExportWorkflow";
import type {
  KimHammerExportFormat,
  KimHammerExportScope,
} from "@/lib/opposition/types/kimHammerExportControl";

const EXPORT_CHANGED_BY_ROUTE = "admin/intelligence/kim-hammer/export-actions";

const EXPORT_REVALIDATE_PATHS = [
  "/admin/intelligence/kim-hammer",
  "/admin/intelligence/kim-hammer/evidence-command",
  "/admin/intelligence/kim-hammer/export-control-center",
  "/admin/intelligence/kim-hammer/debate-packet-export",
  "/admin/intelligence/kim-hammer/audit-log",
  "/admin/intelligence/kim-hammer/citation-locker",
];

function revalidateKimHammerExportSurfaces() {
  for (const routePath of EXPORT_REVALIDATE_PATHS) {
    revalidatePath(routePath);
  }
}

export async function recordKimHammerExportAction(input: {
  operator: string;
  format: KimHammerExportFormat;
  scope: KimHammerExportScope;
  countyId?: string;
  exportNotes?: string;
}) {
  await requireAdminAction();

  const result = recordKimHammerExportEvent({
    ...input,
    changedByRoute: `${EXPORT_CHANGED_BY_ROUTE}#recordKimHammerExportAction`,
  });

  if (result.ok) {
    revalidateKimHammerExportSurfaces();
  }

  return result;
}
