import { NextResponse } from "next/server";

// Black Widow wallet
const BLACK_WIDOW = "0xD84C6FC956e2798C9cc4cED40573188Cea98F996";
const GAMORA = "0xa38059e56d81f471129b7ea02b202ddc9c3a65c9";

export async function GET() {
  try {
    // Fetch portfolio data for both bots
    const [bwResponse, gamoraResponse] = await Promise.all([
      fetch("https://api.hyperliquid.xyz/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "portfolio", user: BLACK_WIDOW }),
      }),
      fetch("https://api.hyperliquid.xyz/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "portfolio", user: GAMORA }),
      }),
    ]);

    const bwData = await bwResponse.json();
    const gamoraData = await gamoraResponse.json();

    // Parse PnL history
    const parsePnlHistory = (data: any) => {
      const allTime = data?.find((d: any) => d[0] === "allTime");
      if (!allTime) return [];
      
      const pnlHistory = allTime[1]?.pnlHistory || [];
      
      return pnlHistory.map((entry: any) => ({
        time: entry[0],
        pnl: parseFloat(entry[1]) || 0,
      }));
    };

    const bwHistory = parsePnlHistory(bwData);
    const gamoraHistory = parsePnlHistory(gamoraData);

    // Combine and aggregate by day
    const pnlByDay = new Map<string, number>();
    
    const addToDay = (history: any[], multiplier: number) => {
      history.forEach((entry: any) => {
        const date = new Date(entry.time).toLocaleDateString('en-US', { weekday: 'short' });
        const current = pnlByDay.get(date) || 0;
        pnlByDay.set(date, current + entry.pnl * multiplier);
      });
    };
    
    addToDay(bwHistory, 1);
    addToDay(gamoraHistory, 1);

    // Convert to array and take last 7 days
    const result = Array.from(pnlByDay.entries()).map(([date, pnl]) => ({
      date,
      pnl: Math.round(pnl * 100) / 100,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Hyperliquid API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
