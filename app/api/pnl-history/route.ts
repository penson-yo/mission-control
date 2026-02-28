import { NextResponse } from "next/server";

// Black Widow wallet
const BLACK_WIDOW = "0xD84C6FC956e2798C9cc4cED40573188Cea98F996";

export async function GET() {
  try {
    // Fetch portfolio data for Black Widow
    const bwResponse = await fetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "portfolio", user: BLACK_WIDOW }),
    });

    const bwData = await bwResponse.json();

    // Parse allTime PnL (cumulative) and calculate daily changes
    const parsePnlWithDailyChanges = (data: any) => {
      const allTime = data?.find((d: any) => d[0] === "allTime");
      if (!allTime) return { total: 0, daily: [] };
      
      const pnlHistory = allTime[1]?.pnlHistory || [];
      const total = parseFloat(pnlHistory[pnlHistory.length - 1]?.[1]) || 0;
      
      // Calculate daily changes (difference between consecutive entries)
      const daily: {time: number, pnl: number}[] = [];
      for (let i = 1; i < pnlHistory.length; i++) {
        const prev = parseFloat(pnlHistory[i-1][1]) || 0;
        const curr = parseFloat(pnlHistory[i][1]) || 0;
        daily.push({
          time: pnlHistory[i][0],
          pnl: Math.round((curr - prev) * 100) / 100
        });
      }
      
      return { total, daily };
    };

    const bw = parsePnlWithDailyChanges(bwData);

    // Aggregate by day
    const pnlByDay = new Map<string, number>();
    
    bw.daily.forEach((entry: any) => {
      const date = new Date(entry.time).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', timeZone: 'Australia/Melbourne' });
      const current = pnlByDay.get(date) || 0;
      pnlByDay.set(date, current + entry.pnl);
    });

    // Convert to array
    const result = Array.from(pnlByDay.entries()).map(([date, pnl]) => ({
      date,
      pnl: Math.round(pnl * 100) / 100,
    }));

    return NextResponse.json({
      data: result,
      totalPnl: bw.total,
    });
  } catch (error) {
    console.error("Hyperliquid API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
