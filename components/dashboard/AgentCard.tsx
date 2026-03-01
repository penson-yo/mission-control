"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ExternalLink, Wallet, ArrowDownToLine } from "lucide-react";

interface AgentCardProps {
  name: string;
  address: string;
  balance: number;
  pnl: number;
  color: string;
  agentKey: "black-widow" | "loki";
  onTransfer: (agent: string, amount: number) => Promise<void>;
}

export function AgentCard({ name, address, balance, pnl, color, agentKey, onTransfer }: AgentCardProps) {
  const [showFund, setShowFund] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFund(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFund(true)}>
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                Fund
              </Button>
              <Button asChild variant="ghost" size="sm">
                <a href={`https://hyperdash.com/address/${address}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View
                </a>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
