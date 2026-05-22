import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ComplianceTask } from "./compliance-task-types";

const TASKS_PATH = path.join(process.cwd(), "data", "compliance", "tasks", "approval-needs-info.json");

async function ensureDir() {
  await mkdir(path.dirname(TASKS_PATH), { recursive: true });
}

export async function loadApprovalNeedsInfoTasks(): Promise<ComplianceTask[]> {
  try {
    const raw = await readFile(TASKS_PATH, "utf8");
    return JSON.parse(raw) as ComplianceTask[];
  } catch {
    return [];
  }
}

export async function upsertApprovalNeedsInfoTask(input: {
  approvalItemId: string;
  queueId: string;
  title: string;
  note?: string;
  requestedInfo: string;
  priority?: ComplianceTask["priority"];
}): Promise<ComplianceTask> {
  const tasks = await loadApprovalNeedsInfoTasks();
  const id = `approval-needs-${input.approvalItemId}`;
  const now = new Date().toISOString();
  const existing = tasks.find((task) => task.id === id);
  const next: ComplianceTask = {
    id,
    type: "approval_needs_info",
    title: input.title,
    priority: input.priority ?? "high",
    status: "open",
    notes: [input.requestedInfo, input.note].filter(Boolean) as string[],
    relatedRecordLinks: [
      {
        label: "Approval item",
        href: `/admin/compliance/approval/${input.queueId}/item/${input.approvalItemId}`,
        recordId: input.approvalItemId,
      },
      { label: "Approval history", href: "/admin/compliance/approval/history", recordId: "history" },
    ],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const merged = existing ? tasks.map((task) => (task.id === id ? next : task)) : [...tasks, next];
  await ensureDir();
  await writeFile(TASKS_PATH, JSON.stringify(merged, null, 2), "utf8");
  return next;
}
