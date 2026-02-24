"use client";

import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/sidebar-trigger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface BotData {
  balance: number;
  pnl: number;
}

export default function Agents() {
  const [blackWidow, setBlackWidow] = useState<BotData>({ balance: 0, pnl: 0 });
  const [gamora, setGamora] = useState<BotData>({ balance: 0, pnl: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/portfolio").then((res) => res.json()),
      fetch("/api/pnl").then((res) => res.json()),
    ])
      .then(([portfolioData, pnlData]) => {
        setBlackWidow({
          balance: portfolioData.blackWidow?.balance || 0,
          pnl: pnlData.blackWidowPnl || 0,
        });
        setGamora({
          balance: portfolioData.gamora?.balance || 0,
          pnl: pnlData.gamoraPnl || 0,
        });
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
          <h1 className="text-3xl font-bold mb-6">Agents</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Black Widow */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-orange-500">●</span>
                  Black Widow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-2xl font-bold">${blackWidow.balance.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">All-time PnL</p>
                    <p className={`text-2xl font-bold ${blackWidow.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {blackWidow.pnl >= 0 ? "+" : ""}{blackWidow.pnl.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gamora */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-green-500">●</span>
                  Gamora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-2xl font-bold">${gamora.balance.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">All-time PnL</p>
                    <p className={`text-2xl font-bold ${gamora.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {gamora.pnl >= 0 ? "+" : ""}{gamora.pnl.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
