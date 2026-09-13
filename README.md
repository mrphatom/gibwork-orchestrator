# gibwork-orchestrator

**Enterprise-grade internal control plane for Gibwork bounties.**

Create, list, review, approve and reject bounties from the terminal or from YAML/JSON specs.  
Built for engineering teams that want to treat paid work as a first-class workflow.

Coordinates with the rest of the ecosystem:

| Tool | Role |
|------|------|
| `gibwork-github-bounty` | Auto-create bounties from labeled GitHub issues |
| `gibwork-agent` | Discover open bounties and submit work |
| **gibwork-orchestrator** | Team-side creation, review & payment control |

---

## Features

- Create bounties from CLI flags or YAML/JSON files
- List own bounties
- List submissions per bounty
- Approve / reject with amount and reason
- Dry-run mode throughout
- Zod-validated specs
- External reference field (Linear, Jira, GitHub issue, etc.)
- Ready for CI and internal automation

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

### Create a bounty

```bash
npx tsx src/cli.ts create --title "Fix flaky CI" --content "<p>...</p>" --reward 40.00
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

## Ecosystem Workflow

1. **Create** – Orchestrator or GitHub Action creates the bounty
2. **Discover & Work** – `gibwork-agent` (or humans) finds and submits
3. **Review & Pay** – Orchestrator lists submissions and approves/rejects

All three tools share the same wallet configuration style and dry-run safety model.

---

## License

MIT
