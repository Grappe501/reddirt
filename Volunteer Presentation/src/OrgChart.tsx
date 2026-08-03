import { Link } from "react-router-dom";
import { CAMPAIGN_TEAMS, LOCAL_ROLES, RALLY } from "./content";

type Node = {
  id: string;
  title: string;
  name?: string;
  note?: string;
  tone?: "kelly" | "ops" | "priority" | "open" | "default";
  href?: string;
  children?: Node[];
};

const ORG: Node = {
  id: "kelly",
  title: "Candidate",
  name: "Kelly Grappe",
  note: "Secretary of State · Trust before politics",
  tone: "kelly",
  children: [
    {
      id: "steve",
      title: "Campaign Operations",
      name: "Steve Grappe",
      note: "Statewide build · logistics spine · Data & Technology",
      tone: "ops",
      children: [
        {
          id: "vol-lead",
          title: "Volunteer Leadership",
          name: "Carol Egan · Sue Farris",
          note: "Recruit · welcome · place people · support county teams",
          href: "/join/campaign?team=volunteer_leadership",
          children: [
            {
              id: "county-leads",
              title: "County Lead Organizers",
              note: "75-county presence · visit prep · local roster",
              href: "/join/local?role=county_lead",
              children: LOCAL_ROLES.filter((r) => r.id !== "county_lead").map((r) => ({
                id: r.id,
                title: r.title,
                note: r.blurb,
                href: `/join/local?role=${r.id}`,
              })),
            },
          ],
        },
        {
          id: "campaign-ops",
          title: "Statewide Campaign Teams",
          note: "Cross-county functions that multiply local work",
          children: [
            {
              id: "ggs",
              title: "Grassroots & Guitar Strings",
              name: "John Duke · Jay Powell",
              note: `${RALLY.shortDate} GOTV kickoff · ${RALLY.artist} · goal ${RALLY.goal}`,
              tone: "priority",
              href: "/join/campaign?team=grassroots_guitar_strings",
            },
            {
              id: "project",
              title: "Campaign Project Organizer",
              name: "Open — priority leadership seat",
              note: "Tasks · deadlines · follow-up · bottlenecks",
              tone: "open",
              href: "/join/campaign?team=project_organizer",
            },
            ...CAMPAIGN_TEAMS.filter(
              (t) => !["grassroots_guitar_strings", "project_organizer", "volunteer_leadership"].includes(t.id),
            ).map((t) => ({
              id: t.id,
              title: t.title,
              name: t.recognize,
              note: t.blurb,
              tone: t.priority ? ("priority" as const) : ("default" as const),
              href: `/join/campaign?team=${t.id}`,
            })),
          ],
        },
        {
          id: "youth",
          title: "Arkansas Youth Coalition",
          name: "Chance Bradford",
          note: "Ages 16–24 · campus & community · voter registration",
          href: "/join/youth",
          children: [
            {
              id: "youth-join",
              title: "Youth Members (16–24)",
              note: "Join · organize · festivals · civic spaces",
              href: "/join/youth",
            },
            {
              id: "youth-adult",
              title: "Adult Supporters",
              note: "Mentors · logistics · referrals",
              href: "/join/youth?intent=help",
            },
            {
              id: "youth-thanks",
              title: "Retreat Partners",
              name: "Dr. Judy Harrison · Kevin Heifner",
              note: "Arkadelphia retreat support",
            },
          ],
        },
        {
          id: "field",
          title: "Operation Arkansas — Field",
          note: "75 counties → statewide tour → GOTV",
          children: [
            {
              id: "strike",
              title: "Traveling Strike Teams",
              note: "NW · NE · SW · SE · Central · Saturdays → Oct 1",
              href: "/join/campaign?team=strike_team",
            },
            {
              id: "gotv",
              title: "Statewide GOTV",
              note: "Final-month turnout · rides · lawful support",
              href: "/join/campaign?team=statewide_gotv",
            },
            {
              id: "tour",
              title: "Community Tour Support",
              note: "Local hosts · media · arrive-ahead teams",
              href: "/join/local",
            },
          ],
        },
      ],
    },
  ],
};

function OrgNode({ node, depth = 0 }: { node: Node; depth?: number }) {
  const tone = node.tone ?? "default";
  const body = (
    <>
      <p className="org-role">{node.title}</p>
      {node.name ? <p className="org-name">{node.name}</p> : null}
      {node.note ? <p className="org-note">{node.note}</p> : null}
    </>
  );

  return (
    <li className={`org-node depth-${Math.min(depth, 3)}`}>
      {node.href ? (
        <Link className={`org-card tone-${tone}`} to={node.href}>
          {body}
        </Link>
      ) : (
        <div className={`org-card tone-${tone}`}>{body}</div>
      )}
      {node.children?.length ? (
        <ul className="org-children">
          {node.children.map((child) => (
            <OrgNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function OrgChartPage() {
  return (
    <article className="org-page">
      <header className="org-header">
        <p className="eyebrow">Kelly Grappe for Secretary of State</p>
        <h1>Volunteer Organization Chart</h1>
        <p className="lead">
          How the kickoff teams fit together. Tap a box to sign up for that lane. Named leaders are recognized
          owners or co-chairs; open seats are priority asks tonight.
        </p>
        <div className="cta-row">
          <Link className="btn btn-gold" to="/join">
            Choose Your Role
          </Link>
          <Link className="btn btn-outline" to="/presenter">
            Presenters Board
          </Link>
          <Link className="btn btn-outline" to="/campaign">
            Campaign Teams Slide
          </Link>
        </div>
      </header>

      <div className="org-legend">
        <span className="leg tone-kelly">Candidate</span>
        <span className="leg tone-ops">Campaign ops</span>
        <span className="leg tone-priority">Priority now</span>
        <span className="leg tone-open">Open seat</span>
        <span className="leg tone-default">Team / role</span>
      </div>

      <div className="org-scroll">
        <ul className="org-tree">
          <OrgNode node={ORG} />
        </ul>
      </div>

      <section className="org-footnote card">
        <h3>How to read this</h3>
        <ul>
          <li>
            <strong>Local path</strong> sits under Volunteer Leadership → County Leads → role teams in each county.
          </li>
          <li>
            <strong>Campaign path</strong> is cross-county: creative, logistics, outreach, data, fundraising, Strike
            Teams, GOTV, and the Sept 17 rally planning team.
          </li>
          <li>
            <strong>Youth Coalition</strong> reports into campaign operations with its own join/refer/help pathways.
          </li>
          <li>
            Event co-chairs for {RALLY.title} ({RALLY.coChairs}) own that rally—not city leadership titles.
          </li>
        </ul>
      </section>
    </article>
  );
}
