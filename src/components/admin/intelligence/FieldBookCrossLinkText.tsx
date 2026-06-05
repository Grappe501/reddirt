import Link from "next/link";
import { parseFieldBookCrossLinks } from "@/lib/intelligence/fieldBookRegistry";

export function FieldBookCrossLinkText({ text }: { text: string }) {
  const parts = parseFieldBookCrossLinks(text);
  return (
    <>
      {parts.map((part, i) =>
        part.type === "link" && part.slug ? (
          <Link
            key={`${part.slug}-${i}`}
            href={`/admin/intelligence/field-book/${part.slug}`}
            className="font-semibold text-kelly-navy underline decoration-kelly-gold/60 underline-offset-2 hover:text-violet-950"
          >
            {part.value}
          </Link>
        ) : (
          <span key={i}>{part.value}</span>
        ),
      )}
    </>
  );
}
