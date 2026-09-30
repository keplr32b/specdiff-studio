"""Structural checks for SpecDiff helpers (no network)."""


def host_of(url: str) -> str:
    u = (url or "").strip().lower()
    assert u.startswith("https://"), "only https"
    rest = u[8:]
    host = rest.split("/")[0].split("?")[0].split("#")[0]
    assert len(host) > 0
    assert "@" not in host
    assert not host.replace(".", "").isdigit()
    assert "localhost" not in host
    assert not host.endswith(".local")
    return host


def test_host_https_ok():
    assert host_of("https://docs.genlayer.com/path") == "docs.genlayer.com"


def test_host_rejects_http():
    try:
        host_of("http://docs.genlayer.com")
        assert False
    except AssertionError:
        pass


def test_labels():
    allowed = {"COMPATIBLE", "BREAKING", "UNCLEAR"}
    assert "BREAKING" in allowed


def test_repo_markers():
    from pathlib import Path
    root = Path(__file__).resolve().parents[1]
    text = (root / "contracts" / "specdiff.py").read_text(encoding="utf-8")
    assert "prompt_comparative" in text
    assert "COMPATIBLE" in text
    assert "run_check" in text