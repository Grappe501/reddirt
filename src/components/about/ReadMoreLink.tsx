import Link from "next/link";
import { cn } from "@/lib/utils";

const readMoreClass =
  "ml-0.5 inline text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#b87333] no-underline decoration-transparent hover:text-[#9a6129] hover:underline";

type Props = { href: string; className?: string };

/**
 * Two-word “READ MORE” — very small, copper — once per section (link to the long chapter).
 */
export function ReadMoreLink({ href, className }: Props) {
  return (
    <Link href={href} className={cn(readMoreClass, className)}>
      READ MORE
    </Link>
  );
}
