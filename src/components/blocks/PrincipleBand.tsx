import { ContentContainer } from "@/components/layout/ContentContainer";
import { cn } from "@/lib/utils";

type PrincipleBandProps = {
  title: string;
  intro?: string;
  principles: string[];
  variant?: "green" | "denim" | "subtle";
  className?: string;
  id?: string;
};

const variants = {
  green: "bg-field-green text-cream-canvas",
  denim: "bg-washed-denim text-cream-canvas",
  subtle: "bg-deep-soil/[0.04] text-deep-soil",
} as const;

export function PrincipleBand({
  title,
  intro,
  principles,
  variant = "green",
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
                isLightText ? "text-cream-canvas" : "text-deep-soil",
              )}
            >
              {title}
            </h2>
            {intro ? (
              <p
                className={cn(
                  "mt-4 font-body text-lg leading-relaxed",
                  isLightText ? "text-cream-canvas/85" : "text-deep-soil/80",
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
                    ? "border-cream-canvas/25 bg-cream-canvas/10 text-cream-canvas"
                    : "border-deep-soil/10 bg-cream-canvas/60 text-deep-soil",
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
