import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "balance-history.json");

interface FundingEvent {
  timestamp: number;
  amount: number;
  type: "fund" | "withdraw";
}

interface BalanceHistory {
  [key: string]: FundingEvent[];
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

export function recordBalance(agent: string, amount: number, type: "fund" | "withdraw") {
  const history = readHistory();
  
  if (!history[agent]) {
    history[agent] = [];
  }
  
  history[agent].push({
    timestamp: Date.now(),
    amount,
    type,
  });
  
  writeHistory(history);
}

export function getNetInvestment(agent: string): { net: number; days: number } {
  const history = readHistory();
  const events = history[agent] || [];
  
  if (events.length === 0) {
    return { net: 0, days: 0 };
  }
  
  let net = 0;
  let firstTimestamp = events[0].timestamp;
  
  for (const event of events) {
    if (event.type === "fund") {
      net += event.amount;
    } else {
      net -= event.amount;
    }
    if (event.timestamp < firstTimestamp) {
      firstTimestamp = event.timestamp;
    }
  }
  
  const days = (Date.now() - firstTimestamp) / (1000 * 60 * 60 * 24);
  
  return { 
    net: Math.max(0, net), 
    days: Math.max(0.01, days) 
  };
}

export function calculateMetrics(agent: string, currentBalance: number) {
  const { net, days } = getNetInvestment(agent);
  
  if (net <= 0) {
    return null;
  }
  
  const pnl = currentBalance - net;
  const pnlPercent = (pnl / net) * 100;
  const apy = pnlPercent * (365 / days);
  
  return {
    initialBalance: net,
    currentBalance,
    pnl,
    pnlPercent: Math.round(pnlPercent * 100) / 100,
    apy: Math.round(apy * 100) / 100,
    days: Math.round(days * 10) / 10,
  };
}
