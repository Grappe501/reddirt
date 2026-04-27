"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/blocks/SectionHeading";

type FormSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormSection({ title, description, children, className }: FormSectionProps) {
  const headingId = useId();

  return (
    <section
      className={cn(
        "rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] md:p-8",
        className,
      )}
      aria-labelledby={headingId}
    >
      <SectionHeading
        as="h2"
        title={title}
        subtitle={description}
        align="left"
        className="mb-6"
        id={headingId}
      />
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
