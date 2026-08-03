import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SLIDES } from "./content";

export function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isPresenter = location.pathname.startsWith("/presenter");
  const index = SLIDES.findIndex((s) => s.path === location.pathname);
  const slideIndex = index >= 0 ? index : -1;
  const isForm = location.pathname.startsWith("/join/") || location.pathname === "/thank-you";

  useEffect(() => {
    if (isForm || isPresenter || slideIndex < 0) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight") navigate(SLIDES[Math.min(SLIDES.length - 1, slideIndex + 1)].path);
      if (e.key === "ArrowLeft") navigate(SLIDES[Math.max(0, slideIndex - 1)].path);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isForm, isPresenter, navigate, slideIndex]);

  return (
    <div className={`app${isPresenter ? " app-presenter" : ""}`}>
      <header className="header">
        <div className="header-inner">
          <div>
            <p className="brand-eyebrow">Kelly Grappe for Secretary of State</p>
            <p className="brand-sub">
              {isPresenter ? "Presenters Board · Kickoff briefing" : "Statewide Volunteer Leadership Kickoff"}
            </p>
          </div>
          <div className="header-actions">
            {isPresenter ? (
              <>
                <Link className="btn btn-ghost" to="/presenter">
                  Board Home
                </Link>
                <Link className="btn btn-ghost hide-sm" to="/org-chart">
                  Org Chart
                </Link>
                <Link className="btn btn-ghost hide-sm" to="/">
                  Audience View
                </Link>
              </>
            ) : (
              <>
                <Link className="btn btn-ghost hide-sm" to="/org-chart">
                  Org Chart
                </Link>
                <Link className="btn btn-ghost hide-sm" to="/presenter">
                  Presenters
                </Link>
                <button type="button" className="btn btn-ghost" onClick={() => setMenuOpen((v) => !v)}>
                  Menu
                </button>
                <Link className="btn btn-gold" to="/join">
                  Volunteer Now
                </Link>
              </>
            )}
          </div>
        </div>
        {menuOpen && !isPresenter ? (
          <nav className="menu" aria-label="Sections">
            <div className="menu-grid">
              {SLIDES.map((slide, i) => (
                <Link
                  key={slide.id}
                  to={slide.path}
                  className={slideIndex === i ? "active" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{i + 1}</span>
                  <span>{slide.navLabel}</span>
                </Link>
              ))}
              <Link to="/org-chart" onClick={() => setMenuOpen(false)}>
                <span>◎</span>
                <span>Org Chart</span>
              </Link>
              <Link to="/presenter" onClick={() => setMenuOpen(false)}>
                <span>★</span>
                <span>Presenters Board</span>
              </Link>
            </div>
          </nav>
        ) : null}
      </header>

      <main className="main">
        <Outlet />
      </main>

      {!isForm && !isPresenter ? (
        <footer className="footer-nav">
          <div className="footer-inner">
            <button
              type="button"
              className="btn btn-outline"
              disabled={slideIndex <= 0}
              onClick={() => slideIndex > 0 && navigate(SLIDES[slideIndex - 1].path)}
            >
              Back
            </button>
            <div className="progress">
              <p>{slideIndex >= 0 ? `${slideIndex + 1} of ${SLIDES.length}` : "Sign up"}</p>
              <div className="bar">
                <span
                  style={{
                    width: `${slideIndex >= 0 ? ((slideIndex + 1) / SLIDES.length) * 100 : 100}%`,
                  }}
                />
              </div>
            </div>
            <Link className="btn btn-navy hide-sm" to="/join">
              Volunteer Now
            </Link>
            <button
              type="button"
              className="btn btn-gold"
              disabled={slideIndex >= SLIDES.length - 1 || slideIndex < 0}
              onClick={() =>
                slideIndex >= 0 &&
                slideIndex < SLIDES.length - 1 &&
                navigate(SLIDES[slideIndex + 1].path)
              }
            >
              Next
            </button>
          </div>
        </footer>
      ) : isForm ? (
        <footer className="footer-nav">
          <div className="footer-inner">
            <Link to="/join">← Back to choices</Link>
            <Link to="/">Return to presentation</Link>
          </div>
        </footer>
      ) : null}
    </div>
  );
}

export function SlideFrame({
  eyebrow,
  title,
  speaker,
  children,
}: {
  eyebrow?: string;
  title: string;
  speaker?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="slide">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {speaker ? (
        <p className="speaker">
          Speaker: <strong>{speaker}</strong>
        </p>
      ) : null}
      <div className="slide-body">{children}</div>
    </article>
  );
}
