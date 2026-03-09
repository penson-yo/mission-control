"use client";

import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/sidebar-trigger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, TrendingUp } from "lucide-react";
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
} from "@/components/ui/pagination";
import { PortfolioCard } from "@/components/dashboard/PortfolioCard";
import { PnLCard } from "@/components/dashboard/PnLCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function Home() {
  const [chartData, setChartData] = useState<{date: string, pnl: number}[]>([]);
  const [portfolioData, setPortfolioData] = useState<{date: string, value: number}[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [totalTradePnl, setTotalTradePnl] = useState<number>(0);
  const [totalApy, setTotalApy] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
  };

  const totalPages = Math.ceil(trades.length / itemsPerPage);
  const paginatedTrades = trades.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    Promise.allSettled([
      fetch("/api/pnl-history")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch PnL history");
          return res.json();
        })
        .then((data) => {
          if (data.data && Array.isArray(data.data)) {
            setChartData(data.data);
          }
        }),
      fetch("/api/portfolio-history")
        .then((res) => res.json())
        .then((data) => {
          if (data.data && Array.isArray(data.data)) {
            setPortfolioData(data.data);
          }
        }),
      fetch("/api/trades")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch trades");
          return res.json();
        })
        .then((data) => {
          if (data.trades && Array.isArray(data.trades)) {
            setTrades(data.trades);
            setTotalTradePnl(data.totalPnl || 0);
          }
        }),
      fetch("/api/apy")
        .then((res) => res.json())
        .then((data) => {
          const bw = data.blackWidow || {};
          const thor = data.thor || {};
          const loki = data.loki || {};
          
          // Calculate combined APY weighted by balance
          const bwNet = bw.initialBalance || 0;
          const lokiNet = loki.initialBalance || 0;
          const thorNet = thor.initialBalance || 0;
          const totalNet = bwNet + lokiNet + thorNet;
          
          if (totalNet > 0) {
            const bwPnl = bw.pnl || 0;
            const lokiPnl = loki.pnl || 0;
            const totalPnl = bwPnl + lokiPnl + (thor.pnl || 0);
            const days = Math.max(bw.days || 1, loki.days || 1, thor.days || 1, 1);
            const apy = (totalPnl / totalNet) * (365 / days) * 100;
            setTotalApy(Math.round(apy * 100) / 100);
          }
        }),
    ]).then((results) => {
      const rejected = results.filter((r) => r.status === "rejected");
      if (rejected.length > 0) {
        setError("Failed to load some data. Please refresh.");
      }
      setLoading(false);
    });
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        
        {error && (
          <div className="mx-8 mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        
        <motion.div 
          className="flex flex-wrap gap-4 m-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="flex-1" variants={cardVariants} whileHover="hover">
            <PortfolioCard />
          </motion.div>
          <motion.div className="flex-1" variants={cardVariants} whileHover="hover">
            <PnLCard />
          </motion.div>
          {totalApy !== null && (
            <motion.div className="flex-1" variants={cardVariants} whileHover="hover">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total APY</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${totalApy >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {totalApy >= 0 ? "+" : ""}{totalApy}%
                  </div>
                  <p className="text-xs text-muted-foreground">Combined</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
        <div className="p-8 pt-0">

          {/* Chart with Tabs */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="portfolio" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="portfolio">Portfolio Value</TabsTrigger>
                  <TabsTrigger value="pnl">PnL History</TabsTrigger>
                </TabsList>
                <TabsContent value="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={portfolioData.length > 0 ? portfolioData : undefined}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
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
                          formatter={(value: number) => [`$${value}`, "Value"]}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#22c55e" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="pnl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
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
                </TabsContent>
              </Tabs>
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
                    <TableHead>Agent</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>PnL</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No trades yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTrades.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell className="font-medium">{trade.agent}</TableCell>
                        <TableCell>
                          <span className={trade.type === "LONG" ? "text-green-500" : "text-red-500"}>
                            {trade.type}
                          </span>
                        </TableCell>
                        <TableCell>{trade.asset}</TableCell>
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
                      <TableCell colSpan={3}>Total</TableCell>
                      <TableCell className={totalTradePnl >= 0 ? "text-green-500" : "text-red-500"}>
                        {totalTradePnl >= 0 ? "+" : ""}{totalTradePnl.toFixed(2)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </tfoot>
                )}
              </Table>
              
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
                        {currentPage} / {totalPages}
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
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
