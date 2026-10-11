import { NextRequest } from "next/server";
import { generateLessonStream } from "@/lib/claude";
import { createClient } from "@/lib/supabase/server";
import type { LearnerLevel } from "@/types";
import fs from "fs";
import path from "path";

// Must be Node.js runtime — uses fs/path to read static lesson files
export const runtime = "nodejs";

/* ─────────────────────────────────────────────────────────────────────────────
   Priority:
   1. Static pre-generated file  →  src/data/lessons/{lessonId}.md  (FREE, instant)
   2. Supabase lesson_cache      →  previously cached API result     (FREE, instant)
   3. Claude API                 →  generate live, save to cache     (costs ~$0.002 once)
───────────────────────────────────────────────────────────────────────────── */

function streamText(text: string): Response {
  const encoder = new TextEncoder();
  // Stream in ~200-char chunks so the client sees progressive rendering
  const CHUNK = 200;
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < text.length; i += CHUNK) {
        const slice = text.slice(i, i + CHUNK);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text: slice })}\n\n`)
        );
        // tiny yield so UI can paint each chunk
        await new Promise((r) => setTimeout(r, 4));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
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

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return new Response("Invalid JSON", { status: 400 }); }

  const { lessonId, academy, module, topic, level } = body as {
    lessonId?: string;
    academy: string;
    module: string;
    topic: string;
    level: LearnerLevel;
  };

  if (!academy || !module || !topic || !level) {
    return new Response("Missing required fields", { status: 400 });
  }

  // ── 1. Static file (Academy 1 pre-generated content) ──────────────────────
  if (lessonId) {
    const staticPath = path.join(
      process.cwd(), "src", "data", "lessons", `${lessonId}.md`
    );
    if (fs.existsSync(staticPath)) {
      const content = fs.readFileSync(staticPath, "utf-8");
      console.log(`[Lesson] Serving static: ${lessonId}`);
      return streamText(content);
    }
  }

  // ── 2. Supabase cache ──────────────────────────────────────────────────────
  const cacheKey = lessonId ?? `${academy}__${module}__${topic}__${level}`.toLowerCase().replace(/\s+/g, "-");
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("lesson_cache")
      .select("content")
      .eq("id", cacheKey)
      .single();

    if (data?.content) {
      console.log(`[Lesson] Serving from Supabase cache: ${cacheKey}`);
      return streamText(data.content);
    }
  } catch {
    // cache miss or table not ready — fall through to API
  }

  // ── 3. Claude API — generate + cache ──────────────────────────────────────
  console.log(`[Lesson] Generating via Claude API: ${topic}`);
  const encoder = new TextEncoder();
  let fullContent = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generateLessonStream(academy, module, topic, level)) {
          fullContent += chunk;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
          );
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));

        // Save to Supabase cache (don't block the response stream)
        if (fullContent.length > 100) {
          try {
            const supabase = await createClient();
            await supabase.from("lesson_cache").upsert(
              { id: cacheKey, content: fullContent, updated_at: new Date().toISOString() },
              { onConflict: "id" }
            );
            console.log(`[Lesson] Cached to Supabase: ${cacheKey}`);
          } catch (cacheErr) {
            console.warn("[Lesson] Cache write failed (non-fatal):", cacheErr);
          }
        }
      } catch (err) {
        console.error("[Generate Lesson]", err);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "Lesson generation failed" })}\n\n`)
        );
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
