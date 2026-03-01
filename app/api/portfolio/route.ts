import { NextResponse } from "next/server";
import { PortfolioResponse } from "@/lib/types/hyperliquid";

const BLACK_WIDOW = process.env.BLACK_WIDOW_ADDRESS!;
const LOKI = process.env.LOKI_ADDRESS!;

async function fetchPortfolio(address: string): Promise<{ balance: number; pnl: number }> {
  const response = await fetch("https://api.hyperliquid.xyz/info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "portfolio", user: address }),
  });

  const data: PortfolioResponse = await response.json();
  
  const allTime = data?.find((d) => d[0] === "allTime");
  if (!allTime) return { balance: 0, pnl: 0 };
  
  const history = allTime[1]?.accountValueHistory;
  const pnlHistory = allTime[1]?.pnlHistory;
  
  const balance = parseFloat(history?.[history.length - 1]?.[1]) || 0;
  const pnl = parseFloat(pnlHistory?.[pnlHistory.length - 1]?.[1]) || 0;
  
  return { balance, pnl };
}

export async function GET() {
  try {
    const [bw, loki] = await Promise.all([
      fetchPortfolio(BLACK_WIDOW),
      fetchPortfolio(LOKI),
    ]);

    return NextResponse.json({
      blackWidow: bw,
      loki: loki,
      totalPortfolio: bw.balance + loki.balance,
    });
  } catch (error) {
    console.error("Hyperliquid API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
