import { TESTS } from "@/content/macroscopic-life/catalog";

export const metadata = { title: "Eleven Tests" };

export default function TestsPage() {
  return (
    <div className="ml-page">
      <p className="ml-kicker">Falsification lab</p>
      <h1 className="ml-display ml-page-title">Eleven ways to break it</h1>
      <p className="ml-line">
        Current evidence strongly supports macroscopic organization. It does not yet require
        higher-order individuality.
      </p>
      <p className="ml-lede">
        A proposed synthesis for this project — not a consensus definition of life. There is no
        organism score. Test 11 is always required.
      </p>
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
    </div>
  );
}
