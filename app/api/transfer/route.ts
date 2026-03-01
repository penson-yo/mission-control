import { NextResponse } from "next/server";
import { Hyperliquid, signUsdTransferAction } from "hyperliquid";
import { ethers } from "ethers";

const PEPPER_PRIVATE_KEY = process.env.PEPPER_PRIVATE_KEY!;
const PEPPER_ADDRESS = process.env.PEPPER_ADDRESS!;
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

    // Initialize Hyperliquid with both private key AND wallet address
    const hl = new Hyperliquid({ 
      privateKey: PEPPER_PRIVATE_KEY, 
      walletAddress: PEPPER_ADDRESS,
      enableWs: false 
    });
    await hl.connect();

    // Build the action
    const action = {
      type: "usdSend",
      hyperliquidChain: "Mainnet",
      signatureChainId: "0xa4b1",
      destination: destination,
      amount: amount.toString(),
      time: Date.now(),
    };

    // Sign the action
    const wallet = new ethers.Wallet(PEPPER_PRIVATE_KEY);
    const signature = await signUsdTransferAction(wallet, action, true);

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
