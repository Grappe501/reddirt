import Link from "next/link";
import { notFound } from "next/navigation";
import { MovementPhilosophyDocPanel } from "@/components/admin/intelligence/movement-philosophy/MovementPhilosophyDocPanel";
import { MovementPhilosophyMarkdownArticle } from "@/components/admin/intelligence/movement-philosophy/MovementPhilosophyMarkdownArticle";
import { Phase11P2UpgradePassPanel } from "@/components/admin/intelligence/Phase11P2UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { loadMovementPhilosophyMarkdown } from "@/lib/philosophy/load-movement-philosophy-md";
import { findMovementPhilosophyEntry, movementPhilosophyDocHref } from "@/lib/philosophy/movement-philosophy-nav";
import { getMovementPhilosophyDocOverlay } from "@/lib/intelligence/v4/phase11P2MovementPhilosophyDepth";
import {
  computePhase11P2UpgradePass,
  listMovementPhilosophyDocSurfaces,
} from "@/lib/intelligence/v4/phase11P2Closure";

type Props = {
  params: Promise<{ path?: string[] }>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function MovementPhilosophyHub() {
  const report = computePhase11P2UpgradePass();
  const docs = listMovementPhilosophyDocSurfaces();

  return (
    <>
      <V4PageHeader
        eyebrow="Intelligence · Phase 11 P2"
        title="Movement philosophy — document command"
        description="Public philosophy corpus from docs/philosophy plus VOL-CORE-1 volunteer foundation — debate application and volunteer system overlays on every document."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/staff-strategy-command"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Staff strategy command
        </Link>
        <Link
          href="/admin/intelligence/phase-11-p2-upgrade"
          className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          P2 upgrade pass
        </Link>
      </V4PageHeader>

      <Phase11P2UpgradePassPanel report={report} compact />

      <section className="mb-8 rounded-xl border border-kelly-navy/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Document inventory</h2>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {docs.map((doc) => (
            <li key={doc.pathKey} className="rounded-lg border border-kelly-text/10 px-3 py-2 text-sm">
              <Link href={doc.href} className="font-semibold text-kelly-navy underline">
                {doc.title}
              </Link>
              <p className="mt-0.5 text-[10px] text-kelly-muted">
                {doc.phase11P2Enriched ? "P2 enriched" : "needs overlay"} · {doc.sourceFile}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default async function MovementPhilosophyCatchAllPage({ params }: Props) {
  const { path } = await params;

  if (!path || path.length === 0) {
    return <MovementPhilosophyHub />;
  }

  const pathKey = path.join("/");
  if (!findMovementPhilosophyEntry(pathKey)) notFound();

  const overlay = getMovementPhilosophyDocOverlay(pathKey);
  const loaded = await loadMovementPhilosophyMarkdown(pathKey);

  if (loaded.kind === "doc") {
    return (
      <>
        <MovementPhilosophyDocPanel overlay={overlay} />
        <MovementPhilosophyMarkdownArticle
          pathKey={pathKey}
          markdown={loaded.markdown}
          sourceFile={loaded.sourceFile}
        />
      </>
    );
  }

  notFound();
}
