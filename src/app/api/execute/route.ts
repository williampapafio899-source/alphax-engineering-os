import { NextRequest, NextResponse } from "next/server";
import { executeCode, getRuntimes } from "@/lib/piston";

// ─── Simple in-memory rate limiter ───────────────────────────────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 20;        // 20 executions
const WINDOW = 60_000;   // per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= LIMIT) return false;
    entry.count++;
  } else {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW });
  }
  return true;
}

// ─── POST /api/execute ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Maximum 20 executions per minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { language, version, code, stdin, args } = body as Record<string, unknown>;

  if (!language || typeof language !== "string") {
    return NextResponse.json({ error: "Missing required field: language" }, { status: 400 });
  }
  if (!version || typeof version !== "string") {
    return NextResponse.json({ error: "Missing required field: version" }, { status: 400 });
  }
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Missing required field: code" }, { status: 400 });
  }

  try {
    const result = await executeCode({
      language,
      version,
      code,
      stdin: typeof stdin === "string" ? stdin : undefined,
      args: Array.isArray(args) ? args.map(String) : undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Execution failed";
    if (message.includes("not installed") || message.includes("404")) {
      return NextResponse.json(
        { error: `Language '${language}' is not installed in this Piston instance.` },
        { status: 404 }
      );
    }
    console.error("[Piston] Execute error:", message);
    return NextResponse.json({ error: "Execution service unavailable" }, { status: 503 });
  }
}

// ─── GET /api/execute (runtimes) ──────────────────────────────────────────────
export async function GET() {
  try {
    const runtimes = await getRuntimes();
    return NextResponse.json(runtimes);
  } catch {
    return NextResponse.json(
      { error: "Cannot reach code execution engine" },
      { status: 503 }
    );
  }
}
