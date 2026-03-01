import { NextResponse } from "next/server";
import { calculateMetrics, getNetInvestment } from "@/lib/balanceHistory";

const BLACK_WIDOW = process.env.BLACK_WIDOW_ADDRESS!;
const LOKI = process.env.LOKI_ADDRESS!;

async function fetchCurrentBalance(address: string): Promise<number> {
  try {
    const response = await fetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "portfolio", user: address }),
    });

    const data = await response.json();
    const allTime = data?.find((d: any) => d[0] === "allTime");
    if (!allTime) return 0;
    
    const history = allTime[1]?.accountValueHistory;
    return parseFloat(history?.[history.length - 1]?.[1]) || 0;
  } catch (error) {
    console.error("Error fetching balance:", error);
    return 0;
  }
}

export async function GET() {
  try {
    const [bwBalance, lokiBalance] = await Promise.all([
      fetchCurrentBalance(BLACK_WIDOW),
      fetchCurrentBalance(LOKI),
    ]);

    const bwMetrics = calculateMetrics("black-widow", bwBalance);
    const lokiMetrics = calculateMetrics("loki", lokiBalance);

    return NextResponse.json({
      blackWidow: bwMetrics || { initialBalance: 0, currentBalance: bwBalance, pnl: 0, pnlPercent: 0, apy: 0, days: 0 },
      loki: lokiMetrics || { initialBalance: 0, currentBalance: lokiBalance, pnl: 0, pnlPercent: 0, apy: 0, days: 0 },
    });
  } catch (error) {
    console.error("APY API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate APY" },
      { status: 500 }
    );
  }
}
