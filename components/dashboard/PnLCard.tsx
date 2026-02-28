"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Loader2 } from "lucide-react";

export function PnLCard() {
  const [pnl, setPnl] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pnl")
      .then((res) => res.json())
      .then((data) => {
        setPnl(data.totalPnl ?? 0);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Total PnL</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <div className={`text-3xl font-bold ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
            {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
          </div>
        )}
        <p className="text-xs text-muted-foreground">All time</p>
      </CardContent>
    </Card>
  );
}
