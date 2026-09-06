import { MODELS } from "@/content/macroscopic-life/catalog";

export const metadata = { title: "Models" };

export default function ModelsPage() {
  return (
    <div className="ml-page">
      <p className="ml-kicker">Same observations, four explanations</p>
      <h1 className="ml-display" style={{ fontSize: "2.5rem", margin: "0.4rem 0 1rem" }}>
        Model C is the current result
      </h1>
      <div className="ml-grid">
        {MODELS.map((model) => (
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
          </article>
        ))}
      </div>
    </div>
  );
}
