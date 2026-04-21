"use client";

import { cn } from "@/lib/utils";

export function FormErrorSummary({ errors }: { errors: Record<string, string> }) {
  const keys = Object.keys(errors);
  if (!keys.length) return null;
  return (
    <div
      role="alert"
      className="rounded-card border border-red-dirt/35 bg-red-dirt/10 p-4 font-body text-sm text-deep-soil"
    >
      <p className="font-semibold">Please fix the highlighted fields.</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {keys.map((k) => (
          <li key={k}>
            <span className="font-medium">{k}:</span> {errors[k]}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FormSuccessPanel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-field-green/35 bg-field-green/10 p-8 shadow-[var(--shadow-soft)] transition duration-slow",
        className,
      )}
    >
      <h3 className="font-heading text-2xl font-bold text-deep-soil">{title}</h3>
      <div className="mt-4 space-y-3 font-body text-base leading-relaxed text-deep-soil/80">{children}</div>
    </div>
  );
}
