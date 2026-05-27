import fs from "node:fs";
import path from "node:path";

type EvidenceStatus =
  | "VERIFIED_FACT"
  | "REPORTED_CLAIM"
  | "INTERPRETATION"
  | "RESEARCH_QUESTION"
  | "NEEDS_REVIEW";

type Weakness = {
  sources: string[];
  sourceConfidence: "LOW" | "MEDIUM" | "HIGH";
  saferWording: string;
  evidenceStatus: EvidenceStatus;
};

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relPath), "utf8")) as T;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function hasFile(relPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), relPath));
}

function noBannedLanguage(text: string): boolean {
  const banned = [
    "home address",
    "private address",
    "target family",
    "target voters by",
    "demographic targeting",
    "individual persuasion model",
  ];
  const lower = text.toLowerCase();
  return banned.every((term) => !lower.includes(term));
}

function main() {
  const requiredFiles = [
    "data/opposition/kim-hammer-profile/website/kim-hammer-website-pages.json",
    "data/opposition/kim-hammer-profile/website/kim-hammer-website-fulltext.txt",
    "data/opposition/kim-hammer-profile/website/kim-hammer-website-message-index.json",
    "data/opposition/kim-hammer-profile/kim-hammer-strengths-matrix.json",
    "data/opposition/kim-hammer-profile/kim-hammer-vulnerability-matrix.json",
    "data/opposition/kim-hammer-profile/kim-hammer-intelligence-gaps.json",
    "data/opposition/kim-hammer-profile/kim-hammer-contrast-vs-kelly.json",
    "data/opposition/kim-hammer-profile/kim-hammer-debate-profile.json",
    "data/opposition/kim-hammer-profile/kim-hammer-likely-arguments.json",
    "data/opposition/kim-hammer-profile/kim-hammer-rebuttal-prep.json",
    "src/app/admin/(board)/intelligence/kim-hammer/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/website/page.tsx",
  ];
  requiredFiles.forEach((file) => assert(hasFile(file), `Missing required file: ${file}`));

  const vulnerabilities = readJson<{ weaknesses: Weakness[] }>(
    "data/opposition/kim-hammer-profile/kim-hammer-vulnerability-matrix.json",
  );
  assert(vulnerabilities.weaknesses.length > 0, "Weakness matrix must include entries.");

  vulnerabilities.weaknesses.forEach((item, index) => {
    assert(item.sources.length > 0, `Weakness ${index} missing sources.`);
    assert(Boolean(item.sourceConfidence), `Weakness ${index} missing source confidence.`);
    assert(Boolean(item.saferWording), `Weakness ${index} missing safer wording.`);
  });

  const publicClaims = readJson<{
    claims: Array<{ evidenceStatus: EvidenceStatus; sourceConfidence: "LOW" | "MEDIUM" | "HIGH" }>;
  }>("data/opposition/kim-hammer-profile/kim-hammer-public-claims-index.json");
  publicClaims.claims.forEach((claim, idx) => {
    if (claim.evidenceStatus === "VERIFIED_FACT") {
      assert(claim.sourceConfidence !== "LOW", `Verified fact claim ${idx} cannot be low confidence.`);
    }
  });

  const aggregateTexts = [
    fs.readFileSync(path.join(process.cwd(), "data/opposition/kim-hammer-profile/website/kim-hammer-website-fulltext.txt"), "utf8"),
    fs.readFileSync(path.join(process.cwd(), "docs/opposition/KIM_HAMMER_CONTRAST_VS_KELLY.md"), "utf8"),
    fs.readFileSync(path.join(process.cwd(), "docs/opposition/KIM_HAMMER_DEBATE_PROFILE.md"), "utf8"),
    fs.readFileSync(path.join(process.cwd(), "docs/opposition/KIM_HAMMER_STRENGTHS_AND_WEAKNESSES.md"), "utf8"),
  ].join("\n");
  assert(noBannedLanguage(aggregateTexts), "Detected banned private/targeting/religious-attack language.");

  console.log("KH-2 contrast/debate profile checks passed.");
}

main();

