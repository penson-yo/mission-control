"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/sidebar-trigger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Bot, Percent } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const pnlData = [
  { date: "Mon", pnl: 0 },
  { date: "Tue", pnl: 5 },
  { date: "Wed", pnl: 12 },
  { date: "Thu", pnl: 8 },
  { date: "Fri", pnl: 15 },
  { date: "Sat", pnl: 18 },
  { date: "Sun", pnl: 13.5 },
];

export default function Home() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6">Mission Control</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Portfolio Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Portfolio</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$500.00</div>
                <p className="text-xs text-muted-foreground">USDC</p>
              </CardContent>
            </Card>

            {/* Total PnL Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total PnL</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">+$13.50</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            {/* Active Agents Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Black Widow, Gamora</p>
              </CardContent>
            </Card>

            {/* APY Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">APY</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.5%</div>
                <p className="text-xs text-muted-foreground">Estimated</p>
              </CardContent>
            </Card>
          </div>

          {/* PnL Chart */}
          <Card>
            <CardHeader>
              <CardTitle>PnL History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pnlData}>
                    <defs>
                      <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} />
                    <YAxis stroke="#888888" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pnl" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPnl)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
