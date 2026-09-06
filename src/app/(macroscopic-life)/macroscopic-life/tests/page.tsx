import { TESTS } from "@/content/macroscopic-life/catalog";

export const metadata = { title: "Eleven Tests" };

export default function TestsPage() {
  return (
    <div className="ml-page">
      <p className="ml-kicker">Research program</p>
      <h1 className="ml-display" style={{ fontSize: "2.5rem", margin: "0.4rem 0 0.8rem" }}>
        Eleven ways to break Macroscopic Life
      </h1>
      <p className="ml-line">
        Current evidence strongly supports macroscopic organization. It does not yet require
        higher-order individuality.
      </p>
      <p style={{ color: "var(--ml-mute)", maxWidth: "38rem", marginBottom: "1.5rem" }}>
        These tests are a proposed synthesis for this project. They are not a consensus definition of
        life. Do not add them into an organism score.
      </p>
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
    </div>
  );
}
