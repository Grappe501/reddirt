import Link from "next/link";

import { ML_BASE, MODELS } from "@/content/macroscopic-life/catalog";

export const metadata = { title: "Models A–D" };

const MODEL_NOTES: Record<string, { burden: string; status: string; move: string }> = {
  A: {
    burden: "Can capable components plus a shared environment explain the observed pattern?",
    status: "Often sufficient for local behavior and loose large-scale pattern.",
    move: "Move upward only when organization-dependent variables add reproducible explanatory or predictive value.",
  },
  B: {
    burden: "Does coordination among components explain more than independent action?",
    status: "Strong for institutions, teams, standards, markets, and many bounded cooperative systems.",
    move: "Move upward only when the capability depends on distributed system relationships, not merely coordination among already-capable agents.",
  },
  C: {
    burden: "Do relational variables create real system-level capability without requiring one new individual?",
    status: "Current best model for civilization in Book One.",
    move: "Model D must earn something Model C cannot already explain.",
  },
  D: {
    burden: "Is there enough boundary, integration, conflict control, persistence, causal organization, repair, and heredity to justify a new individual?",
    status: "Not established on the evidence reviewed in Book One.",
    move: "Requires prospectively specified evidence that survives the Eleven Tests and Model Competition.",
  },
};

export default function ModelsPage() {
  return (
    <div className="ml-page">
      <p className="ml-kicker">Model competition</p>
      <h1 className="ml-display" style={{ fontSize: "2.5rem", margin: "0.4rem 0 0.7rem" }}>
        Same observations. Four explanations.
      </h1>
      <p className="ml-line" style={{ maxWidth: "50rem" }}>
        Model D does not win by remaining possible. It must outperform the strongest lower-level explanation.
      </p>
      <p style={{ color: "var(--ml-mute)", maxWidth: "50rem", marginBottom: "1.6rem" }}>
        Book One currently places civilization in <strong>Model C</strong>: distributed technical-social macroscopic
        organization. That is a positive scientific result, not a failed attempt to reach Model D.
      </p>

      <div className="ml-grid">
        {MODELS.map((model) => {
          const note = MODEL_NOTES[model.id];
          return (
            <article
              key={model.id}
              className="ml-card"
              style={model.id === "C" ? { borderColor: "var(--ml-model)" } : undefined}
            >
              <p className="ml-kicker">Model {model.id}</p>
              <h2 className="ml-display" style={{ fontSize: "1.5rem", margin: "0.35rem 0 0.6rem" }}>
                {model.name}
              </h2>
              <p>{model.body}</p>
              <p style={{ marginTop: "0.8rem" }}>
                <strong>Burden. </strong>{note?.burden}
              </p>
              <p style={{ color: "var(--ml-mute)", marginTop: "0.55rem" }}>
                <strong>Status. </strong>{note?.status}
              </p>
              <p className="ml-brake">{note?.move}</p>
            </article>
          );
        })}
      </div>

      <section className="ml-card" style={{ marginTop: "2rem" }}>
        <p className="ml-kicker">Current verdict</p>
        <h2 className="ml-display" style={{ fontSize: "1.6rem", margin: "0.4rem 0 0.7rem" }}>
          Current winner: Model C.
        </h2>
        <p style={{ maxWidth: "52rem" }}>
          Civilization is an unusually integrated macroscopic organization and cognitive ecology. Whether it is
          moving toward a new level of individuality remains an open question.
        </p>
        <p style={{ color: "var(--ml-mute)", maxWidth: "52rem", marginTop: "0.75rem" }}>
          The next scientific question is not whether Model D is imaginable. It is what future evidence would force
          us to leave Model C.
        </p>
        <p style={{ marginTop: "1rem" }}>
          <Link className="ml-btn" href={`${ML_BASE}/tests`}>
            Put the models through the Eleven Tests
          </Link>
        </p>
      </section>
    </div>
  );
}
