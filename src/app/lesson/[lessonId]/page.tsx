"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useParams } from "next/navigation";
import { Suspense } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

/* ─── Styled Markdown component map ───────────────────────────────────────── */
const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 style={{
      fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em",
      color: "#e8f4fd", margin: "2.5rem 0 0.75rem",
      paddingBottom: "0.5rem",
      borderBottom: "1px solid #1a2d45",
      lineHeight: 1.3,
    }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{
      fontSize: "1.2rem", fontWeight: 700, color: "#00d4ff",
      margin: "2.25rem 0 0.6rem", letterSpacing: "-0.01em", lineHeight: 1.4,
      display: "flex", alignItems: "center", gap: "0.5rem",
    }}>
      <span style={{ width: 3, height: "1em", background: "#00d4ff", borderRadius: 2, display: "inline-block", flexShrink: 0 }} />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{
      fontSize: "1rem", fontWeight: 600, color: "#00ff88",
      margin: "1.75rem 0 0.5rem", lineHeight: 1.5,
    }}>{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 style={{
      fontSize: "0.9rem", fontWeight: 600, color: "#fbbf24",
      margin: "1.25rem 0 0.4rem", lineHeight: 1.5,
    }}>{children}</h4>
  ),
  p: ({ children }) => (
    <p style={{
      color: "#c4d9ec", fontSize: "0.95rem", lineHeight: 1.85,
      margin: "0.75rem 0",
    }}>{children}</p>
  ),
  strong: ({ children }) => (
    <strong style={{ color: "#e8f4fd", fontWeight: 600 }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ color: "#8ba3bc", fontStyle: "italic" }}>{children}</em>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) {
      const lang = className?.replace("language-", "") ?? "";
      return (
        <div style={{ margin: "1.25rem 0", borderRadius: 10, overflow: "hidden", border: "1px solid #1e3a5f" }}>
          {lang && (
            <div style={{
              padding: "0.4rem 1rem",
              background: "#0d1828",
              borderBottom: "1px solid #1e3a5f",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#4a6580", textTransform: "uppercase", letterSpacing: "0.1em" }}>{lang}</span>
              <div style={{ display: "flex", gap: 5 }}>
                {["#ff5f57","#febc2e","#28c840"].map((c) => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                ))}
              </div>
            </div>
          )}
          <pre style={{
            margin: 0, padding: "1.25rem 1.5rem",
            background: "#040810",
            overflowX: "auto",
            fontSize: "0.85rem",
            lineHeight: 1.7,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          }}>
            <code style={{ color: "#e2f0fb" }}>{children}</code>
          </pre>
        </div>
      );
    }
    return (
      <code style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.8em",
        background: "#0d1828",
        border: "1px solid #1e3a5f",
        color: "#00d4ff",
        padding: "0.15em 0.45em",
        borderRadius: 4,
      }} {...props}>{children}</code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  blockquote: ({ children }) => (
    <blockquote style={{
      margin: "1.25rem 0",
      padding: "1rem 1.25rem",
      borderLeft: "3px solid #00d4ff",
      background: "rgba(0,212,255,0.04)",
      borderRadius: "0 8px 8px 0",
    }}>
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: "0.75rem 0", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: "0.75rem 0", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ color: "#c4d9ec", fontSize: "0.95rem", lineHeight: 1.75 }}>{children}</li>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: "auto", margin: "1.25rem 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ background: "#0d1828", borderBottom: "2px solid #1e3a5f" }}>
      {children}
    </thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr style={{ borderBottom: "1px solid #1a2d45" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "#0d1828"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
    >{children}</tr>
  ),
  th: ({ children }) => (
    <th style={{
      padding: "0.625rem 1rem", textAlign: "left",
      color: "#00d4ff", fontFamily: "monospace",
      fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em",
      fontWeight: 600,
    }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{
      padding: "0.625rem 1rem",
      color: "#c4d9ec", fontSize: "0.9rem",
      verticalAlign: "top",
    }}>{children}</td>
  ),
  hr: () => (
    <hr style={{ border: "none", borderTop: "1px solid #1a2d45", margin: "2rem 0" }} />
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ color: "#00d4ff", textDecoration: "underline", textDecorationColor: "rgba(0,212,255,0.35)" }}>
      {children}
    </a>
  ),
};

/* ─── Compact MD for chat bubbles (smaller text, less margin) ─────────────── */
const chatMdComponents: Components = {
  ...mdComponents,
  h2: ({ children }) => (
    <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#00d4ff", margin: "0.75rem 0 0.3rem" }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontSize: "0.8rem", fontWeight: 600, color: "#00ff88", margin: "0.6rem 0 0.25rem" }}>{children}</h3>
  ),
  p: ({ children }) => (
    <p style={{ color: "#c4d9ec", fontSize: "0.8rem", lineHeight: 1.7, margin: "0.3rem 0" }}>{children}</p>
  ),
  li: ({ children }) => (
    <li style={{ color: "#c4d9ec", fontSize: "0.8rem", lineHeight: 1.6 }}>{children}</li>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: "0.3rem 0", paddingLeft: "1.2rem" }}>{children}</ul>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) {
      return (
        <pre style={{ margin: "0.5rem 0", padding: "0.75rem", background: "#040810", borderRadius: 6, fontSize: "0.75rem", overflowX: "auto", fontFamily: "monospace", color: "#e2f0fb", border: "1px solid #1e3a5f" }}>
          <code>{children}</code>
        </pre>
      );
    }
    return (
      <code style={{ fontFamily: "monospace", fontSize: "0.75em", background: "#0d1828", border: "1px solid #1e3a5f", color: "#00d4ff", padding: "0.1em 0.35em", borderRadius: 3 }} {...props}>
        {children}
      </code>
    );
  },
};

const SECTION_TITLES = [
  "Why This Matters", "Mental Model", "Powerful Analogy", "Socratic Questions",
  "Deep Explanation", "Visual Thinking", "Real Engineering Examples", "Code Walkthrough",
  "Failure Cases", "Engineering Decisions", "Common Misconceptions", "Guided Practice",
  "Quiz", "Project Micro-Task", "Project Progression Ladder", "Knowledge Transfer",
  "Connection Map", "Expert Thinking", "Expert Insights", "Memory Anchors",
  "First Principles Summary", "Mastery Challenge",
];

const LEVEL_COLORS: Record<string, string> = {
  foundation: "#00d4ff",
  apprentice: "#00ff88",
  practitioner: "#fbbf24",
  professional: "#ff6b35",
  expert: "#f43f5e",
};

/* ─── Main lesson component ───────────────────────────────────────────────── */
function LessonContent() {
  const searchParams = useSearchParams();
  const academy = searchParams.get("academy") ?? "Engineering OS";
  const module  = searchParams.get("module")  ?? "General";
  const topic   = searchParams.get("topic")   ?? "Topic";
  const level   = searchParams.get("level")   ?? "foundation";

  const [content, setContent]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [generated, setGenerated]   = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user"|"assistant"; content: string }>>([]);
  const [chatInput, setChatInput]   = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat]     = useState(false);
  const [completed, setCompleted]   = useState(false);
  const [completing, setCompleting] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Derive IDs — lessonId IS the topicId; look up academy/module from data
  const academyId = searchParams.get("academyId") ?? "";
  const moduleId  = searchParams.get("moduleId")  ?? "";

  async function markComplete() {
    if (completed || completing) return;
    setCompleting(true);
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: lessonId, moduleId, academyId, difficulty: level }),
      });
      setCompleted(true);
    } catch { /* silent fail — user not logged in */ }
    finally { setCompleting(false); }
  }

  const levelColor = LEVEL_COLORS[level] ?? "#00d4ff";

  /* ── Generate lesson (streaming) ─────────────────────────────────────── */
  // grab lessonId from the URL so the API can hit the static file first
  const params = useParams<{ lessonId: string }>();
  const lessonId = params?.lessonId ?? "";

  async function generateLesson() {
    setLoading(true);
    setContent("");
    setGenerated(false);
    try {
      const res = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, academy, module, topic, level }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") { setGenerated(true); break; }
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) setContent((p) => p + parsed.text);
            } catch { /* ignore partial json */ }
          }
        }
      }
      setGenerated(true);
    } catch {
      setContent("Failed to generate lesson. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── AI Professor chat ────────────────────────────────────────────────── */
  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user" as const, content: chatInput };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);
    let assistantContent = "";
    try {
      const res = await fetch("/api/ai-professor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, context: { academy, module, topic, level } }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;
      setChatMessages((p) => [...p, { role: "assistant", content: "" }]);
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantContent += parsed.text;
                setChatMessages((p) => {
                  const u = [...p];
                  u[u.length - 1] = { role: "assistant", content: assistantContent };
                  return u;
                });
              }
            } catch { /* ignore */ }
          }
        }
      }
    } finally { setChatLoading(false); }
  }

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <div style={{ minHeight: "100vh", background: "#050a0f", color: "#e8f4fd", display: "flex", flexDirection: "column" }}>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav style={{ borderBottom: "1px solid #1a2d45", background: "rgba(5,10,15,0.97)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 1.5rem", height: 52, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Link href="/academy" style={{ textDecoration: "none", color: "#4a6580", fontSize: "0.75rem", fontFamily: "monospace", whiteSpace: "nowrap" }}>← Academies</Link>
          <span style={{ color: "#1a2d45" }}>›</span>
          <span style={{ color: "#8ba3bc", fontSize: "0.75rem", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{module}</span>
          <span style={{ color: "#1a2d45" }}>›</span>
          <span style={{ color: levelColor, fontSize: "0.75rem", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{topic}</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.55rem", borderRadius: 4, border: `1px solid ${levelColor}33`, background: levelColor + "10", color: levelColor, fontFamily: "monospace" }}>
              {level}
            </span>
            <button
              onClick={() => setShowChat(!showChat)}
              style={{
                padding: "0.35rem 0.8rem", borderRadius: 6,
                border: `1px solid ${showChat ? "rgba(0,212,255,0.5)" : "rgba(0,212,255,0.25)"}`,
                background: showChat ? "rgba(0,212,255,0.12)" : "transparent",
                color: "#00d4ff", cursor: "pointer", fontSize: "0.75rem",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              🧠 AI Professor
            </button>
          </div>
        </div>
      </nav>

      {/* ── Layout ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", maxWidth: 1320, margin: "0 auto", width: "100%" }}>

        {/* ── Lesson main ──────────────────────────────────────────── */}
        <div style={{ flex: 1, padding: "2.5rem 2rem 5rem", minWidth: 0, maxWidth: showChat ? "calc(100% - 380px)" : "100%" }}>

          {/* Topic header */}
          <div style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid #1a2d45" }}>
            <div style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "#4a6580", marginBottom: "0.5rem" }}>
              {academy} › {module}
            </div>
            <h1 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem", lineHeight: 1.2 }}>
              {topic}
            </h1>
            <div style={{ display: "flex", gap: "0.65rem", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{
                fontSize: "0.72rem", padding: "0.2rem 0.65rem", borderRadius: 4,
                border: `1px solid ${levelColor}33`, background: levelColor + "10",
                color: levelColor, fontFamily: "monospace", fontWeight: 600,
              }}>
                {level.charAt(0).toUpperCase() + level.slice(1)} Level
              </span>
              <span style={{ fontSize: "0.72rem", color: "#4a6580", fontFamily: "monospace" }}>
                22-section mastery lesson · Claude AI
              </span>
              {generated && (
                <button
                  onClick={generateLesson}
                  style={{ fontSize: "0.72rem", color: "#4a6580", background: "transparent", border: "1px solid #1a2d45", borderRadius: 4, padding: "0.15rem 0.55rem", cursor: "pointer", fontFamily: "monospace" }}
                >
                  ↺ Regenerate
                </button>
              )}
            </div>
          </div>

          {/* ── Pre-generate state ─────────────────────────────────── */}
          {!generated && !loading && (
            <div style={{ padding: "3.5rem 2rem", borderRadius: 14, border: "1px dashed #1e3a5f", background: "#070d16", textAlign: "center" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🎓</div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Ready to master <span style={{ color: levelColor }}>{topic}</span>?
              </h2>
              <p style={{ color: "#8ba3bc", marginBottom: "0.75rem", fontSize: "0.9rem", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 1.5rem" }}>
                Your AI Professor will generate a complete 22-section lesson — analogies, deep explanations, code examples, quizzes, projects, expert insights and more.
              </p>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1.75rem" }}>
                {["Mental Model", "Code Examples", "Quiz", "Project", "Expert Insights"].map((tag) => (
                  <span key={tag} style={{ fontSize: "0.7rem", padding: "0.2rem 0.55rem", borderRadius: 4, border: "1px solid #1a2d45", color: "#4a6580", fontFamily: "monospace" }}>
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={generateLesson}
                style={{
                  padding: "0.9rem 2.5rem", borderRadius: 10,
                  background: "linear-gradient(135deg, #00d4ff, #00cc6a)",
                  color: "#050a0f", fontWeight: 700, fontSize: "0.95rem",
                  border: "none", cursor: "pointer",
                  boxShadow: "0 0 30px rgba(0,212,255,0.25)",
                }}
              >
                Generate My Lesson →
              </button>
            </div>
          )}

          {/* ── Streaming indicator ─────────────────────────────────── */}
          {loading && !content && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", gap: "1rem" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                border: "3px solid #1a2d45", borderTopColor: "#00d4ff",
                animation: "spin 0.8s linear infinite",
              }} />
              <p style={{ color: "#4a6580", fontFamily: "monospace", fontSize: "0.8rem" }}>
                AI Professor is building your lesson...
              </p>
            </div>
          )}

          {/* ── Section nav pills ───────────────────────────────────── */}
          {content && (
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "1.75rem", padding: "0.875rem", borderRadius: 8, background: "#0a1220", border: "1px solid #1a2d45" }}>
              {SECTION_TITLES.map((title, i) => (
                <span
                  key={title}
                  style={{
                    fontSize: "0.62rem", padding: "0.2rem 0.45rem", borderRadius: 4,
                    background: "#0d1828", border: "1px solid #1a2d45",
                    color: "#4a6580", fontFamily: "monospace", cursor: "default",
                    whiteSpace: "nowrap",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              ))}
              {loading && (
                <span style={{ fontSize: "0.62rem", color: "#00d4ff", fontFamily: "monospace", display: "flex", alignItems: "center", gap: 4, padding: "0.2rem 0.45rem" }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#00d4ff", animation: "pulse 1.2s ease-in-out infinite" }} />
                  Streaming...
                </span>
              )}
            </div>
          )}

          {/* ── Rendered lesson content ─────────────────────────────── */}
          {content && (
            <div style={{
              background: "#070d16",
              borderRadius: 12,
              border: "1px solid #1a2d45",
              padding: "2rem 2.5rem",
            }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {content}
              </ReactMarkdown>

              {/* Cursor while streaming */}
              {loading && (
                <span style={{
                  display: "inline-block", width: 2, height: "1.1em",
                  background: "#00d4ff", verticalAlign: "text-bottom",
                  marginLeft: 2, animation: "blink 1s step-end infinite",
                }} />
              )}
            </div>
          )}

          {/* ── Post-lesson actions ─────────────────────────────────── */}
          {generated && (
            <div style={{ marginTop: "2rem" }}>
              {/* Primary mastery actions */}
              <div style={{
                padding: "1.5rem",
                borderRadius: 12,
                border: `1px solid ${completed ? "rgba(0,255,136,0.3)" : "rgba(0,212,255,0.2)"}`,
                background: completed ? "rgba(0,255,136,0.05)" : "rgba(0,212,255,0.03)",
                marginBottom: "1rem",
              }}>
                <p style={{ fontFamily: "monospace", fontSize: "0.68rem", color: completed ? "#00ff88" : "#4a6580", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
                  {completed ? "✅ TOPIC MASTERED" : "⚡ MASTERY ACTIONS"}
                </p>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {/* Mark Complete */}
                  <button
                    onClick={markComplete}
                    disabled={completed || completing}
                    style={{
                      padding: "0.7rem 1.4rem", borderRadius: 8,
                      background: completed
                        ? "rgba(0,255,136,0.1)"
                        : "linear-gradient(135deg, #00d4ff, #00cc6a)",
                      border: completed ? "1px solid rgba(0,255,136,0.3)" : "none",
                      color: completed ? "#00ff88" : "#050a0f",
                      fontWeight: 700, fontSize: "0.875rem",
                      cursor: completed ? "default" : "pointer",
                    }}
                  >
                    {completed ? "✅ Completed" : completing ? "Saving..." : "✓ Mark Complete"}
                  </button>

                  {/* Take Challenge (mastery quiz) */}
                  <Link
                    href={`/challenge/${lessonId}?topic=${encodeURIComponent(topic)}&desc=${encodeURIComponent("")}&level=${level}&module=${encodeURIComponent(moduleId)}&academy=${encodeURIComponent(academyId)}&moduleName=${encodeURIComponent(module)}`}
                    style={{
                      padding: "0.7rem 1.4rem", borderRadius: 8,
                      border: "1px solid rgba(251,191,36,0.4)",
                      background: "rgba(251,191,36,0.06)",
                      color: "#fbbf24",
                      textDecoration: "none", fontSize: "0.875rem", fontWeight: 600,
                      display: "inline-flex", alignItems: "center", gap: 6,
                    }}
                  >
                    🎯 Take Challenge
                  </Link>
                </div>
                {!completed && (
                  <p style={{ fontSize: "0.75rem", color: "#4a6580", marginTop: "0.75rem", lineHeight: 1.5 }}>
                    Complete this topic to earn XP and unlock the next one. Take the challenge to prove mastery.
                  </p>
                )}
              </div>

              {/* Secondary actions */}
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => setShowChat(true)}
                  style={{ padding: "0.55rem 1rem", borderRadius: 7, border: "1px solid rgba(0,212,255,0.3)", background: "rgba(0,212,255,0.06)", color: "#00d4ff", cursor: "pointer", fontSize: "0.82rem" }}
                >
                  🧠 Ask AI Professor
                </button>
                <Link
                  href="/workspace"
                  style={{ padding: "0.55rem 1rem", borderRadius: 7, border: "1px solid rgba(0,255,136,0.3)", background: "rgba(0,255,136,0.06)", color: "#00ff88", textDecoration: "none", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: 5 }}
                >
                  💻 Practice in Workspace
                </Link>
                <Link
                  href={academyId ? `/academy/${academyId}/module/${moduleId}` : "/academy"}
                  style={{ padding: "0.55rem 1rem", borderRadius: 7, border: "1px solid #1a2d45", background: "transparent", color: "#8ba3bc", textDecoration: "none", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: 5 }}
                >
                  ← Back to Module
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── AI Professor sidebar ─────────────────────────────────── */}
        {showChat && (
          <div style={{
            width: 380, flexShrink: 0,
            borderLeft: "1px solid #1a2d45",
            background: "#070d16",
            display: "flex", flexDirection: "column",
            position: "sticky", top: 52,
            height: "calc(100vh - 52px)",
          }}>
            {/* Header */}
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #1a2d45", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: 7 }}>
                  <span>🧠</span> AI Professor
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "0.62rem", color: "#4a6580", marginTop: 2 }}>
                  {topic} · {level}
                </div>
              </div>
              <button onClick={() => setShowChat(false)} style={{ background: "transparent", border: "none", color: "#4a6580", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1 }}>×</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {chatMessages.length === 0 && (
                <div style={{ textAlign: "center", padding: "1.5rem 1rem", color: "#4a6580" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🎓</div>
                  <p style={{ fontSize: "0.78rem", lineHeight: 1.65, marginBottom: "1rem" }}>
                    Ask me anything about <strong style={{ color: "#8ba3bc" }}>{topic}</strong>.
                  </p>
                  {[
                    `Can you give me a real-world analogy for ${topic}?`,
                    `What are the most common mistakes beginners make?`,
                    `How is this used in production systems?`,
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => setChatInput(q)}
                      style={{
                        display: "block", width: "100%", textAlign: "left",
                        marginBottom: "0.4rem", padding: "0.5rem 0.75rem",
                        borderRadius: 6, border: "1px solid #1a2d45",
                        background: "#0d1828", color: "#8ba3bc",
                        cursor: "pointer", fontSize: "0.75rem", lineHeight: 1.5,
                      }}
                    >{q}</button>
                  ))}
                </div>
              )}

              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  {msg.role === "assistant" && (
                    <span style={{ fontSize: "0.6rem", color: "#4a6580", fontFamily: "monospace", marginBottom: 3, paddingLeft: 4 }}>
                      AI Professor
                    </span>
                  )}
                  <div
                    style={{
                      maxWidth: "90%",
                      padding: "0.625rem 0.875rem",
                      borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                      background: msg.role === "user" ? "rgba(0,212,255,0.1)" : "#0d1828",
                      border: `1px solid ${msg.role === "user" ? "rgba(0,212,255,0.25)" : "#1a2d45"}`,
                    }}
                  >
                    {msg.role === "user" ? (
                      <p style={{ color: "#e8f4fd", fontSize: "0.82rem", margin: 0, lineHeight: 1.6 }}>{msg.content}</p>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={chatMdComponents}>
                        {msg.content || (chatLoading && i === chatMessages.length - 1 ? "▌" : "")}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "0.75rem", borderTop: "1px solid #1a2d45" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChat()}
                  placeholder="Ask anything about this topic..."
                  style={{
                    flex: 1, padding: "0.55rem 0.75rem", borderRadius: 7,
                    border: "1px solid #1a2d45", background: "#0d1828",
                    color: "#e8f4fd", fontSize: "0.8rem", outline: "none", fontFamily: "inherit",
                  }}
                />
                <button
                  onClick={sendChat}
                  disabled={!chatInput.trim() || chatLoading}
                  style={{
                    padding: "0.55rem 0.85rem", borderRadius: 7,
                    background: chatInput.trim() ? "rgba(0,212,255,0.12)" : "transparent",
                    border: "1px solid rgba(0,212,255,0.3)",
                    color: "#00d4ff", cursor: chatInput.trim() ? "pointer" : "not-allowed",
                    fontSize: "0.875rem", fontWeight: 600,
                  }}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CSS animations ────────────────────────────────────────── */}
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes blink  { 50% { opacity: 0; } }
        @keyframes pulse  { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#050a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d4ff", fontFamily: "monospace", fontSize: "0.85rem" }}>
        Loading lesson...
      </div>
    }>
      <LessonContent />
    </Suspense>
  );
}
