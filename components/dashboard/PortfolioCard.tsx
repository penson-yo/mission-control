"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Loader2 } from "lucide-react";

export function PortfolioCard() {
  const [portfolio, setPortfolio] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((data) => {
        setPortfolio(data.totalPortfolio ?? 0);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <div className="text-3xl font-bold">${portfolio.toFixed(2)}</div>
        )}
        <p className="text-xs text-muted-foreground">USDC</p>
      </CardContent>
    </Card>
  );
}
