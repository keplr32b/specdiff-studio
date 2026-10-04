# SpecDiff - Studionet E2E

## Canonical contract

| Item | Value |
|------|--------|
| Address | [`0x7A728FDBA822bA16adDc9eD3138980FF89b9868C`](https://explorer-studio.genlayer.com/address/0x7A728FDBA822bA16adDc9eD3138980FF89b9868C) |
| Network | GenLayer StudioNet |
| UI | https://keplr32b.github.io/specdiff-studio/ |

Features: dual-URL spec vs impl · closed labels COMPATIBLE / BREAKING / UNCLEAR · host allowlist · fail-closed empty fetch · `create_check` + `run_check` + `get_last` · frontend wallet flow.

---

## Smoke matrix

| Step | Result | Tx |
|------|--------|-----|
| allow_host docs.genlayer.com | ok | [`0x91377a54d621611f072a9b835b035fa36d3648bdd67537fbb82da0b1721c8d5f`](https://explorer-studio.genlayer.com/tx/0x91377a54d621611f072a9b835b035fa36d3648bdd67537fbb82da0b1721c8d5f) |
| allow_host genlayer.com | ok | [`0x94d5e157f151b1653f36250b37e83f03c2f63ee0d8100930f49a9e330a7ec217`](https://explorer-studio.genlayer.com/tx/0x94d5e157f151b1653f36250b37e83f03c2f63ee0d8100930f49a9e330a7ec217) |
| allow_host rekt.news | ok | [`0x887e1608b63c2d7e9cb67e941e206177a174a45c84aee7bb1d539cf699225dd9`](https://explorer-studio.genlayer.com/tx/0x887e1608b63c2d7e9cb67e941e206177a174a45c84aee7bb1d539cf699225dd9) |
| create docs-align-2 (self pair) | ok | [`0x68242e2cf37f8620ddb04d7ba9a25b3badaa751f1cfbf694fe0bd2f803e84db7`](https://explorer-studio.genlayer.com/tx/0x68242e2cf37f8620ddb04d7ba9a25b3badaa751f1cfbf694fe0bd2f803e84db7) |
| run_check docs-align-2 | COMPATIBLE | [`0x56d97ecec110a5605a187dcc434268aa7fec0fee0ab9fe28295f2e52816f6d12`](https://explorer-studio.genlayer.com/tx/0x56d97ecec110a5605a187dcc434268aa7fec0fee0ab9fe28295f2e52816f6d12) |
| create unclear-2 (404 impl) | ok | [`0xd902723b5ca8b8cf36531aba592a785cd7ce01a879440a971acfad68dba27394`](https://explorer-studio.genlayer.com/tx/0xd902723b5ca8b8cf36531aba592a785cd7ce01a879440a971acfad68dba27394) |
| run_check unclear-2 | UNCLEAR | [`0x5ce3698daafb0ad2db8c228d87c70252ab62dc1ce7c05b58fcbbf75944a25065`](https://explorer-studio.genlayer.com/tx/0x5ce3698daafb0ad2db8c228d87c70252ab62dc1ce7c05b58fcbbf75944a25065) |
| create break-hard-2 (docs vs rekt) | ok | [`0x9b6bd67600afef96de4a3017d4832a74396ffb682786f3e268d04485d1175543`](https://explorer-studio.genlayer.com/tx/0x9b6bd67600afef96de4a3017d4832a74396ffb682786f3e268d04485d1175543) |
| run_check break-hard-2 | BREAKING | [`0xb7ecb57ad8d77033a0f08dc88a98e45fe3c61a47929d80f52269ab53df94c4c3`](https://explorer-studio.genlayer.com/tx/0xb7ecb57ad8d77033a0f08dc88a98e45fe3c61a47929d80f52269ab53df94c4c3) |
| create reject-2 (example.com) | host not allowed | [`0x1be757017305b30d183bb65a19856ec9b46429964a610630d975388f4e9e6204`](https://explorer-studio.genlayer.com/tx/0x1be757017305b30d183bb65a19856ec9b46429964a610630d975388f4e9e6204) |
| recheck docs-align-2 | COMPATIBLE | [`0x9abb71dc97f8ac02cac733a9c140b9ed215e4596e91191ad33d88469a63f9765`](https://explorer-studio.genlayer.com/tx/0x9abb71dc97f8ac02cac733a9c140b9ed215e4596e91191ad33d88469a63f9765) |

### UI path (frontend)

| Step | Result | Tx |
|------|--------|-----|
| UI create_check `ui-live-9` | accepted | [`0xf1d6f9585ff8f2a428230b21bb238cb841691d9e1d5a85ce82bc7300b452f0af`](https://explorer-studio.genlayer.com/tx/0xf1d6f9585ff8f2a428230b21bb238cb841691d9e1d5a85ce82bc7300b452f0af) |
| UI run_check `ui-live-9` | accepted | [`0xc3c001cb98c7539fc13d60d80ff5af25c05e299d6575a7f72e27ac9e83a152a5`](https://explorer-studio.genlayer.com/tx/0xc3c001cb98c7539fc13d60d80ff5af25c05e299d6575a7f72e27ac9e83a152a5) |
| UI get_last | **COMPATIBLE** | progress COMPLETE · ON-CHAIN table row |

---

## Frontend checklist

| Check | OK |
|-------|-----|
| MetaMask connect, truncated address | yes |
| create_check → ACCEPTED | yes |
| run_check → ACCEPTED | yes |
| get_last → COMPATIBLE + ON-CHAIN row | yes |
| Non-allowlisted host blocked | yes (`reject-2`) |

Note: `wallet_getSnaps` console noise from MetaMask is harmless.

---

## Design checks

- Comparative consensus on closed labels only (COMPATIBLE / BREAKING / UNCLEAR).
- Fail-closed: unusable or empty fetch must not become COMPATIBLE (see unclear-2).
- Owner host allowlist; HTTPS-only; unauthorized host reverts (see reject-2).
- UI reads `get_last` after writes — no client-side verdict invention.
- StudioNet demo; not a production compliance audit.

---

## Reproduce

1. UI: https://keplr32b.github.io/specdiff-studio/  
2. Or Studio: `create_check` / `run_check` / `get_last` on the contract above.  
3. Match receipts in this file and explorer.