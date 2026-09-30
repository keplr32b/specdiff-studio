# # SpecDiff Studio

**Projects** - dual-URL compatibility checks on GenLayer.

Register a check with a **spec** URL and an **impl** URL (allowlisted HTTPS only). Validators independently fetch both pages and reach comparative consensus on a closed label:

| Label | Meaning |
|-------|---------|
| **COMPATIBLE** | Both readable and clearly aligned |
| **BREAKING** | Both readable and material mismatch / unrelated topics |
| **UNCLEAR** | Empty, fetch failed, or insufficient evidence (fail-closed) |

No fund custody. No agent halt. No metered credits. GenLayer is used for **live dual fetch + label consensus**.

## Live (Studionet)

| Item | Value |
|------|--------|
| Contract | [`0x7A728FDBA822bA16adDc9eD3138980FF89b9868C`](https://explorer-studio.genlayer.com/address/0x7A728FDBA822bA16adDc9eD3138980FF89b9868C) |
| Deploy | [`0xf957411e…`](https://explorer-studio.genlayer.com/tx/0xf957411ea81e21a112efcbb531d38dedb53620c4a4a24b9e382d7f23a12533e9) |

Full receipts: [`verification/studionet-e2e.md`](verification/studionet-e2e.md)

## Quick path

1. Owner `allow_host` for each hostname (`docs.genlayer.com`, …).
2. `create_check(check_id, spec_url, impl_url, title)`.
3. `run_check(check_id)` → `COMPATIBLE` | `BREAKING` | `UNCLEAR`.
4. Views: `get_last`, `get_history`.

## Repo

```text
contracts/specdiff.py
docs/design.md
verification/studionet-e2e.md
tests/test_specdiff_structural.py
README.md
```

## Limits

- Studionet / Studio demo network
- Owner controls host allowlist
- Exactly two URLs per check
- History capped (last 10 runs)
- LLM judgment is point-in-time under closed labels

## License

MIT 