# <img src="./assets/logo.svg" width="28" height="28" alt="OpenRepos logo" /> OpenRepos Register

[English](./README.md) · **简体中文** · [日本語](./README.ja.md) · [العربية](./README.ar.md) · [Español](./README.es.md) · [Português](./README.pt.md)

为你的开源项目在 OpenRepos 的域名下申请一个**免费二级域名**。永久免费，域名长期妥善管理。

- 官网：**https://openrepos.org/**——其余 6 个域名会重定向到这里
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

子域名即 key，每条记录包含以下字段：

| 字段     | 必填 | 说明                                              |
| -------- | ---- | ------------------------------------------------- |
| `repo`   | 是   | 你的开源项目仓库（公开的 GitHub 仓库）            |
| `target` | 是   | CNAME 目标主机，例如 `octocat.github.io`          |
| `txt`    | 否   | 托管商域名校验 TXT 记录（见下文）                 |

归属由 PR 作者自动校验，因此没有 `owner` 字段。记录为 DNS-only，由你的托管商提供 TLS。

### 托管商校验（TXT）

部分托管商要求先添加 TXT 记录才会为你的自定义域名提供服务。把托管商后台给出的信息填入条目：

```json
"awesome-project": {
  "repo": "https://github.com/octocat/awesome-project",
  "target": "octocat.gitlab.io",
  "txt": {
    "name": "_gitlab-pages-verification-code",
    "value": "gitlab-pages-verification-code=abc123"
  }
}
```

- `name` 是托管商给出的标签（必须以 `_` 开头）；实际创建的记录是
  `<name>.<你的子域名>.<域名>` TXT。
- `value` 是托管商给出的原始值（1–255 个可打印 ASCII 字符）。
- 合并后自动创建；删除 `txt` 字段后会自动移除。

## 添加徽章

新申请必须在项目 README 中放置 OpenRepos 徽章。徽章是动态的：审核期间显示 `pending`，
合并后自动变为 `live`，无需再修改 README。

可选择任意 [shields.io 样式](https://shields.io)（`flat`、`flat-square`、`plastic`、
`for-the-badge`、`social`）：

```markdown
[![OpenRepos](https://img.shields.io/endpoint?url=https://openrepos.org/status/awesome-project.openrepos.org.json&style=flat-square)](https://awesome-project.openrepos.org/)
```

状态 URL 始终使用 `openrepos.org`；把 `awesome-project` 替换为你的子域名，链接中使用你申请的域名。

静态备选（不发起动态请求；注意 shields 会把 `-` 转义为 `--`）：

```markdown
[![OpenRepos](https://img.shields.io/badge/openrepos.org-awesome-project.openrepos.org-blue?style=flat-square)](https://awesome-project.openrepos.org/)
```

徽章 URL 必须包含你的完整子域名——CI 会据此校验，缺失则拒绝申请。

## 允许的目标

子域名只能指向以下托管商：

| 模式                               | 托管商           | 域名校验           |
| ---------------------------------- | ---------------- | ------------------ |
| `*.github.io`                      | GitHub Pages     | 无需               |
| `*.gitlab.io`                      | GitLab Pages     | **必须 TXT**       |
| `*.pages.dev`                      | Cloudflare Pages | 无需               |
| `*.netlify.app`                    | Netlify          | 有时需要 TXT       |
| `*.vercel.app`, `*.vercel-dns.com` | Vercel           | 有时需要 TXT       |
| `*.surge.sh`                       | Surge            | 无需               |
| `*.gitbook.io`, `*.gitbook.com`    | GitBook          | 无需               |
| `*.alwaysdata.net`                 | Alwaysdata       | 无需               |

如需其他目标，请在同一个 PR 中把该主机加入 [`targets.json`](./targets.json) 的 `custom`
数组并说明理由，维护者会进行审核。

## 内容规则

- 内容必须与所申请的开源项目相关，禁止无关内容。
- 禁止从子域名自动跳转到其他站点；跳转必须由用户主动触发。
- 禁止 NSFW/成人内容、钓鱼、恶意软件及其他滥用行为。

## 合并之后

- GitHub Action 会创建或更新 CNAME 记录 `<subdomain>.<domain> → <target>`；若条目包含
  `txt` 字段，也会创建对应的 TXT 记录（均标记为 `openrepos-register`）。
- 通常一分钟内生效。记录为 DNS-only，因此由你的托管商提供 HTTPS。
- **请在你的托管平台配置自定义域名**，否则访问会报错：
  - **GitHub Pages**：仓库 Settings → Pages → Custom domain → 填入子域名，然后启用 **Enforce HTTPS**
  - **Cloudflare Pages**：项目 → Custom domains → 添加子域名（或调用 API `POST /accounts/{account_id}/pages/projects/{project}/domains`）；未绑定前会返回 `522`
  - **Vercel / Netlify**：在项目设置中添加该域名；如果平台要求 TXT 校验，把它的名称和值填入条目的 `txt` 字段
  - **GitLab Pages**：在项目的 Pages 设置中添加域名；GitLab 会给出 TXT 记录（名称为 `_gitlab-pages-verification-code`），把它填入条目的 `txt` 字段
  - **Surge / GitBook / Alwaysdata**：在平台后台添加自定义域名即可，无需额外记录
- 出现 TLS 错误或 `522`，通常表示托管平台还没有绑定该自定义域名。

## 移除与滥用

当项目不再开源、被废弃或被用于滥用时，记录会被移除。如需举报滥用或申请移除，请在本仓库
提交 issue。

完整流程（内容规则、审核、移除、申诉）与保留字政策见
**https://openrepos.org/abuse**。保留字（见 [`reserved.json`](./reserved.json)）用于保护
基础设施、防止冒用，释放申请逐案审核。

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
