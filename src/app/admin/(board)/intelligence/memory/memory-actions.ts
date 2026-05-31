"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { syncRecommendationLedgerFromActionQueue } from "@/lib/intelligence/institutionalMemory/institutionalMemoryEngine";
import {
  createDecisionEntry,
  createLessonEntry,
  createManualRecommendationEntry,
  recordRecommendationDisposition,
  saveWeeklyReflectionEntry,
} from "@/lib/intelligence/institutionalMemory/institutionalMemoryWorkflow";
import type {
  DecisionCategory,
  DecisionResultStatus,
  LessonKind,
  RecommendationDisposition,
} from "@/lib/intelligence/institutionalMemory/types";

const CHANGED_BY_ROUTE = "admin/intelligence/memory/memory-actions";

const REVALIDATE_PATHS = [
  "/admin/intelligence/memory",
  "/admin/intelligence/command-center",
  "/admin/intelligence",
  "/admin/intelligence/action-queue",
];

function revalidateMemorySurfaces() {
  for (const routePath of REVALIDATE_PATHS) {
    revalidatePath(routePath);
  }
}

export async function syncRecommendationsFromQueueAction() {
  await requireAdminAction();
  const result = syncRecommendationLedgerFromActionQueue();
  revalidateMemorySurfaces();
  return { ok: true as const, ...result };
}

export async function createDecisionAction(input: {
  operator: string;
  title: string;
  decisionDate: string;
  category: DecisionCategory;
  summary: string;
  reasoning: string;
  expectedOutcome: string;
  actualOutcome?: string;
  resultStatus?: DecisionResultStatus;
  lessonLearned?: string;
  confidenceImpact?: string;
  notes?: string;
}) {
  await requireAdminAction();
  const result = createDecisionEntry({ ...input, changedByRoute: CHANGED_BY_ROUTE });
  if (result.ok) revalidateMemorySurfaces();
  return result;
}

export async function createLessonAction(input: {
  operator: string;
  kind: LessonKind;
  title: string;
  body: string;
  tags?: string;
}) {
  await requireAdminAction();
  const result = createLessonEntry({ ...input, changedByRoute: CHANGED_BY_ROUTE });
  if (result.ok) revalidateMemorySurfaces();
  return result;
}

export async function createRecommendationAction(input: {
  operator: string;
  recommendation: string;
  sourceSystem: string;
  priority?: string;
}) {
  await requireAdminAction();
  const result = createManualRecommendationEntry({ ...input, changedByRoute: CHANGED_BY_ROUTE });
  if (result.ok) revalidateMemorySurfaces();
  return result;
}

export async function updateRecommendationDispositionAction(input: {
  recommendationId: string;
  operator: string;
  disposition: RecommendationDisposition;
  result?: string;
  operatorNotes?: string;
}) {
  await requireAdminAction();
  const result = recordRecommendationDisposition({ ...input, changedByRoute: CHANGED_BY_ROUTE });
  if (result.ok) revalidateMemorySurfaces();
  return result;
}

export async function saveWeeklyReflectionAction(input: {
  operator: string;
  weekLabel: string;
  whatWorked: string;
  whatFailed: string;
  whatSurprised: string;
  whatToStop: string;
  whatToDoMore: string;
  whatWeAreLearning: string;
}) {
  await requireAdminAction();
  const result = saveWeeklyReflectionEntry({ ...input, changedByRoute: CHANGED_BY_ROUTE });
  if (result.ok) revalidateMemorySurfaces();
  return result;
}
