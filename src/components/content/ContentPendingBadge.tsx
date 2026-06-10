import { cn } from "@/lib/utils";
import type { PublicContentClass } from "@/content/website/content-integrity";
import { CONTENT_PENDING, DRAFT_SECTION, SOURCE_NEEDED } from "@/content/website/content-integrity";

const LABEL: Record<"pending" | "source" | "draft", string> = {
  pending: CONTENT_PENDING,
  source: SOURCE_NEEDED,
  draft: DRAFT_SECTION,
};

type Variant = keyof typeof LABEL;

export function ContentPendingBadge({
  variant = "pending",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border border-amber-700/25 bg-amber-50 px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-amber-950",
        className,
      )}
    >
      {LABEL[variant]}
    </span>
  );
}

export function contentClassLabel(c: PublicContentClass): string {
  switch (c) {
    case "real_sourced":
      return "Real sourced campaign content";
    case "generic_civic":
      return "Generic civic explanation";
    case "placeholder_pending":
      return CONTENT_PENDING;
    case "removed":
      return "Removed — unsupported claim";
    default:
      return c;
  }
}
