import Link from "next/link";
import { DebateGlossaryIndex } from "@/components/admin/intelligence/DebateGlossaryIndex";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { FIELD_BOOK_HUB_HREF } from "@/lib/intelligence/fieldBookRegistry";
import { DEBATE_GLOSSARY_TERMS } from "@/lib/intelligence/v4/debateGlossaryRegistry";

export const dynamic = "force-dynamic";

export default function FieldBookGlossaryPage() {
  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="The Field Book · Reference"
        title="Debate glossary"
        description={`${DEBATE_GLOSSARY_TERMS.length} intelligence workbench terms — plain English definitions with Field Book and route links.`}
      >
        <V4BackLinks />
        <Link
          href={`${FIELD_BOOK_HUB_HREF}/debate-glossary`}
          className="rounded-full border border-kelly-gold/60 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Encyclopedia article
        </Link>
        <Link
          href="/admin/intelligence/phase-5-upgrade"
          className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Phase 5 upgrade
        </Link>
      </V4PageHeader>

      <DebateGlossaryIndex />
    </div>
  );
}
