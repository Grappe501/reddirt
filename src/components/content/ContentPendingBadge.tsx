import type { PublicContentClass } from "@/content/website/content-integrity";
import { CONTENT_PENDING } from "@/content/website/content-integrity";

/**
 * Editorial workflow labels — never render on the public site.
 * Call sites stay stable; operators use Evidence Workbench / internal docs instead.
 */
export function ContentPendingBadge(_props: {
  variant?: "pending" | "source" | "draft";
  className?: string;
}) {
  return null;
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
