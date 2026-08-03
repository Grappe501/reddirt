import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CAMPAIGN_TEAMS, COUNTIES, LOCAL_ROLES, RALLY } from "./content";
import { SlideFrame } from "./Shell";

type Pathway = "local" | "campaign" | "youth" | "match";

export function Welcome() {
  return (
    <SlideFrame eyebrow="Statewide Volunteer Leadership Kickoff" title="75 Counties. One Arkansas. One Team." speaker="Steve">
      <p className="lead">
        Kelly and Steve have spent the last nine months building trust, traveling the state, and listening to Arkansans.
        Tonight, we begin the next phase.
      </p>
      <div className="hero-navy">
        <p className="eyebrow">Tonight’s purpose</p>
        <p>
          Tonight isn’t about listening to another campaign meeting. Tonight is about building the team that’s going to
          take this campaign into every corner of Arkansas.
        </p>
      </div>
      <div className="grid grid-3">
        <div className="card"><h3>Organize 75 counties</h3><p>Build a grassroots presence before Labor Day.</p></div>
        <div className="card"><h3>Launch the tour</h3><p>Start the statewide community tour after Labor Day.</p></div>
        <div className="card accent"><h3>Fill {RALLY.goal} seats on Sept 17</h3><p>{RALLY.title} GOTV kickoff with {RALLY.artist}.</p></div>
      </div>
      <div className="cta-row">
        <Link className="btn btn-gold" to="/why">Begin the Presentation</Link>
        <Link className="btn btn-navy" to="/join">Volunteer Now</Link>
        <Link className="btn btn-outline" to="/org-chart">Org Chart</Link>
      </div>
    </SlideFrame>
  );
}

export function Why() {
  return (
    <SlideFrame eyebrow="Why we are here" title="The Campaign Has Reached a Turning Point" speaker="Steve">
      <p className="lead">The foundation is in place. Now we need leaders who will help operate, expand, and carry the campaign into every county.</p>
      <div className="grid grid-2">
        {["Inspire", "Inform", "Recruit", "Commit"].map((t) => (
          <div className="card" key={t}><h3>{t}</h3></div>
        ))}
      </div>
    </SlideFrame>
  );
}

export function Vision() {
  return (
    <SlideFrame eyebrow="Kelly’s vision" title="Trust Comes Before Politics" speaker="Kelly">
      <div className="word-row">
        {["Listen.", "Trust.", "Serve."].map((w) => (
          <div className="word" key={w}>{w}</div>
        ))}
      </div>
      <p className="lead">People do not listen to a candidate until they trust the person.</p>
      <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--navy)" }}>
        “Government works best when it listens. My goal isn’t simply to win an election—it’s to earn the trust of Arkansas.”
      </p>
    </SlideFrame>
  );
}

export function Elections() {
  return (
    <SlideFrame eyebrow="Elections & citizen power" title="Secure Elections. Accessible Elections. Local Trust." speaker="Kelly">
      <div className="grid grid-2">
        <div className="card"><h3>Support Local Election Officials</h3><p>Resources, training, and dependable systems.</p></div>
        <div className="card"><h3>Protect Voter Access</h3><p>Every eligible Arkansan should be able to participate.</p></div>
        <div className="card"><h3>Build Confidence Through Transparency</h3><p>Show how safeguards work. Address legitimate concerns.</p></div>
        <div className="card"><h3>Defend Citizen Power</h3><p>Protect initiative, referendum, and accountability.</p></div>
      </div>
    </SlideFrame>
  );
}

export function Strategy() {
  return (
    <SlideFrame eyebrow="Operation Arkansas" title="County by County. Community by Community." speaker="Steve">
      <div className="grid grid-3">
        <div className="card accent"><h3>Before Labor Day</h3><p>Presence in all 75 counties.</p></div>
        <div className="card accent"><h3>After Labor Day</h3><p>Statewide tour + Sept 17 GOTV kickoff.</p></div>
        <div className="card accent"><h3>Final Month</h3><p>Canvass, Strike Teams, GOTV.</p></div>
      </div>
      <div className="card accent">
        <h3>{RALLY.shortDate} — {RALLY.title}</h3>
        <p>GOTV kickoff with {RALLY.artist} in {RALLY.city}. Goal: {RALLY.goal} attendees. Planning team needed tonight.</p>
      </div>
      <p className="lead">Kelly and I can’t do this alone anymore. That’s why you’re here tonight.</p>
    </SlideFrame>
  );
}

export function Events() {
  return (
    <SlideFrame eyebrow="Local event model" title="Help Bring the Campaign to Your Community" speaker="Steve">
      <div className="hero-navy">
        <p className="eyebrow">Priority rally · {RALLY.shortDate}</p>
        <h2>{RALLY.title}</h2>
        <p style={{ color: "var(--gold)", fontWeight: 700 }}>{RALLY.subtitle}</p>
        <p>Featuring <strong style={{ color: "white" }}>{RALLY.artist}</strong> · {RALLY.city}, {RALLY.county} County · Goal: <strong style={{ color: "white" }}>{RALLY.goal} people</strong></p>
        <p>{RALLY.detail} Co-chairs: {RALLY.coChairs}.</p>
        <div className="cta-row" style={{ marginTop: "1rem" }}>
          <Link className="btn btn-gold" to="/join/campaign?team=grassroots_guitar_strings">Join the Planning Team</Link>
        </div>
      </div>
      <div className="grid grid-2">
        <div className="card accent"><h3>Local Candidate Rally</h3><p>Feature the local candidate; Kelly appears as a guest.</p></div>
        <div className="card accent"><h3>Community Town Hall</h3><p>Locally led conversations around community needs.</p></div>
      </div>
    </SlideFrame>
  );
}

export function Youth() {
  return (
    <SlideFrame eyebrow="Arkansas Youth Coalition" title="Building the Next Generation of Arkansas Leadership" speaker="Chance Bradford">
      <p className="lead">Young Arkansans ages 16–24 organizing for civic engagement and voter registration.</p>
      <div className="grid grid-3">
        <div className="card"><h3>Friday — Arkadelphia Retreat</h3></div>
        <div className="card"><h3>Saturday — Hope Watermelon Festival</h3></div>
        <div className="card"><h3>Saturday — Clark County Clinton Day</h3></div>
      </div>
      <div className="cta-row">
        <Link className="btn btn-gold" to="/join/youth">Join the Youth Coalition</Link>
        <Link className="btn btn-outline" to="/join/youth?intent=refer">Refer a Young Person</Link>
      </div>
    </SlideFrame>
  );
}

export function Local() {
  return (
    <SlideFrame eyebrow="Local involvement" title="Build the Campaign Where You Live" speaker="Carol Egan">
      <div className="grid grid-2">
        {LOCAL_ROLES.map((r) => (
          <div className="card" key={r.id}><h3>{r.title}</h3><p>{r.blurb}</p></div>
        ))}
      </div>
      <Link className="btn btn-gold" to="/join/local">Join My Local Team</Link>
    </SlideFrame>
  );
}

export function Campaign() {
  const priority = CAMPAIGN_TEAMS.filter((t) => t.priority);
  const rest = CAMPAIGN_TEAMS.filter((t) => !t.priority);
  return (
    <SlideFrame eyebrow="Statewide campaign involvement" title="Help Operate the Statewide Campaign" speaker="Steve">
      <p className="eyebrow">Start here tonight</p>
      <div className="grid grid-2">
        {priority.map((t) => (
          <div className="card accent" key={t.id}>
            <h3>{t.title}</h3>
            <p>{t.blurb}</p>
            {t.recognize ? <p><strong>Recognize:</strong> {t.recognize}</p> : null}
            {t.id === "grassroots_guitar_strings" ? (
              <Link to="/join/campaign?team=grassroots_guitar_strings">Sign up for Sept 17 planning →</Link>
            ) : null}
          </div>
        ))}
      </div>
      <div className="grid grid-3">
        {rest.map((t) => (
          <div className="card" key={t.id}><h3>{t.title}</h3><p>{t.blurb}</p></div>
        ))}
      </div>
      <Link className="btn btn-gold" to="/join/campaign">Join a Campaign Team</Link>
    </SlideFrame>
  );
}

export function StrikeTeam() {
  return (
    <SlideFrame eyebrow="Traveling Strike Teams" title="Five Teams. Every Saturday. Communities Across Arkansas." speaker="Steve">
      <div className="grid grid-3">
        {["Northwest", "Northeast", "Southwest", "Southeast", "Central"].map((r) => (
          <div className="hero-navy" key={r} style={{ textAlign: "center", color: "var(--gold)", fontFamily: "var(--font-heading)", fontWeight: 700 }}>{r}</div>
        ))}
      </div>
      <div className="card accent"><h3>Goal</h3><p>Five operational Strike Teams by October 1.</p></div>
      <Link className="btn btn-gold" to="/join/campaign?team=strike_team">Join a Strike Team</Link>
    </SlideFrame>
  );
}

export function Calendar() {
  return (
    <SlideFrame eyebrow="Campaign calendar" title="Where We Are Going Next" speaker="Steve">
      <div className="card accent">
        <p className="eyebrow">Featured · {RALLY.shortDate}</p>
        <h3>{RALLY.title}</h3>
        <p><strong>{RALLY.subtitle}</strong> · {RALLY.artist}</p>
        <p>{RALLY.city}, {RALLY.county} County · Attendance goal: {RALLY.goal}. About one month to plan.</p>
        <div className="cta-row" style={{ marginTop: "1rem" }}>
          <Link className="btn btn-gold" to="/join/campaign?team=grassroots_guitar_strings">Join Rally Planning Team</Link>
        </div>
      </div>
      <div className="grid grid-3">
        <div className="card"><h3>This weekend</h3><p>Youth retreat · Hope Watermelon Festival · Clinton Day Dinner</p></div>
        <div className="card"><h3>Through Labor Day</h3><p>75-county organization sprint</p></div>
        <div className="card"><h3>After Labor Day</h3><p>Statewide tour · Strike Saturdays · GOTV build</p></div>
      </div>
    </SlideFrame>
  );
}

export function JoinHub() {
  return (
    <SlideFrame eyebrow="The commitment moment" title="Where Will You Help Build This Campaign?" speaker="Kelly">
      <div className="card">
        <h3>Time check</h3>
        <p>
          Land the three asks, get forms started, then open <strong>5 minutes of initial Q&A</strong> inside the hour.
          An optional <strong>15 minutes</strong> is available after the one-hour mark for deeper questions.
        </p>
      </div>
      <div className="card accent">
        <p className="eyebrow">Immediate ask · September 17</p>
        <h3>{RALLY.title} planning team</h3>
        <p>GOTV kickoff with {RALLY.artist} — help plan and fill {RALLY.goal} seats.</p>
        <div className="cta-row" style={{ marginTop: "1rem" }}>
          <Link className="btn btn-gold" to="/join/campaign?team=grassroots_guitar_strings">Join Rally Planning Team</Link>
        </div>
      </div>
      <div className="grid grid-2">
        <div className="card">
          <h3>Local Involvement</h3>
          <p>Help organize your county, city, campus, or community.</p>
          <Link className="btn btn-gold" to="/join/local">Join My Local Team</Link>
        </div>
        <div className="card">
          <h3>Campaign Involvement</h3>
          <p>Statewide operations, outreach, logistics, Strike Teams, or GOTV.</p>
          <Link className="btn btn-navy" to="/join/campaign">Join a Campaign Team</Link>
        </div>
      </div>
      <div className="cta-row">
        <Link className="btn btn-outline" to="/join/match">Help Me Find My Place</Link>
        <Link className="btn btn-outline" to="/join/youth">Youth Coalition (16–24)</Link>
      </div>
    </SlideFrame>
  );
}

export function SignupForm({ pathway, title, intro }: { pathway: Pathway; title: string; intro: string }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState<string[]>(() => {
    const team = params.get("team");
    const role = params.get("role");
    if (pathway === "campaign" && team) return [team];
    if (pathway === "local" && role) return [role];
    return [];
  });

  const defaultTeam = params.get("team") ?? (pathway === "campaign" ? "grassroots_guitar_strings" : "");

  const roleOptions = useMemo(
    () => (pathway === "local" ? LOCAL_ROLES : pathway === "campaign" ? CAMPAIGN_TEAMS : []),
    [pathway],
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("form-name", "kickoff-signup");
    data.set("pathway", pathway);
    data.set("roles", roles.join(", "));
    const body = new URLSearchParams();
    data.forEach((value, key) => {
      body.append(key, String(value));
    });
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!res.ok) throw new Error("submit_failed");
      const q = new URLSearchParams({
        pathway,
        county: String(data.get("county") || ""),
        role: roles[0] || pathway,
      });
      navigate(`/thank-you?${q.toString()}`);
    } catch {
      setError("We could not save your signup. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form className="form-page grid" onSubmit={onSubmit} style={{ gap: "1rem" }}>
      <div>
        <h1>{title}</h1>
        <p>{intro}</p>
      </div>
      {error ? <p className="alert">{error}</p> : null}
      <input type="hidden" name="form-name" value="kickoff-signup" />
      <p hidden>
        <label>
          Don’t fill this out: <input name="bot-field" />
        </label>
      </p>
      <div className="field"><label htmlFor="name">Full name</label><input id="name" name="name" required /></div>
      <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required /></div>
      <div className="field"><label htmlFor="phone">Mobile number</label><input id="phone" name="phone" type="tel" required /></div>
      <div className="field">
        <label htmlFor="county">County</label>
        <select id="county" name="county" required defaultValue="">
          <option value="" disabled>Select county</option>
          {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="field"><label htmlFor="city">City (optional)</label><input id="city" name="city" /></div>
      {pathway === "campaign" ? (
        <div className="field">
          <label htmlFor="primaryTeam">Primary campaign team</label>
          <select id="primaryTeam" name="primaryTeam" defaultValue={defaultTeam} onChange={(e) => setRoles([e.target.value].filter(Boolean))}>
            {CAMPAIGN_TEAMS.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>
      ) : null}
      {roleOptions.length && pathway === "local" ? (
        <div className="check-grid">
          {LOCAL_ROLES.map((r) => (
            <label key={r.id}>
              <input
                type="checkbox"
                checked={roles.includes(r.id)}
                onChange={() =>
                  setRoles((prev) => (prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev, r.id]))
                }
              />
              <span><strong>{r.title}</strong><br />{r.blurb}</span>
            </label>
          ))}
        </div>
      ) : null}
      <div className="field"><label htmlFor="availability">Availability</label><input id="availability" name="availability" placeholder="Evenings, Saturdays…" /></div>
      <div className="field"><label htmlFor="notes">Notes</label><textarea id="notes" name="notes" /></div>
      <div className="field"><label htmlFor="eventInterest">Event interest</label><input id="eventInterest" name="eventInterest" defaultValue={pathway === "campaign" && defaultTeam === "grassroots_guitar_strings" ? RALLY.title : ""} /></div>
      <button className="btn btn-gold" type="submit" disabled={submitting}>{submitting ? "Saving…" : "Join the Team"}</button>
    </form>
  );
}

export function ThankYou() {
  const [params] = useSearchParams();
  return (
    <div className="form-page">
      <p className="eyebrow">You’re in</p>
      <h1>You Are Now Part of the Team</h1>
      <div className="success" style={{ marginTop: "1.25rem" }}>
        <p><strong>Selected role:</strong> {(params.get("role") || "Volunteer").replace(/_/g, " ")}</p>
        {params.get("county") ? <p><strong>County:</strong> {params.get("county")} County</p> : null}
        <p><strong>Next step:</strong> A coordinator will follow up. Recruit one person and stay ready for Operation Arkansas.</p>
      </div>
      <div className="cta-row" style={{ marginTop: "1.25rem" }}>
        <Link className="btn btn-gold" to="/join">Invite Someone Else</Link>
        <Link className="btn btn-outline" to="/">Return to Presentation</Link>
      </div>
    </div>
  );
}
