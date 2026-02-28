// Hyperliquid API response types

export interface HyperliquidPortfolio {
  balance: number;
  pnl: number;
}

export interface HyperliquidTrade {
  id: string;
  agent: string;
  type: "LONG" | "SHORT";
  asset: string;
  pnl: string;
  time: string;
  timestamp: number;
  rawPnl: number;
}

export interface HyperliquidTradesResponse {
  trades: HyperliquidTrade[];
  totalPnl: number;
}

export interface HyperliquidPnLResponse {
  totalPnl: number;
  blackWidowPnl: number;
  lokiPnl?: number;
}

export interface DailyPnL {
  date: string;
  pnl: number;
}

export interface PnLHistoryResponse {
  data: DailyPnL[];
}

// Internal Hyperliquid API types
export interface Fill {
  closedPnl: string;
  side: string;
  sz: string;
  px: string;
  coin: string;
  time: number;
}

export interface AccountValueEntry {
  0: number; // timestamp
  1: string; // value
}

export interface PnLEntry {
  0: number; // timestamp
  1: string; // pnl
}

export interface AllTimeData {
  accountValueHistory: AccountValueEntry[];
  pnlHistory: PnLEntry[];
}

export interface PortfolioResponse {
  [key: string]: [string, AllTimeData][];
}
