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
      <h1 className="ml-display ml-page-title">Eleven ways to break it</h1>
      <p className="ml-line">
        Current evidence strongly supports macroscopic organization. It does not yet require
        higher-order individuality.
      </p>
      <p className="ml-lede">
        The Eleven Tests are a proposed synthesis for model comparison in this project. They are not a
        consensus definition of life. There is no organism score. Test 11 is always required.
      </p>
      <section className="ml-card" style={{ marginBottom: "2rem" }}>
        <p className="ml-kicker">How to read the framework</p>
        <h2 className="ml-display ml-card-title">
          Four research questions. Eleven named tests. One governing comparison.
        </h2>
        <div className="ml-grid">
          {FAMILIES.map((family) => (
            <div key={family.title}>
              <strong>{family.title}</strong>
              <p className="ml-lede" style={{ margin: "0.35rem 0 0" }}>
                {family.tests
                  .map((number) => TESTS.find((test) => test.number === number)?.name)
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          ))}
        </div>
        <p className="ml-brake" style={{ marginTop: "1rem" }}>
          Model Competition is always required. These families are pedagogical groupings, not statistically
          independent evidence buckets.
        </p>
      </section>
      <div className="ml-lab">
        {TESTS.map((test) => (
          <article key={test.number} id={`test-${test.number}`} data-required={test.number === 11 ? "true" : "false"}>
            <p className="ml-kicker">
              Test {String(test.number).padStart(2, "0")}
              {test.number === 11 ? " · always required" : ""}
            </p>
            <h2 className="ml-display ml-card-title">{test.name}</h2>
            <p className="ml-question">{test.question}</p>
            <p className="ml-brake">
              <strong>Perturb. </strong>
              {test.perturbation}
            </p>
            <div className="ml-verdict">
              <div className="ml-plus">
                <p className="ml-kicker">Strengthens D</p>
                <p>{test.strengthens}</p>
              </div>
              <div className="ml-minus">
                <p className="ml-kicker">Weakens D</p>
                <p>{test.weakens}</p>
              </div>
            </div>
            <p className="ml-brake">{test.caveat}</p>
          </article>
        ))}
      </div>
      <section className="ml-card" style={{ marginTop: "2rem" }}>
        <p className="ml-kicker">Evidence dependence</p>
        <h2 className="ml-display ml-card-title">Eleven tests are not eleven independent votes.</h2>
        {CLUSTERS.map((cluster) => (
          <p key={cluster} style={{ margin: "0.45rem 0" }}>{cluster}</p>
        ))}
        <p className="ml-brake" style={{ marginTop: "1rem" }}>
          Dependent tests may strengthen a mechanistic story without multiplying the evidence as if each
          were an independent observation.
        </p>
      </section>
      <section className="ml-card" style={{ marginTop: "2rem" }}>
        <p className="ml-kicker">The rule that governs everything</p>
        <h2 className="ml-display ml-card-title">Measure. Perturb. Compare models. Allow failure.</h2>
        <p className="ml-lede">
          A positive test result does not automatically establish higher-order individuality. The result must
          survive comparison with the strongest Model A–C explanation available.
        </p>
        <p>
          <Link className="ml-btn" href={`${ML_BASE}/models`}>
            Return to Models A–D
          </Link>
        </p>
      </section>
    </div>
  );
}
