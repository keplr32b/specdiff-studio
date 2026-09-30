# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""
SpecDiff Studio — dual-URL compatibility checks on GenLayer (Projects).

Seal a check with spec_url + impl_url (allowlisted HTTPS).
run_check: validators fetch both pages and agree on
COMPATIBLE | BREAKING | UNCLEAR (label only).
Empty/failed fetch => UNCLEAR (never BREAKING).
No custody, no halt flags, no credits.
"""

from genlayer import *
import json

try:
    _UserError = gl.vm.UserError
except Exception:
    _UserError = Exception

HISTORY_CAP = 10


def require(cond: bool, msg: str) -> None:
    if not cond:
        raise _UserError(msg)


def canonical(obj) -> str:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"))


def parse_json_response(text: str) -> dict:
    t = (text or "").strip()
    if t.startswith("```"):
        t = t.strip("`")
        if t[:4].lower() == "json":
            t = t[4:]
        t = t.strip()
    start, end = t.find("{"), t.rfind("}")
    if start != -1 and end != -1:
        t = t[start : end + 1]
    return json.loads(t)


def _host_of(url: str) -> str:
    u = (url or "").strip().lower()
    require(u.startswith("https://"), "only https urls allowed")
    rest = u[8:]
    host = rest.split("/")[0].split("?")[0].split("#")[0]
    require(len(host) > 0, "empty host")
    require("@" not in host, "userinfo not allowed")
    require(not host.replace(".", "").isdigit(), "ip literal hosts rejected")
    require("localhost" not in host, "localhost rejected")
    require(not host.endswith(".local"), "local tld rejected")
    return host


class SpecDiff(gl.Contract):
    owner: Address
    allowed_hosts: TreeMap[str, bool]

    # check_id -> metadata
    exists: TreeMap[str, bool]
    title_of: TreeMap[str, str]
    spec_url_of: TreeMap[str, str]
    impl_url_of: TreeMap[str, str]
    creator_of: TreeMap[str, Address]

    # last result
    last_label_of: TreeMap[str, str]
    last_note_of: TreeMap[str, str]
    run_count_of: TreeMap[str, u256]
    history_json_of: TreeMap[str, str]

    def __init__(self):
        self.owner = gl.message.sender_address

    @gl.public.write
    def allow_host(self, host: str) -> None:
        require(gl.message.sender_address == self.owner, "only owner")
        h = (host or "").strip().lower()
        require(len(h) > 0, "empty host")
        require("://" not in h, "pass host only, not url")
        require("@" not in h, "userinfo not allowed")
        require(not h.replace(".", "").isdigit(), "ip literal rejected")
        self.allowed_hosts[h] = True

    def _require_url_allowed(self, url: str) -> str:
        host = _host_of(url)
        require(self.allowed_hosts.get(host, False) is True, "host not allowed: " + host)
        return host

    @gl.public.write
    def create_check(self, check_id: str, spec_url: str, impl_url: str, title: str) -> None:
        cid = (check_id or "").strip()
        require(1 <= len(cid) <= 64, "bad check_id")
        require(self.exists.get(cid, False) is not True, "check already exists")
        su = (spec_url or "").strip()
        iu = (impl_url or "").strip()
        self._require_url_allowed(su)
        self._require_url_allowed(iu)
        t = (title or "").strip()
        require(len(t) <= 120, "title too long")
        self.exists[cid] = True
        self.title_of[cid] = t
        self.spec_url_of[cid] = su
        self.impl_url_of[cid] = iu
        self.creator_of[cid] = gl.message.sender_address
        self.last_label_of[cid] = ""
        self.last_note_of[cid] = ""
        self.run_count_of[cid] = u256(0)
        self.history_json_of[cid] = "[]"

    def _fetch_snippet(self, url: str) -> tuple:
        """Returns (ok: bool, snippet: str)."""
        try:
            content = gl.nondet.web.render(url, mode="text")
            snippet = (content[:3000] if content else "")
            if snippet.strip():
                return True, snippet
            return False, "[EMPTY PAGE]"
        except Exception as e:
            return False, ("[FETCH FAILED: " + str(e) + "]")[:240]

    def _run_judgment(self, spec_url: str, impl_url: str) -> dict:
        def judge() -> str:
            ok_spec, sn_spec = self._fetch_snippet(spec_url)
            ok_impl, sn_impl = self._fetch_snippet(impl_url)
            block = (
                "SPEC URL: " + spec_url + "\n---\n" + sn_spec + "\n---\n\n"
                "IMPL URL: " + impl_url + "\n---\n" + sn_impl + "\n---\n"
            )
            prompt = (
                "You compare a SPECIFICATION page to an IMPLEMENTATION/DOCS page.\n\n"
                + block
                + "\n"
                "Return ONLY strict JSON:\n"
                '{ "label": "COMPATIBLE" or "BREAKING" or "UNCLEAR", '
                '"note": "<short reason max 160 chars>" }\n'
                "Rules:\n"
                "- COMPATIBLE only if both sides are readable and clearly aligned "
                "in topic and substance for a spec-vs-impl check.\n"
                "- BREAKING only if both sides are readable and there is a clear "
                "material mismatch (conflicting claims, missing critical surface, "
                "or obvious divergence).\n"
                "- UNCLEAR if either side is empty, fetch failed, off-topic noise, "
                "or the comparison is ambiguous.\n"
                "- Never use BREAKING when either side failed or is empty.\n"
            )
            raw = gl.nondet.exec_prompt(prompt)
            data = parse_json_response(raw)
            label = str(data.get("label", "")).strip().upper()
            if label not in ("COMPATIBLE", "BREAKING", "UNCLEAR"):
                label = "UNCLEAR"
            if (not ok_spec or not ok_impl) and label == "BREAKING":
                label = "UNCLEAR"
            if (not ok_spec or not ok_impl) and label == "COMPATIBLE":
                label = "UNCLEAR"
            note = str(data.get("note", "")).strip()[:160]
            return canonical({"label": label, "note": note})

        principle = (
            "EQUIVALENT iff 'label' is identical "
            "(COMPATIBLE, BREAKING, or UNCLEAR). "
            "note may differ. If label differs => NOT equivalent."
        )
        agreed = gl.eq_principle.prompt_comparative(judge, principle)
        parsed = json.loads(agreed)
        label = str(parsed["label"]).strip().upper()
        note = str(parsed.get("note", "")).strip()[:160]
        require(label in ("COMPATIBLE", "BREAKING", "UNCLEAR"), "bad label")
        return {"label": label, "note": note}

    def _append_history(self, check_id: str, label: str, note: str) -> None:
        raw = self.history_json_of.get(check_id, "[]")
        try:
            hist = json.loads(raw)
            if not isinstance(hist, list):
                hist = []
        except Exception:
            hist = []
        hist.append({"label": label, "note": note})
        if len(hist) > HISTORY_CAP:
            hist = hist[-HISTORY_CAP:]
        self.history_json_of[check_id] = canonical(hist)

    @gl.public.write
    def run_check(self, check_id: str) -> str:
        cid = (check_id or "").strip()
        require(self.exists.get(cid, False) is True, "unknown check")
        su = self.spec_url_of.get(cid, "")
        iu = self.impl_url_of.get(cid, "")
        self._require_url_allowed(su)
        self._require_url_allowed(iu)
        result = self._run_judgment(su, iu)
        label = result["label"]
        note = result["note"]
        self.last_label_of[cid] = label
        self.last_note_of[cid] = note
        self.run_count_of[cid] = self.run_count_of.get(cid, u256(0)) + u256(1)
        self._append_history(cid, label, note)
        return label

    @gl.public.write
    def recheck(self, check_id: str) -> str:
        return self.run_check(check_id)

    @gl.public.view
    def get_last(self, check_id: str) -> str:
        cid = (check_id or "").strip()
        require(self.exists.get(cid, False) is True, "unknown check")
        return canonical(
            {
                "check_id": cid,
                "title": self.title_of.get(cid, ""),
                "spec_url": self.spec_url_of.get(cid, ""),
                "impl_url": self.impl_url_of.get(cid, ""),
                "label": self.last_label_of.get(cid, ""),
                "note": self.last_note_of.get(cid, ""),
                "run_count": int(self.run_count_of.get(cid, u256(0))),
            }
        )

    @gl.public.view
    def get_history(self, check_id: str) -> str:
        cid = (check_id or "").strip()
        require(self.exists.get(cid, False) is True, "unknown check")
        return self.history_json_of.get(cid, "[]")

    @gl.public.view
    def get_owner(self) -> Address:
        return self.owner

    @gl.public.view
    def is_host_allowed(self, host: str) -> bool:
        h = (host or "").strip().lower()
        return self.allowed_hosts.get(h, False) is True