import { NextResponse } from "next/server";
import { Fill, PortfolioResponse } from "@/lib/types/hyperliquid";

const BLACK_WIDOW = process.env.BLACK_WIDOW_ADDRESS!;
const LOKI = process.env.LOKI_ADDRESS!;

async function fetchFills(address: string): Promise<Fill[]> {
  const response = await fetch("https://api.hyperliquid.xyz/info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "userFills", user: address }),
  });
  return response.json();
}

export async function GET() {
  try {
    const [bwFills, lokiFills] = await Promise.all([
      fetchFills(BLACK_WIDOW),
      fetchFills(LOKI),
    ]);

    const parseTrades = (fills: Fill[], botName: string) => {
      if (!fills || !Array.isArray(fills)) return [];
      
      return fills
        .filter((fill: Fill) => {
          const pnl = parseFloat(fill.closedPnl || "0");
          return Math.abs(pnl) >= 1;
        })
        .slice(-20)
        .reverse()
        .map((fill: Fill, index: number) => {
          const side = fill.side === "A" ? "LONG" : "SHORT";
          const pnl = parseFloat(fill.closedPnl || "0");
          const coin = fill.coin || "UNKNOWN";
          const timestamp = fill.time || Date.now();
          
          return {
            id: `${botName}-${index}`,
            agent: botName,
            type: side,
            asset: coin,
            pnl: pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`,
            time: new Date(timestamp).toLocaleTimeString('en-AU', { timeZone: 'Australia/Melbourne', hour: '2-digit', minute: '2-digit' }),
            timestamp: timestamp,
            rawPnl: pnl,
          };
        });
    };

    const bwTrades = parseTrades(bwFills, "Black Widow");
    const lokiTrades = parseTrades(lokiFills, "Loki");
    
    const allTrades = [...bwTrades, ...lokiTrades]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);

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
