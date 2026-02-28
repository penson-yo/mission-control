"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Loader2 } from "lucide-react";

const PEPPER_ADDRESS = process.env.NEXT_PUBLIC_PEPPER_ADDRESS!;

async function fetchBalance(address: string) {
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
}

export function FundingWalletCard() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance(PEPPER_ADDRESS)
      .then(setBalance)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Pepper (Funding)</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <div className="text-3xl font-bold">${balance.toFixed(2)}</div>
        )}
        <p className="text-xs text-muted-foreground">USDC</p>
      </CardContent>
    </Card>
  );
}
