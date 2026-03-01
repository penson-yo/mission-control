import { NextResponse } from "next/server";
import { calculateAPY, getInitialBalance } from "@/lib/balanceHistory";

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
    const [bwBalance, lokiBalance, bwApy, lokiApy] = await Promise.all([
      fetchCurrentBalance(BLACK_WIDOW),
      fetchCurrentBalance(LOKI),
      Promise.resolve(calculateAPY("black-widow")),
      Promise.resolve(calculateAPY("loki")),
    ]);

    return NextResponse.json({
      blackWidow: {
        balance: bwBalance,
        initialBalance: getInitialBalance("black-widow"),
        apy: bwApy?.apy || null,
        days: bwApy?.days || null,
        pnl: bwApy?.pnl || null,
      },
      loki: {
        balance: lokiBalance,
        initialBalance: getInitialBalance("loki"),
        apy: lokiApy?.apy || null,
        days: lokiApy?.days || null,
        pnl: lokiApy?.pnl || null,
      },
    });
  } catch (error) {
    console.error("APY API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate APY" },
      { status: 500 }
    );
  }
}
