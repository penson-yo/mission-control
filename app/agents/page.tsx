"use client";

import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/sidebar-trigger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";

interface BotData {
  balance: number;
  pnl: number;
}

export default function Agents() {
  const [blackWidow, setBlackWidow] = useState<BotData>({ balance: 0, pnl: 0 });
  const [loki, setLoki] = useState<BotData>({ balance: 0, pnl: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((data) => {
        setBlackWidow({
          balance: data.blackWidow?.balance || 0,
          pnl: data.blackWidow?.pnl || 0,
        });
        setLoki({
          balance: data.loki?.balance || 0,
          pnl: data.loki?.pnl || 0,
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
                  <Button asChild>
                    <a href="https://hyperdash.com/address/0xad80393600f6c510633fff285d5dacce8785089d" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on Hyperdash
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Loki */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-green-500">●</span>
                  Loki
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-2xl font-bold">${loki.balance.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">All-time PnL</p>
                    <p className={`text-2xl font-bold ${loki.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {loki.pnl >= 0 ? "+" : ""}{loki.pnl.toFixed(2)}
                    </p>
                  </div>
                  <Button asChild>
                    <a href="https://hyperdash.com/address/0x7612df241fa696d12b384aa04ebc5a2cb4700daf" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on Hyperdash
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
