import { NextResponse } from "next/server";
import { PortfolioResponse } from "@/lib/types/hyperliquid";

const BLACK_WIDOW = process.env.BLACK_WIDOW_ADDRESS!;
const LOKI = process.env.LOKI_ADDRESS!;
const THOR = process.env.THOR_ADDRESS!;
const PEPPER = process.env.PEPPER_ADDRESS!;

async function fetchPortfolio(address: string): Promise<PortfolioResponse> {
  const response = await fetch("https://api.hyperliquid.xyz/info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "portfolio", user: address }),
  });
  return response.json();
}

function parseValueHistory(data: PortfolioResponse) {
  const allTime = data?.find((d) => d[0] === "allTime");
  if (!allTime) return [];
  
  const history = allTime[1]?.accountValueHistory || [];
  const daily: { time: number; value: number }[] = [];
  
  for (let i = 1; i < history.length; i++) {
    const value = parseFloat(history[i]?.[1]) || 0;
    if (value > 0) {
      daily.push({
        time: history[i]?.[0] || 0,
        value: Math.round(value * 100) / 100
      });
    }
  }
  
  return daily;
}

export async function GET() {
  try {
    const [bwData, lokiData, thorData, pepperData] = await Promise.all([
      fetchPortfolio(BLACK_WIDOW),
      fetchPortfolio(LOKI),
      fetchPortfolio(THOR),
      fetchPortfolio(PEPPER),
    ]);

    const bwDaily = parseValueHistory(bwData);
    const lokiDaily = parseValueHistory(lokiData);
    const thorDaily = parseValueHistory(thorData);
    const pepperDaily = parseValueHistory(pepperData);

    // Aggregate all values by day - use latest value for each day
    const valueByDay = new Map<string, number>();
    
    // For each agent, take the latest entry for each date
    const addLatestByDate = (entries: { time: number; value: number }[]) => {
      const byDate = new Map<string, number>();
      entries.forEach((entry) => {
        const date = new Date(entry.time).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', timeZone: 'Australia/Melbourne' });
        byDate.set(date, entry.value); // keeps last value for each date
      });
      byDate.forEach((value, date) => {
        valueByDay.set(date, (valueByDay.get(date) || 0) + value);
      });
    };
    
    addLatestByDate(bwDaily);
    addLatestByDate(lokiDaily);
    addLatestByDate(thorDaily);
    addLatestByDate(pepperDaily);
    

    const result = Array.from(valueByDay.entries()).map(([date, value]) => ({
      date,
      value: Math.round(value * 100) / 100,
    }));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Hyperliquid API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
