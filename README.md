# gibwork-orchestrator

**Enterprise-grade internal control plane for Gibwork bounties.**

Create, list, review, approve and reject bounties from the terminal, YAML/JSON specs, or GitHub Actions.

Part of the coordinated tooling suite:

| Tool | Role |
|------|------|
| [gibwork-github-bounty](https://github.com/mrphatom/gibwork-github-bounty) | Auto-create bounties from labeled GitHub issues |
| [gibwork-agent](https://github.com/mrphatom/gibwork-agent) | Discover open bounties and submit work |
| **gibwork-orchestrator** (this repo) | Team-side creation, review & payment control |

Full workflow: [ECOSYSTEM.md](https://github.com/mrphatom/gibwork-github-bounty/blob/main/ECOSYSTEM.md)

---

## Features

- Create bounties from CLI flags or YAML/JSON files
- List own bounties and their submissions
- Approve / reject with amount and reason
- Dry-run mode throughout
- Zod-validated specs + external reference field
- Manual `workflow_dispatch` Action for creating bounties from the GitHub UI
- CI pipeline

---

## Quick Start

```bash
git clone https://github.com/mrphatom/gibwork-orchestrator.git
cd gibwork-orchestrator
npm install
cp .env.example .env
# start with DRY_RUN=true
npm run build
```

### Create

```bash
npx tsx src/cli.ts create \
  --title "Fix flaky CI job" \
  --content "<p>Make the e2e suite stable...</p>" \
  --reward 40.00 \
  --tags "ci,devops" \
  --ref "LINEAR-987"

# or from file
npx tsx src/cli.ts create --file examples/bounty.example.yaml
```

### Review & pay

```bash
npx tsx src/cli.ts list
npx tsx src/cli.ts submissions --task <taskId>
npx tsx src/cli.ts approve --task <taskId> --submission <subId> --amount 40.00
npx tsx src/cli.ts reject  --task <taskId> --submission <subId> --reason "Missing tests"
```

---

## GitHub Actions

- **CI** – typecheck + build
- **Create Bounty (manual)** – `workflow_dispatch` with title, content, reward, tags, ref inputs

Set repository secrets/vars:
- `SOLANA_PRIVATE_KEY` (secret)
- `GIBWORK_ENVIRONMENT`, `DRY_RUN` (vars)

---

## Bounty Spec (YAML)

```yaml
title: "Clear title"
content: |
  Full HTML or markdown description
reward: "50.00"
tags: [typescript, backend]
minSubmissionAmount: "5.00"
externalRef: "LINEAR-123"
```

---

## License

MIT
