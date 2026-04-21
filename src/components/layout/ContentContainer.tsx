import { cn } from "@/lib/utils";

type ContentContainerProps = {
  children: React.ReactNode;
  className?: string;
  /** Wider measure for cinematic layouts */
  wide?: boolean;
};

export function ContentContainer({ children, className, wide }: ContentContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-content px-[var(--gutter-x)]",
        wide && "max-w-[min(100%,1440px)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
