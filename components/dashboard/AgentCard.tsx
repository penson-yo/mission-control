"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ExternalLink, ArrowDownToLine, ArrowUpFromLine, TrendingUp } from "lucide-react";

interface AgentCardProps {
  name: string;
  address: string;
  balance: number;
  pnl: number;
  color: string;
  agentKey: "black-widow" | "loki";
  onTransfer: (agent: string, amount: number) => Promise<void>;
  onWithdraw: (agent: string, amount: number) => Promise<void>;
}

interface ApyData {
  initialBalance: number;
  currentBalance: number;
  pnl: number;
  pnlPercent: number;
  apy: number;
  days: number;
}

export function AgentCard({ name, address, balance, pnl, color, agentKey, onTransfer, onWithdraw }: AgentCardProps) {
  const [showFund, setShowFund] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [apyData, setApyData] = useState<ApyData | null>(null);
  const [apyLoading, setApyLoading] = useState(true);

  useEffect(() => {
    fetch("/api/apy")
      .then((res) => res.json())
      .then((data) => {
        const agentData = agentKey === "black-widow" ? data.blackWidow : data.loki;
        if (agentData && agentData.initialBalance > 0) {
          setApyData(agentData);
        }
        setApyLoading(false);
      })
      .catch(() => {
        setApyLoading(false);
      });
  }, [agentKey, balance]);

  const handleFund = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await onTransfer(agentKey, value);
      setSuccess(`Transferred $${value} to ${name}`);
      setAmount("");
      setShowFund(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await onWithdraw(agentKey, value);
      setSuccess(`Withdrew $${value} from ${name}`);
      setAmount("");
      setShowWithdraw(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdraw failed");
    } finally {
      setLoading(false);
    }
  };

  const setMaxAmount = (isWithdraw: boolean) => {
    setAmount(isWithdraw ? balance.toFixed(2) : "");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className={color}>●</span>
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
          </div>
          
          {/* APY Display */}
          {!apyLoading && apyData && apyData.initialBalance > 0 && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                Since Funded
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-bold ${apyData.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {apyData.pnl >= 0 ? "+" : ""}{apyData.pnl.toFixed(2)} ({apyData.pnlPercent.toFixed(1)}%)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {apyData.days} days • ${apyData.initialBalance.toFixed(2)} → ${apyData.currentBalance.toFixed(2)}
              </p>
              {apyData.days >= 1 && (
                <p className="text-sm font-semibold mt-1">
                  APY: <span className={apyData.apy >= 0 ? "text-green-500" : "text-red-500"}>
                    {apyData.apy >= 0 ? "+" : ""}{apyData.apy}%
                  </span>
                </p>
              )}
            </div>
          )}
          
          {!apyLoading && (!apyData || apyData.initialBalance === 0) && (
            <p className="text-sm text-muted-foreground">Fund to start tracking APY</p>
          )}
          
          <div>
            <p className="text-sm text-muted-foreground">All-time PnL</p>
            <p className={`text-2xl font-bold ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
              {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
            </p>
          </div>

          {showFund ? (
            <div className="space-y-3 pt-2">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading}
                />
                <Button onClick={handleFund} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                </Button>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-500">{success}</p>}
              <Button variant="ghost" size="sm" onClick={() => { setShowFund(false); setError(null); setSuccess(null); }} disabled={loading}>
                Cancel
              </Button>
            </div>
          ) : showWithdraw ? (
            <div className="space-y-3 pt-2">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading}
                />
                <Button variant="outline" size="default" onClick={() => setMaxAmount(true)} disabled={loading}>
                  Max
                </Button>
                <Button onClick={handleWithdraw} disabled={loading} variant="secondary">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Withdraw"}
                </Button>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-500">{success}</p>}
              <Button variant="ghost" size="sm" onClick={() => { setShowWithdraw(false); setError(null); setSuccess(null); }} disabled={loading}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFund(true)}>
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                Fund
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowWithdraw(true)}>
                <ArrowUpFromLine className="mr-2 h-4 w-4" />
                Withdraw
              </Button>
              <Button asChild variant="ghost" size="sm">
                <a href={`https://hyperdash.com/address/${address}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
