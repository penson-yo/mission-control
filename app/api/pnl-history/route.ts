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

    // Parse allTime PnL (total trading PnL, excludes transfers)
    const parseAllTimePnl = (data: any) => {
      const allTime = data?.find((d: any) => d[0] === "allTime");
      if (!allTime) return { total: 0, history: [] };
      
      const pnlHistory = allTime[1]?.pnlHistory || [];
      const total = parseFloat(pnlHistory[pnlHistory.length - 1]?.[1]) || 0;
      
      return { 
        total, 
        history: pnlHistory.map((entry: any) => ({
          time: entry[0],
          pnl: parseFloat(entry[1]) || 0,
        }))
      };
    };

    const bw = parseAllTimePnl(bwData);
    const gamora = parseAllTimePnl(gamoraData);

    // Combine and aggregate by day
    const pnlByDay = new Map<string, number>();
    
    const addToDay = (history: any[]) => {
      history.forEach((entry: any) => {
        const date = new Date(entry.time).toLocaleDateString('en-US', { weekday: 'short' });
        const current = pnlByDay.get(date) || 0;
        pnlByDay.set(date, current + entry.pnl);
      });
    };
    
    addToDay(bw.history);
    addToDay(gamora.history);

    // Convert to array
    const result = Array.from(pnlByDay.entries()).map(([date, pnl]) => ({
      date,
      pnl: Math.round(pnl * 100) / 100,
    }));

    return NextResponse.json({
      data: result,
      totalPnl: bw.total + gamora.total,
    });
  } catch (error) {
    console.error("Hyperliquid API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
