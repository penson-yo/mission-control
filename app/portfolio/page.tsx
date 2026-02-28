"use client";

import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/sidebar-trigger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Loader2 } from "lucide-react";
import { FundingWalletCard } from "@/components/dashboard/FundingWalletCard";

export default function Portfolio() {
  const [totalPortfolio, setTotalPortfolio] = useState(0);
  const [totalPnl, setTotalPnl] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/portfolio").then((res) => res.json()),
      fetch("/api/pnl").then((res) => res.json()),
    ])
      .then(([portfolioData, pnlData]) => {
        setTotalPortfolio(portfolioData.totalPortfolio || 0);
        setTotalPnl(pnlData.totalPnl || 0);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>
          <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6">Portfolio</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <FundingWalletCard />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Agent Balances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">${totalPortfolio.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total PnL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-4xl font-bold ${totalPnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
