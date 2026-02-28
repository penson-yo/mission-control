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
    const parsePortfolio = (data: any): number => {
      const allTime = data?.find((d: any) => d[0] === "allTime");
      if (!allTime) return 0;
      
      const pnlHistory = allTime[1]?.pnlHistory;
      const pnl = parseFloat(pnlHistory?.[pnlHistory.length - 1]?.[1]) || 0;
      
      return pnl;
    };

    const bwPnl = parsePortfolio(bwData);

    return NextResponse.json({
      totalPnl: bwPnl,
      blackWidowPnl: bwPnl,
    });
  } catch (error) {
    console.error("Hyperliquid API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
