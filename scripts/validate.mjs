#!/usr/bin/env node
// PR 校验：register.json 合法性与重复校验，并在有 GITHUB_TOKEN 时校验项目归属。
//
// 用法：node scripts/validate.mjs
// 可选环境变量：
//   GITHUB_TOKEN     — 用于 GitHub API 归属校验（CI 中为 secrets.GITHUB_TOKEN）
//   PR_AUTHOR        — PR 作者用户名（github.event.pull_request.user.login）
//   GITHUB_BASE_REF  — PR 的 base 分支名；用于只校验发生变更的 claim
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  SUBDOMAIN_PATTERN,
  TARGET_PATTERN,
  domains,
  eachClaim,
  githubApi,
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
  console.error(`::error file=register.json::register.json 不是合法 JSON：${cause.message}`);
  process.exit(1);
}

// 1) 顶层结构：恰好 7 个域名 key
for (const key of Object.keys(register).filter((key) => key !== "$schema")) {
  if (!domains.includes(key)) error(`未知域名 key「${key}」：顶层只允许 7 个支持域名`);
}
for (const domain of domains) {
  if (!(domain in register)) {
    error(`缺少域名 key「${domain}」：即使没有 claim 也要保留空对象 {}`);
    continue;
  }
  const bucket = register[domain];
  if (typeof bucket !== "object" || bucket === null || Array.isArray(bucket)) {
    error(`域名「${domain}」的值必须是对象`);
  }
}

// 2) 逐条 claim：命名、保留字、字段、跨域名重复
const claims = [];
const seenRepos = new Map();
for (const [domain, subdomain, claim] of eachClaim(register)) {
  const where = `${domain}/${subdomain}`;
  claims.push([domain, subdomain, claim]);

  if (!SUBDOMAIN_PATTERN.test(subdomain)) {
    error(`${where}：subdomain 非法（3–63 位，仅 a-z0-9-，不以 - 开头/结尾）`);
  }
  if (reserved.has(subdomain)) error(`${where}：subdomain「${subdomain}」是保留字`);
  if (typeof claim !== "object" || claim === null || Array.isArray(claim)) {
    error(`${where}：claim 必须是对象`);
    continue;
  }

  const allowed = new Set(["repo", "target"]);
  for (const field of Object.keys(claim)) {
    if (!allowed.has(field)) error(`${where}：不支持的字段「${field}」（只允许 repo / target）`);
  }

  if (typeof claim.repo !== "string" || !/^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(claim.repo)) {
    error(`${where}：repo 必须是 https://github.com/<owner>/<repo>`);
  } else {
    const normalized = normalizeRepo(claim.repo);
    if (seenRepos.has(normalized)) {
      error(`${where}：与 ${seenRepos.get(normalized)} 重复——同一项目只能在一个域名下 claim`);
    } else {
      seenRepos.set(normalized, where);
    }
  }
  if (typeof claim.target !== "string" || !TARGET_PATTERN.test(claim.target)) {
    error(`${where}：target 不是合法主机名`);
  } else if (!isAllowedTarget(claim.target, targets)) {
    error(
      `${where}：target「${claim.target}」不在托管商白名单内（见 targets.json）；` +
        `如需自定义目标，请在本 PR 中把该主机加入 targets.json#custom 并说明理由`,
    );
  }
}

// 3) 归属校验（需要 GITHUB_TOKEN + PR_AUTHOR；只检查相对 base 发生变更的 claim）
//    owner 字段已移除：归属由「PR 作者是 repo 所有者/组织成员」自动判定。
const token = process.env.GITHUB_TOKEN;
const prAuthor = process.env.PR_AUTHOR ?? "";
if (token && prAuthor) {
  const base = loadBaseRegister();
  const changed = claims.filter(([domain, subdomain, claim]) => {
    if (!base) return true;
    return JSON.stringify(base?.[domain]?.[subdomain]) !== JSON.stringify(claim);
  });
  if (changed.length > 30) {
    warn(`变更 claim 数量为 ${changed.length}（>30），已跳过归属校验，请人工重点复核`);
  } else {
    for (const [domain, subdomain, claim] of changed) {
      await verifyOwnership(domain, subdomain, claim, token, prAuthor);
    }
  }
} else if (token) {
  warn("缺少 PR_AUTHOR，跳过归属校验（CI 中由 workflow 提供）");
} else {
  warn("未提供 GITHUB_TOKEN，跳过归属校验（CI 中会自动启用）");
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
    error(`${where}：项目仓库不存在或不可公开访问（${claim.repo}）`);
    return;
  }
  if (status !== 200) {
    warn(`${where}：无法校验仓库（GitHub API ${status}），请人工确认`);
    return;
  }
  if (data.private) error(`${where}：项目仓库必须是公开仓库`);
  if (data.archived) error(`${where}：项目仓库已归档`);
  if (!data.license) error(`${where}：项目仓库缺少 LICENSE（必须是开源项目）`);

  // 归属：PR 作者必须是仓库所有者，或该组织的成员
  const repoOwner = String(data.owner?.login ?? "");
  if (prAuthor.toLowerCase() !== repoOwner.toLowerCase()) {
    const membership = await githubApi(`/orgs/${repoOwner}/members/${prAuthor}`, token);
    if (membership.status === 204) return;
    if (membership.status === 404) {
      error(`${where}：PR 作者「${prAuthor}」不是仓库「${data.full_name}」的所有者或组织成员`);
    } else {
      warn(
        `${where}：无法确认 PR 作者「${prAuthor}」与「${repoOwner}」的组织关系（GitHub API ${membership.status}），请人工确认`,
      );
    }
  }
}

for (const message of warnings) console.log(`::warning file=register.json::${message}`);
for (const message of errors) console.error(`::error file=register.json::${message}`);

if (errors.length > 0) {
  console.error(`\n[validate] 校验失败：${errors.length} 个错误、${warnings.length} 个警告。`);
  process.exit(1);
}
console.log(`[validate] 校验通过：${claims.length} 条 claim，${warnings.length} 个警告。`);
