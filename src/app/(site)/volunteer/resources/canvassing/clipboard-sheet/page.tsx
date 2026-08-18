import type { Metadata } from "next";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { CanvassingClipboardSheet } from "@/components/volunteer/canvassing/CanvassingClipboardSheet";
import { CanvassingClipboardPrintActions } from "@/components/volunteer/canvassing/CanvassingClipboardPrintActions";
import { CANVASSING_CLIPBOARD } from "@/content/volunteer/canvassing";
import { pageMeta } from "@/lib/seo/metadata";

type Props = {
  searchParams: Promise<{ print?: string }>;
};

export const metadata: Metadata = pageMeta({
  title: "Canvassing clipboard sheet",
  description: "Printable Kelly Grappe canvassing clipboard tally sheet — five kitchen-table issues.",
  path: "/volunteer/resources/canvassing/clipboard-sheet",
});

export default async function CanvassingClipboardSheetPage({ searchParams }: Props) {
  const { print } = await searchParams;
  const autoPrint = print === "1";

  return (
    <>
      <FullBleedSection padY className="no-print">
        <ContentContainer className="max-w-3xl">
          <nav className="font-body text-sm">
            <Link href="/volunteer/resources/canvassing" className="font-semibold text-kelly-navy hover:underline">
              ← Canvassing training
            </Link>
          </nav>
          <h1 className="mt-4 font-heading text-2xl font-bold text-kelly-ink md:text-3xl">Clipboard sheet</h1>
          <p className="mt-3 max-w-2xl font-body text-base leading-relaxed text-kelly-slate">
            Print this branded tally sheet for doors. Use check marks or hash marks — no names required. Save as PDF from
            your browser print dialog.
          </p>
          <CanvassingClipboardPrintActions downloadFilename={CANVASSING_CLIPBOARD.downloadFilename} />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY className="bg-kelly-fog/40 print:bg-white print:py-0">
        <ContentContainer className="max-w-lg print:max-w-none print:p-0">
          <CanvassingClipboardSheet autoPrint={autoPrint} />
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
