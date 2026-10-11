"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ACADEMIES } from "@/data/academies";
import { createClient } from "@/lib/supabase/client";

const MASTERY_STEPS = ["Learn", "Practice", "Build", "Explain", "Demonstrate", "Unlock"];

const QUICK_ACTIONS = [
  { icon: "🧠", label: "Continue Learning",   href: "/academy",    color: "#00d4ff" },
  { icon: "💻", label: "Open Workspace",       href: "/workspace",  color: "#00ff88" },
  { icon: "🗺️", label: "Get My Roadmap",       href: "/onboarding", color: "#7c3aed" },
  { icon: "📚", label: "Browse All Academies", href: "/academy",    color: "#ff6b35" },
];

const ENGINEERING_TIPS = [
  "The best engineers don't memorize — they understand. Before moving on, ask: 'Can I explain this to a 12-year-old?'",
  "Write code that is easy to delete, not easy to extend. Simplicity is a feature.",
  "Debugging is twice as hard as writing code. Write code half as clever as you think you can.",
  "A good commit message is a letter to your future self. Make it count.",
  "The most important skill in engineering is knowing what to ignore.",
  "Read the error message. All of it. Every time.",
  "The fastest code is code that doesn't run. Remove before you optimize.",
  "Every bug is a misunderstanding made concrete. Fix the understanding, not just the code.",
];

interface ProgressData {
  completedTopics: Array<{ topic_id: string; module_id: string; academy_id: string; xp_earned: number; completed_at: string }>;
  streak: { current_streak: number; longest_streak: number; total_xp: number };
}

export default function DashboardPage() {
  const [user, setUser]       = useState<{ email?: string; id?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ProgressData | null>(null);

  const today = new Date();
  const tipIndex = today.getDate() % ENGINEERING_TIPS.length;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/progress")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setProgress(data); })
      .catch(() => {});
  }, [user]);

  const displayName = user?.email?.split("@")[0] ?? "Engineer";

  const completedIds = new Set((progress?.completedTopics ?? []).map((t) => t.topic_id));
  const totalXp      = progress?.streak?.total_xp ?? 0;
  const streak       = progress?.streak?.current_streak ?? 0;
  const topicsCount  = completedIds.size;

  // Find the next recommended topic (first incomplete in Academy 1 → 2 → ...)
  let nextTopic: { academy: typeof ACADEMIES[0]; module: typeof ACADEMIES[0]["modules"][0]; topic: typeof ACADEMIES[0]["modules"][0]["topics"][0] } | null = null;
  outer: for (const academy of ACADEMIES) {
    for (const mod of academy.modules) {
      for (const topic of mod.topics) {
        if (!completedIds.has(topic.id)) {
          nextTopic = { academy, module: mod, topic };
          break outer;
        }
      }
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#050a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#00d4ff", fontFamily: "monospace", fontSize: "0.85rem" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050a0f", color: "#e8f4fd" }}>

      {/* ─── Navigation ─────────────────────────────────────────── */}
      <nav style={{ borderBottom: "1px solid #1a2d45", background: "rgba(5,10,15,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span>⚡</span>
            <span style={{ fontWeight: 700, fontSize: "0.9rem", background: "linear-gradient(135deg,#00d4ff,#00ff88)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Engineering OS
            </span>
          </Link>
          <div style={{ display: "flex", gap: "1.25rem", marginLeft: "1rem" }}>
            {[
              { label: "Academies", href: "/academy"   },
              { label: "Workspace", href: "/workspace" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ color: "#8ba3bc", textDecoration: "none", fontSize: "0.85rem" }}>
                {l.label}
              </Link>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #00d4ff, #00ff88)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#050a0f", fontWeight: 700, fontSize: "0.8rem",
            }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: "0.8rem", color: "#8ba3bc" }}>{displayName}</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* ─── Welcome ──────────────────────────────────────────── */}
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#4a6580", marginBottom: "0.4rem" }}>
            {today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Welcome back,{" "}
            <span style={{ background: "linear-gradient(135deg,#00d4ff,#00ff88)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {displayName}
            </span>
          </h1>
          <p style={{ color: "#8ba3bc", marginTop: "0.3rem", fontSize: "0.9rem" }}>
            {topicsCount > 0 ? `${topicsCount} topic${topicsCount > 1 ? "s" : ""} mastered. Keep building.` : "Your engineering journey starts now. Pick up the first topic below."}
          </p>
        </div>

        {/* ─── Stats row ────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "2.5rem" }}>
          {[
            { label: "XP Earned",       value: totalXp.toLocaleString(), unit: "xp",    color: "#00d4ff" },
            { label: "Day Streak",       value: String(streak),           unit: "days",  color: "#00ff88" },
            { label: "Topics Mastered",  value: String(topicsCount),      unit: "done",  color: "#fbbf24" },
            { label: "Academy",          value: `A${Math.min(7, Math.floor(topicsCount / 5) + 1)}`, unit: "active", color: "#ff6b35" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{ padding: "1.1rem 1.25rem", borderRadius: 10, border: "1px solid #1a2d45", background: "#0d1828" }}
            >
              <div style={{ fontFamily: "monospace", fontSize: "1.6rem", fontWeight: 700, color: stat.color }}>
                {stat.value}
                <span style={{ fontSize: "0.65rem", marginLeft: 4, color: "#4a6580" }}>{stat.unit}</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#4a6580", marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ─── Main grid ────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.25rem", alignItems: "start" }}>

          {/* ── Left column ─────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Next up / current focus */}
            {nextTopic && (
              <div style={{ padding: "1.5rem", borderRadius: 12, border: `1px solid ${nextTopic.academy.color}33`, background: `linear-gradient(135deg, ${nextTopic.academy.color}08, #0a1220)` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div>
                    <p style={{ fontFamily: "monospace", fontSize: "0.65rem", color: nextTopic.academy.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                      NEXT UP — {nextTopic.academy.title}
                    </p>
                    <h2 style={{ fontWeight: 700, fontSize: "1.1rem" }}>{nextTopic.topic.title}</h2>
                    <p style={{ color: "#8ba3bc", fontSize: "0.82rem", marginTop: 3 }}>{nextTopic.topic.description}</p>
                  </div>
                  <span style={{ fontSize: "2rem", flexShrink: 0 }}>{nextTopic.academy.icon}</span>
                </div>

                {/* Mastery loop display */}
                <div style={{ display: "flex", gap: 4, marginBottom: "1.25rem", flexWrap: "wrap" }}>
                  {MASTERY_STEPS.map((step, i) => (
                    <div key={step} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <div style={{
                        padding: "0.25rem 0.6rem", borderRadius: 5, fontSize: "0.7rem",
                        fontWeight: i === 0 ? 600 : 400,
                        color: i === 0 ? "#050a0f" : "#4a6580",
                        background: i === 0 ? "#00d4ff" : "#111f33",
                        border: `1px solid ${i === 0 ? "#00d4ff" : "#1a2d45"}`,
                      }}>
                        {step}
                      </div>
                      {i < MASTERY_STEPS.length - 1 && <span style={{ color: "#1a2d45", fontSize: "0.65rem" }}>→</span>}
                    </div>
                  ))}
                </div>

                <Link
                  href={`/lesson/${nextTopic.topic.id}?academyId=${nextTopic.academy.id}&moduleId=${nextTopic.module.id}&academy=${encodeURIComponent(nextTopic.academy.title)}&module=${encodeURIComponent(nextTopic.module.title)}&topic=${encodeURIComponent(nextTopic.topic.title)}&level=${nextTopic.topic.difficulty}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "0.65rem 1.25rem", borderRadius: 8,
                    background: "linear-gradient(135deg, #00d4ff, #00cc6a)",
                    color: "#050a0f", fontWeight: 700, fontSize: "0.875rem",
                    textDecoration: "none",
                  }}
                >
                  Start Lesson →
                </Link>
              </div>
            )}

            {/* All academies overview */}
            <div>
              <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#4a6580", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.875rem" }}>
                All Academies
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {ACADEMIES.map((academy, idx) => {
                  const academyTopics = academy.modules.flatMap((m) => m.topics);
                  const academyDone   = academyTopics.filter((t) => completedIds.has(t.id)).length;
                  const academyPct    = Math.round((academyDone / academyTopics.length) * 100);
                  const isActive = idx === 0 || academyDone > 0;
                  const isLocked = idx > 0 && academyDone === 0 && (progress?.completedTopics?.length ?? 0) === 0;

                  return (
                    <Link
                      key={academy.id}
                      href={isLocked ? "#" : `/academy/${academy.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div style={{
                        padding: "0.875rem 1.1rem",
                        borderRadius: 8,
                        border: `1px solid ${isActive ? academy.color + "44" : "#1a2d45"}`,
                        background: isActive ? academy.color + "08" : "#0d1828",
                        display: "flex", alignItems: "center", gap: "0.875rem",
                        opacity: isLocked ? 0.45 : 1,
                        cursor: isLocked ? "not-allowed" : "pointer",
                        transition: "all 0.15s ease",
                      }}>
                        <span style={{ fontSize: "1.2rem" }}>{academy.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#e8f4fd", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            A{academy.number}: {academy.title}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                            <div style={{ flex: 1, height: 3, background: "#1a2d45", borderRadius: 999, overflow: "hidden", maxWidth: 120 }}>
                              <div style={{ height: "100%", width: `${academyPct}%`, background: academy.color, borderRadius: 999 }} />
                            </div>
                            <span style={{ fontFamily: "monospace", fontSize: "0.62rem", color: "#4a6580" }}>
                              {academyDone}/{academyTopics.length}
                            </span>
                          </div>
                        </div>
                        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                          {isActive && academyPct === 100 && (
                            <span style={{ fontFamily: "monospace", fontSize: "0.6rem", padding: "0.15rem 0.45rem", borderRadius: 3, background: "#00ff8820", color: "#00ff88", border: "1px solid #00ff8833" }}>
                              DONE
                            </span>
                          )}
                          {isActive && academyPct < 100 && academyDone > 0 && (
                            <span style={{ fontFamily: "monospace", fontSize: "0.6rem", padding: "0.15rem 0.45rem", borderRadius: 3, background: academy.color + "20", color: academy.color, border: `1px solid ${academy.color}33` }}>
                              {academyPct}%
                            </span>
                          )}
                          {isLocked && <span style={{ color: "#4a6580", fontSize: "0.85rem" }}>🔒</span>}
                          {!isLocked && <span style={{ color: academy.color, fontSize: "0.9rem" }}>→</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right column ────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Quick actions */}
            <div style={{ padding: "1.25rem", borderRadius: 12, border: "1px solid #1a2d45", background: "#0d1828" }}>
              <h3 style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#4a6580", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.875rem" }}>
                QUICK ACTIONS
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "0.625rem 0.875rem", borderRadius: 7,
                      border: "1px solid #1a2d45", background: "#070d16",
                      textDecoration: "none", color: "#e8f4fd",
                      fontSize: "0.85rem", transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = action.color + "44"; el.style.background = action.color + "08"; }}
                    onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = "#1a2d45"; el.style.background = "#070d16"; }}
                  >
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                    <span style={{ marginLeft: "auto", color: action.color, fontSize: "0.8rem" }}>→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* XP breakdown */}
            {topicsCount > 0 && (
              <div style={{ padding: "1.25rem", borderRadius: 12, border: "1px solid #1a2d45", background: "#0d1828" }}>
                <h3 style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#4a6580", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.875rem" }}>
                  RECENT COMPLETIONS
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {(progress?.completedTopics ?? []).slice(-5).reverse().map((t) => (
                    <div key={t.topic_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid #111f33" }}>
                      <span style={{ fontSize: "0.78rem", color: "#8ba3bc", fontFamily: "monospace" }}>
                        ✅ {t.topic_id.replace(/-/g, " ")}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#00d4ff", fontFamily: "monospace" }}>+{t.xp_earned}xp</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily tip */}
            <div style={{ padding: "1.25rem", borderRadius: 12, border: "1px solid rgba(0,255,136,0.2)", background: "rgba(0,255,136,0.04)" }}>
              <p style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#00ff88", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
                💡 ENGINEERING TIP
              </p>
              <p style={{ fontSize: "0.82rem", color: "#8ba3bc", lineHeight: 1.7 }}>
                {ENGINEERING_TIPS[tipIndex]}
              </p>
            </div>

            {/* Workspace CTA */}
            <Link
              href="/workspace"
              style={{
                display: "flex", flexDirection: "column", gap: 8,
                padding: "1.25rem", borderRadius: 12,
                border: "1px solid rgba(0,212,255,0.2)",
                background: "rgba(0,212,255,0.04)",
                textDecoration: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "1.5rem" }}>💻</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#e8f4fd" }}>Code Workspace</p>
                  <p style={{ fontSize: "0.75rem", color: "#4a6580" }}>Python · C · JS · TypeScript · Bash</p>
                </div>
                <span style={{ marginLeft: "auto", color: "#00d4ff" }}>→</span>
              </div>
            </Link>

            {/* Sign out */}
            {user && (
              <button
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                style={{
                  padding: "0.6rem", borderRadius: 8,
                  border: "1px solid #1a2d45", background: "transparent",
                  color: "#4a6580", cursor: "pointer", fontSize: "0.78rem",
                  fontFamily: "monospace",
                }}
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
