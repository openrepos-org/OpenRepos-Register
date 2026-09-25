# OpenRepos Register

[English](./README.md) · **简体中文** · [日本語](./README.ja.md) · [العربية](./README.ar.md) · [Español](./README.es.md) · [Português](./README.pt.md)

为你的开源项目在 OpenRepos 的域名下申请一个**免费二级域名**。永久免费，域名长期妥善管理。

- 官网：**https://openrepos.org/**（同时支持 `openrepos.io`、`openrepos.sh`、`repos.one`、
  `sourcepage.io`、`sourcepage.org`、`sourcepage.sh`）
- 所有申请都保存在同一个文件：[`register.json`](./register.json)
- 示例：`awesome-project.openrepos.org` → 你的项目站点

## 域名列表

| 域名             | 官网                        |
| ---------------- | --------------------------- |
| `openrepos.io`   | https://openrepos.io/       |
| `openrepos.org`  | https://openrepos.org/      |
| `openrepos.sh`   | https://openrepos.sh/       |
| `repos.one`      | https://repos.one/          |
| `sourcepage.io`  | https://sourcepage.io/      |
| `sourcepage.org` | https://sourcepage.org/     |
| `sourcepage.sh`  | https://sourcepage.sh/      |

## 规则

1. **永久免费**，仅限开源项目（公开的 GitHub 仓库且包含 LICENSE）。
2. **你必须拥有该项目仓库**，或是其所在组织的成员；CI 会根据 PR 作者自动校验。
3. **一个项目只能申请一个子域名，且只能选择一个域名**，不可跨域名重复申请。
4. 子域名命名：3–63 个字符，仅小写 `a-z`、`0-9`、`-`，且不能以 `-` 开头或结尾。
5. 保留字不可申请——见 [`reserved.json`](./reserved.json)。
6. 目标必须是允许的托管商（见下文）；自定义目标需要维护者审核。
7. **需要在项目 README 中放置 OpenRepos 徽章**，每个新申请都会自动检查
   （见 [添加徽章](#添加徽章)）。
8. 你需要对子域名下的内容负责。内容规则：内容必须与该项目相关；禁止自动跳转离开；
   禁止 NSFW/成人内容。滥用可被移除。

## 如何申请

1. 选择一个域名和一个可用的子域名，例如 `awesome-project.openrepos.org`。
2. 编辑 [`register.json`](./register.json)，在所选域名下添加条目：

   ```json
   "openrepos.org": {
     "awesome-project": {
       "repo": "https://github.com/octocat/awesome-project",
       "target": "octocat.github.io"
     }
   }
   ```

3. 在项目 README 中添加 OpenRepos 徽章（见 [添加徽章](#添加徽章)）。
4. 提交 Pull Request。CI 会校验命名、保留字、重复、目标白名单、归属与徽章。
5. 维护者审核并合并。合并后 DNS 会自动生效，你无需再做任何操作。

> 小提示：在 `register.json` 上使用 GitHub 的 **编辑**（铅笔）按钮，GitHub 会自动
> fork 仓库并为你创建 Pull Request。

## 字段

子域名即 key，每条记录只需两个字段：

| 字段     | 必填 | 说明                                              |
| -------- | ---- | ------------------------------------------------- |
| `repo`   | 是   | 你的开源项目仓库（公开的 GitHub 仓库）            |
| `target` | 是   | CNAME 目标主机，例如 `octocat.github.io`          |

归属由 PR 作者自动校验，因此没有 `owner` 字段。记录为 DNS-only，由你的托管商提供 TLS。

## 添加徽章

新申请必须在项目 README 中放置 OpenRepos 徽章。徽章是动态的：审核期间显示 `pending`，
合并后自动变为 `live`，无需再修改 README。

可选择任意 [shields.io 样式](https://shields.io)（`flat`、`flat-square`、`plastic`、
`for-the-badge`、`social`）：

```markdown
[![OpenRepos](https://img.shields.io/endpoint?url=https://openrepos.org/status/awesome-project.openrepos.org.json&style=flat-square)](https://awesome-project.openrepos.org/)
```

把 `openrepos.org` 替换为你申请的域名，把 `awesome-project` 替换为你的子域名。

静态备选（不发起动态请求；注意 shields 会把 `-` 转义为 `--`）：

```markdown
[![OpenRepos](https://img.shields.io/badge/openrepos.org-awesome-project.openrepos.org-blue?style=flat-square)](https://awesome-project.openrepos.org/)
```

徽章 URL 必须包含你的完整子域名——CI 会据此校验，缺失则拒绝申请。

## 允许的目标

子域名只能指向以下托管商：

| 模式                               | 托管商           |
| ---------------------------------- | ---------------- |
| `*.github.io`                      | GitHub Pages     |
| `*.gitlab.io`                      | GitLab Pages     |
| `*.pages.dev`                      | Cloudflare Pages |
| `*.netlify.app`                    | Netlify          |
| `*.vercel.app`, `*.vercel-dns.com` | Vercel           |
| `*.surge.sh`                       | Surge            |
| `*.gitbook.io`, `*.gitbook.com`    | GitBook          |
| `*.alwaysdata.net`                 | Alwaysdata       |

如需其他目标，请在同一个 PR 中把该主机加入 [`targets.json`](./targets.json) 的 `custom`
数组并说明理由，维护者会进行审核。

## 内容规则

- 内容必须与所申请的开源项目相关，禁止无关内容。
- 禁止从子域名自动跳转到其他站点；跳转必须由用户主动触发。
- 禁止 NSFW/成人内容、钓鱼、恶意软件及其他滥用行为。

## 合并之后

- GitHub Action 会创建或更新 CNAME 记录 `<subdomain>.<domain> → <target>`
  （标记为 `openrepos-register`）。
- 通常一分钟内生效。记录为 DNS-only，因此由你的托管商提供 HTTPS。
- **请在你的托管平台配置自定义域名**，否则访问会报错：
  - **GitHub Pages**：仓库 Settings → Pages → Custom domain → 填入子域名
  - **Cloudflare Pages**：项目 → Custom domains → 添加子域名
  - **Vercel / Netlify**：在项目中添加该域名
- 出现 TLS 错误或 `522`，通常表示托管平台还没有绑定该自定义域名。

## 移除与滥用

当项目不再开源、被废弃或被用于滥用时，记录会被移除。如需举报滥用或申请移除，请在本仓库
提交 issue。

## 仓库结构

```
.
├── register.json                    # 全部申请（域名 → 子域名 → 条目）
├── domains.json                     # 支持的 7 个域名
├── targets.json                     # 允许的托管商 + 人工批准的自定义目标
├── reserved.json                    # 保留字
├── schema/register.schema.json      # register.json 的 JSON Schema
├── scripts/validate.mjs             # PR 校验（命名、重复、白名单、归属、徽章）
├── scripts/sync-dns.mjs             # Cloudflare DNS 同步（幂等、通配符记录、--prune）
└── .github/workflows/               # validate.yml / dns.yml
```

## 许可证

[MIT](./LICENSE)
