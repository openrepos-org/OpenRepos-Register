# <img src="./assets/logo.svg" width="28" height="28" alt="OpenRepos logo" /> OpenRepos Register

**English** · [简体中文](./README.zh-CN.md) · [日本語](./README.ja.md) · [العربية](./README.ar.md) · [Español](./README.es.md) · [Português](./README.pt.md)

Claim a **free subdomain for your open source project** on one of the OpenRepos domains.
Free forever, and the domains are managed for the long term.

- Website: **https://openrepos.org/** — the other six domains redirect there
- All claims live in one file: [`register.json`](./register.json)
- Example: `awesome-project.openrepos.org` → your project's site

## Domains

| Domain           | Website                     |
| ---------------- | --------------------------- |
| `openrepos.io`   | https://openrepos.io/       |
| `openrepos.org`  | https://openrepos.org/      |
| `openrepos.sh`   | https://openrepos.sh/       |
| `repos.one`      | https://repos.one/          |
| `sourcepage.io`  | https://sourcepage.io/      |
| `sourcepage.org` | https://sourcepage.org/     |
| `sourcepage.sh`  | https://sourcepage.sh/      |

## Rules

1. **Free forever**, for open source projects only (a public GitHub repository with a LICENSE).
2. **You must own the project repository**, or be a member of the organization that owns it.
   CI verifies this from your pull request author.
3. **One subdomain per project, on exactly one domain** — a project may not be claimed on more
   than one OpenRepos domain.
4. Subdomain names: 3–63 characters, lowercase `a-z`, `0-9`, `-`; must not start or end with `-`.
5. Reserved names cannot be claimed — see [`reserved.json`](./reserved.json).
6. Targets must be one of the allowed hosting providers (see below); custom targets need
   maintainer approval.
7. **Add the OpenRepos badge to your project README** — it is checked automatically on every new
   claim (see [Add the badge](#add-the-badge)).
8. You are responsible for the content served under your subdomain. Content rules apply:
   keep it about your open source project, no automatic redirects away, no NSFW/adult content.
   Abusive subdomains can be removed.

## How to claim

1. Pick a domain and a free subdomain, e.g. `awesome-project.openrepos.org`.
2. Edit [`register.json`](./register.json) and add your entry under the chosen domain:

   ```json
   "openrepos.org": {
     "awesome-project": {
       "repo": "https://github.com/octocat/awesome-project",
       "target": "octocat.github.io"
     }
   }
   ```

3. Add the OpenRepos badge to your project README (see [Add the badge](#add-the-badge)).
4. Open a pull request. CI validates naming, reserved names, duplicates, the target allowlist,
   ownership and the badge.
5. A maintainer reviews and merges the pull request. After merge, DNS is provisioned
   automatically — no further action from you.

> Tip: use GitHub's **edit** (pencil) button on `register.json`. GitHub will fork the
> repository and open a pull request for you.

## Fields

The subdomain is the key — each entry only needs two fields:

| Field    | Required | Description                                                          |
| -------- | -------- | -------------------------------------------------------------------- |
| `repo`   | yes      | Public GitHub repository of your open source project                 |
| `target` | yes      | CNAME target host, e.g. `octocat.github.io`                          |
| `txt`    | no       | Provider verification TXT record (see below)                         |

Ownership is verified from your pull request author, so there is no `owner` field to fill in.
Records are DNS-only so your host serves TLS.

### Provider verification (TXT)

Some providers require a TXT record before they will serve your custom domain. Add it inside your
entry — copy both values from the provider's dashboard:

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

- `name` is the label the provider gives you; it must start with `_`. The record created is
  `<name>.<your-subdomain>.<domain>` TXT.
- `value` is the exact value the provider gives you (1–255 printable ASCII characters).
- The record is created automatically after merge and removed when you delete the `txt` field.

## Add the badge

New claims must include an OpenRepos badge in the project README. The badge is dynamic: it shows
`pending` while your claim is under review and flips to `live` automatically after merge — no
README edits needed later.

Pick any [shields.io style](https://shields.io) (`flat`, `flat-square`, `plastic`,
`for-the-badge`, `social`):

```markdown
[![OpenRepos](https://img.shields.io/endpoint?url=https://openrepos.org/status/awesome-project.openrepos.org.json&style=flat-square)](https://awesome-project.openrepos.org/)
```

The status URL always uses `openrepos.org`; replace `awesome-project` with your subdomain, and use the domain you claimed in the link.

Static alternative (no dynamic request; note that shields encodes `-` as `--`):

```markdown
[![OpenRepos](https://img.shields.io/badge/openrepos.org-awesome-project.openrepos.org-blue?style=flat-square)](https://awesome-project.openrepos.org/)
```

The badge URL must reference your exact subdomain — CI checks for it and rejects claims without it.

## Allowed targets

Subdomains may only point at established hosting providers:

| Pattern                            | Provider         | Domain verification      |
| ---------------------------------- | ---------------- | ------------------------ |
| `*.github.io`                      | GitHub Pages     | none                     |
| `*.gitlab.io`                      | GitLab Pages     | **TXT required**         |
| `*.pages.dev`                      | Cloudflare Pages | none                     |
| `*.netlify.app`                    | Netlify          | TXT sometimes required   |
| `*.vercel.app`, `*.vercel-dns.com` | Vercel           | TXT sometimes required   |
| `*.surge.sh`                       | Surge            | none                     |
| `*.gitbook.io`, `*.gitbook.com`    | GitBook          | none                     |
| `*.alwaysdata.net`                 | Alwaysdata       | none                     |

If your project needs a different target, add the exact hostname to the `custom` array in
[`targets.json`](./targets.json) in the same pull request and explain why. A maintainer will
review it.

## Content rules

- Serve content about the claimed open source project — no unrelated content.
- No automatic redirects away from the subdomain; redirects must require user interaction.
- No NSFW/adult content, phishing, malware, or other abuse.

## What happens after merge

- A GitHub Action creates or updates a CNAME record `<subdomain>.<domain> → <target>` and, when
  your entry has a `txt` field, the matching TXT record (all tagged with the comment
  `openrepos-register`).
- Changes usually propagate within a minute. Records are DNS-only, so your hosting provider
  serves HTTPS.
- **Configure the custom domain at your host** before or right after merge, otherwise the
  subdomain will show an error:
  - **GitHub Pages**: repository Settings → Pages → Custom domain → add your subdomain, then enable **Enforce HTTPS**
  - **Cloudflare Pages**: project → Custom domains → add your subdomain (or call `POST /accounts/{account_id}/pages/projects/{project}/domains`); Pages answers `522` until it is added
  - **Vercel / Netlify**: add the domain in the project settings; if the provider asks you to verify with a TXT record, copy its name and value into the `txt` field of your entry
  - **GitLab Pages**: add the domain in the project's Pages settings; GitLab shows a TXT record (name `_gitlab-pages-verification-code`) — copy it into the `txt` field of your entry
  - **Surge / GitBook / Alwaysdata**: add the custom domain in the provider dashboard; no extra records needed
- A TLS error or a `522` usually means the custom domain has not been added at the host yet.

## Removal and abuse

Records can be removed when a project is no longer open source, is abandoned, or is used for
abuse. To report abuse or request removal, open an issue in this repository.

The full process — content rules, triage, removal, appeals — and the reserved-name policy are
documented at **https://openrepos.org/abuse**. Reserved names (see
[`reserved.json`](./reserved.json)) protect infrastructure and prevent impersonation; releases
are reviewed case by case.

## Repository layout

```
.
├── register.json                    # all claims (domain → subdomain → entry)
├── domains.json                     # the seven supported domains
├── targets.json                     # allowed hosting providers + approved custom targets
├── reserved.json                    # reserved subdomain names
├── schema/register.schema.json      # JSON Schema for register.json
├── scripts/validate.mjs             # PR validation (naming, duplicates, allowlist, ownership, badge)
├── scripts/sync-dns.mjs             # Cloudflare DNS sync (idempotent, wildcard records, --prune)
└── .github/workflows/               # validate.yml / dns.yml
```

## License

[MIT](./LICENSE)
