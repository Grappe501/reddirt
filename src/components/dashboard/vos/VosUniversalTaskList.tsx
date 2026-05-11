import type { Task } from "@/types/dashboard";

function TaskItem({ task, subtitle }: { task: Task; subtitle?: string }) {
  return (
    <li className="rounded-xl border border-kelly-text/10 bg-white/90 px-4 py-3">
      <p className="font-body text-sm font-semibold text-kelly-deep">{task.title}</p>
      {task.description ? (
        <p className="mt-1 font-body text-xs leading-relaxed text-kelly-text/75">{task.description}</p>
      ) : null}
      {subtitle ? <p className="mt-1 font-body text-[11px] text-kelly-text/55">{subtitle}</p> : null}
    </li>
  );
}

export function VosUniversalTaskList({ title, tasks, cadenceLabel }: { title: string; tasks: Task[]; cadenceLabel: string }) {
  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-kelly-text/[0.02] p-6 md:p-8">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">{cadenceLabel}</p>
      <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">{title}</h3>
      <ul className="mt-4 space-y-3">
        {tasks.map((t) => (
          <TaskItem key={t.id} task={t} />
        ))}
      </ul>
    </section>
  );
}
