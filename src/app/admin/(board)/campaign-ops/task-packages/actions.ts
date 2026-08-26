"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import {
  addTaskPackageProof,
  claimTaskPackage,
  initializeTaskPackage,
  requestTaskPackageChanges,
  saveTaskPackageWorksheet,
  submitTaskPackage,
  verifyTaskPackage,
} from "@/lib/campaign-ops/task-package-service";

const PATH = "/admin/campaign-ops/task-packages";

function required(formData: FormData, key: string): string {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) throw new Error(`${key} is required`);
  return value;
}

function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function revalidate(taskId?: string) {
  revalidatePath(PATH);
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/workbench");
  if (taskId) revalidatePath(`/admin/tasks/${taskId}`);
}

export async function initializeTaskPackageAction(formData: FormData) {
  await requireAdminAction();
  const taskId = required(formData, "taskId");
  await initializeTaskPackage({
    taskId,
    objective: String(formData.get("objective") ?? "").trim() || null,
    instructions: lines(formData.get("instructions")),
    acceptanceCriteria: lines(formData.get("acceptanceCriteria")),
    dependencyTaskIds: formData.getAll("dependencyTaskId").map(String).filter(Boolean),
  });
  revalidate(taskId);
}

export async function claimTaskPackageAction(formData: FormData) {
  await requireAdminAction();
  const taskId = required(formData, "taskId");
  const actorUserId = required(formData, "actorUserId");
  await claimTaskPackage(taskId, actorUserId);
  revalidate(taskId);
}

export async function saveTaskPackageWorksheetAction(formData: FormData) {
  await requireAdminAction();
  const taskId = required(formData, "taskId");
  const actorUserId = required(formData, "actorUserId");
  const key = required(formData, "worksheetKey");
  const value = String(formData.get("worksheetValue") ?? "").trim();
  await saveTaskPackageWorksheet({ taskId, actorUserId, worksheet: { [key]: value } });
  revalidate(taskId);
}

export async function addTaskPackageProofAction(formData: FormData) {
  await requireAdminAction();
  const taskId = required(formData, "taskId");
  await addTaskPackageProof({
    taskId,
    actorUserId: required(formData, "actorUserId"),
    label: required(formData, "label"),
    url: String(formData.get("url") ?? "").trim() || null,
    note: String(formData.get("note") ?? "").trim() || null,
  });
  revalidate(taskId);
}

export async function submitTaskPackageAction(formData: FormData) {
  await requireAdminAction();
  const taskId = required(formData, "taskId");
  await submitTaskPackage({
    taskId,
    actorUserId: required(formData, "actorUserId"),
    note: String(formData.get("note") ?? "").trim() || null,
  });
  revalidate(taskId);
}

export async function verifyTaskPackageAction(formData: FormData) {
  await requireAdminAction();
  const taskId = required(formData, "taskId");
  await verifyTaskPackage({
    taskId,
    verifierUserId: required(formData, "verifierUserId"),
    note: String(formData.get("note") ?? "").trim() || null,
  });
  revalidate(taskId);
}

export async function requestTaskPackageChangesAction(formData: FormData) {
  await requireAdminAction();
  const taskId = required(formData, "taskId");
  await requestTaskPackageChanges({
    taskId,
    verifierUserId: required(formData, "verifierUserId"),
    note: required(formData, "note"),
  });
  revalidate(taskId);
}
