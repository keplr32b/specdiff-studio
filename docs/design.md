# SpecDiff Studio - Design

## Thesis

SpecDiff Studio is a GenLayer product that checks whether a **live implementation or docs page** still matches a **sealed specification page**.

Anyone registers a check with two allowlisted HTTPS URLs: a **spec** URL and an **impl** URL. Validators independently fetch both pages and reach comparative consensus on a closed label:

- `COMPATIBLE` - readable content supports alignment between the two pages for the check’s purpose
- `BREAKING` - readable content shows a clear, material mismatch
- `UNCLEAR` - fetch failed, empty, unusable, or ambiguous (fail-closed; never treated as BREAKING)

Results are stored on-chain with a short history so the demo UI and integrators can show a report trail. SpecDiff does **not** custody funds, freeze agents, or evolve genomes.


## Why GenLayer

Plain contracts cannot read two live documents and agree on meaning. SpecDiff needs independent HTTPS fetches and equivalence on a **closed verdict label** only.

## Adversarial model

| False outcome | Who is hurt |
|---------------|-------------|
| False BREAKING | Teams block releases or panic on noise |
| False COMPATIBLE | Drift ships unnoticed |
| Forced UNCLEAR | Delay without a wrong BREAKING |

### Mitigations

- HTTPS-only + owner host allowlist
- Empty or failed fetch ⇒ `UNCLEAR` only (cannot become BREAKING)
- Comparative consensus on **label only** (notes are non-binding)
- Recheck allowed; history capped per check id
- Honest limits: point-in-time LLM judgment under closed labels

## Lifecycle

```text
allow_host (owner)
  → create_check (check_id, spec_url, impl_url, title)
  → run_check / recheck
  → label: COMPATIBLE | BREAKING | UNCLEAR
  → last_result + history entry
```

**v1 rule:** anyone may create_check and anyone may run_check / recheck (open demo). Owner only controls the host allowlist and is recorded at deploy.


| Verdicts Label | Meaning |
| :--- | :--- |
| `COMPATIBLE` | `Clear alignment signal from readable pages` |
| `BREAKING` | `Clear material mismatch from readable pages` |
| `UNCLEAR` | `Empty, error, or ambiguous — fail-closed` |

## Consensus rules

1. Each validator fetches both URLs via text render.

2. Returns strict JSON only:
{ "label": "COMPATIBLE"|"BREAKING"|"UNCLEAR", "note": "≤160 chars" }

3. If either side is empty or fetch fails ⇒ force UNCLEAR before agreement.

4. Equivalence: EQUIVALENT iff label is identical. Notes may differ.

5. Contract persists agreed label, non-binding note, URLs, and run metadata.

## Core API

| Method | Who |
|--------|-----|
| `allow_host(host)` | Owner |
| `create_check(check_id, spec_url, impl_url, title)` | Anyone (or owner-only — **lock: anyone**) |
| `run_check(check_id)` | Anyone |
| `recheck(check_id)` | Anyone (same as run) |
| `get_last(check_id)` | View |
| `get_history(check_id)` | View (JSON array, capped) |
| `is_host_allowed(host)` / `get_owner` | Views |

## Non-goals

- Fund custody, refunds, or partial payouts
- Agent halt / mandate revoke
- Free-form user URLs without allowlisted hosts
- Guaranteeing legal or security audit outcomes
- Mainnet SLA

## Limits

- Studionet / Studio demo network
- Owner controls host allowlist
- 1–2 pages per check (spec + impl only)
- History cap (e.g. last 10 runs per check_id)
- LLM judgment is point-in-time

## Success criteria

1. Allowlist `docs.genlayer.com` (and/or `genlayer.com`)
2. Check with two related docs URLs → `COMPATIBLE` or honest `UNCLEAR`
3. Impl URL empty/unusable → `UNCLEAR`, not BREAKING
4. Clearly different pages → `BREAKING` or `UNCLEAR` (not false COMPATIBLE)
5. UI: create → run → show label + note + explorer
6. Repo: design, E2E receipts, honest limits

## Live verification

See verification/studionet-e2e.md for addresses and transaction receipts after deploy.