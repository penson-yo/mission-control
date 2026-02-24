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

    // Parse portfolio data
    const parsePortfolio = (data: any) => {
      const allTime = data?.find((d: any) => d[0] === "allTime");
      if (!allTime) return { balance: 0, pnl: 0 };
      
      const history = allTime[1]?.accountValueHistory;
      const pnlHistory = allTime[1]?.pnlHistory;
      
      const balance = parseFloat(history?.[history.length - 1]?.[1]) || 0;
      const pnl = parseFloat(pnlHistory?.[pnlHistory.length - 1]?.[1]) || 0;
      
      return { balance, pnl };
    };

    const bw = parsePortfolio(bwData);
    const gamora = parsePortfolio(gamoraData);

    return NextResponse.json({
      blackWidow: bw,
      gamora: gamora,
      totalPortfolio: bw.balance + gamora.balance,
    });
  } catch (error) {
    console.error("Hyperliquid API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
