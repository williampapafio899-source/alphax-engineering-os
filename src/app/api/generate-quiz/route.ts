import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { topic, description, difficulty, academy, module: moduleName } = await req.json();

  if (!topic) return NextResponse.json({ error: "Missing topic" }, { status: 400 });

  const difficultyContext: Record<string, string> = {
    foundation:   "beginner-level, conceptual, recognition questions",
    apprentice:   "basic understanding, can-you-explain questions",
    practitioner: "applied knowledge, how-would-you questions",
    professional: "deep understanding, design and tradeoff questions",
    expert:       "expert-level, open-ended systems thinking questions",
  };

  const prompt = `Generate exactly 5 multiple-choice quiz questions for:

Topic: ${topic}
Description: ${description}
Module: ${moduleName}
Academy: ${academy}
Difficulty: ${difficulty} (${difficultyContext[difficulty] ?? "intermediate"})

Rules:
- Each question tests genuine understanding, not just memory
- 4 options per question (A, B, C, D)
- Exactly 1 correct answer per question
- Include a brief explanation for the correct answer
- Questions must be practical and specific to this topic

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correct": "A",
      "explanation": "..."
    }
  ]
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (response.content[0] as { type: string; text: string }).text;

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const quiz = JSON.parse(jsonMatch[0]);
    return NextResponse.json(quiz);
  } catch (err) {
    console.error("Quiz generation error:", err);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}
