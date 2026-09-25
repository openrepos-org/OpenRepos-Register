// 共享常量与工具（register 仓库）。
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(rootDir, relativePath), "utf8"));
}

export const domains = readJson("domains.json").domains;

export const reserved = new Set(readJson("reserved.json").reserved.map((name) => name.toLowerCase()));

/** subdomain：3–63 位，仅 a-z0-9-，不以 - 开头/结尾（小写） */
export const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])$/;

/** 主机名（CNAME 目标） */
export const TARGET_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;

/**
 * 目标主机是否在白名单内（patterns 支持 `*.example.com` 后缀匹配，custom 为精确主机）。
 * 见 targets.json 与 docs/PRODUCT-TECH-DESIGN.md 3.4。
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

/** 归一化仓库 URL，用于跨域名唯一性判断 */
export function normalizeRepo(repo) {
  return repo.trim().toLowerCase().replace(/\.git$/, "").replace(/\/+$/, "");
}

/** 遍历全部 claim：[domain, subdomain, claim] */
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

/** GitHub raw 内容（如项目 README）；返回 { status, text } */
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

/** GitHub API（可选 token；返回 { status, data }） */
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
