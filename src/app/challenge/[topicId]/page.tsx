"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { LEVEL_COLORS, LEVEL_LABELS } from "@/data/academies";

const XP_BY_DIFFICULTY: Record<string, number> = {
  foundation:   50,
  apprentice:   100,
  practitioner: 175,
  professional: 250,
  expert:       400,
};

interface Question {
  id: number;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: string;
  explanation: string;
}

function ChallengeContent() {
  const { topicId } = useParams<{ topicId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const topic      = searchParams.get("topic") ?? topicId;
  const description = searchParams.get("desc") ?? "";
  const difficulty = searchParams.get("level") ?? "foundation";
  const moduleId   = searchParams.get("module") ?? "";
  const academyId  = searchParams.get("academy") ?? "";
  const moduleName = searchParams.get("moduleName") ?? "";

  const [questions, setQuestions]   = useState<Question[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [answers, setAnswers]       = useState<Record<number, string>>({});
  const [submitted, setSubmitted]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [xpEarned, setXpEarned]     = useState(0);

  const generateQuiz = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, description, difficulty, academy: academyId, module: moduleName }),
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      } else {
        setError("Failed to generate questions. Try again.");
      }
    } catch {
      setError("Network error. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [topic, description, difficulty, academyId, moduleName]);

  useEffect(() => { generateQuiz(); }, [generateQuiz]);

  const score = submitted
    ? questions.filter((q) => answers[q.id] === q.correct).length
    : 0;
  const pct   = submitted ? Math.round((score / questions.length) * 100) : 0;
  const passed = submitted && pct >= 80;

  async function handleSubmit() {
    if (Object.keys(answers).length < questions.length) return;
    setSubmitted(true);

    const s = questions.filter((q) => answers[q.id] === q.correct).length;
    const p = Math.round((s / questions.length) * 100);

    if (p >= 80) {
      setSaving(true);
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId, moduleId, academyId, difficulty }),
        });
        const data = await res.json();
        setXpEarned(data.xp ?? XP_BY_DIFFICULTY[difficulty] ?? 50);
      } catch {
        // Silently fail — user still sees result
      } finally {
        setSaving(false);
      }
    }
  }

  const accentColor = LEVEL_COLORS[difficulty] ?? "#00d4ff";

  return (
    <div style={{ minHeight: "100vh", background: "#050a0f", color: "#e8f4fd" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #1a2d45", background: "rgba(5,10,15,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Link href="/" style={{ textDecoration: "none", color: "#4a6580", fontSize: "0.78rem", fontFamily: "monospace" }}>Engineering OS</Link>
          <span style={{ color: "#1a2d45" }}>›</span>
          <Link href={`/academy/${academyId}`} style={{ textDecoration: "none", color: "#4a6580", fontSize: "0.78rem", fontFamily: "monospace" }}>{academyId}</Link>
          <span style={{ color: "#1a2d45" }}>›</span>
          <span style={{ color: accentColor, fontSize: "0.78rem", fontFamily: "monospace" }}>Challenge</span>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "1.5rem" }}>🎯</span>
            <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: accentColor, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Mastery Challenge
            </span>
            <span style={{
              fontSize: "0.65rem", padding: "0.15rem 0.45rem", borderRadius: 4,
              border: `1px solid ${accentColor}33`,
              background: accentColor + "15",
              color: accentColor,
              fontFamily: "monospace",
            }}>
              {LEVEL_LABELS[difficulty] ?? difficulty}
            </span>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
            {topic}
          </h1>
          <p style={{ color: "#8ba3bc", fontSize: "0.9rem" }}>
            Answer 4 out of 5 questions correctly (80%+) to unlock this topic and earn XP.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "4rem 0" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${accentColor}33`, borderTop: `3px solid ${accentColor}`, animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "#8ba3bc", fontFamily: "monospace", fontSize: "0.85rem" }}>
              AI Professor is crafting your challenge...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <p style={{ color: "#f43f5e", marginBottom: "1rem" }}>{error}</p>
            <button onClick={generateQuiz} style={{ padding: "0.75rem 1.5rem", borderRadius: 8, background: "linear-gradient(135deg, #00d4ff, #00cc6a)", color: "#050a0f", fontWeight: 700, border: "none", cursor: "pointer" }}>
              Retry →
            </button>
          </div>
        )}

        {/* Questions */}
        {!loading && !error && !submitted && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {questions.map((q) => (
                <div
                  key={q.id}
                  style={{ padding: "1.5rem", borderRadius: 12, border: "1px solid #1a2d45", background: "#0d1828" }}
                >
                  <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "#e8f4fd", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                    <span style={{ color: accentColor, fontFamily: "monospace", fontSize: "0.75rem", marginRight: 8 }}>Q{q.id}.</span>
                    {q.question}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {(["A", "B", "C", "D"] as const).map((opt) => {
                      const selected = answers[q.id] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                          style={{
                            padding: "0.75rem 1rem",
                            borderRadius: 8,
                            border: `1px solid ${selected ? accentColor : "#1e3a5f"}`,
                            background: selected ? accentColor + "15" : "#070d16",
                            color: selected ? "#e8f4fd" : "#8ba3bc",
                            cursor: "pointer",
                            textAlign: "left",
                            fontSize: "0.875rem",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            transition: "all 0.15s ease",
                          }}
                        >
                          <span style={{
                            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                            border: `1px solid ${selected ? accentColor : "#2a4a6a"}`,
                            background: selected ? accentColor : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.7rem", fontWeight: 700, color: selected ? "#050a0f" : "#4a6580",
                          }}>
                            {opt}
                          </span>
                          {q.options[opt]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress indicator */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.5rem", marginBottom: "1rem" }}>
              <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#4a6580" }}>
                {Object.keys(answers).length} / {questions.length} answered
              </span>
              <div style={{ height: 4, flex: 1, margin: "0 1rem", background: "#1a2d45", borderRadius: 999, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(Object.keys(answers).length / questions.length) * 100}%`,
                  background: `linear-gradient(90deg, ${accentColor}, #00ff88)`,
                  borderRadius: 999,
                  transition: "width 0.3s ease",
                }} />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < questions.length}
              style={{
                width: "100%",
                padding: "0.9rem",
                borderRadius: 10,
                background: Object.keys(answers).length >= questions.length
                  ? "linear-gradient(135deg, #00d4ff, #00cc6a)"
                  : "#1a2d45",
                color: "#050a0f",
                fontWeight: 700,
                fontSize: "0.95rem",
                border: "none",
                cursor: Object.keys(answers).length >= questions.length ? "pointer" : "not-allowed",
              }}
            >
              Submit Challenge →
            </button>
          </>
        )}

        {/* Results */}
        {submitted && (
          <div>
            {/* Score banner */}
            <div style={{
              padding: "2rem",
              borderRadius: 16,
              border: `1px solid ${passed ? "rgba(0,255,136,0.3)" : "rgba(244,63,94,0.3)"}`,
              background: passed ? "rgba(0,255,136,0.06)" : "rgba(244,63,94,0.06)",
              textAlign: "center",
              marginBottom: "2rem",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>
                {passed ? "🏆" : "📚"}
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, color: passed ? "#00ff88" : "#f43f5e", marginBottom: "0.5rem" }}>
                {pct}%
              </h2>
              <p style={{ fontSize: "1rem", color: "#e8f4fd", fontWeight: 600, marginBottom: "0.5rem" }}>
                {passed ? "Topic Unlocked!" : "Not quite — review and try again"}
              </p>
              <p style={{ color: "#8ba3bc", fontSize: "0.875rem" }}>
                {score} out of {questions.length} correct · {passed ? `Need ≥ 80% · You got ${pct}%` : `Need 80% to pass · You got ${pct}%`}
              </p>
              {passed && !saving && xpEarned > 0 && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  marginTop: "0.75rem", padding: "0.4rem 1rem",
                  borderRadius: 999, background: "rgba(0,212,255,0.1)",
                  border: "1px solid rgba(0,212,255,0.3)",
                  color: "#00d4ff", fontFamily: "monospace", fontSize: "0.8rem",
                }}>
                  ⚡ +{xpEarned} XP earned
                </div>
              )}
              {saving && (
                <p style={{ color: "#4a6580", fontFamily: "monospace", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                  Saving progress...
                </p>
              )}
            </div>

            {/* Answer review */}
            <h3 style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#4a6580", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
              Answer Review
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
              {questions.map((q) => {
                const userAns = answers[q.id];
                const correct = userAns === q.correct;
                return (
                  <div key={q.id} style={{
                    padding: "1.25rem",
                    borderRadius: 10,
                    border: `1px solid ${correct ? "rgba(0,255,136,0.25)" : "rgba(244,63,94,0.25)"}`,
                    background: correct ? "rgba(0,255,136,0.04)" : "rgba(244,63,94,0.04)",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: "0.6rem" }}>
                      <span style={{ fontSize: "0.9rem", flexShrink: 0, marginTop: 1 }}>{correct ? "✅" : "❌"}</span>
                      <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#e8f4fd", lineHeight: 1.5 }}>{q.question}</p>
                    </div>

                    <div style={{ paddingLeft: 26 }}>
                      {!correct && (
                        <p style={{ fontSize: "0.8rem", color: "#f43f5e", marginBottom: 4 }}>
                          Your answer: <strong>{userAns}. {q.options[userAns as keyof typeof q.options]}</strong>
                        </p>
                      )}
                      <p style={{ fontSize: "0.8rem", color: "#00ff88", marginBottom: "0.5rem" }}>
                        Correct: <strong>{q.correct}. {q.options[q.correct as keyof typeof q.options]}</strong>
                      </p>
                      <p style={{ fontSize: "0.78rem", color: "#8ba3bc", lineHeight: 1.6, padding: "0.6rem 0.75rem", borderRadius: 6, background: "#070d16", border: "1px solid #1a2d45" }}>
                        💡 {q.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {!passed && (
                <button
                  onClick={() => { setSubmitted(false); setAnswers({}); setQuestions([]); generateQuiz(); }}
                  style={{
                    flex: 1, padding: "0.875rem", borderRadius: 10,
                    border: "1px solid #1a2d45", background: "transparent",
                    color: "#e8f4fd", cursor: "pointer", fontSize: "0.9rem",
                  }}
                >
                  🔄 Try Again
                </button>
              )}
              <Link
                href={`/lesson/${topicId}?academy=${encodeURIComponent(academyId)}&module=${encodeURIComponent(moduleName)}&topic=${encodeURIComponent(topic)}&level=${difficulty}`}
                style={{
                  flex: 1, padding: "0.875rem", borderRadius: 10,
                  border: "1px solid #1a2d45", background: "transparent",
                  color: "#8ba3bc", textDecoration: "none", fontSize: "0.875rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ← Back to Lesson
              </Link>
              {passed && (
                <Link
                  href={`/academy/${academyId}/module/${moduleId}`}
                  style={{
                    flex: 2, padding: "0.875rem", borderRadius: 10,
                    background: "linear-gradient(135deg, #00d4ff, #00cc6a)",
                    color: "#050a0f", fontWeight: 700, textDecoration: "none",
                    fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  Continue to Next Topic →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChallengePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#050a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#00d4ff", fontFamily: "monospace" }}>Loading challenge...</div>
      </div>
    }>
      <ChallengeContent />
    </Suspense>
  );
}
