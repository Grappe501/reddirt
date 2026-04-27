import { cn } from "@/lib/utils";

export type ProcessStepItem = {
  step: number | string;
  title: string;
  description: string;
};

type ProcessStepsProps = {
  steps: ProcessStepItem[];
  className?: string;
  id?: string;
};

export function ProcessSteps({ steps, className, id }: ProcessStepsProps) {
  return (
    <ol
      id={id}
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5 xl:gap-5",
        className,
      )}
    >
      {steps.map((s) => (
        <li
          key={`${s.step}-${s.title}`}
          className="relative flex flex-col gap-4 rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)]"
        >
          <span
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-kelly-gold font-heading text-base font-bold text-kelly-navy"
            aria-hidden
          >
            {s.step}
          </span>
          <div>
            <h3 className="font-heading text-lg font-bold text-kelly-text lg:text-xl">{s.title}</h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/75 lg:text-base">
              {s.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
