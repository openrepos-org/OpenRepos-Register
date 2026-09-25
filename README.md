# OpenRepos Register

Claim a **free subdomain for your open source project** on one of the OpenRepos domains.

| Domain           |
| ---------------- |
| `openrepos.io`   |
| `openrepos.org`  |
| `openrepos.sh`   |
| `repos.one`      |
| `sourcepage.io`  |
| `sourcepage.org` |
| `sourcepage.sh`  |

All claims live in a single file: [`register.json`](./register.json).

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
7. **Add the OpenRepos badge to your project README** — it is checked automatically on every
   new claim (see [Add the badge](#add-the-badge)).
8. You are responsible for the content served under your subdomain. Content rules apply:
   keep it about your open source project, no automatic redirects away, no NSFW/adult content.
   Abusive subdomains can be removed.

## How to claim

1. Pick a domain and a free subdomain, e.g. `awesome-project.openrepos.io`.
2. Edit [`register.json`](./register.json) and add your entry under the chosen domain:

   ```json
   "openrepos.io": {
     "awesome-project": {
       "repo": "https://github.com/octocat/awesome-project",
       "target": "octocat.github.io"
     }
   }
   ```

3. Open a pull request. CI validates naming, reserved names, duplicates and ownership.
4. A maintainer reviews and merges the pull request. After merge, DNS is provisioned
   automatically — no further action from you.

> Tip: use GitHub's **edit** (pencil) button on `register.json`. GitHub will fork the
> repository and open a pull request for you.

## Fields

The subdomain is the key — each entry only needs two fields:

| Field    | Required | Description                                                          |
| -------- | -------- | -------------------------------------------------------------------- |
| `repo`   | yes      | Public GitHub repository of your open source project                 |
| `target` | yes      | CNAME target host, e.g. `octocat.github.io`                          |

Ownership is verified from your pull request author, so there is no `owner` field to fill in.

Records are DNS-only so your host serves TLS.

## Allowed targets

Subdomains may only point at established hosting providers:

| Pattern                        | Provider        |
| ------------------------------ | --------------- |
| `*.github.io`                  | GitHub Pages    |
| `*.gitlab.io`                  | GitLab Pages    |
| `*.pages.dev`                  | Cloudflare Pages |
| `*.netlify.app`                | Netlify         |
| `*.vercel.app`, `*.vercel-dns.com` | Vercel      |
| `*.surge.sh`                   | Surge           |
| `*.gitbook.io`, `*.gitbook.com` | GitBook        |
| `*.alwaysdata.net`             | Alwaysdata      |

If your project needs a different target, add the exact hostname to the `custom` array in
[`targets.json`](./targets.json) in the same pull request and explain why. A maintainer will
review it.

## Add the badge

New claims must include an OpenRepos badge in the project README. The badge is dynamic: it shows
`pending` while your claim is under review and flips to `live` automatically after merge — no
README edits needed later.

Pick any [shields.io style](https://shields.io) (`flat`, `flat-square`, `plastic`,
`for-the-badge`, `social`):

```markdown
[![OpenRepos](https://img.shields.io/endpoint?url=https://openrepos.org/status/awesome-project.openrepos.org.json&style=flat-square)](https://awesome-project.openrepos.org/)
```

Replace `openrepos.org` with the domain you claimed, and `awesome-project` with your subdomain.

Static alternative (no dynamic request; note that shields encodes `-` as `--`):

```markdown
[![OpenRepos](https://img.shields.io/badge/openrepos.org-awesome-project.openrepos.org-blue?style=flat-square)](https://awesome-project.openrepos.org/)
```

The badge URL must reference your exact subdomain — CI checks for it and rejects claims without it.

## Content rules

- Serve content about the claimed open source project — no unrelated content.
- No automatic redirects away from the subdomain; redirects must require user interaction.
- No NSFW/adult content, phishing, malware, or other abuse.

## What happens after merge

- A GitHub Action creates or updates a CNAME record `<subdomain>.<domain> → <target>`
  (tagged with the comment `openrepos-register`).
- Changes usually propagate within a minute.
- Make sure your host is configured to answer for the custom domain.

## Removal and abuse

Records can be removed when a project is no longer open source, is abandoned, or is used for
abuse. To report abuse or request removal, open an issue in this repository.

## Repository layout

```
.
├── register.json                    # all claims (domain → subdomain → entry)
├── domains.json                     # the seven supported domains
├── reserved.json                    # reserved subdomain names
├── schema/register.schema.json      # JSON Schema for register.json
├── scripts/validate.mjs             # PR validation
├── scripts/sync-dns.mjs             # Cloudflare DNS sync (idempotent)
└── .github/workflows/               # validate.yml / dns.yml
```

## For maintainers

- Add a `CLOUDFLARE_API_TOKEN` repository secret with **Zone:Read** and **Zone:DNS:Edit**
  for all seven zones. Without it, the `Sync DNS` workflow skips with a notice.
- `node scripts/validate.mjs` runs locally too (set `GITHUB_TOKEN` to enable ownership checks).
- `node scripts/sync-dns.mjs --dry-run` previews DNS changes without applying them.

## License

[MIT](./LICENSE)
