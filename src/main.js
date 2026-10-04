import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import "./style.css";

const CONTRACT_ADDRESS = "0x7A728FDBA822bA16adDc9eD3138980FF89b9868C";
const explorerBase = "https://explorer-studio.genlayer.com";
const state = {
  account: "",
  client: null,
  busy: false,
  stage: "idle",
  output: [],
  txHashes: [],
  error: "",
};

const icon = (name, size = 18) => {
  const paths = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h.01"/>',
    spark: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z"/>',
    chevronDown: '<path d="m7 10 5 5 5-5"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ""}</svg>`;
};

document.querySelector("#app").innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#top" aria-label="SpecDiff Studio home">
        <span class="brand-mark"><span></span><span></span><span></span></span>
        <span class="brand-word">specdiff<span>studio</span></span>
      </a>
      <nav class="nav-links" aria-label="Main navigation">
        <a href="#workflow">Workflow</a>
        <a href="#records">Demo records</a>
        <a href="#run-check">Run a check</a>
      </nav>
      <div class="nav-actions">
        <span class="network-pill"><i></i> StudioNet</span>
        <button class="wallet-button" id="connect-wallet">${icon("wallet", 16)}<span>Connect wallet</span></button>
      </div>
    </header>

    <main id="top">
      <section class="hero wrap">
        <div class="hero-copy">
          <div class="eyebrow"><span class="eyebrow-line"></span> GENLAYER · SPECIFICATION VERIFICATION</div>
          <h1>Does the build<br />match the <span>brief?</span></h1>
          <p class="hero-lede">Compare a public product spec with its implementation. Get a compatibility verdict that your team can verify on-chain.</p>
          <div class="hero-actions">
            <a class="button-primary" href="#run-check">Start a compatibility check ${icon("arrow", 17)}</a>
            <a class="text-link" href="#workflow">How it works <span>↓</span></a>
          </div>
          <div class="hero-meta">
            <span><span class="status-dot"></span> LIVE ON STUDIONET</span>
            <span class="meta-divider"></span>
            <span>NO VERDICT WITHOUT A TRANSACTION</span>
          </div>
        </div>
        <div class="hero-art" aria-label="Specification and implementation converge into a verifiable result">
          <div class="art-grid"></div>
          <div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div>
          <div class="art-core"><span class="core-ring"></span><span class="core-glyph">≠</span></div>
          <div class="art-label label-spec"><b>01</b><span>SPECIFICATION</span><i></i></div>
          <div class="art-label label-build"><b>02</b><span>IMPLEMENTATION</span><i></i></div>
          <div class="art-label label-verdict"><i></i><span>VERIFIABLE RESULT</span></div>
          <div class="art-corner">GNL / 01<br/>SPEC DIFF ENGINE</div>
        </div>
      </section>

      <section class="feature-strip" id="workflow">
        <div class="wrap feature-inner">
          <div class="feature-intro"><span class="section-kicker">A BETTER KIND OF CHECK</span><span>From two URLs to a shared source of truth.</span></div>
          <article class="feature"><span class="feature-number">01</span><div><h3>Bring both sides</h3><p>Point to the public spec and the implementation you want reviewed.</p></div></article>
          <article class="feature"><span class="feature-number">02</span><div><h3>Run the agent</h3><p>GenLayer evaluates compatibility and commits the check on StudioNet.</p></div></article>
          <article class="feature"><span class="feature-number">03</span><div><h3>Verify the outcome</h3><p>Read the latest contract result and keep its transaction trail.</p></div></article>
        </div>
      </section>

      <section class="contract-section wrap">
        <div class="section-heading">
          <div><span class="section-kicker">THE EXECUTION LAYER</span><h2>A contract you can inspect.</h2></div>
          <span class="section-note">DEPLOYED · STUDIONET</span>
        </div>
        <div class="contract-card">
          <div class="contract-main">
            <div class="contract-icon"><span class="contract-bracket">{ }</span></div>
            <div class="contract-details">
              <div class="contract-title-row"><h3>SpecDiff compatibility contract</h3><span class="live-tag"><i></i> CONTRACT READY</span></div>
              <p>Creates a check, evaluates it, then exposes the latest recorded result.</p>
              <div class="address-row"><span class="mono address" id="contract-address">${CONTRACT_ADDRESS}</span><button class="icon-button copy-address" title="Copy contract address" aria-label="Copy contract address">${icon("copy", 15)}</button><a class="contract-explorer" href="${explorerBase}/contracts/${CONTRACT_ADDRESS}" target="_blank" rel="noopener noreferrer">View in explorer ${icon("external", 13)}</a></div>
            </div>
          </div>
          <div class="contract-methods"><span class="method-label">METHODS</span><code>create_check</code><code>run_check</code><code>get_last</code><span class="method-chain">${icon("chevron", 14)}</span></div>
        </div>
      </section>

      <section class="results-section wrap" id="records">
        <div class="section-heading">
          <div><span class="section-kicker">CONTRACT-BACKED OUTCOMES</span><h2>Proven by a contract, not a hunch.</h2></div>
          <span class="section-note">LIVE RECORDS APPEAR AFTER A CHECK</span>
        </div>
        <div class="results-table-wrap">
          <div class="table-caption"><span><b class="caption-mark"></b>Compatibility result records</span><span class="sample-warning">EXAMPLES ARE MARKED · LIVE ROWS ARE ON-CHAIN</span></div>
          <table class="results-table">
            <thead><tr><th>CHECK ID</th><th>VERDICT</th><th>INTERPRETATION</th><th>SOURCE</th></tr></thead>
            <tbody>
              <tr class="example-record"><td class="mono">sample-check-01</td><td><span class="verdict compatible"><i></i> COMPATIBLE</span></td><td>Public requirements align with the implementation.</td><td><span class="record-type">ILLUSTRATIVE</span></td></tr>
              <tr class="example-record"><td class="mono">sample-check-02</td><td><span class="verdict breaking"><i></i> BREAKING</span></td><td>A documented requirement appears absent or incompatible.</td><td><span class="record-type">ILLUSTRATIVE</span></td></tr>
              <tr class="example-record"><td class="mono">sample-check-03</td><td><span class="verdict unclear"><i></i> UNCLEAR</span></td><td>Available evidence is insufficient for a confident match.</td><td><span class="record-type">ILLUSTRATIVE</span></td></tr>
            </tbody>
          </table>
        </div>
        <p class="table-disclaimer">${icon("spark", 14)} Example labels explain the contract's result states. They are not claimed as verified transactions.</p>
      </section>

      <section class="runner-section" id="run-check">
        <div class="wrap runner-wrap">
          <div class="runner-intro">
            <span class="section-kicker">YOUR TURN · STUDIONET</span>
            <h2>Put a spec<br/>to the test.</h2>
            <p>Submit the two public URLs. Your wallet signs each contract action; the result only appears after the chain returns it.</p>
            <div class="flow-note"><span class="flow-icon">${icon("check", 15)}</span><span><b>Two writes, one read.</b><br/>No locally generated verdicts.</span></div>
            <div class="contract-mini"><span class="mini-label">TARGET CONTRACT</span><code>${CONTRACT_ADDRESS}</code></div>
          </div>
          <div class="check-panel">
            <div class="panel-topline"><div><span class="panel-index">CHECK / 001</span><h3>Compatibility check</h3></div><span class="panel-network"><i></i> StudioNet</span></div>
            <form id="check-form">
              <label class="field-label" for="check-id">CHECK IDENTIFIER <span>REQUIRED</span></label>
              <div class="input-shell id-input"><span class="input-prefix">#</span><input id="check-id" name="check_id" value="ui-replit-1" maxlength="64" required autocomplete="off" /></div>
              <div class="input-pair">
                <div class="field-group"><label class="field-label" for="spec-url">PUBLIC SPEC URL</label><div class="input-shell"><span class="input-prefix input-index">A</span><input id="spec-url" name="spec_url" type="url" value="https://docs.genlayer.com" required /></div></div>
                <div class="field-group"><label class="field-label" for="impl-url">IMPLEMENTATION URL</label><div class="input-shell"><span class="input-prefix input-index">B</span><input id="impl-url" name="impl_url" type="url" value="https://docs.genlayer.com" required /></div></div>
              </div>
              <div class="form-foot"><span class="wallet-state" id="wallet-state"><i></i><span>Wallet not connected</span></span><button class="run-button" id="run-button" type="submit">Connect &amp; run ${icon("arrow", 16)}</button></div>
            </form>
            <div class="progress-area" id="progress-area" aria-live="polite" hidden>
              <div class="progress-head"><span>TRANSACTION PROGRESS</span><span id="progress-summary">Ready</span></div>
              <ol class="progress-steps">
                 <li data-step="create"><span class="step-indicator"></span><div><b>Create check</b><small>Write create_check(check_id, spec_url, impl_url, title)</small></div><span class="step-state">WAITING</span></li>
                <li data-step="create-confirm"><span class="step-indicator"></span><div><b>Confirm creation</b><small>Wait for on-chain finalization</small></div><span class="step-state">WAITING</span></li>
                <li data-step="run"><span class="step-indicator"></span><div><b>Run evaluation</b><small>Write run_check(check_id)</small></div><span class="step-state">WAITING</span></li>
                <li data-step="run-confirm"><span class="step-indicator"></span><div><b>Confirm evaluation</b><small>Wait for on-chain finalization</small></div><span class="step-state">WAITING</span></li>
                <li data-step="read"><span class="step-indicator"></span><div><b>Read latest result</b><small>Read get_last(check_id)</small></div><span class="step-state">WAITING</span></li>
              </ol>
            </div>
            <div class="console" id="console">
              <div class="console-bar"><span><i></i><i></i><i></i></span><b>OUTPUT / TRANSACTION LOG</b><button id="clear-console" type="button">CLEAR</button></div>
              <div class="console-body" id="console-body" aria-live="polite"><div class="console-empty"><span>01</span><p>Connect a wallet and run a check.<br/><em>Hashes, progress and contract output will appear here.</em></p></div></div>
            </div>
            <div class="error-banner" id="error-banner" role="alert" hidden></div>
          </div>
        </div>
      </section>

      <footer class="footer wrap">
        <a class="brand footer-brand" href="#top"><span class="brand-mark"><span></span><span></span><span></span></span><span class="brand-word">specdiff<span>studio</span></span></a>
        <p>Compatibility, not conjecture.</p>
        <div class="footer-meta"><span>GENLAYER STUDIONET DEMO</span><span class="footer-separator">/</span><span>not escrow, not halt, Studionet demo</span></div>
      </footer>
    </main>
  </div>`;

const $ = (selector) => document.querySelector(selector);
const connectButton = $("#connect-wallet");
const runButton = $("#run-button");
const walletState = $("#wallet-state");
const form = $("#check-form");
const progressArea = $("#progress-area");
const consoleBody = $("#console-body");
const errorBanner = $("#error-banner");

function shortAddress(address) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function setWalletConnected(address) {
  state.account = address;
  state.client = createClient({ chain: studionet, account: address, provider: window.ethereum });
  connectButton.innerHTML = `${icon("wallet", 16)}<span>${shortAddress(address)}</span><span class="connected-indicator"></span>`;
  connectButton.classList.add("is-connected");
  walletState.innerHTML = `<i class="connected"></i><span>Connected <b>${shortAddress(address)}</b></span>`;
  updateSubmitLabel();
}

function updateSubmitLabel() {
  if (!state.busy) runButton.innerHTML = state.account ? `Run compatibility check ${icon("arrow", 16)}` : `Connect &amp; run ${icon("arrow", 16)}`;
}

function addLog(message, type = "") {
  const empty = consoleBody.querySelector(".console-empty");
  if (empty) empty.remove();
  const row = document.createElement("div");
  row.className = `log-line ${type}`;
  const time = new Date().toLocaleTimeString([], { hour12: false });
  row.innerHTML = `<time>${time}</time><span class="log-mark">${type === "error" ? "!" : type === "success" ? "✓" : "›"}</span><span class="log-message"></span>`;
  row.querySelector(".log-message").textContent = message;
  consoleBody.append(row);
  consoleBody.scrollTop = consoleBody.scrollHeight;
}

function addHashLog(label, hash) {
  const empty = consoleBody.querySelector(".console-empty");
  if (empty) empty.remove();
  const row = document.createElement("div");
  row.className = "log-line hash-line";
  const time = new Date().toLocaleTimeString([], { hour12: false });
  row.innerHTML = `<time>${time}</time><span class="log-mark">↗</span><span class="log-message"><span>${label} · </span><a href="${explorerBase}/tx/${encodeURIComponent(hash)}" target="_blank" rel="noopener noreferrer"></a></span><button type="button" class="hash-copy" aria-label="Copy transaction hash">${icon("copy", 13)}</button>`;
  const link = row.querySelector("a");
  link.textContent = hash;
  row.querySelector(".hash-copy").addEventListener("click", () => copyText(hash));
  consoleBody.append(row);
  consoleBody.scrollTop = consoleBody.scrollHeight;
}

function addJsonLog(label, value) {
  const empty = consoleBody.querySelector(".console-empty");
  if (empty) empty.remove();
  const row = document.createElement("div");
  row.className = "log-json";
  const heading = document.createElement("div");
  heading.className = "json-label";
  heading.textContent = label;
  const pre = document.createElement("pre");
  try {
    pre.textContent = JSON.stringify(value, (_, item) => typeof item === "bigint" ? item.toString() : item, 2);
  } catch {
    pre.textContent = String(value);
  }
  row.append(heading, pre);
  consoleBody.append(row);
  consoleBody.scrollTop = consoleBody.scrollHeight;
}

function addLiveRecord(value, fallbackCheckId) {
  let record = value;
  if (typeof record === "string") {
    try {
      record = JSON.parse(record);
    } catch {
      record = { check_id: fallbackCheckId, label: "UNKNOWN", note: record };
    }
  }
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    record = { check_id: fallbackCheckId, label: "UNKNOWN", note: String(record) };
  }

  const label = String(record.label || "UNKNOWN").toUpperCase();
  const labelClass = label === "COMPATIBLE" ? "compatible" : label === "BREAKING" ? "breaking" : "unclear";
  const row = document.createElement("tr");
  row.className = "live-record";

  const idCell = document.createElement("td");
  idCell.className = "mono";
  idCell.textContent = String(record.check_id || fallbackCheckId);
  const verdictCell = document.createElement("td");
  const verdict = document.createElement("span");
  verdict.className = `verdict ${labelClass}`;
  verdict.innerHTML = "<i></i>";
  verdict.append(document.createTextNode(` ${label}`));
  verdictCell.append(verdict);
  const noteCell = document.createElement("td");
  noteCell.textContent = String(record.note || "No explanation was returned by the contract.");
  const sourceCell = document.createElement("td");
  const source = document.createElement("span");
  source.className = "record-type on-chain-type";
  source.textContent = "ON-CHAIN";
  sourceCell.append(source);
  row.append(idCell, verdictCell, noteCell, sourceCell);

  const body = document.querySelector(".results-table tbody");
  body.querySelectorAll(".live-record").forEach((existing) => existing.remove());
  body.prepend(row);
}

function setStep(step, status) {
  const element = document.querySelector(`[data-step="${step}"]`);
  if (!element) return;
  element.dataset.status = status;
  element.querySelector(".step-state").textContent = status === "active" ? "IN PROGRESS" : status.toUpperCase();
}

function setProgressSummary(text, status = "") {
  const summary = $("#progress-summary");
  summary.textContent = text;
  summary.dataset.status = status;
}

function showError(message) {
  state.error = message;
  errorBanner.hidden = false;
  errorBanner.innerHTML = `<span class="error-mark">!</span><span></span><button type="button" aria-label="Dismiss error">×</button>`;
  errorBanner.querySelector("span:nth-child(2)").textContent = message;
  errorBanner.querySelector("button").addEventListener("click", () => { errorBanner.hidden = true; });
  addLog(message, "error");
}

function resetProgress() {
  document.querySelectorAll(".progress-steps li").forEach((item) => {
    delete item.dataset.status;
    item.querySelector(".step-state").textContent = "WAITING";
  });
  state.txHashes = [];
  errorBanner.hidden = true;
}

async function connectWallet() {
  if (!window.ethereum) {
    showError("MetaMask was not detected. Install or unlock MetaMask, then try again.");
    return null;
  }
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts?.[0]) throw new Error("No wallet account was returned.");
    setWalletConnected(accounts[0]);
    await state.client.connect("studionet");
    addLog(`Wallet connected · ${accounts[0]}`, "success");
    return state.client;
  } catch (error) {
    if (error?.code === 4001) showError("Wallet connection was declined. Approve the request in MetaMask to continue.");
    else showError(error?.message || "Could not connect to MetaMask.");
    return null;
  }
}

async function writeAndConfirm(functionName, args, label) {
  const write = { address: CONTRACT_ADDRESS, functionName, args };
  const client = state.client;
  let fees;
  if (typeof client.estimateTransactionFeesForWrite === "function") {
    addLog(`Estimating fees for ${functionName}…`);
    try {
      const estimate = await client.estimateTransactionFeesForWrite(write);
      if (estimate && "distribution" in estimate && "feeValue" in estimate) {
        fees = { distribution: estimate.distribution, feeValue: estimate.feeValue };
        addLog(`Fee estimate ready · ${String(estimate.feeValue)} fee value`);
      } else {
        addLog("Fee estimator returned no distribution and feeValue; submitting without estimate.");
      }
    } catch {
      addLog("Fee estimate skipped; submitting without estimate.");
    }
  }
  const hash = await client.writeContract({ ...write, ...(fees ? { fees } : {}) });
  if (!hash) throw new Error(`${functionName} did not return a transaction hash.`);
  state.txHashes.push(hash);
  addHashLog(label, hash);

  try {
    const receipt = await client.waitForTransactionReceipt({
      hash,
      status: TransactionStatus.ACCEPTED,
      retries: 180,
      interval: 5000,
    });
    if (receipt?.txExecutionResultName) {
      addLog(functionName + " accepted · " + receipt.txExecutionResultName + ".", "success");
    } else {
      addLog(functionName + " accepted on-chain.", "success");
    }
    return { hash, receipt, timedOut: false };
  } catch {
    addLog(functionName + " wait timed out; tx may still finalize. Continuing…", "error");
    return { hash, receipt: null, timedOut: true };
  }
}
async function verifyAllowedHosts(urls) {
  const hosts = [...new Set(urls.map((value) => {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      throw new Error("Only public HTTPS URLs are accepted by the SpecDiff contract.");
    }
    return url.hostname.toLowerCase();
  }))];
  for (const host of hosts) {
    addLog(`Checking whether ${host} is allowlisted on StudioNet…`);
    const allowed = await state.client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "is_host_allowed",
      args: [host],
    });
    if (allowed !== true) {
      throw new Error(`The contract owner has not allowlisted ${host}. Use a permitted HTTPS host or ask the contract owner to allow it.`);
    }
  }
}

async function runCheck(event) {
  event.preventDefault();
  if (state.busy) return;
  errorBanner.hidden = true;
  if (!form.reportValidity()) return;
  if (!state.account) {
    const client = await connectWallet();
    if (!client) return;
  }
  const checkId = $("#check-id").value.trim();
  const specUrl = $("#spec-url").value.trim();
  const implUrl = $("#impl-url").value.trim();
  if (!checkId || !specUrl || !implUrl) return;
  state.busy = true;
  state.output = [];
  state.stage = "create";
  resetProgress();
  progressArea.hidden = false;
  runButton.disabled = true;
  runButton.innerHTML = `<span class="button-pulse"></span> Working on-chain`;
  $("#progress-summary").textContent = "Starting";
  addLog(`Starting check "${checkId}" on StudioNet.`);
  try {
    await verifyAllowedHosts([specUrl, implUrl]);
    setStep("create", "active");
    setProgressSummary("Creating check", "active");
    addLog("Submitting create_check(check_id, spec_url, impl_url, title)…");
    await writeAndConfirm("create_check", [checkId, specUrl, implUrl, `SpecDiff check · ${checkId}`], "CREATE_CHECK");
    setStep("create", "complete");
    setStep("create-confirm", "complete");
    setStep("run", "active");
    setProgressSummary("Running evaluation", "active");
    addLog("Submitting run_check(check_id)…");
    await writeAndConfirm("run_check", [checkId], "RUN_CHECK");
    setStep("run", "complete");
    setStep("run-confirm", "complete");
    setStep("read", "active");
    setProgressSummary("Reading contract result", "active");
    addLog("Reading get_last(check_id)…");
    let result = null;
    let lastErr = null;
    for (let i = 1; i <= 6; i++) {
      try {
        result = await state.client.readContract({
          address: CONTRACT_ADDRESS,
          functionName: "get_last",
          args: [checkId],
        });
        if (result != null && result !== "") break;
      } catch (e) {
        lastErr = e;
      }
      if (i < 6) {
        addLog("get_last not ready yet (try " + i + "/6). Waiting…");
        await new Promise((r) => setTimeout(r, 8000));
      }
    }
    if (result == null || result === "") {
      throw new Error(lastErr?.message || "get_last empty after retries. Check run_check on explorer.");
    }
    setStep("read", "complete");
    setProgressSummary("Result read from contract", "complete");
    addLog("Contract read completed. Result shown exactly as returned.", "success");
    addJsonLog("GET_LAST · CONTRACT RESPONSE", result);
    addLiveRecord(result, checkId);
    state.output = result;
  } catch (error) {
    const message = error?.shortMessage || error?.message || "The compatibility check failed.";
    const rejected = error?.code === 4001 || /user rejected|denied transaction/i.test(message);
    setProgressSummary(rejected ? "Wallet action declined" : "Check stopped", "error");
    showError(rejected ? "A wallet transaction was declined. No verdict has been displayed." : message);
  } finally {
    state.busy = false;
    runButton.disabled = false;
    updateSubmitLabel();
  }
}
async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    addLog("Copied to clipboard.", "success");
  } catch {
    showError("Clipboard access is unavailable in this browser.");
  }
}
connectButton.addEventListener("click", async () => {
  if (state.account) {
    addLog(`Connected wallet · ${state.account}`);
    return;
  }
  await connectWallet();
});
form.addEventListener("submit", runCheck);
$(".copy-address").addEventListener("click", () => copyText(CONTRACT_ADDRESS));
$("#clear-console").addEventListener("click", () => {
  consoleBody.innerHTML = `<div class="console-empty"><span>01</span><p>Console cleared.<br/><em>Run a check to see its transaction trail.</em></p></div>`;
});
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

if (window.ethereum?.on) {
  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts?.[0]) {
      setWalletConnected(accounts[0]);
      addLog(`Active wallet changed · ${accounts[0]}`);
    } else {
      state.account = "";
      state.client = null;
      connectButton.innerHTML = `${icon("wallet", 16)}<span>Connect wallet</span>`;
      connectButton.classList.remove("is-connected");
      walletState.innerHTML = `<i></i><span>Wallet not connected</span>`;
      updateSubmitLabel();
      addLog("Wallet disconnected.");
    }
  });
}
