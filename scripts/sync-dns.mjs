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

import { domains, isAllowedTarget, readJson, rootDir } from "./lib.mjs";

const COMMENT = "openrepos-register";
// 通配符基础设施记录（未 claim 子域名 → Worker 首页重定向，见 ADR-0003）
const WILDCARD_COMMENT = "openrepos-wildcard";
const WILDCARD_CONTENT = "192.0.2.1";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const prune = args.includes("--prune");

const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.log("::notice::CLOUDFLARE_API_TOKEN 未配置，跳过 DNS 同步（维护者需在仓库 secrets 中配置）");
  process.exit(0);
}

const register = JSON.parse(readFileSync(path.join(rootDir, "register.json"), "utf8"));
const targets = readJson("targets.json");
const changes = [];

// 双重防线：main 上若出现白名单外的目标（绕过 PR 校验），直接失败而不是写入 DNS
for (const domain of domains) {
  for (const [subdomain, claim] of Object.entries(register[domain] ?? {})) {
    if (!isAllowedTarget(claim.target, targets)) {
      throw new Error(
        `${subdomain}.${domain} 的 target「${claim.target}」不在 targets.json 白名单内，拒绝同步`,
      );
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

  // 通配符基础设施：确保 *.<domain> 存在且代理开启（未 claim 子域名落到 Worker）
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
      changes.push(`~ ${wildcardName} 修正为 ${WILDCARD_CONTENT} (proxied)`);
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
      `::warning::${wildcardName} 已存在且非 OpenRepos 管理（comment 不匹配），已跳过；请人工确认`,
    );
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
