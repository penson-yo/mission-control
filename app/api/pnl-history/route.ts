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

    // Parse PnL history from "day" period
    const parseDayPnl = (data: any) => {
      const day = data?.find((d: any) => d[0] === "day");
      if (!day) return [];
      
      const pnlHistory = day[1]?.pnlHistory || [];
      
      return pnlHistory.map((entry: any) => ({
        time: entry[0],
        pnl: parseFloat(entry[1]) || 0,
      }));
    };

    const bwHistory = parseDayPnl(bwData);
    const gamoraHistory = parseDayPnl(gamoraData);

    // Combine both histories
    const combined = [...bwHistory, ...gamoraHistory];
    
    // Sort by time and aggregate by day
    combined.sort((a, b) => a.time - b.time);
    
    const pnlByDay = new Map<string, number>();
    
    combined.forEach((entry: any) => {
      const date = new Date(entry.time).toLocaleDateString('en-US', { weekday: 'short' });
      const current = pnlByDay.get(date) || 0;
      pnlByDay.set(date, current + entry.pnl);
    });

    // Convert to array
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
