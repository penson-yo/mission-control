"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/sidebar-trigger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Bot, Percent } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const trades = [
  { id: 1, bot: "Black Widow", type: "LONG", size: "0.01 BTC", entry: "$64,500", exit: "$64,774", pnl: "+$17.65", time: "2:30 PM" },
  { id: 2, bot: "Black Widow", type: "SHORT", size: "0.01 BTC", entry: "$65,100", exit: "$64,900", pnl: "-$10.20", time: "1:15 PM" },
  { id: 3, bot: "Black Widow", type: "LONG", size: "0.005 BTC", entry: "$63,800", exit: "$64,200", pnl: "+$8.50", time: "11:45 AM" },
  { id: 4, bot: "Black Widow", type: "SHORT", size: "0.01 BTC", entry: "$64,000", exit: "$64,500", pnl: "-$9.81", time: "10:00 AM" },
  { id: 5, bot: "Gamora", type: "LONG", size: "100 SOL", entry: "$120", exit: "$125", pnl: "+$12.00", time: "Yesterday" },
];

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
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>PnL History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pnlData}>
                    <defs>
                      <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#oklch" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#e0801a" stopOpacity={0}/>
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

          {/* Recent Trades Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bot</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Entry</TableHead>
                    <TableHead>Exit</TableHead>
                    <TableHead>PnL</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">{trade.bot}</TableCell>
                      <TableCell>
                        <span className={trade.type === "LONG" ? "text-green-500" : "text-red-500"}>
                          {trade.type}
                        </span>
                      </TableCell>
                      <TableCell>{trade.size}</TableCell>
                      <TableCell>{trade.entry}</TableCell>
                      <TableCell>{trade.exit}</TableCell>
                      <TableCell className={trade.pnl.startsWith("+") ? "text-green-500" : "text-red-500"}>
                        {trade.pnl}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{trade.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
