import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "balance-history.json");

interface BalanceEntry {
  timestamp: number;
  balance: number;  // cumulative balance after this entry
  type: "fund" | "withdraw" | "snapshot";
}

interface BalanceHistory {
  [key: string]: BalanceEntry[];
}

function readHistory(): BalanceHistory {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading balance history:", e);
  }
  return { "black-widow": [], loki: [] };
}

function writeHistory(history: BalanceHistory) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(history, null, 2));
}

export function recordBalance(agent: string, amount: number, type: "fund" | "withdraw" | "snapshot") {
  const history = readHistory();
  
  if (!history[agent]) {
    history[agent] = [];
  }
  
  // Calculate new cumulative balance
  const lastEntry = history[agent][history[agent].length - 1];
  const previousBalance = lastEntry?.balance || 0;
  const newBalance = type === "withdraw" 
    ? previousBalance - amount 
    : previousBalance + amount;
  
  history[agent].push({
    timestamp: Date.now(),
    balance: Math.max(0, newBalance),
    type,
  });
  
  writeHistory(history);
}

export function calculateAPY(agent: string): { apy: number; days: number; pnl: number } | null {
  const history = readHistory();
  const entries = history[agent];
  
  if (!entries || entries.length < 2) {
    return null;
  }
  
  // Find first entry with type "fund"
  const firstFund = entries.find(e => e.type === "fund");
  if (!firstFund) {
    return null;
  }
  
  const initialBalance = firstFund.balance;
  const latestBalance = entries[entries.length - 1].balance;
  
  // Calculate time elapsed
  const now = Date.now();
  const startTime = firstFund.timestamp;
  const days = (now - startTime) / (1000 * 60 * 60 * 24);
  
  if (days < 1) {
    return null;
  }
  
  const pnl = latestBalance - initialBalance;
  const apy = ((pnl / initialBalance) * (365 / days)) * 100;
  
  return {
    apy: Math.round(apy * 100) / 100,
    days: Math.round(days * 10) / 10,
    pnl: Math.round(pnl * 100) / 100,
  };
}

export function getInitialBalance(agent: string): number {
  const history = readHistory();
  const entries = history[agent];
  
  if (!entries || entries.length === 0) {
    return 0;
  }
  
  // Find first fund entry
  const firstFund = entries.find(e => e.type === "fund");
  return firstFund?.balance || 0;
}
