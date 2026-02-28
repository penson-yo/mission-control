import { NextResponse } from "next/server";

const BLACK_WIDOW = "0xad80393600f6c510633fff285d5dacce8785089d";
const LOKI = "0x7612df241fa696d12b384aa04ebc5a2cb4700daf";

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
