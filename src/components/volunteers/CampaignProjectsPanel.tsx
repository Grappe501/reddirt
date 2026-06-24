import Link from "next/link";

import {
  advanceProjectTaskStatusAction,
  createCampaignProjectAction,
  createProjectTaskAction,
  updateCampaignProjectStatusAction,
} from "@/app/election-plan/operators/campaign-project-actions";
import type {
  CampaignProjectBoardPayload,
  CampaignProjectListPayload,
} from "@/lib/volunteers/campaign-projects";
import { PROJECT_STATUS_LABELS } from "@/lib/volunteers/campaign-projects";

function statusBadge(status: string): string {
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-950 ring-emerald-200";
  if (status === "PLANNING") return "bg-sky-50 text-sky-950 ring-sky-200";
  if (status === "ON_HOLD") return "bg-amber-50 text-amber-950 ring-amber-200";
  if (status === "COMPLETED") return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)] ring-[var(--ep-navy)]/10";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)] ring-[var(--ep-navy)]/10";
}

function noticeText(code: string | null | undefined): string | null {
  if (!code) return null;
  const map: Record<string, string> = {
    created: "Project created with starter tasks.",
    updated: "Project status updated.",
    task_created: "Task added to project.",
    task_updated: "Task status updated.",
    task_failed: "Could not create task — check database.",
    no_db: "Database not configured.",
    missing: "Missing required fields.",
  };
  return map[code] ?? null;
}

export function CampaignProjectsListPanel({
  payload,
  returnTo,
  notice,
}: {
  payload: CampaignProjectListPayload;
  returnTo: string;
  notice?: string | null;
}) {
  const msg = noticeText(notice);

  return (
    <div className="space-y-8">
      {!payload.dbAvailable ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Database not configured — project list unavailable.
        </p>
      ) : null}
      {msg ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">{msg}</p>
      ) : null}

      <section className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Start from template</h2>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          One-click project shells with default tasks for VR, coalition, and Labor Day pushes.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {payload.templates.map((t) => (
            <li key={t.templateKey} className="rounded-lg border border-[var(--ep-navy)]/10 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">{t.templateKey}</p>
              <h3 className="mt-1 font-semibold text-[var(--ep-navy)]">{t.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--ep-navy-muted)]">{t.description}</p>
              <form action={createCampaignProjectAction} className="mt-3">
                <input type="hidden" name="templateKey" value={t.templateKey} />
                <input type="hidden" name="title" value={t.title} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <button
                  type="submit"
                  className="rounded-full bg-[var(--ep-navy)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white"
                >
                  Create project →
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[var(--ep-navy)]/10 px-5 py-4">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Active projects</h2>
        </div>
        {payload.projects.length === 0 ? (
          <p className="px-5 py-8 text-sm text-[var(--ep-navy-muted)]">No projects yet — create one from a template above.</p>
        ) : (
          <ul className="divide-y divide-[var(--ep-navy)]/10">
            {payload.projects.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <Link href={p.href} className="font-semibold text-[var(--ep-navy)] hover:underline">
                    {p.title}
                  </Link>
                  {p.description ? <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{p.description}</p> : null}
                  <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
                    {p.openTaskCount} open · {p.doneTaskCount} done
                    {p.laneId ? ` · lane ${p.laneId}` : ""}
                    {p.countySlug ? ` · ${p.countySlug}` : ""}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${statusBadge(p.status)}`}>
                  {PROJECT_STATUS_LABELS[p.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function CampaignProjectBoardPanel({
  payload,
  returnTo,
  notice,
}: {
  payload: CampaignProjectBoardPayload;
  returnTo: string;
  notice?: string | null;
}) {
  const project = payload.project;
  const msg = noticeText(notice);

  if (!project) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
        Project not found.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {msg ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">{msg}</p>
      ) : null}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${statusBadge(project.status)}`}>
            {PROJECT_STATUS_LABELS[project.status]}
          </span>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">{project.title}</h1>
          {project.description ? <p className="mt-2 max-w-2xl text-sm text-[var(--ep-navy-muted)]">{project.description}</p> : null}
          <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
            {project.openTaskCount} open · {project.doneTaskCount} done
            {project.targetEndAt ? ` · target ${new Date(project.targetEndAt).toLocaleDateString()}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["ACTIVE", "ON_HOLD", "COMPLETED"] as const).map((status) => (
            <form key={status} action={updateCampaignProjectStatusAction}>
              <input type="hidden" name="slug" value={project.slug} />
              <input type="hidden" name="status" value={status} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <button
                type="submit"
                className="rounded-full border border-[var(--ep-navy)]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--ep-navy)]"
              >
                Mark {PROJECT_STATUS_LABELS[status].toLowerCase()}
              </button>
            </form>
          ))}
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-4">
        {payload.columns.map((col) => (
          <div key={col.status} className="rounded-xl border border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/40 p-3">
            <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">
              {col.label} ({col.tasks.length})
            </h2>
            <ul className="mt-3 space-y-2">
              {col.tasks.map((task) => (
                <li key={task.id} className="rounded-lg border border-[var(--ep-navy)]/10 bg-white p-3 text-sm">
                  <p className="font-semibold text-[var(--ep-navy)]">{task.title}</p>
                  {task.dueAt ? (
                    <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
                      Due {new Date(task.dueAt).toLocaleDateString()}
                    </p>
                  ) : null}
                  {col.status !== "DONE" ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {col.status === "TODO" ? (
                        <form action={advanceProjectTaskStatusAction}>
                          <input type="hidden" name="taskId" value={task.id} />
                          <input type="hidden" name="status" value="IN_PROGRESS" />
                          <input type="hidden" name="returnTo" value={returnTo} />
                          <button type="submit" className="text-[10px] font-bold uppercase text-[var(--ep-blue)]">
                            Start
                          </button>
                        </form>
                      ) : null}
                      {col.status !== "BLOCKED" ? (
                        <form action={advanceProjectTaskStatusAction}>
                          <input type="hidden" name="taskId" value={task.id} />
                          <input type="hidden" name="status" value="DONE" />
                          <input type="hidden" name="returnTo" value={returnTo} />
                          <button type="submit" className="text-[10px] font-bold uppercase text-emerald-800">
                            Done
                          </button>
                        </form>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-5 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Add task</h2>
        <form action={createProjectTaskAction} className="mt-3 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="projectSlug" value={project.slug} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <label className="block text-sm sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">Title</span>
            <input name="title" required className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">Description</span>
            <input name="description" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <button
            type="submit"
            className="rounded-full bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white sm:col-span-2 sm:w-fit"
          >
            Add task
          </button>
        </form>
      </section>

      {payload.upcomingDue.length > 0 ? (
        <section className="rounded-xl border border-dashed border-[var(--ep-navy)]/20 p-5">
          <h2 className="font-heading text-sm font-bold text-[var(--ep-navy)]">Calendar view — upcoming due dates</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {payload.upcomingDue.map((t) => (
              <li key={t.id} className="flex justify-between gap-3 text-[var(--ep-navy-muted)]">
                <span className="text-[var(--ep-navy)]">{t.title}</span>
                <span className="shrink-0 text-xs">{t.dueAt ? new Date(t.dueAt).toLocaleDateString() : "—"}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
