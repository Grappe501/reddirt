import type { Metadata } from "next";
import Link from "next/link";

import { AeacProse } from "@/components/election-advisory/DefinedText";
import { aeacResourceKinds, aeacResources } from "@/content/election-advisory/resources";
import { getAeacDataConnections } from "@/lib/election-advisory/data-connections";
import { aeacHref } from "@/lib/election-advisory/public-origin";
import { getAeacBase } from "@/lib/election-advisory/public-origin-server";

export const metadata: Metadata = {
  title: "Research desk",
  description:
    "Law, official desks, Census, labor data, and civic lookup tools for the Arkansas Election Advisory Commission.",
};

export default async function ElectionAdvisoryResearchPage() {
  const base = await getAeacBase();
  const connections = getAeacDataConnections();

  return (
    <article>
      <p className="aeac-kicker">Stay on the record</p>
      <h1 className="aeac-display">Research desk</h1>
      <AeacProse
        base={base}
        className="aeac-lede"
        text="The Commission should not have to hunt the open web for the next statute, data table, or official desk. This page keeps those doors in one place. Outside reading is welcome. Leaving because the site had no link is the failure to avoid."
      />

      <section className="aeac-section">
        <h2>How this is stored</h2>
        <p className="aeac-prose">
          Library pages and these links are part of the public site. When someone asks for a deeper write-up, that
          request uses the same public form intake already on this site. It is saved as a Commission queue item in
          the hosted Postgres database the campaign site already uses. A second Netlify database is not required for
          this layer.
        </p>
      </section>

      <section className="aeac-section">
        <h2>Data connections in this environment</h2>
        <p className="aeac-prose">
          Keys are never shown here. The lights only say whether this deploy can call the official API. Anyone can
          still use the public websites.
        </p>
        <div className="aeac-grid" style={{ marginTop: "1rem" }}>
          {connections.map((item) => (
            <article key={item.id} className="aeac-card">
              <span className="aeac-status">{item.ready ? "API ready" : "Use the public site"}</span>
              <h3>{item.label}</h3>
              <p>
                Config name: <code>{item.envName}</code>
              </p>
              <p style={{ marginTop: "0.6rem" }}>
                <a href={item.publicHref} rel="noreferrer" target="_blank">
                  Open official docs
                </a>
              </p>
            </article>
          ))}
        </div>
      </section>

      {aeacResourceKinds.map((kind) => (
        <section key={kind.id} className="aeac-section">
          <h2>{kind.label}</h2>
          <div className="aeac-grid">
            {aeacResources
              .filter((item) => item.kind === kind.id)
              .map((item) => (
                <article key={item.id} className="aeac-card">
                  <h3>
                    <a href={item.href} rel="noreferrer" target="_blank">
                      {item.title}
                    </a>
                  </h3>
                  <p>{item.summary}</p>
                  <p style={{ marginTop: "0.7rem" }}>{item.why}</p>
                </article>
              ))}
          </div>
        </section>
      ))}

      <div className="aeac-actions">
        <Link className="aeac-btn" href={aeacHref(base, "library")}>
          Open the word library
        </Link>
        <Link className="aeac-btn aeac-btn-ghost" href={aeacHref(base, "concerns")}>
          Send a research gap
        </Link>
      </div>
    </article>
  );
}
