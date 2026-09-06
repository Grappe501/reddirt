import Link from "next/link";

import { ML_BASE, TESTS } from "@/content/macroscopic-life/catalog";

export const metadata = { title: "Eleven Tests" };

const FAMILIES = [
  {
    title: "Does the proposed whole maintain coherent organization?",
    tests: [1, 2, 4, 7],
  },
  {
    title: "Does organization persist and use time?",
    tests: [5, 6],
  },
  {
    title: "Does the whole add explanatory or causal leverage?",
    tests: [8, 9],
  },
  {
    title: "Is the candidate approaching evolutionary individuality?",
    tests: [3, 10],
  },
];

const CLUSTERS = [
  "Cluster A — Boundary Perturbation / Integration Ablation / Repair Autonomy",
  "Cluster B — Conflict Suppression / Reproduction-Heredity",
  "Cluster C — Memory Turnover / Prediction Advantage",
  "Cluster D — Whole-Only Information / Higher-Level Intervention / Model Competition",
  "Cluster E — Energetic Organization",
];

export default function TestsPage() {
  return (
    <div className="ml-page">
      <p className="ml-kicker">Research program</p>
      <h1 className="ml-display" style={{ fontSize: "2.5rem", margin: "0.4rem 0 0.8rem" }}>
        Eleven ways to make the stronger hypothesis risk failure
      </h1>
      <p className="ml-line" style={{ maxWidth: "52rem" }}>
        Current evidence strongly supports macroscopic organization. It does not yet require higher-order individuality.
      </p>
      <p style={{ color: "var(--ml-mute)", maxWidth: "52rem", marginBottom: "1.5rem" }}>
        The Eleven Tests are a proposed synthesis for model comparison in this project. They are not a consensus
        definition of life or biological individuality, and positive results must not be added into an organism score.
        Their job is to make Model D compete against serious lower-level alternatives.
      </p>

      <section className="ml-card" style={{ marginBottom: "2rem" }}>
        <p className="ml-kicker">How to read the framework</p>
        <h2 className="ml-display" style={{ fontSize: "1.55rem", margin: "0.4rem 0 0.8rem" }}>
          Four research questions. Eleven named tests. One governing comparison.
        </h2>
        <div className="ml-grid">
          {FAMILIES.map((family) => (
            <div key={family.title}>
              <strong>{family.title}</strong>
              <p style={{ color: "var(--ml-mute)", marginTop: "0.35rem" }}>
                {family.tests
                  .map((number) => TESTS.find((test) => test.number === number)?.name)
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          ))}
        </div>
        <p className="ml-brake" style={{ marginTop: "1rem" }}>
          Model Competition is always required. These families are pedagogical groupings, not statistically independent evidence buckets.
        </p>
      </section>

      <div className="ml-grid">
        {TESTS.map((test) => (
          <article key={test.number} className="ml-card" id={`test-${test.number}`}>
            <p className="ml-kicker">Test {String(test.number).padStart(2, "0")}</p>
            <h2 className="ml-display" style={{ fontSize: "1.45rem", margin: "0.35rem 0 0.6rem" }}>
              {test.name}
            </h2>
            <p>{test.question}</p>
            <p style={{ color: "var(--ml-mute)", marginTop: "0.6rem" }}>
              <strong>Perturb / measure. </strong>
              {test.perturbation}
            </p>
            <p style={{ marginTop: "0.45rem" }}>
              <strong>Strengthens D. </strong>
              {test.strengthens}
            </p>
            <p style={{ marginTop: "0.45rem" }}>
              <strong>Weakens D. </strong>
              {test.weakens}
            </p>
            <p className="ml-brake">{test.caveat}</p>
          </article>
        ))}
      </div>

      <section className="ml-card" style={{ marginTop: "2rem" }}>
        <p className="ml-kicker">Evidence dependence</p>
        <h2 className="ml-display" style={{ fontSize: "1.55rem", margin: "0.4rem 0 0.8rem" }}>
          Eleven tests are not eleven independent votes.
        </h2>
        {CLUSTERS.map((cluster) => (
          <p key={cluster} style={{ margin: "0.45rem 0" }}>{cluster}</p>
        ))}
        <p className="ml-brake" style={{ marginTop: "1rem" }}>
          Dependent tests may strengthen a mechanistic story without multiplying the evidence as if each were an independent observation.
        </p>
      </section>

      <section className="ml-card" style={{ marginTop: "2rem" }}>
        <p className="ml-kicker">The rule that governs everything</p>
        <h2 className="ml-display" style={{ fontSize: "1.6rem", margin: "0.4rem 0 0.7rem" }}>
          Measure. Perturb. Compare models. Allow failure.
        </h2>
        <p style={{ color: "var(--ml-mute)", maxWidth: "50rem" }}>
          A positive test result does not automatically establish higher-order individuality. The result must survive comparison with the strongest Model A–C explanation available.
        </p>
        <p style={{ marginTop: "1rem" }}>
          <Link className="ml-btn" href={`${ML_BASE}/models`}>
            Return to Models A–D
          </Link>
        </p>
      </section>
    </div>
  );
}
