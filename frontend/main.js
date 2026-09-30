import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const CONTRACT = "0x7A728FDBA822bA16adDc9eD3138980FF89b9868C";

const out = document.getElementById("out");
const walletStatus = document.getElementById("walletStatus");

let address = null;
let client = null;

function log(msg) {
  out.textContent = typeof msg === "string" ? msg : JSON.stringify(msg, null, 2);
}

async function connect() {
  if (!window.ethereum) {
    log("Install MetaMask (or any EIP-1193 wallet).");
    return;
  }
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  address = accounts[0];
  walletStatus.textContent = address;

  client = createClient({
    chain: studionet,
    account: address,
    provider: window.ethereum,
  });

  try {
    await client.connect("studionet");
  } catch (e) {
    log("connect(studionet) warning: " + (e?.message || e));
  }

  try {
    if (typeof client.initializeConsensusSmartContract === "function") {
      await client.initializeConsensusSmartContract();
    }
  } catch (_) {}

  log("Connected. You can create_check / run_check.");
}

async function write(functionName, args) {
  if (!client) throw new Error("Connect wallet first");
  const write = { address: CONTRACT, functionName, args, value: 0n };
  let fees;
  try {
    const estimate = await client.estimateTransactionFeesForWrite(write);
    fees = {
      distribution: estimate.distribution,
      feeValue: estimate.feeValue,
      messageAllocations: estimate.messageAllocations,
    };
  } catch {
    // some studio setups accept write without explicit fees
  }
  const txHash = await client.writeContract(fees ? { ...write, fees } : write);
  log("Tx sent: " + txHash + "\nWaiting for consensus (run_check can take 1–3 min)...");
  try {
    await client.waitForTransactionReceipt({
      hash: txHash,
      status: TransactionStatus.ACCEPTED,
      retries: 120,
      interval: 5000,
    });
  } catch (e) {
    log("Tx " + txHash + " — wait ended: " + (e?.message || e) + "\nCheck explorer.");
    return txHash;
  }
  return txHash;
}

async function read(functionName, args) {
  const readClient = createClient({ chain: studionet });
  return readClient.readContract({
    address: CONTRACT,
    functionName,
    args,
  });
}

document.getElementById("btnConnect").onclick = () => connect().catch((e) => log(e.message || String(e)));

document.getElementById("btnCreate").onclick = async () => {
  try {
    const id = document.getElementById("checkId").value.trim();
    const spec = document.getElementById("specUrl").value.trim();
    const impl = document.getElementById("implUrl").value.trim();
    const title = document.getElementById("title").value.trim();
    const hash = await write("create_check", [id, spec, impl, title]);
    log("create_check ACCEPTED\n" + hash);
  } catch (e) {
    log("create_check error: " + (e?.message || e));
  }
};

document.getElementById("btnRun").onclick = async () => {
  try {
    const id = document.getElementById("runId").value.trim();
    const hash = await write("run_check", [id]);
    log("run_check sent: " + hash + "\nFetching get_last...");
    const last = await read("get_last", [id]);
    log({ tx: hash, get_last: last });
  } catch (e) {
    log("run_check error: " + (e?.message || e));
  }
};

document.getElementById("btnLast").onclick = async () => {
  try {
    const id = document.getElementById("runId").value.trim();
    const last = await read("get_last", [id]);
    log(last);
  } catch (e) {
    log("get_last error: " + (e?.message || e));
  }
};