import { NextResponse } from "next/server";
import { Exchange } from "hyperliquid";

const PEPPER_PRIVATE_KEY = process.env.PEPPER_PRIVATE_KEY!;
const BLACK_WIDOW = process.env.BLACK_WIDOW_ADDRESS!;
const LOKI = process.env.LOKI_ADDRESS!;

interface TransferRequest {
  agent: "black-widow" | "loki";
  amount: number;
}

export async function POST(request: Request) {
  try {
    const body: TransferRequest = await request.json();
    const { agent, amount } = body;

    if (!agent || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid agent or amount" },
        { status: 400 }
      );
    }

    const destination = agent === "black-widow" ? BLACK_WIDOW : LOKI;
    const agentName = agent === "black-widow" ? "Black Widow" : "Loki";

    // Initialize Pepper's wallet - private key as second param
    const exchange = new Exchange(null, PEPPER_PRIVATE_KEY, undefined, "0xa96d52e31b09cc1e8e85e2f978159c8437907e3d");

    // Execute transfer
    const result = await exchange.send_asset(
      destination,
      "spot",
      "spot",
      "USDC",
      amount
    );

    if (result.status === "ok") {
      return NextResponse.json({
        success: true,
        message: `Transferred $${amount} to ${agentName}`,
        txId: result.response,
      });
    } else {
      return NextResponse.json(
        { error: result.response || "Transfer failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      { error: "Transfer failed" },
      { status: 500 }
    );
  }
}
