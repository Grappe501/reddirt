import { cn } from "@/lib/utils";

type ResponsiveGridProps = {
  children: React.ReactNode;
  className?: string;
  /** Default: 1 col mobile, 2 md, 3 xl — adjust with className */
  cols?: "2" | "3" | "4";
};

const colMap = {
  "2": "md:grid-cols-2",
  "3": "md:grid-cols-2 xl:grid-cols-3",
  "4": "sm:grid-cols-2 xl:grid-cols-4",
} as const;

export function ResponsiveGrid({ children, className, cols = "3" }: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:gap-10",
        colMap[cols],
        className,
      )}
    >
      {children}
    </div>
  );
}
