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
2. **One subdomain per project, on exactly one domain** — a project may not be claimed on more
   than one OpenRepos domain.
3. Subdomain names: 3–63 characters, lowercase `a-z`, `0-9`, `-`; must not start or end with `-`.
4. Reserved names cannot be claimed — see [`reserved.json`](./reserved.json).
5. You are responsible for the content served under your subdomain. Abusive subdomains can be removed.

## How to claim

1. Pick a domain and a free subdomain, e.g. `awesome-project.openrepos.io`.
2. Edit [`register.json`](./register.json) and add your entry under the chosen domain:

   ```json
   "openrepos.io": {
     "awesome-project": {
       "owner": "octocat",
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

| Field         | Required | Description                                                              |
| ------------- | -------- | ------------------------------------------------------------------------ |
| `owner`       | yes      | Your GitHub username; must own (or be a member of the org that owns) `repo` |
| `repo`        | yes      | Public GitHub repository of your open source project                     |
| `target`      | yes      | CNAME target host, e.g. `octocat.github.io`                              |
| `description` | no       | Short project description (≤ 200 characters)                             |
| `proxied`     | no       | Route through the Cloudflare proxy. Default `false`                      |

`target` can point at GitHub Pages, Cloudflare Pages, Vercel, Netlify, or your own server —
anything that serves HTTP(S). By default the record is DNS-only (`proxied: false`) so your host
serves TLS; set `"proxied": true` to use Cloudflare's proxy instead.

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
