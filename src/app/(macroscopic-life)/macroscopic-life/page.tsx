import Link from "next/link";

import { ML_BASE } from "@/content/macroscopic-life/catalog";

export default function MacroscopicLifeThresholdPage() {
  return (
    <section className="ml-threshold">
      <p className="ml-kicker">Book One</p>
      <h1 className="ml-display" style={{ fontSize: "clamp(3rem, 9vw, 6.4rem)", margin: "0.6rem 0 1rem" }}>
        Macroscopic Life
      </h1>
      <p style={{ fontFamily: "var(--ml-serif)", fontSize: "1.35rem", maxWidth: "28rem" }}>
        What If We Are the Microbe?
      </p>
      <p className="ml-line" style={{ marginTop: "2rem" }}>
        The microbe is a perspective, not a diagnosis.
      </p>
      <p style={{ color: "var(--ml-mute)", maxWidth: "34rem" }}>
        This book does not assume that a larger organism exists. It asks what evidence could distinguish
        higher-order individuality from an extraordinarily complex organized world.
      </p>
      <Link className="ml-btn" href={`${ML_BASE}/book`}>
        Enter Book One
      </Link>
      <div className="ml-scale" aria-label="Observational scale">
        <span>molecule</span>
        <span>cell</span>
        <span>tissue</span>
        <span>organ</span>
        <span>organism</span>
        <span>network</span>
        <span>civilization</span>
      </div>
    </section>
  );
}
