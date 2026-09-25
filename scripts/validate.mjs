#!/usr/bin/env node
// PR validation: register.json legality and duplicate checks, plus ownership and badge checks
// when GITHUB_TOKEN is available.
//
// Usage: node scripts/validate.mjs
// Optional environment variables:
//   GITHUB_TOKEN     — for GitHub API ownership/badge checks (CI: secrets.GITHUB_TOKEN)
//   PR_AUTHOR        — pull request author (github.event.pull_request.user.login)
//   GITHUB_BASE_REF  — PR base branch; only changed claims are checked
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  SUBDOMAIN_PATTERN,
  TARGET_PATTERN,
  domains,
  eachClaim,
  githubApi,
  githubRaw,
  isAllowedTarget,
  normalizeRepo,
  readJson,
  reserved,
  rootDir,
} from "./lib.mjs";

const targets = readJson("targets.json");

const errors = [];
const warnings = [];
const error = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

let register;
try {
  register = JSON.parse(readFileSync(path.join(rootDir, "register.json"), "utf8"));
} catch (cause) {
  console.error(`::error file=register.json::register.json is not valid JSON: ${cause.message}`);
  process.exit(1);
}

// 1) Top-level structure: exactly the 7 domain keys
for (const key of Object.keys(register).filter((key) => key !== "$schema")) {
  if (!domains.includes(key)) error(`Unknown top-level key "${key}": only the 7 supported domains are allowed`);
}
for (const domain of domains) {
  if (!(domain in register)) {
    error(`Missing top-level key "${domain}": keep it even without claims (empty object {})`);
    continue;
  }
  const bucket = register[domain];
  if (typeof bucket !== "object" || bucket === null || Array.isArray(bucket)) {
    error(`Value for "${domain}" must be an object`);
  }
}

// 2) Per-claim checks: naming, reserved names, fields, cross-domain duplicates
const claims = [];
const seenRepos = new Map();
for (const [domain, subdomain, claim] of eachClaim(register)) {
  const where = `${domain}/${subdomain}`;
  claims.push([domain, subdomain, claim]);

  if (!SUBDOMAIN_PATTERN.test(subdomain)) {
    error(`${where}: invalid subdomain (3–63 chars, a-z0-9- only, no leading/trailing hyphen)`);
  }
  if (reserved.has(subdomain)) error(`${where}: "${subdomain}" is a reserved name`);
  if (typeof claim !== "object" || claim === null || Array.isArray(claim)) {
    error(`${where}: claim must be an object`);
    continue;
  }

  const allowed = new Set(["repo", "target"]);
  for (const field of Object.keys(claim)) {
    if (!allowed.has(field)) error(`${where}: unsupported field "${field}" (only repo / target)`);
  }

  if (typeof claim.repo !== "string" || !/^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(claim.repo)) {
    error(`${where}: repo must be https://github.com/<owner>/<repo>`);
  } else {
    const normalized = normalizeRepo(claim.repo);
    if (seenRepos.has(normalized)) {
      error(`${where}: duplicates ${seenRepos.get(normalized)} — a project may only be claimed on one domain`);
    } else {
      seenRepos.set(normalized, where);
    }
  }
  if (typeof claim.target !== "string" || !TARGET_PATTERN.test(claim.target)) {
    error(`${where}: target is not a valid hostname`);
  } else if (!isAllowedTarget(claim.target, targets)) {
    error(
      `${where}: target "${claim.target}" is not on the hosting-provider allowlist (see targets.json); ` +
        `for a custom target, add the host to targets.json#custom in this PR with a reason`,
    );
  }
}

// 3) Ownership and badge checks (needs GITHUB_TOKEN + PR_AUTHOR; only changed claims)
const token = process.env.GITHUB_TOKEN;
const prAuthor = process.env.PR_AUTHOR ?? "";
if (token && prAuthor) {
  const base = loadBaseRegister();
  const changed = claims.filter(([domain, subdomain, claim]) => {
    if (!base) return true;
    return JSON.stringify(base?.[domain]?.[subdomain]) !== JSON.stringify(claim);
  });
  if (changed.length > 30) {
    warn(`Changed claim count is ${changed.length} (>30); ownership/badge checks skipped — review manually`);
  } else {
    for (const [domain, subdomain, claim] of changed) {
      await verifyOwnership(domain, subdomain, claim, token, prAuthor);
    }
  }
} else if (token) {
  warn("PR_AUTHOR is missing; ownership/badge checks skipped (provided by the workflow in CI)");
} else {
  warn("GITHUB_TOKEN is missing; ownership/badge checks skipped (enabled automatically in CI)");
}

function loadBaseRegister() {
  const ref = process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : "origin/main";
  try {
    const raw = execFileSync("git", ["show", `${ref}:register.json`], {
      cwd: rootDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function verifyOwnership(domain, subdomain, claim, token, prAuthor) {
  const where = `${domain}/${subdomain}`;
  if (typeof claim?.repo !== "string") return;
  const match = claim.repo.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)$/);
  if (!match) return;
  const [, owner, repo] = match;

  const { status, data } = await githubApi(`/repos/${owner}/${repo}`, token);
  if (status === 404) {
    error(`${where}: project repository does not exist or is not publicly accessible (${claim.repo})`);
    return;
  }
  if (status !== 200) {
    warn(`${where}: cannot verify the repository (GitHub API ${status}); please confirm manually`);
    return;
  }
  if (data.private) error(`${where}: project repository must be public`);
  if (data.archived) error(`${where}: project repository is archived`);
  if (!data.license) error(`${where}: project repository has no LICENSE (must be open source)`);

  // Ownership: the PR author must be the repository owner or a member of its organization
  const repoOwner = String(data.owner?.login ?? "");
  if (prAuthor.toLowerCase() !== repoOwner.toLowerCase()) {
    const membership = await githubApi(`/orgs/${repoOwner}/members/${prAuthor}`, token);
    if (membership.status === 204) {
      // Organization member; continue to the badge check
    } else if (membership.status === 404) {
      error(`${where}: PR author "${prAuthor}" is neither the owner of "${data.full_name}" nor an organization member`);
    } else {
      warn(
        `${where}: cannot confirm the organization relationship between "${prAuthor}" and "${repoOwner}" ` +
          `(GitHub API ${membership.status}); please confirm manually`,
      );
    }
  }

  await verifyBadge(domain, subdomain, `${owner}/${repo}`, token);
}

/**
 * Badge gate (see docs/PRODUCT-TECH-DESIGN.md 3.5): the project README must contain an
 * OpenRepos badge that references this exact fqdn (dynamic, self-hosted, or static shields).
 */
async function verifyBadge(domain, subdomain, repoFullName, token) {
  const fqdn = `${subdomain}.${domain}`;
  const { status, text } = await githubRaw(`/repos/${repoFullName}/readme`, token);
  if (status !== 200 || !text) {
    warn(`${fqdn}: cannot read the project README (GitHub API ${status}); please confirm the badge manually`);
    return;
  }
  const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Static shields badges encode hyphens as --, so allow one or two hyphens
  const fqdnPattern = escape(fqdn).replace(/-/g, "-{1,2}");
  const patterns = [
    new RegExp(`openrepos\\.org/status/${escape(fqdn)}\\.json`, "i"),
    new RegExp(`openrepos\\.org/badge/${escape(fqdn)}\\.svg`, "i"),
    new RegExp(`img\\.shields\\.io/[^\\s)"'<>]*openrepos[^\\s)"'<>]*${fqdnPattern}`, "i"),
  ];
  if (!patterns.some((pattern) => pattern.test(text))) {
    error(
      `${fqdn}: project README has no OpenRepos badge referencing this subdomain` +
        ` (see "Add the badge" in the register README)`,
    );
  }
}

for (const message of warnings) console.log(`::warning file=register.json::${message}`);
for (const message of errors) console.error(`::error file=register.json::${message}`);

if (errors.length > 0) {
  console.error(`\n[validate] FAILED: ${errors.length} error(s), ${warnings.length} warning(s).`);
  process.exit(1);
}
console.log(`[validate] OK: ${claims.length} claim(s), ${warnings.length} warning(s).`);
