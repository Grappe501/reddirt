import Link from "next/link";
import type { ReactNode } from "react";

import {
  AEAC_CONTACT_EMAIL,
  AEAC_MOTTO_EN,
  AEAC_MOTTO_LATIN,
  AEAC_NAME,
  AEAC_ORGANIZER_NAME,
  AEAC_ORGANIZER_ROLE,
  AEAC_PUBLIC_DOMAIN,
  aeacNavItemsForBase,
} from "@/content/election-advisory/catalog";
import { CAMPAIGN_POLICY_V1 } from "@/lib/campaign-engine/policy";
import { aeacHref } from "@/lib/election-advisory/public-origin";
import { getAeacBase } from "@/lib/election-advisory/public-origin-server";

import { CommissionNav } from "./CommissionNav";

export async function CommissionShell({ children }: { children: ReactNode }) {
  const base = await getAeacBase();
  const navItems = aeacNavItemsForBase(base);
  const homeHref = aeacHref(base);

  return (
    <div className="aeac-shell">
      <p className="aeac-banner">A continuing nonpartisan advisory body · Arkansas people · Evidence first</p>
      <header className="aeac-header">
        <Link href={homeHref} className="aeac-wordmark">
          <img src="/election-advisory/aeac-seal.svg" alt="" width={72} height={72} className="aeac-seal" />
          <span>
            <strong>{AEAC_NAME}</strong>
            <small>{AEAC_PUBLIC_DOMAIN}</small>
          </span>
        </Link>
        <CommissionNav items={navItems} />
      </header>
      <div className="aeac-main">{children}</div>
      <footer className="aeac-footer">
        <div className="aeac-footer-inner">
          <div>
            <img src="/election-advisory/aeac-seal.svg" alt="" width={88} height={88} className="aeac-seal-footer" />
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
              {navItems.slice(0, 8).map((item) => (
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
            <p>{AEAC_PUBLIC_DOMAIN}</p>
          </div>
        </div>
        <p className="aeac-paid-for">{CAMPAIGN_POLICY_V1.disclaimers.pageFooterPaidForLine}</p>
      </footer>
    </div>
  );
}
