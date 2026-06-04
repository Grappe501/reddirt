import { loadKellyAdversarialMirror } from "@/lib/intelligence/kellyAdversarialMirror";
import { hasKellyMirrorAccess, isKellyMirrorConfigured } from "@/lib/admin/kelly-mirror-gate";
import { KellyMirrorGateForm } from "@/components/admin/intelligence/kelly-mirror/KellyMirrorGateForm";
import { KellyMirrorClient } from "@/components/admin/intelligence/kelly-mirror/KellyMirrorClient";
import { V4BackLinks } from "@/components/admin/intelligence/v4/V4PageHeader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Internal reference",
};

export default async function KellyMirrorPage() {
  const mirror = loadKellyAdversarialMirror();
  const configured = isKellyMirrorConfigured();
  const unlocked = await hasKellyMirrorAccess();

  return (
    <div className="mx-auto max-w-5xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Candidate mirror · not in nav</p>
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Adversarial mirror — defensive prep</h1>
        <p className="mt-2 max-w-3xl text-sm text-kelly-muted">
          How Hammer and Packo would try to knock you out — and how you answer. Staff admin login does not unlock this
          page.
        </p>
        <div className="mt-3">
          <V4BackLinks />
        </div>
      </header>

      {!mirror ? (
        <p className="text-rose-900">Mirror data file missing.</p>
      ) : !configured ? (
        <article className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Set <code>KELLY_MIRROR_PASSPHRASE</code> in environment variables (Netlify) to enable the secondary gate.
        </article>
      ) : !unlocked ? (
        <KellyMirrorGateForm />
      ) : (
        <KellyMirrorClient mirror={mirror} />
      )}
    </div>
  );
}
