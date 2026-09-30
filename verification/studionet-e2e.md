# SpecDiff Studio - Studionet E2E

## Canonical contract

| Item | Value |
|------|--------|
| Contract | [`0x7A728FDBA822bA16adDc9eD3138980FF89b9868C`](https://explorer-studio.genlayer.com/address/0x7A728FDBA822bA16adDc9eD3138980FF89b9868C) |
| Deploy | [`0xf957411ea81e21a112efcbb531d38dedb53620c4a4a24b9e382d7f23a12533e9`](https://explorer-studio.genlayer.com/tx/0xf957411ea81e21a112efcbb531d38dedb53620c4a4a24b9e382d7f23a12533e9) |

Prompt rules (v2): empty/fail → UNCLEAR only; both readable + aligned → COMPATIBLE; both readable + material mismatch or unrelated topics → BREAKING. Comparative consensus on **label only**.

## Smoke matrix

| Step | Result | Tx |
|------|--------|-----|
| allow_host `docs.genlayer.com` | ok | `0x91377a54d621611f072a9b835b035fa36d3648bdd67537fbb82da0b1721c8d5f` |
| allow_host `genlayer.com` | ok | `0x94d5e157f151b1653f36250b37e83f03c2f63ee0d8100930f49a9e330a7ec217` |
| allow_host `rekt.news` | ok | `0x887e1608b63c2d7e9cb67e941e206177a174a45c84aee7bb1d539cf699225dd9` |
| create `docs-align-2` (self pair) | ok | `0x68242e2cf37f8620ddb04d7ba9a25b3badaa751f1cfbf694fe0bd2f803e84db7` |
| run_check `docs-align-2` | **COMPATIBLE** | `0x56d97ecec110a5605a187dcc434268aa7fec0fee0ab9fe28295f2e52816f6d12` |
| create `unclear-2` (404 impl) | ok | `0xd902723b5ca8b8cf36531aba592a785cd7ce01a879440a971acfad68dba27394` |
| run_check `unclear-2` | **UNCLEAR** | `0x5ce3698daafb0ad2db8c228d87c70252ab62dc1ce7c05b58fcbbf75944a25065` |
| create `break-hard-2` (docs vs rekt) | ok | `0x9b6bd67600afef96de4a3017d4832a74396ffb682786f3e268d04485d1175543` |
| run_check `break-hard-2` | **BREAKING** | `0xb7ecb57ad8d77033a0f08dc88a98e45fe3c61a47929d80f52269ab53df94c4c3` |
| create `reject-2` (example.com) | **host not allowed** | `0x1be757017305b30d183bb65a19856ec9b46429964a610630d975388f4e9e6204` |
| recheck `docs-align-2` | **COMPATIBLE** | `0x9abb71dc97f8ac02cac733a9c140b9ed215e4596e91191ad33d88469a63f9765` |

## Design checks

- Comparative consensus on verdict **label** only (note non-binding)
- Fail-closed host allowlist; empty/404 fetch must not be BREAKING or COMPATIBLE
- All three labels proven live: COMPATIBLE / BREAKING / UNCLEAR
- No custody, no halt flag, no credits