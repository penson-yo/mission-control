import { NextResponse } from "next/server";
import { Hyperliquid, signUserSignedAction } from "hyperliquid";
import { ethers } from "ethers";

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

    // Create wallet
    const wallet = new ethers.Wallet(PEPPER_PRIVATE_KEY);
    
    // Try with usdSend type using userSignedAction
    const action = {
      type: "usdSend",
      hyperliquidChain: "Mainnet",
      signatureChainId: "0xa4b1",
      destination: destination,
      amount: amount.toString(),
      time: Date.now(),
    };

    // Sign with user signed action - needs 5 args
    const payloadTypes = [
      { name: "hyperliquidChain", type: "string" },
      { name: "destination", type: "string" },
      { name: "amount", type: "string" },
      { name: "time", type: "uint64" },
    ];
    const signature = await signUserSignedAction(wallet, action, payloadTypes, "HyperliquidTransaction:UsdSend", true);

    // Post to exchange API
    const response = await fetch("https://api.hyperliquid.xyz/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        nonce: action.time,
        signature,
      }),
    });

    const result = await response.json();

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
