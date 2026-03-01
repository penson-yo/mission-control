import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

const PEPPER_PRIVATE_KEY = process.env.PEPPER_PRIVATE_KEY!;
const BLACK_WIDOW = process.env.BLACK_WIDOW_ADDRESS!;
const LOKI = process.env.LOKI_ADDRESS!;

interface TransferRequest {
  agent: "black-widow" | "loki";
  amount: number;
}

function runPython(scriptPath: string, args: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const proc = spawn("python3", [scriptPath, JSON.stringify(args)], {
      env: { ...process.env },
      stdio: ["pipe", "pipe", "pipe"],
    });
    
    let stdout = "";
    let stderr = "";
    
    proc.stdout.on("data", (data) => { stdout += data.toString(); });
    proc.stderr.on("data", (data) => { stderr += data.toString(); });
    
    // Add timeout
    const timeout = setTimeout(() => {
      proc.kill();
      reject(new Error("Transfer timeout"));
    }, 30000);
    
    proc.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        console.error("Python stderr:", stderr);
        reject(new Error(stderr || "Python script failed"));
      } else {
        try {
          resolve(JSON.parse(stdout.trim()));
        } catch (e) {
          console.error("Python stdout:", stdout);
          reject(new Error("Invalid Python output: " + stdout));
        }
      }
    });
  });
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

    console.log("Starting transfer:", { destination, amount });

    const scriptPath = path.join(process.cwd(), "scripts", "transfer.py");
    const result = await runPython(scriptPath, {
      private_key: PEPPER_PRIVATE_KEY,
      destination: destination,
      amount: amount,
    });

    console.log("Transfer result:", result);

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
      { error: error instanceof Error ? error.message : "Transfer failed" },
      { status: 500 }
    );
  }
}
