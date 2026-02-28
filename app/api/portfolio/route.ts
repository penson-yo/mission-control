import { NextResponse } from "next/server";

// Wallet addresses
const BLACK_WIDOW = "0xD84C6FC956e2798C9cc4cED40573188Cea98F996";
const LOKI = "0xA38059E56D81F471129B7EA02B202DDc9C3A65c9";

async function fetchPortfolio(address: string) {
  const response = await fetch("https://api.hyperliquid.xyz/info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "portfolio", user: address }),
  });

  const data = await response.json();
  
  const allTime = data?.find((d: any) => d[0] === "allTime");
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
