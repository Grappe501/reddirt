import Link from "next/link";

import { NestedInstrument } from "@/components/macroscopic-life/NestedInstrument";
import { ML_BASE } from "@/content/macroscopic-life/catalog";

export default function MacroscopicLifeThresholdPage() {
  return (
    <section className="ml-threshold">
      <div className="ml-threshold-copy">
        <p className="ml-kicker">Observational instrument · Book One</p>
        <h1 className="ml-display">Macroscopic Life</h1>
        <p className="ml-threshold-sub">What if we are the microbe?</p>
        <p className="ml-line">The microbe is a perspective, not a diagnosis.</p>
        <p className="ml-lede">
          Sixteen chapters. Eighteen figures. Eleven tests that can fail. The book does not ask you
          to believe in a larger organism. It asks what evidence would be allowed to count.
        </p>
        <div className="ml-actions">
          <Link className="ml-btn" href={`${ML_BASE}/book/01-the-microbe`}>
            Open the first window
          </Link>
          <Link className="ml-btn ml-btn-ghost" href={`${ML_BASE}/book`}>
            Enter the atlas
          </Link>
        </div>
        <div className="ml-scale" aria-label="Observational scale, nested not ranked">
          <span>molecule</span>
          <span>cell</span>
          <span>tissue</span>
          <span>organ</span>
          <span data-here="true">organism</span>
          <span>network</span>
          <span>civilization</span>
        </div>
      </div>
      <NestedInstrument />
    </section>
  );
}
