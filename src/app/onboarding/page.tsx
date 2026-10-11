"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GOALS = [
  { id: "web-app",    icon: "🌐", label: "Build web applications" },
  { id: "ai-product", icon: "🤖", label: "Build AI-powered products" },
  { id: "startup",    icon: "🚀", label: "Launch a tech startup" },
  { id: "job",        icon: "💼", label: "Get a software engineering job" },
  { id: "cs-degree",  icon: "🎓", label: "Master computer science" },
  { id: "games",      icon: "🎮", label: "Build games" },
  { id: "open-source",icon: "🌍", label: "Contribute to open source" },
  { id: "other",      icon: "✨", label: "Something else entirely" },
];

const SKILL_LEVELS = [
  { id: "zero",      label: "Complete beginner",      desc: "I've never written code before" },
  { id: "basics",    label: "I know some basics",     desc: "Variables, loops — but struggling" },
  { id: "some-apps", label: "I've built small things", desc: "Simple scripts or websites" },
  { id: "hobbyist",  label: "Hobbyist programmer",    desc: "Side projects, self-taught" },
  { id: "pro",       label: "Working developer",      desc: "Professional experience, want to level up" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [customGoal, setCustomGoal] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<string>("");

  const goal = selectedGoal === "other" ? customGoal : GOALS.find(g => g.id === selectedGoal)?.label ?? "";

  async function generateRoadmap() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, currentSkills: selectedLevel }),
      });
      const data = await res.json();
      setRoadmap(data.roadmap);
      setStep(4);
    } catch {
      setRoadmap("Failed to generate roadmap. Please try again.");
      setStep(4);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050a0f",
        color: "#e8f4fd",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        backgroundImage:
          "linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      {/* Back nav */}
      <div style={{ position: "absolute", top: 24, left: 24 }}>
        <Link href="/" style={{ color: "#4a6580", textDecoration: "none", fontSize: "0.85rem", fontFamily: "monospace" }}>
          ← Engineering OS
        </Link>
      </div>

      {/* Progress */}
      <div style={{ display: "flex", gap: 6, marginBottom: "2.5rem" }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              width: s <= step ? 32 : 8,
              height: 4,
              borderRadius: 999,
              background: s <= step ? "#00d4ff" : "#1a2d45",
              transition: "all 0.4s ease",
            }}
          />
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 640 }}>

        {/* ─── Step 1: Goal ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem", textAlign: "center" }}>
              What do you want to build?
            </h1>
            <p style={{ color: "#8ba3bc", textAlign: "center", marginBottom: "2rem", fontSize: "0.95rem" }}>
              Engineering OS builds your personal roadmap around your goal — not a generic curriculum.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGoal(g.id)}
                  style={{
                    padding: "1rem",
                    borderRadius: 10,
                    border: `1px solid ${selectedGoal === g.id ? "#00d4ff" : "#1a2d45"}`,
                    background: selectedGoal === g.id ? "rgba(0,212,255,0.08)" : "#0d1828",
                    color: "#e8f4fd",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: "0.875rem",
                    fontWeight: selectedGoal === g.id ? 600 : 400,
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "1.25rem" }}>{g.icon}</span>
                  {g.label}
                </button>
              ))}
            </div>

            {selectedGoal === "other" && (
              <input
                autoFocus
                placeholder="Describe your goal..."
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: 8,
                  border: "1px solid #1e3a5f",
                  background: "#0d1828",
                  color: "#e8f4fd",
                  fontSize: "0.9rem",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!selectedGoal || (selectedGoal === "other" && !customGoal.trim())}
              style={{
                width: "100%",
                marginTop: "1.5rem",
                padding: "0.875rem",
                borderRadius: 10,
                background:
                  selectedGoal && !(selectedGoal === "other" && !customGoal.trim())
                    ? "linear-gradient(135deg, #00d4ff, #00cc6a)"
                    : "#1a2d45",
                color: "#050a0f",
                fontWeight: 700,
                fontSize: "0.95rem",
                border: "none",
                cursor: selectedGoal ? "pointer" : "not-allowed",
              }}
            >
              Continue →
            </button>

            <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.8rem", color: "#4a6580" }}>
              Not ready?{" "}
              <a
                href="/academy"
                style={{ color: "#00d4ff", textDecoration: "none", cursor: "pointer" }}
              >
                Explore the curriculum without an account →
              </a>
            </p>
          </div>
        )}

        {/* ─── Step 2: Skill Level ──────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem", textAlign: "center" }}>
              Where are you starting from?
            </h1>
            <p style={{ color: "#8ba3bc", textAlign: "center", marginBottom: "2rem", fontSize: "0.95rem" }}>
              Be honest — Engineering OS adapts to exactly where you are.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  style={{
                    padding: "1rem 1.25rem",
                    borderRadius: 10,
                    border: `1px solid ${selectedLevel === level.id ? "#00d4ff" : "#1a2d45"}`,
                    background: selectedLevel === level.id ? "rgba(0,212,255,0.08)" : "#0d1828",
                    color: "#e8f4fd",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{level.label}</div>
                    <div style={{ color: "#8ba3bc", fontSize: "0.8rem", marginTop: 2 }}>{level.desc}</div>
                  </div>
                  {selectedLevel === level.id && (
                    <span style={{ color: "#00d4ff", fontSize: "1.1rem" }}>✓</span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: "0.875rem",
                  borderRadius: 10,
                  border: "1px solid #1a2d45",
                  background: "transparent",
                  color: "#8ba3bc",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedLevel}
                style={{
                  flex: 2,
                  padding: "0.875rem",
                  borderRadius: 10,
                  background: selectedLevel ? "linear-gradient(135deg, #00d4ff, #00cc6a)" : "#1a2d45",
                  color: "#050a0f",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  border: "none",
                  cursor: selectedLevel ? "pointer" : "not-allowed",
                }}
              >
                Continue →
              </button>
            </div>

            <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.8rem", color: "#4a6580" }}>
              <a href="/academy" style={{ color: "#00d4ff", textDecoration: "none" }}>
                Skip → Explore without an account
              </a>
            </p>
          </div>
        )}

        {/* ─── Step 3: Confirm & Generate ──────────────────────────────── */}
        {step === 3 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗺️</div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              Ready to generate your roadmap
            </h1>
            <p style={{ color: "#8ba3bc", marginBottom: "2rem", lineHeight: 1.7 }}>
              Engineering OS will create a personalized learning path based on your goal and current level.
            </p>

            <div
              style={{
                padding: "1.25rem",
                borderRadius: 10,
                border: "1px solid #1a2d45",
                background: "#0d1828",
                textAlign: "left",
                marginBottom: "2rem",
              }}
            >
              <div style={{ marginBottom: "0.75rem" }}>
                <span style={{ color: "#4a6580", fontSize: "0.75rem", fontFamily: "monospace" }}>GOAL</span>
                <p style={{ color: "#e8f4fd", marginTop: 4, fontSize: "0.95rem", fontWeight: 500 }}>{goal}</p>
              </div>
              <div>
                <span style={{ color: "#4a6580", fontSize: "0.75rem", fontFamily: "monospace" }}>CURRENT LEVEL</span>
                <p style={{ color: "#e8f4fd", marginTop: 4, fontSize: "0.95rem" }}>
                  {SKILL_LEVELS.find(l => l.id === selectedLevel)?.label}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  flex: 1,
                  padding: "0.875rem",
                  borderRadius: 10,
                  border: "1px solid #1a2d45",
                  background: "transparent",
                  color: "#8ba3bc",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                ← Back
              </button>
              <button
                onClick={generateRoadmap}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: "0.875rem",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #00d4ff, #00cc6a)",
                  color: "#050a0f",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  border: "none",
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                {loading ? "Generating your roadmap..." : "Generate My Roadmap →"}
              </button>
            </div>

            <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.8rem", color: "#4a6580" }}>
              <a href="/academy" style={{ color: "#00d4ff", textDecoration: "none" }}>
                Skip → Explore without an account
              </a>
            </p>
          </div>
        )}

        {/* ─── Step 4: Roadmap Result ───────────────────────────────────── */}
        {step === 4 && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✅</div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                Your roadmap is ready
              </h1>
              <p style={{ color: "#8ba3bc", fontSize: "0.9rem" }}>
                Here&apos;s your personalized Engineering OS path
              </p>
            </div>

            <div
              style={{
                padding: "1.5rem",
                borderRadius: 12,
                border: "1px solid #1a2d45",
                background: "#0d1828",
                whiteSpace: "pre-wrap",
                fontSize: "0.875rem",
                lineHeight: 1.8,
                color: "#8ba3bc",
                maxHeight: 400,
                overflowY: "auto",
                marginBottom: "1.5rem",
                fontFamily: "monospace",
              }}
            >
              {roadmap}
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => router.push("/academy")}
                style={{
                  flex: 1,
                  padding: "0.875rem",
                  borderRadius: 10,
                  border: "1px solid #1a2d45",
                  background: "transparent",
                  color: "#e8f4fd",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Browse Academies
              </button>
              <button
                onClick={() => router.push("/auth")}
                style={{
                  flex: 2,
                  padding: "0.875rem",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #00d4ff, #00cc6a)",
                  color: "#050a0f",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Create Account & Start →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
