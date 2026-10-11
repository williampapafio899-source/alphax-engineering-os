import { NextRequest } from "next/server";
import { chatWithProfessor } from "@/lib/claude";
import type { LearnerLevel } from "@/types";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { messages, context } = body as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    context: { academy: string; module: string; topic: string; level: LearnerLevel };
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response("Missing messages", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of chatWithProfessor(messages, context ?? {
          academy: "Engineering OS",
          module: "General",
          topic: "General",
          level: "foundation" as LearnerLevel,
        })) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        console.error("[AI Professor]", err);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "AI service error" })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
