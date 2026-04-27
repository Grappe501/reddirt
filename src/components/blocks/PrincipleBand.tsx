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
  success: "bg-kelly-success text-kelly-page",
  muted: "bg-kelly-muted text-kelly-page",
  subtle: "bg-kelly-text/[0.04] text-kelly-text",
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
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h2
              className={cn(
                "font-heading text-3xl font-bold tracking-tight sm:text-4xl",
                isLightText ? "text-kelly-page" : "text-kelly-text",
              )}
            >
              {title}
            </h2>
            {intro ? (
              <p
                className={cn(
                  "mt-4 font-body text-lg leading-relaxed",
                  isLightText ? "text-kelly-page/85" : "text-kelly-text/80",
                )}
              >
                {intro}
              </p>
            ) : null}
          </div>
          <ul className="flex flex-col gap-4 lg:col-span-7">
            {principles.map((line) => (
              <li
                key={line}
                className={cn(
                  "rounded-card border px-5 py-4 font-body text-base leading-relaxed md:text-lg",
                  isLightText
                    ? "border-kelly-page/25 bg-kelly-page/10 text-kelly-page"
                    : "border-kelly-text/10 bg-kelly-page/60 text-kelly-text",
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
