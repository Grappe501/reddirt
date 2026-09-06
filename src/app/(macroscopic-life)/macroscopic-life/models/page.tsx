import { MODELS } from "@/content/macroscopic-life/catalog";

export const metadata = { title: "Models" };

export default function ModelsPage() {
  return (
    <div className="ml-page">
      <p className="ml-kicker">Same observations. Four explanations.</p>
      <h1 className="ml-display ml-page-title">Model C holds the lock</h1>
      <p className="ml-lede">
        The book does not pick a favorite story. It keeps four models in the same frame and lets
        the Eleven Tests decide. Model D is still allowed to win later. It has not won yet.
      </p>
      <div className="ml-models">
        {MODELS.map((model) => (
          <article key={model.id} className="ml-card" data-current={model.id === "C" ? "true" : "false"}>
            <p className="ml-kicker">
              Model {model.id}
              {model.id === "C" ? " · current result" : ""}
            </p>
            <h2 className="ml-display ml-card-title">{model.name}</h2>
            <p>{model.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
