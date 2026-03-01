"use client";

import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/sidebar-trigger";
import { Loader2 } from "lucide-react";
import { AgentCard } from "@/components/dashboard/AgentCard";

const BLACK_WIDOW_ADDRESS = process.env.NEXT_PUBLIC_BLACK_WIDOW_ADDRESS!;
const LOKI_ADDRESS = process.env.NEXT_PUBLIC_LOKI_ADDRESS!;

interface BotData {
  balance: number;
  pnl: number;
}

export default function Agents() {
  const [blackWidow, setBlackWidow] = useState<BotData>({ balance: 0, pnl: 0 });
  const [loki, setLoki] = useState<BotData>({ balance: 0, pnl: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTransfer = async (agent: string, amount: number) => {
    const res = await fetch("/api/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent, amount }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Transfer failed");
    }

    // Refresh data after transfer
    setTimeout(fetchData, 2000);
  };

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
            <AgentCard
              name="Black Widow"
              address={BLACK_WIDOW_ADDRESS}
              balance={blackWidow.balance}
              pnl={blackWidow.pnl}
              color="text-orange-500"
              agentKey="black-widow"
              onTransfer={handleTransfer}
            />

            <AgentCard
              name="Loki"
              address={LOKI_ADDRESS}
              balance={loki.balance}
              pnl={loki.pnl}
              color="text-green-500"
              agentKey="loki"
              onTransfer={handleTransfer}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
