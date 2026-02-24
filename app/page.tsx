"use client";

import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/sidebar-trigger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export default function Home() {
  const [chartData, setChartData] = useState<{date: string, pnl: number}[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [totalTradePnl, setTotalTradePnl] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(trades.length / itemsPerPage);
  const paginatedTrades = trades.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    fetch("/api/pnl-history")
      .then((res) => res.json())
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          setChartData(data.data);
        }
      });
    
    fetch("/api/trades")
      .then((res) => res.json())
      .then((data) => {
        if (data.trades && Array.isArray(data.trades)) {
          setTrades(data.trades);
          setTotalTradePnl(data.totalPnl || 0);
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
        <div className="flex gap-4 m-8">
          <div className="flex-1">
            <PortfolioCard />
          </div>
          <div className="flex-1">
            <PnLCard />
          </div>
        </div>
        <div className="p-8 pt-0">

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
                        <stop offset="5%" stopColor="#f54900" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f54900" stopOpacity={0}/>
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
                      stroke="#f54900" 
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
                  {paginatedTrades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No trades yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTrades.map((trade) => (
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
                    ))
                  )}
                </TableBody>
                {trades.length > 0 && (
                  <tfoot>
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell colSpan={5}>Total</TableCell>
                      <TableCell className={totalTradePnl >= 0 ? "text-green-500" : "text-red-500"}>
                        {totalTradePnl >= 0 ? "+" : ""}{totalTradePnl.toFixed(2)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </tfoot>
                )}
              </Table>
            </CardContent>
          </Card>
          
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
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
