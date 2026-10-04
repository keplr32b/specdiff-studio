# SpecDiff Studio

**Spec vs implementation - verifiable compatibility checks on GenLayer StudioNet.**

Compare two public HTTPS pages (a product specification and its implementation). GenLayer validators fetch both, reach comparative consensus on a closed label, and the contract stores the result on-chain.

**Live app:** https://keplr32b.github.io/specdiff-studio/  
**Contract (StudioNet):** [`0x7A728FDBA822bA16adDc9eD3138980FF89b9868C`](https://explorer-studio.genlayer.com/address/0x7A728FDBA822bA16adDc9eD3138980FF89b9868C)

---

## What it does

1. Owner allowlists HTTPS hosts (`allow_host`).
2. Anyone creates a check: `create_check(check_id, spec_url, impl_url, title)`.
3. Anyone runs evaluation: `run_check(check_id)` — validators fetch both URLs under consensus.
4. Closed labels only: **COMPATIBLE** | **BREAKING** | **UNCLEAR**.
5. Read latest: `get_last(check_id)` / history via `get_history`.
6. Fail-closed: empty/failed fetch → **UNCLEAR**; non-allowlisted host → revert.

---

## Labels

| Label | Meaning |
|--------|---------|
| COMPATIBLE | Spec and impl appear aligned for the stated purpose |
| BREAKING | Clear mismatch or incompatible requirement |
| UNCLEAR | Insufficient or unusable evidence (fail-closed) |

---

## Quick demo (UI)

1. Open https://keplr32b.github.io/specdiff-studio/ in **MetaMask in-app browser**.
2. Connect wallet (StudioNet).
3. `check_id`: e.g. `ui-live-9` (unique).
4. Spec + impl: `https://docs.genlayer.com` (host must be allowlisted).
5. **Run compatibility check** → approve `create_check` and `run_check`.
6. Progress should reach **Result read from contract**; log shows `label: COMPATIBLE`.

---

## Live proof (StudioNet)

| Item | Value |
|------|--------|
| Contract | [`0x7A728FDBA822bA16adDc9eD3138980FF89b9868C`](https://explorer-studio.genlayer.com/address/0x7A728FDBA822bA16adDc9eD3138980FF89b9868C) |
| UI check | `ui-live-9` → **COMPATIBLE** |
| create_check | [`0xf1d6f9585ff8f2a428230b21bb238cb841691d9e1d5a85ce82bc7300b452f0af`](https://explorer-studio.genlayer.com/tx/0xf1d6f9585ff8f2a428230b21bb238cb841691d9e1d5a85ce82bc7300b452f0af) |
| run_check | [`0xc3c001cb98c7539fc13d60d80ff5af25c05e299d6575a7f72e27ac9e83a152a5`](https://explorer-studio.genlayer.com/tx/0xc3c001cb98c7539fc13d60d80ff5af25c05e299d6575a7f72e27ac9e83a152a5) |

Full matrix (host reject, UNCLEAR, BREAKING, recheck): see [`verification/studionet-e2e.md`](verification/studionet-e2e.md).

---

## Contract API (summary)

| Method | Role |
|--------|------|
| `allow_host(host)` | Owner - hostname only (e.g. `docs.genlayer.com`) |
| `is_host_allowed(host)` | View |
| `create_check(id, spec_url, impl_url, title)` | Register pair |
| `run_check(id)` / `recheck(id)` | Consensus judgment |
| `get_last(id)` / `get_history(id)` | Read results |

HTTPS only; host allowlist enforced.

---

## Repo layout

```text
.specdiff-studio/
├── .github/workflows/     # Pages / deploy
├── contracts/             # specdiff.py
├── docs/                  # design.md
├── src/                   # main.js (+ style if present)
├── tests/                 # structural tests
├── verification/          # studionet-e2e.md
├── .gitignore
├── README.md
├── index.html
├── package.json
└── vite.config.js
```

## Limits

- StudioNet demo - not a mainnet SLA.
- Owner-controlled host allowlist.
- LLM judgment is point-in-time under closed labels.
- Public pages can change; ratios/labels are not a legal audit.

## License

MIT