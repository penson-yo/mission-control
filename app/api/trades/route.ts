import { NextResponse } from "next/server";

const BLACK_WIDOW = "0xad80393600f6c510633fff285d5dacce8785089d";
const LOKI = "0x7612df241fa696d12b384aa04ebc5a2cb4700daf";

async function fetchFills(address: string) {
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
          const coin = fill.coin || "UNKNOWN";
          
          return {
            id: `${botName}-${index}`,
            agent: botName,
            type: side,
            asset: coin,
            pnl: pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`,
            time: new Date(fill.time || Date.now()).toLocaleTimeString('en-AU', { timeZone: 'Australia/Melbourne', hour: '2-digit', minute: '2-digit' }),
            rawPnl: pnl,
          };
        });
    };

    const bwTrades = parseTrades(bwFills, "Black Widow");
    const lokiTrades = parseTrades(lokiFills, "Loki");
    
    const allTrades = [...bwTrades, ...lokiTrades]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
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
