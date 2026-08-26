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
  return String(value ?? "").split(/\r?\n/).map((v) => v.trim()).filter(Boolean);
}
function refresh() {
  revalidatePath(PATH);
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/workbench");
}

export async function initializeTaskPackageAction(formData: FormData) {
  await requireAdminAction();
  await initializeTaskPackage({
    taskId: required(formData, "taskId"),
    objective: String(formData.get("objective") ?? "").trim() || null,
    instructions: lines(formData.get("instructions")),
    acceptanceCriteria: lines(formData.get("acceptanceCriteria")),
    dependencyTaskIds: formData.getAll("dependencyTaskId").map(String).filter(Boolean),
  });
  refresh();
}
export async function claimTaskPackageAction(formData: FormData) {
  await requireAdminAction();
  await claimTaskPackage(required(formData, "taskId"), required(formData, "actorUserId"));
  refresh();
}
export async function saveTaskPackageWorksheetAction(formData: FormData) {
  await requireAdminAction();
  await saveTaskPackageWorksheet({ taskId: required(formData, "taskId"), actorUserId: required(formData, "actorUserId"), worksheet: { [required(formData, "worksheetKey")]: String(formData.get("worksheetValue") ?? "").trim() } });
  refresh();
}
export async function addTaskPackageProofAction(formData: FormData) {
  await requireAdminAction();
  await addTaskPackageProof({ taskId: required(formData, "taskId"), actorUserId: required(formData, "actorUserId"), label: required(formData, "label"), url: String(formData.get("url") ?? "").trim() || null, note: String(formData.get("note") ?? "").trim() || null });
  refresh();
}
export async function submitTaskPackageAction(formData: FormData) {
  await requireAdminAction();
  await submitTaskPackage({ taskId: required(formData, "taskId"), actorUserId: required(formData, "actorUserId"), note: String(formData.get("note") ?? "").trim() || null });
  refresh();
}
export async function verifyTaskPackageAction(formData: FormData) {
  await requireAdminAction();
  await verifyTaskPackage({ taskId: required(formData, "taskId"), verifierUserId: required(formData, "verifierUserId"), note: String(formData.get("note") ?? "").trim() || null });
  refresh();
}
export async function requestTaskPackageChangesAction(formData: FormData) {
  await requireAdminAction();
  await requestTaskPackageChanges({ taskId: required(formData, "taskId"), verifierUserId: required(formData, "verifierUserId"), note: required(formData, "note") });
  refresh();
}
