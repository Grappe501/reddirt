import { ContentContainer } from "@/components/layout/ContentContainer";
import { cn } from "@/lib/utils";

type PrincipleBandProps = {
  title: string;
  intro?: string;
  principles: string[];
  variant?: "success" | "muted" | "subtle";
  className?: string;
  id?: string;
};

const variants = {
  success:
    "bg-kelly-success text-kelly-page dark:bg-kelly-success/90 dark:text-kelly-page dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
  muted: "bg-kelly-muted text-kelly-page dark:bg-kelly-slate/35 dark:text-kelly-fog",
  subtle: "bg-kelly-text/[0.04] text-kelly-text dark:bg-kelly-deep/55 dark:text-kelly-fog",
} as const;

export function PrincipleBand({
  title,
  intro,
  principles,
  variant = "success",
  className,
  id,
}: PrincipleBandProps) {
  const isLightText = variant !== "subtle";

  return (
    <section
      id={id}
      className={cn(
        "relative w-full py-section-y lg:py-section-y-lg",
        variants[variant],
        className,
      )}
    >
      <ContentContainer>
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h2
              className={cn(
                "font-heading text-2xl font-bold tracking-tight sm:text-3xl sm:tracking-tight md:text-4xl",
                isLightText ? "text-kelly-page" : "text-kelly-text",
              )}
            >
              {title}
            </h2>
            {intro ? (
              <p
                className={cn(
                  "mt-3 font-body text-base leading-relaxed sm:mt-4 sm:text-lg",
                  isLightText ? "text-kelly-page/85" : "text-kelly-text/80",
                )}
              >
                {intro}
              </p>
            ) : null}
          </div>
          <ul className="flex flex-col gap-3 sm:gap-4 lg:col-span-7">
            {principles.map((line) => (
              <li
                key={line}
                className={cn(
                  "rounded-card border px-4 py-3.5 font-body text-[0.95rem] leading-relaxed sm:px-5 sm:py-4 sm:text-base md:text-lg",
                  isLightText
                    ? "border-kelly-page/25 bg-kelly-page/10 text-kelly-page dark:border-kelly-page/20 dark:bg-kelly-page/8"
                    : "border-kelly-text/10 bg-kelly-page/60 text-kelly-text dark:border-white/10 dark:bg-kelly-deep/40 dark:text-kelly-fog",
                )}
              >
                {line}
              </li>
            ))}
          </ul>
        </div>
      </ContentContainer>
    </section>
  );
}
