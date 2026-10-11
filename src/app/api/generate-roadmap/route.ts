import { NextRequest, NextResponse } from "next/server";
import { generateRoadmap } from "@/lib/claude";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { goal, currentSkills } = body as { goal: string; currentSkills?: string };

  if (!goal || typeof goal !== "string") {
    return NextResponse.json({ error: "Missing field: goal" }, { status: 400 });
  }

  try {
    const roadmap = await generateRoadmap(goal, currentSkills ?? "");
    return NextResponse.json({ roadmap });
  } catch (err) {
    console.error("[Generate Roadmap]", err);
    return NextResponse.json({ error: "Roadmap generation failed" }, { status: 500 });
  }
}
