import Link from "next/link";
import type { ReactNode } from "react";

import {
  AEAC_BASE,
  AEAC_CONTACT_EMAIL,
  AEAC_MOTTO_EN,
  AEAC_MOTTO_LATIN,
  AEAC_NAME,
  AEAC_ORGANIZER_NAME,
  AEAC_ORGANIZER_ROLE,
  AEAC_PUBLIC_DOMAIN,
  aeacNavItems,
} from "@/content/election-advisory/catalog";

import { CommissionNav } from "./CommissionNav";

export function CommissionShell({ children }: { children: ReactNode }) {
  return (
    <div className="aeac-shell">
      <p className="aeac-banner">A continuing nonpartisan advisory body · Arkansas people · Evidence first</p>
      <header className="aeac-header">
        <Link href={AEAC_BASE} className="aeac-wordmark">
          <strong>{AEAC_NAME}</strong>
          <small>{AEAC_PUBLIC_DOMAIN}</small>
        </Link>
        <CommissionNav />
      </header>
      <div className="aeac-main">{children}</div>
      <footer className="aeac-footer">
        <div className="aeac-footer-inner">
          <div>
            <h2>{AEAC_NAME}</h2>
            <p>
              An independent, nonpartisan advisory effort organized by {AEAC_ORGANIZER_NAME}, {AEAC_ORGANIZER_ROLE}.
              This is not a statutory state commission. Its work is public by design.
            </p>
            <p className="aeac-motto" style={{ marginTop: "1rem", fontSize: "1.1rem" }}>
              {AEAC_MOTTO_LATIN} — {AEAC_MOTTO_EN}
            </p>
          </div>
          <div>
            <h2>This site</h2>
            <ul>
              {aeacNavItems.slice(0, 6).map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Contact</h2>
            <p>
              <a href={`mailto:${AEAC_CONTACT_EMAIL}`}>{AEAC_CONTACT_EMAIL}</a>
            </p>
            <p>
              Organizer: {AEAC_ORGANIZER_NAME}
              <br />
              {AEAC_ORGANIZER_ROLE}
            </p>
            <p>
              Future public home: {AEAC_PUBLIC_DOMAIN}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
