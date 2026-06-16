import type { ElectionPlanFieldCategory } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  FIELD_ENTRY_CATEGORIES,
  type FieldEntryCategory,
  type FieldEntryLocationSummary,
  type FieldEntryRow,
} from "./types";

function categoryLabel(cat: FieldEntryCategory): string {
  return FIELD_ENTRY_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
}

function toRow(e: {
  id: string;
  operatorInitials: string;
  category: ElectionPlanFieldCategory;
  label: string;
  description: string | null;
  quantity: number;
  countySlug: string;
  citySlug: string | null;
  createdAt: Date;
  operator: { displayName: string };
}): FieldEntryRow {
  return {
    id: e.id,
    operatorInitials: e.operatorInitials,
    operatorDisplayName: e.operator.displayName,
    category: e.category as FieldEntryCategory,
    label: e.label,
    description: e.description,
    quantity: e.quantity,
    countySlug: e.countySlug,
    citySlug: e.citySlug,
    createdAt: e.createdAt.toISOString(),
  };
}

export async function loadFieldEntriesForLocation(opts: {
  countySlug: string;
  citySlug?: string | null;
  limit?: number;
}): Promise<FieldEntryLocationSummary> {
  const limit = opts.limit ?? 50;
  const citySlug = opts.citySlug?.trim() || null;

  try {
    const where = citySlug
      ? { countySlug: opts.countySlug, citySlug }
      : { countySlug: opts.countySlug };

    const entries = await prisma.electionPlanFieldEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { operator: { select: { displayName: true } } },
    });

    const rollupsRaw = await prisma.electionPlanFieldEntry.groupBy({
      by: ["category"],
      where,
      _sum: { quantity: true },
      _count: { id: true },
    });

    const rollups = rollupsRaw.map((r) => ({
      category: r.category as FieldEntryCategory,
      label: categoryLabel(r.category as FieldEntryCategory),
      totalQuantity: r._sum.quantity ?? 0,
      entryCount: r._count.id,
    }));

    const totalQuantity = rollups.reduce((s, r) => s + r.totalQuantity, 0);

    return {
      entries: entries.map(toRow),
      rollups,
      totalQuantity,
    };
  } catch {
    return { entries: [], rollups: [], totalQuantity: 0 };
  }
}

export async function loadStatewideFieldEntryRollups(): Promise<FieldEntryLocationSummary["rollups"]> {
  try {
    const rollupsRaw = await prisma.electionPlanFieldEntry.groupBy({
      by: ["category"],
      _sum: { quantity: true },
      _count: { id: true },
    });
    return rollupsRaw.map((r) => ({
      category: r.category as FieldEntryCategory,
      label: categoryLabel(r.category as FieldEntryCategory),
      totalQuantity: r._sum.quantity ?? 0,
      entryCount: r._count.id,
    }));
  } catch {
    return [];
  }
}
