import fs from "node:fs";
import path from "node:path";
import { loadKimHammerWorkbench } from "../src/lib/opposition/kimHammerWorkbench";
import { findKimHammerBill } from "../src/lib/opposition/kimHammerWorkbench";

function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), relPath));
}

function main() {
  const data = loadKimHammerWorkbench();

  const dashboardLoadsPacket = data.totalBills >= 18 && data.enactedActs >= 18;
  const all18BillsAppear = data.bills.length >= 18;
  const eachBillHasDetailRouteData = data.bills.every((bill) => findKimHammerBill(bill.billNumber) != null);
  const claimsSeparatedBySupportLevel =
    data.claimBuckets.supported.length > 0 &&
    data.claimBuckets.partial.length > 0 &&
    data.claimBuckets.needsResearch.length > 0;
  const debateCardsCiteBillIds = data.debateDrillQueue.every((card) =>
    data.bills.some((bill) => bill.billNumber === card.billNumber),
  );
  const riskyMotiveClaimsFlagged = data.riskClaims.some((line) => /motive/i.test(line));
  const stackingSectionFramedAsResearchQuestion = fileExists(
    "src/app/admin/(board)/intelligence/kim-hammer/bills/[billNumber]/page.tsx",
  ) && fs
    .readFileSync(path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/bills/[billNumber]/page.tsx"), "utf8")
    .includes("This raises a research question");
  const noUnsourcedClaimsMarkedApproved = data.claims.every(
    (row) => row.assessment !== "supported" || row.sourceNeeded.length > 0,
  );
  const noTargetingOutputs =
    !/target individual|microtarget|demographic targeting/i.test(data.dossier) &&
    !/target individual|microtarget|demographic targeting/i.test(data.guidance);
  const routeBuildFilesPresent =
    fileExists("src/app/admin/(board)/intelligence/kim-hammer/page.tsx") &&
    fileExists("src/app/admin/(board)/intelligence/kim-hammer/debate-prep/page.tsx") &&
    fileExists("src/app/admin/(board)/intelligence/kim-hammer/claims-review/page.tsx") &&
    fileExists("src/app/admin/(board)/intelligence/kim-hammer/themes/page.tsx") &&
    fileExists("src/app/admin/(board)/intelligence/kim-hammer/timeline/page.tsx") &&
    fileExists("src/app/admin/(board)/intelligence/kim-hammer/research-gaps/page.tsx");

  console.log("Opposition workbench debate prep checks");
  console.log("  dashboard loads source packet:", dashboardLoadsPacket);
  console.log("  all 18 bills appear:", all18BillsAppear);
  console.log("  each bill has detail route data:", eachBillHasDetailRouteData);
  console.log("  claims separated by support level:", claimsSeparatedBySupportLevel);
  console.log("  debate prep cards cite bill IDs:", debateCardsCiteBillIds);
  console.log("  risky motive claims are flagged:", riskyMotiveClaimsFlagged);
  console.log("  stacking office framed as research question:", stackingSectionFramedAsResearchQuestion);
  console.log("  no unsourced claims marked approved:", noUnsourcedClaimsMarkedApproved);
  console.log("  no voter targeting outputs:", noTargetingOutputs);
  console.log("  route build files present:", routeBuildFilesPresent);

  const ok =
    dashboardLoadsPacket &&
    all18BillsAppear &&
    eachBillHasDetailRouteData &&
    claimsSeparatedBySupportLevel &&
    debateCardsCiteBillIds &&
    riskyMotiveClaimsFlagged &&
    stackingSectionFramedAsResearchQuestion &&
    noUnsourcedClaimsMarkedApproved &&
    noTargetingOutputs &&
    routeBuildFilesPresent;

  if (!ok) process.exit(1);
  console.log("OK — Opposition workbench and debate prep checks passed");
}

main();

