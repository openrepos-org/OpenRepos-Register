# Subdomain claim

<!--
  One project, one subdomain, one domain. Replace the example below before opening this PR.
  CI checks the schema, naming rules, availability, ownership, and the one-domain-per-project rule.
-->

## Checklist

- [ ] I am the owner or a member of the project repository linked below.
- [ ] This project is open source (public repository with an open source license).
- [ ] I claim a subdomain on exactly one OpenRepos domain, and this project does not already
      have a claim on any other OpenRepos domain.
- [ ] The target host is configured to serve my project.

## Claim

```json
{
  "subdomain": "example",
  "domain": "openrepos.io",
  "owner": { "github": "octocat" },
  "project": { "name": "Example Project", "repo": "https://github.com/octocat/example" },
  "target": { "type": "CNAME", "value": "octocat.github.io" }
}
```
