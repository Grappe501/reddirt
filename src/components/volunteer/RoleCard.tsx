type Props = {
  title: string;
  description: string;
  weeklyTasks: string[];
};

export function RoleCard({ title, description, weeklyTasks }: Props) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] print:break-inside-avoid">
      <h3 className="font-heading text-lg font-bold text-kelly-navy">{title}</h3>
      <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">{description}</p>
      <p className="mt-4 font-body text-xs font-bold uppercase tracking-wide text-kelly-text/55">Weekly tasks</p>
      <ul className="mt-2 list-disc space-y-2 pl-5 font-body text-sm leading-relaxed text-kelly-text/85">
        {weeklyTasks.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
