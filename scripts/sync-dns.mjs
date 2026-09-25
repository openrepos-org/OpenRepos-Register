#!/usr/bin/env node
// 将 register.json 同步到 Cloudflare DNS（幂等）。
//
// 用法：node scripts/sync-dns.mjs [--dry-run] [--prune]
// 环境变量：
//   CLOUDFLARE_API_TOKEN — 需要 Zone:Read + Zone:DNS:Edit（7 个 zone）
//
// 规则：
//   - 目标记录：<subdomain>.<domain> CNAME → claim.target
//   - 一律 DNS-only（proxied: false），由目标主机提供 TLS
//   - 所有由本服务创建的记录都带 comment「openrepos-register」
//   - 仅更新/删除带该 comment 的记录，绝不触碰其他记录
import { readFileSync } from "node:fs";
import path from "node:path";

import { domains, rootDir } from "./lib.mjs";

const COMMENT = "openrepos-register";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const prune = args.includes("--prune");

const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.log("::notice::CLOUDFLARE_API_TOKEN 未配置，跳过 DNS 同步（维护者需在仓库 secrets 中配置）");
  process.exit(0);
}

const register = JSON.parse(readFileSync(path.join(rootDir, "register.json"), "utf8"));
const changes = [];

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
      `Cloudflare API ${init.method ?? "GET"} ${pathname} 失败：${JSON.stringify(body.errors ?? body)}`,
    );
  }
  return body.result;
}

async function zoneIdFor(domain) {
  const zones = await cloudflare(`/zones?name=${encodeURIComponent(domain)}`);
  if (!Array.isArray(zones) || zones.length === 0) {
    throw new Error(`账号中找不到 zone：${domain}（Token 是否覆盖该 zone？）`);
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
      continue;
    }

    if (existing.comment !== COMMENT) {
      console.log(
        `::warning::${name} 已存在同名记录且非 OpenRepos 管理（comment 不匹配），已跳过；请人工确认`,
      );
      continue;
    }

    if (existing.content !== claim.target) {
      changes.push(`~ ${name} → ${claim.target}`);
      if (!dryRun) {
        await cloudflare(`/zones/${zoneId}/dns_records/${existing.id}`, {
          method: "PATCH",
          body: JSON.stringify({ content: claim.target, comment: COMMENT }),
        });
      }
    }
  }

  if (prune) {
    const wanted = new Set(Object.keys(bucket).map((subdomain) => `${subdomain}.${domain}`));
    for (const record of records) {
      if (record.comment === COMMENT && !wanted.has(record.name)) {
        changes.push(`- ${record.name}（已从 register.json 移除）`);
        if (!dryRun) {
          await cloudflare(`/zones/${zoneId}/dns_records/${record.id}`, { method: "DELETE" });
        }
      }
    }
  }
}

if (changes.length === 0) {
  console.log(`[sync-dns] 无变更${dryRun ? "（dry-run）" : ""}。`);
} else {
  console.log(`[sync-dns] ${dryRun ? "dry-run " : ""}共 ${changes.length} 项变更：`);
  for (const change of changes) console.log(`  ${change}`);
}
