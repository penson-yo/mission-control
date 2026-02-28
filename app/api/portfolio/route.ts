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

    return NextResponse.json({
      blackWidow: bw,
      totalPortfolio: bw.balance,
    });
  } catch (error) {
    console.error("Hyperliquid API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
