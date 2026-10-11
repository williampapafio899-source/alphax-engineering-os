import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const XP_BY_DIFFICULTY: Record<string, number> = {
  foundation:   50,
  apprentice:   100,
  practitioner: 175,
  professional: 250,
  expert:       400,
};

// GET /api/progress?userId=... — load all progress for a user
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [progressRes, streakRes] = await Promise.all([
    supabase
      .from("user_progress")
      .select("topic_id, module_id, academy_id, xp_earned, completed_at")
      .eq("user_id", user.id),
    supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user.id)
      .single(),
  ]);

  const completedTopics = progressRes.data ?? [];
  const streak = streakRes.data ?? { current_streak: 0, longest_streak: 0, total_xp: 0 };

  return NextResponse.json({ completedTopics, streak });
}

// POST /api/progress — mark a topic complete
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { topicId, moduleId, academyId, difficulty } = body;

  if (!topicId || !moduleId || !academyId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const xp = XP_BY_DIFFICULTY[difficulty] ?? 50;

  // Upsert the topic completion
  const { error: progressError } = await supabase
    .from("user_progress")
    .upsert(
      { user_id: user.id, topic_id: topicId, module_id: moduleId, academy_id: academyId, difficulty, xp_earned: xp },
      { onConflict: "user_id,topic_id" }
    );

  if (progressError) {
    return NextResponse.json({ error: progressError.message }, { status: 500 });
  }

  // Update streak + total XP
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    // First ever activity
    await supabase.from("user_streaks").insert({
      user_id: user.id,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
      total_xp: xp,
    });
  } else {
    const last = existing.last_activity_date;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    let newStreak = existing.current_streak;

    if (last === today) {
      // Already active today — just add XP
    } else if (last === yesterday) {
      // Continued streak
      newStreak += 1;
    } else {
      // Streak broken — reset to 1
      newStreak = 1;
    }

    await supabase.from("user_streaks").update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, existing.longest_streak),
      last_activity_date: today,
      total_xp: existing.total_xp + xp,
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id);
  }

  return NextResponse.json({ success: true, xp });
}
