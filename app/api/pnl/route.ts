import { NextResponse } from "next/server";

const BLACK_WIDOW = process.env.BLACK_WIDOW_ADDRESS!;
const LOKI = process.env.LOKI_ADDRESS!;

async function fetchPnL(address: string) {
  const response = await fetch("https://api.hyperliquid.xyz/info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "portfolio", user: address }),
  });

  const data = await response.json();
  const allTime = data?.find((d: any) => d[0] === "allTime");
  if (!allTime) return 0;
  
  const pnlHistory = allTime[1]?.pnlHistory;
  return parseFloat(pnlHistory?.[pnlHistory.length - 1]?.[1]) || 0;
}

export async function GET() {
  try {
    const [bwPnl, lokiPnl] = await Promise.all([
      fetchPnL(BLACK_WIDOW),
      fetchPnL(LOKI),
    ]);

    return NextResponse.json({
      totalPnl: bwPnl + lokiPnl,
      blackWidowPnl: bwPnl,
      lokiPnl: lokiPnl,
    });
  } catch (error) {
    console.error("Hyperliquid API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
