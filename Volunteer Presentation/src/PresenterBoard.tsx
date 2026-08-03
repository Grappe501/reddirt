import { Link, useParams } from "react-router-dom";
import {
  DRILL_DOWNS,
  getDrillDown,
  getPresenterBrief,
  PRESENTER_NAV,
  PRESENTER_SLIDES,
  presenterSlideIndex,
} from "./presenterContent";
import { SLIDES } from "./content";

function BlockList({ heading, bullets }: { heading: string; bullets: string[] }) {
  return (
    <section className="p-block">
      <h3>{heading}</h3>
      <ul>
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </section>
  );
}

export function PresenterHub() {
  return (
    <div className="presenter">
      <header className="presenter-hero">
        <p className="eyebrow">Private · Presenters only</p>
        <h1>Presenters Board</h1>
        <p className="lead">
          Color-analyst notes for the Statewide Volunteer Leadership Kickoff. Same path the audience walks—denser
          briefing for the people speaking. This board is link-only (not listed in the public menu). Use the meeting
          clock at the top — Start when Zoom begins.
        </p>
        <div className="cta-row">
          <Link className="btn btn-gold" to="/presenter/welcome">
            Start at Welcome
          </Link>
          <Link className="btn btn-navy" to="/org-chart">
            Org Chart
          </Link>
          <Link className="btn btn-outline" to="/">
            Open audience view
          </Link>
        </div>
      </header>

      <section className="p-section">
        <h2>How to use this board</h2>
        <div className="grid grid-3">
          <div className="card">
            <h3>1. Mirror the deck</h3>
            <p>Each page matches an audience slide. Keep that tab open on Zoom; keep this board on a second screen or phone.</p>
          </div>
          <div className="card">
            <h3>2. Speak from blocks</h3>
            <p>Why you’re here · Why it matters · Campaign fit · Talking points · Lines to land · Asks · Watch-outs.</p>
          </div>
          <div className="card">
            <h3>3. Drill when you need depth</h3>
            <p>Rally planning, Operation Arkansas, Youth, teams, elections—deep pages without derailing the live hour.</p>
          </div>
        </div>
      </section>

      <section className="p-section">
        <h2>Presentation path</h2>
        <div className="presenter-path">
          {PRESENTER_NAV.map((item, i) => (
            <Link key={item.id} className="presenter-path-card" to={item.path}>
              <span className="num">{i + 1}</span>
              <span>
                <strong>{item.label}</strong>
                <em>{item.speaker}</em>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="p-section">
        <h2>Deep drill-downs</h2>
        <div className="grid grid-2">
          {DRILL_DOWNS.map((d) => (
            <Link key={d.id} className="card drill-card" to={`/presenter/drill/${d.id}`}>
              <h3>{d.title}</h3>
              <p>{d.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="p-section">
        <h2>By speaker</h2>
        <div className="grid grid-2">
          {[
            { name: "Steve", ids: ["welcome", "why", "strategy", "events", "campaign", "strike-team", "calendar"] },
            { name: "Kelly", ids: ["vision", "elections", "join"] },
            { name: "Chance Bradford", ids: ["youth"] },
            { name: "Carol Egan", ids: ["local"] },
          ].map((group) => (
            <div className="card" key={group.name}>
              <h3>{group.name}</h3>
              <ul className="link-list">
                {group.ids.map((id) => {
                  const slide = SLIDES.find((s) => s.id === id);
                  return (
                    <li key={id}>
                      <Link to={`/presenter/${id}`}>{slide?.navLabel ?? id}</Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function PresenterSlidePage() {
  const { slideId = "welcome" } = useParams();
  const brief = getPresenterBrief(slideId);
  const idx = presenterSlideIndex(slideId);
  const prev = idx > 0 ? PRESENTER_SLIDES[idx - 1] : null;
  const next = idx >= 0 && idx < PRESENTER_SLIDES.length - 1 ? PRESENTER_SLIDES[idx + 1] : null;

  if (!brief) {
    return (
      <div className="presenter">
        <p>Presenter notes not found.</p>
        <Link to="/presenter">Back to Presenters Board</Link>
      </div>
    );
  }

  const audienceSlide = SLIDES.find((s) => s.id === brief.slideId);

  return (
    <div className="presenter">
      <div className="presenter-toolbar">
        <Link to="/presenter">← Board home</Link>
        <span>
          {idx + 1} / {PRESENTER_SLIDES.length}
        </span>
        <Link to={brief.audiencePath} target="_blank" rel="noreferrer">
          Audience slide ↗
        </Link>
      </div>

      <header className="presenter-slide-head">
        <p className="eyebrow">
          Presenter notes · {brief.timeBox} · {brief.speaker}
        </p>
        <h1>{audienceSlide?.title ?? brief.slideId}</h1>
        <p className="speaker-line">Speaker: {brief.speaker}</p>
      </header>

      <div className="presenter-grid">
        <aside className="presenter-rail">
          <div className="card accent">
            <h3>Audience sees</h3>
            <ul>
              {brief.audienceSees.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <Link className="btn btn-outline" style={{ marginTop: "0.75rem" }} to={brief.audiencePath}>
              Open audience page
            </Link>
          </div>
          <div className="card">
            <h3>Open with</h3>
            <ul>
              {brief.openWith.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3>Lines to land</h3>
            <ul className="lines">
              {brief.linesToLand.map((a) => (
                <li key={a}>“{a}”</li>
              ))}
            </ul>
          </div>
          {brief.drillDownIds.length ? (
            <div className="card">
              <h3>Drill deeper</h3>
              <ul className="link-list">
                {brief.drillDownIds.map((id) => {
                  const d = getDrillDown(id);
                  return (
                    <li key={id}>
                      <Link to={`/presenter/drill/${id}`}>{d?.title ?? id}</Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </aside>

        <div className="presenter-main">
          <div className="p-callout">
            <h3>Why you are presenting</h3>
            <p>{brief.whyYouAreHere}</p>
          </div>
          <div className="p-callout gold">
            <h3>Why it matters</h3>
            <p>{brief.whyItMatters}</p>
          </div>
          <div className="p-callout">
            <h3>How it fits the campaign</h3>
            <p>{brief.campaignFit}</p>
          </div>

          {brief.talkingPoints.map((block) => (
            <BlockList key={block.heading} heading={block.heading} bullets={block.bullets} />
          ))}

          <BlockList heading="Asks on this slide" bullets={brief.asks} />
          <BlockList heading="Watch-outs" bullets={brief.watchOuts} />
        </div>
      </div>

      <nav className="presenter-pager">
        {prev ? (
          <Link className="btn btn-outline" to={`/presenter/${prev.slideId}`}>
            ← {SLIDES.find((s) => s.id === prev.slideId)?.navLabel}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="btn btn-gold" to={`/presenter/${next.slideId}`}>
            {SLIDES.find((s) => s.id === next.slideId)?.navLabel} →
          </Link>
        ) : (
          <Link className="btn btn-gold" to="/presenter">
            Back to board
          </Link>
        )}
      </nav>
    </div>
  );
}

export function PresenterDrillPage() {
  const { drillId = "" } = useParams();
  const drill = getDrillDown(drillId);
  if (!drill) {
    return (
      <div className="presenter">
        <p>Drill-down not found.</p>
        <Link to="/presenter">Back to Presenters Board</Link>
      </div>
    );
  }

  return (
    <div className="presenter">
      <div className="presenter-toolbar">
        <Link to="/presenter">← Board home</Link>
        <span>Deep dive</span>
        <Link to="/presenter/welcome">Slide notes</Link>
      </div>
      <header className="presenter-slide-head">
        <p className="eyebrow">Drill-down</p>
        <h1>{drill.title}</h1>
        <p className="lead">{drill.subtitle}</p>
      </header>
      <div className="presenter-main" style={{ maxWidth: "48rem" }}>
        {drill.sections.map((s) => (
          <BlockList key={s.heading} heading={s.heading} bullets={s.bullets} />
        ))}
        <div className="card">
          <h3>Related presentation slides</h3>
          <ul className="link-list">
            {drill.relatedSlideIds.map((id) => (
              <li key={id}>
                <Link to={`/presenter/${id}`}>{SLIDES.find((s) => s.id === id)?.navLabel ?? id}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
