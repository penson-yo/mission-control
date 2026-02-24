"use client";

import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/sidebar-trigger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Bot, Loader2 } from "lucide-react";
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

export default function Home() {
  const [chartData, setChartData] = useState<{date: string, pnl: number}[]>([]);

  useEffect(() => {
    fetch("/api/pnl-history")
      .then((res) => res.json())
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          setChartData(data.data);
        }
      });
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <PortfolioCard />
        <PnLCard />
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
          </div>

          {/* PnL Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>PnL History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.length > 0 ? chartData : undefined}>
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
                <tfoot>
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={5}>Total</TableCell>
                    <TableCell className="text-green-500">+$18.14</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </tfoot>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function PortfolioCard() {
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
    <Card className="m-8 mb-0">
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

function PnLCard() {
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
    <Card className="m-8 mb-0">
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
