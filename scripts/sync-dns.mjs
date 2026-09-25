#!/usr/bin/env node
// Sync register.json to Cloudflare DNS (idempotent).
//
// Usage: node scripts/sync-dns.mjs [--dry-run] [--prune]
// Environment:
//   CLOUDFLARE_API_TOKEN — needs Zone:Read + Zone:DNS:Edit for all 7 zones
//
// Rules:
//   - Target record: <subdomain>.<domain> CNAME → claim.target
//   - Optional provider verification record: <txt.name>.<subdomain>.<domain> TXT → claim.txt.value
//   - Always DNS-only (proxied: false); the target host serves TLS
//   - Every record this service creates carries comment "openrepos-register"
//   - Only records carrying that comment are updated/deleted; nothing else is touched
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  TXT_NAME_PATTERN,
  TXT_VALUE_PATTERN,
  domains,
  isAllowedTarget,
  readJson,
  rootDir,
} from "./lib.mjs";

const COMMENT = "openrepos-register";
// Wildcard infrastructure record (unclaimed subdomains → Worker homepage redirect, ADR-0003)
const WILDCARD_COMMENT = "openrepos-wildcard";
const WILDCARD_CONTENT = "192.0.2.1";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const prune = args.includes("--prune");

const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.log("::notice::CLOUDFLARE_API_TOKEN is not configured; skipping DNS sync (maintainers configure it in repository secrets)");
  process.exit(0);
}

const register = JSON.parse(readFileSync(path.join(rootDir, "register.json"), "utf8"));
const targets = readJson("targets.json");
const changes = [];

// Defense in depth: a target outside the allowlist on main (bypassing PR validation) fails the
// sync instead of being written to DNS
for (const domain of domains) {
  for (const [subdomain, claim] of Object.entries(register[domain] ?? {})) {
    if (!isAllowedTarget(claim.target, targets)) {
      throw new Error(
        `${subdomain}.${domain}: target "${claim.target}" is not on the targets.json allowlist; refusing to sync`,
      );
    }
    if (claim.txt !== undefined) {
      const validTxt =
        typeof claim.txt === "object" &&
        claim.txt !== null &&
        typeof claim.txt.name === "string" &&
        TXT_NAME_PATTERN.test(claim.txt.name) &&
        typeof claim.txt.value === "string" &&
        TXT_VALUE_PATTERN.test(claim.txt.value);
      if (!validTxt) {
        throw new Error(`${subdomain}.${domain}: invalid txt record; refusing to sync`);
      }
    }
  }
}

async function cloudflare(pathname, init = {}) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error(
      `Cloudflare API ${init.method ?? "GET"} ${pathname} failed: ${JSON.stringify(body.errors ?? body)}`,
    );
  }
  return body.result;
}

async function zoneIdFor(domain) {
  const zones = await cloudflare(`/zones?name=${encodeURIComponent(domain)}`);
  if (!Array.isArray(zones) || zones.length === 0) {
    throw new Error(`No zone found for ${domain} (does the token cover this zone?)`);
  }
  return zones[0].id;
}

for (const domain of domains) {
  const bucket = register[domain] ?? {};
  const zoneId = await zoneIdFor(domain);
  const records = await cloudflare(`/zones/${zoneId}/dns_records?per_page=100`);
  const byName = new Map(records.map((record) => [record.name, record]));

  for (const [subdomain, claim] of Object.entries(bucket)) {
    const name = `${subdomain}.${domain}`;
    const existing = byName.get(name);

    if (!existing) {
      changes.push(`+ ${name} → ${claim.target}`);
      if (!dryRun) {
        await cloudflare(`/zones/${zoneId}/dns_records`, {
          method: "POST",
          body: JSON.stringify({
            type: "CNAME",
            name,
            content: claim.target,
            proxied: false,
            ttl: 1,
            comment: COMMENT,
          }),
        });
      }
    } else if (existing.comment !== COMMENT) {
      console.log(
        `::warning::${name} already exists and is not managed by OpenRepos (comment mismatch); skipped — confirm manually`,
      );
    } else if (existing.content !== claim.target) {
      changes.push(`~ ${name} → ${claim.target}`);
      if (!dryRun) {
        await cloudflare(`/zones/${zoneId}/dns_records/${existing.id}`, {
          method: "PATCH",
          body: JSON.stringify({ content: claim.target, comment: COMMENT }),
        });
      }
    }

    // Optional provider verification TXT record (see docs/PRODUCT-TECH-DESIGN.md 3.2)
    if (claim.txt) {
      const txtName = `${claim.txt.name}.${name}`;
      const existingTxt = byName.get(txtName);

      if (!existingTxt) {
        changes.push(`+ ${txtName} TXT "${claim.txt.value}"`);
        if (!dryRun) {
          await cloudflare(`/zones/${zoneId}/dns_records`, {
            method: "POST",
            body: JSON.stringify({
              type: "TXT",
              name: txtName,
              content: claim.txt.value,
              ttl: 1,
              comment: COMMENT,
            }),
          });
        }
      } else if (existingTxt.comment !== COMMENT) {
        console.log(
          `::warning::${txtName} already exists and is not managed by OpenRepos (comment mismatch); skipped — confirm manually`,
        );
      } else if (existingTxt.content !== claim.txt.value) {
        changes.push(`~ ${txtName} TXT "${claim.txt.value}"`);
        if (!dryRun) {
          await cloudflare(`/zones/${zoneId}/dns_records/${existingTxt.id}`, {
            method: "PATCH",
            body: JSON.stringify({ content: claim.txt.value, comment: COMMENT }),
          });
        }
      }
    }
  }

  // Wildcard infrastructure: ensure *.<domain> exists and is proxied (unclaimed names reach the Worker)
  const wildcardName = `*.${domain}`;
  const wildcard = records.find((record) => record.name === wildcardName);
  if (!wildcard) {
    changes.push(`+ ${wildcardName} → ${WILDCARD_CONTENT} (proxied, wildcard)`);
    if (!dryRun) {
      await cloudflare(`/zones/${zoneId}/dns_records`, {
        method: "POST",
        body: JSON.stringify({
          type: "A",
          name: wildcardName,
          content: WILDCARD_CONTENT,
          proxied: true,
          ttl: 1,
          comment: WILDCARD_COMMENT,
        }),
      });
    }
  } else if (wildcard.comment === WILDCARD_COMMENT) {
    if (wildcard.content !== WILDCARD_CONTENT || wildcard.proxied !== true) {
      changes.push(`~ ${wildcardName} corrected to ${WILDCARD_CONTENT} (proxied)`);
      if (!dryRun) {
        await cloudflare(`/zones/${zoneId}/dns_records/${wildcard.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            content: WILDCARD_CONTENT,
            proxied: true,
            comment: WILDCARD_COMMENT,
          }),
        });
      }
    }
  } else {
    console.log(
      `::warning::${wildcardName} already exists and is not managed by OpenRepos (comment mismatch); skipped — confirm manually`,
    );
  }

  if (prune) {
    const wanted = new Set();
    for (const [subdomain, claim] of Object.entries(bucket)) {
      wanted.add(`${subdomain}.${domain}`);
      if (claim.txt?.name) wanted.add(`${claim.txt.name}.${subdomain}.${domain}`);
    }
    for (const record of records) {
      if (record.comment === COMMENT && !wanted.has(record.name)) {
        changes.push(`- ${record.name} (removed from register.json)`);
        if (!dryRun) {
          await cloudflare(`/zones/${zoneId}/dns_records/${record.id}`, { method: "DELETE" });
        }
      }
    }
  }
}

if (changes.length === 0) {
  console.log(`[sync-dns] No changes${dryRun ? " (dry-run)" : ""}.`);
} else {
  console.log(`[sync-dns] ${dryRun ? "dry-run: " : ""}${changes.length} change(s):`);
  for (const change of changes) console.log(`  ${change}`);
}
