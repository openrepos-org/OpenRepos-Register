# Subdomain claim

<!--
  One project, one subdomain, one domain. Replace the example below with your claim.
  CI checks the entry (naming, reserved names, duplicates, ownership) before review.
-->

## Claim

```json
"openrepos.io": {
  "your-project": {
    "owner": "your-github-username",
    "repo": "https://github.com/you/your-project",
    "target": "you.github.io"
  }
}
```

## Checklist

- [ ] I edited `register.json` and added exactly one claim under **one** domain.
- [ ] I own the project repository or am a member of its organization.
- [ ] The project is open source (public repository with a LICENSE).
- [ ] The target host is already configured to serve my project.
- [ ] This project is not claimed on any other OpenRepos domain.
