// Shared constants and helpers (register repo).
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(rootDir, relativePath), "utf8"));
}

export const domains = readJson("domains.json").domains;

export const reserved = new Set(readJson("reserved.json").reserved.map((name) => name.toLowerCase()));

/** subdomain: 3–63 chars, lowercase a-z0-9- only, no leading/trailing hyphen */
export const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])$/;

/** Hostname (CNAME target) */
export const TARGET_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;

/**
 * Optional provider verification TXT record (see docs/PRODUCT-TECH-DESIGN.md 3.2).
 * The name must start with `_` so a claim can never take over the bare hostname's TXT
 * semantics (SPF/DKIM/DMARC); it is one label relative to the claimed fqdn.
 */
export const TXT_NAME_PATTERN = /^_[a-z0-9_-]{1,62}$/;

/** TXT value: 1–255 printable ASCII characters */
export const TXT_VALUE_PATTERN = /^[\x20-\x7E]{1,255}$/;

/**
 * Whether a target host is allowlisted (patterns support `*.example.com` suffix matches;
 * `custom` holds exact hosts). See targets.json and docs/PRODUCT-TECH-DESIGN.md 3.4.
 */
export function isAllowedTarget(target, targets) {
  const value = String(target).toLowerCase();
  if ((targets.custom ?? []).some((host) => host.toLowerCase() === value)) return true;
  return (targets.patterns ?? []).some((pattern) => {
    const normalized = pattern.toLowerCase();
    if (normalized.startsWith("*.")) {
      const suffix = normalized.slice(1); // ".example.com"
      return value.endsWith(suffix) && value.length > suffix.length;
    }
    return value === normalized;
  });
}

/** Normalize a repository URL for cross-domain uniqueness checks */
export function normalizeRepo(repo) {
  return repo.trim().toLowerCase().replace(/\.git$/, "").replace(/\/+$/, "");
}

/** Iterate every claim: [domain, subdomain, claim] */
export function* eachClaim(register) {
  for (const domain of domains) {
    const bucket = register?.[domain];
    if (bucket === undefined || bucket === null) continue;
    if (typeof bucket !== "object" || Array.isArray(bucket)) continue;
    for (const [subdomain, claim] of Object.entries(bucket)) {
      yield [domain, subdomain, claim];
    }
  }
}

/** GitHub raw content (e.g. a project README); returns { status, text } */
export async function githubRaw(pathname, token, accept = "application/vnd.github.raw") {
  const response = await fetch(`https://api.github.com${pathname}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept,
      "User-Agent": "openrepos-register",
    },
  });
  if (!response.ok) return { status: response.status, text: null };
  return { status: response.status, text: await response.text() };
}

/** GitHub API (optional token; returns { status, data }) */
export async function githubApi(pathname, token) {
  const response = await fetch(`https://api.github.com${pathname}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "openrepos-register",
    },
  });
  let data = null;
  if (response.status !== 204) {
    data = await response.json().catch(() => null);
  }
  return { status: response.status, data };
}
