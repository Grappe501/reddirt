import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { VOTE_CORPUS_DIR_CANDIDATES } from "./contracts";

const SKIP = new Set(["node_modules", ".git", ".next", ".local", "dist", "out", "coverage"]);

export type VoteCorpusDiscovery = {
  found: boolean;
  path: string | null;
  matchedName: string | null;
  searchedRoots: string[];
  searchedNames: string[];
};

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function voteCorpusSearchRoots(cwd = process.cwd()): string[] {
  return unique([
    cwd,
    path.resolve(cwd, ".."),
    path.resolve(cwd, "../.."),
    path.resolve(cwd, "../../.."),
    "H:/SOSWebsite",
    "H:/SOSWebsite/RedDirt",
    "H:/SOSWebsite/.local",
    "H:/SOSWebsite/.local/worktrees/dec-sim-main",
    "H:/SOSWebsite/develop_notes",
    "H:/SOSWebsite/tools",
  ]);
}

function isCandidateName(name: string): boolean {
  const lower = name.toLowerCase();
  return VOTE_CORPUS_DIR_CANDIDATES.some((candidate) => lower === candidate);
}

function safeDirs(root: string): string[] {
  try {
    return readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !SKIP.has(entry.name))
      .map((entry) => path.join(root, entry.name));
  } catch {
    return [];
  }
}

export function discoverHillVoteCorpus(cwd = process.cwd()): VoteCorpusDiscovery {
  const roots = voteCorpusSearchRoots(cwd).filter((root) => existsSync(root) && statSync(root).isDirectory());
  const searchedNames = [...VOTE_CORPUS_DIR_CANDIDATES];

  for (const root of roots) {
    for (const name of VOTE_CORPUS_DIR_CANDIDATES) {
      const candidate = path.join(root, name);
      if (existsSync(candidate) && statSync(candidate).isDirectory()) {
        return { found: true, path: candidate, matchedName: name, searchedRoots: roots, searchedNames };
      }
    }
    for (const child of safeDirs(root)) {
      if (isCandidateName(path.basename(child))) {
        return {
          found: true,
          path: child,
          matchedName: path.basename(child),
          searchedRoots: roots,
          searchedNames,
        };
      }
      for (const grandchild of safeDirs(child)) {
        if (isCandidateName(path.basename(grandchild))) {
          return {
            found: true,
            path: grandchild,
            matchedName: path.basename(grandchild),
            searchedRoots: roots,
            searchedNames,
          };
        }
      }
    }
  }

  return { found: false, path: null, matchedName: null, searchedRoots: roots, searchedNames };
}
