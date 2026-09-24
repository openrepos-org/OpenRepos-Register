# OpenRepos Register

> **Placeholder.** This repository is not live yet. It will be extracted into its own
> GitHub repository and linked from the [OpenRepos website](https://openrepos.io).

Claim a free subdomain for your open source project on one of the OpenRepos domains:

| Domain           |
| ---------------- |
| `openrepos.io`   |
| `openrepos.org`  |
| `openrepos.sh`   |
| `repos.one`      |
| `sourcepage.io`  |
| `sourcepage.org` |
| `sourcepage.sh`  |

## Rules

1. Free forever, for open source projects only (a public repository with an open source license).
2. One subdomain per project, and **one domain per project** — you may pick exactly one of the
   seven domains above.
3. Subdomain names must be valid DNS labels: `a-z0-9-`, 3–63 characters, no leading/trailing `-`.
4. Reserved names are not available.
5. You are responsible for the content served under your subdomain.

## How to claim (planned)

1. Pick a domain and a free subdomain, e.g. `awesome-project.openrepos.io`.
2. Add a file `domains/awesome-project.json` following
   [`domains/example.json`](./domains/example.json) and open a pull request.
3. CI validates the request (schema, naming, availability, ownership, and the one-domain rule).
4. Once merged, DNS is provisioned automatically and your subdomain goes live over HTTPS.

Full documentation will be published with the standalone repository.

## Layout

```
.
├── domains/            # one JSON file per claimed subdomain
│   └── example.json
└── schema/
    └── domain.schema.json
```
