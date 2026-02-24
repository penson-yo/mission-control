import { NextResponse } from "next/server";

// Black Widow wallet
const BLACK_WIDOW = "0xD84C6FC956e2798C9cc4cED40573188Cea98F996";
const GAMORA = "0xa38059e56d81f471129b7ea02b202ddc9c3a65c9";

export async function GET() {
  try {
    // Fetch fills for both bots
    const [bwFills, gamoraFills] = await Promise.all([
      fetch("https://api.hyperliquid.xyz/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "userFills", user: BLACK_WIDOW }),
      }),
      fetch("https://api.hyperliquid.xyz/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "userFills", user: GAMORA }),
      }),
    ]);

    const bwFillsData = await bwFills.json();
    const gamoraFillsData = await gamoraFills.json();

    // Parse fills to trades
    const parseTrades = (fills: any[], botName: string) => {
      if (!fills || !Array.isArray(fills)) return [];
      
      return fills
        .filter((fill: any) => {
          const pnl = parseFloat(fill.closedPnl || 0);
          return Math.abs(pnl) >= 1;
        })
        .slice(-20)
        .reverse()
        .map((fill: any, index: number) => {
          const side = fill.side === "A" ? "LONG" : "SHORT";
          const pnl = parseFloat(fill.closedPnl || 0);
          const size = Math.abs(parseFloat(fill.sz || 0));
          const price = parseFloat(fill.px || 0) / 1e6;
          
          return {
            id: `${botName}-${index}`,
            bot: botName,
            type: side,
            size: `${size.toFixed(4)} ${fill.coin || "BTC"}`,
            entry: `$${price.toLocaleString()}`,
            exit: `$${price.toLocaleString()}`,
            pnl: pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`,
            time: new Date(fill.time || Date.now()).toLocaleTimeString(),
            rawPnl: pnl,
          };
        });
    };

    const bwTrades = parseTrades(bwFillsData, "Black Widow");
    const gamoraTrades = parseTrades(gamoraFillsData, "Gamora");
    
    const allTrades = [...bwTrades, ...gamoraTrades]
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 10);

    const totalPnl = allTrades.reduce((sum, t) => sum + t.rawPnl, 0);

    return NextResponse.json({
      trades: allTrades,
      totalPnl: totalPnl,
    });
  } catch (error) {
    console.error("Hyperliquid API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
