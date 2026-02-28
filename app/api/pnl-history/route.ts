import { NextResponse } from "next/server";

const BLACK_WIDOW = process.env.BLACK_WIDOW_ADDRESS!;
const LOKI = process.env.LOKI_ADDRESS!;

async function fetchPortfolio(address: string) {
  const response = await fetch("https://api.hyperliquid.xyz/info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "portfolio", user: address }),
  });
  return response.json();
}

function parsePnlHistory(data: any) {
  const allTime = data?.find((d: any) => d[0] === "allTime");
  if (!allTime) return [];
  
  const pnlHistory = allTime[1]?.pnlHistory || [];
  const daily: {time: number, pnl: number}[] = [];
  
  for (let i = 1; i < pnlHistory.length; i++) {
    const prev = parseFloat(pnlHistory[i-1][1]) || 0;
    const curr = parseFloat(pnlHistory[i][1]) || 0;
    daily.push({
      time: pnlHistory[i][0],
      pnl: Math.round((curr - prev) * 100) / 100
    });
  }
  
  return daily;
}

export async function GET() {
  try {
    const [bwData, lokiData] = await Promise.all([
      fetchPortfolio(BLACK_WIDOW),
      fetchPortfolio(LOKI),
    ]);

    const bwDaily = parsePnlHistory(bwData);
    const lokiDaily = parsePnlHistory(lokiData);

    // Aggregate by day
    const pnlByDay = new Map<string, number>();
    
    [...bwDaily, ...lokiDaily].forEach((entry) => {
      const date = new Date(entry.time).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', timeZone: 'Australia/Melbourne' });
      const current = pnlByDay.get(date) || 0;
      pnlByDay.set(date, current + entry.pnl);
    });

    const result = Array.from(pnlByDay.entries()).map(([date, pnl]) => ({
      date,
      pnl: Math.round(pnl * 100) / 100,
    }));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Hyperliquid API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
