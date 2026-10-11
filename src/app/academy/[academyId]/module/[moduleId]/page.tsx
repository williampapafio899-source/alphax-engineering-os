"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ACADEMIES, LEVEL_COLORS, LEVEL_LABELS } from "@/data/academies";

export default function ModulePage() {
  const { academyId, moduleId } = useParams<{ academyId: string; moduleId: string }>();
  const academy = ACADEMIES.find((a) => a.id === academyId);
  if (!academy) notFound();
  const module = academy!.modules.find((m) => m.id === moduleId);
  if (!module) notFound();

  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.completedTopics) {
          setCompletedTopics(new Set(data.completedTopics.map((t: { topic_id: string }) => t.topic_id)));
        }
      })
      .catch(() => {});
  }, []);

  const completedCount = module!.topics.filter((t) => completedTopics.has(t.id)).length;
  const pct = Math.round((completedCount / module!.topics.length) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#050a0f", color: "#e8f4fd" }}>
      <nav style={{ borderBottom: "1px solid #1a2d45", background: "rgba(5,10,15,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <Link href="/" style={{ textDecoration: "none", color: "#4a6580", fontSize: "0.78rem", fontFamily: "monospace" }}>Engineering OS</Link>
          <span style={{ color: "#1a2d45" }}>›</span>
          <Link href="/academy" style={{ textDecoration: "none", color: "#4a6580", fontSize: "0.78rem", fontFamily: "monospace" }}>Academies</Link>
          <span style={{ color: "#1a2d45" }}>›</span>
          <Link href={`/academy/${academy!.id}`} style={{ textDecoration: "none", color: "#4a6580", fontSize: "0.78rem", fontFamily: "monospace" }}>{academy!.title}</Link>
          <span style={{ color: "#1a2d45" }}>›</span>
          <span style={{ color: academy!.color, fontSize: "0.78rem", fontFamily: "monospace" }}>{module!.title}</span>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1.5rem" }}>
        {/* Module header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: academy!.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            {academy!.icon} Academy {academy!.number}: {academy!.title}
          </div>
          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
            {module!.title}
          </h1>
          <p style={{ color: "#8ba3bc", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1.25rem", maxWidth: 560 }}>
            {module!.description}
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#4a6580" }}>📚 {module!.topics.length} topics</span>
            <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#4a6580" }}>⏱ ~{module!.estimatedHours}h</span>
            <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#4a6580" }}>🏗️ {module!.project}</span>
            {completedCount > 0 && (
              <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#00ff88" }}>
                ✅ {completedCount}/{module!.topics.length} complete
              </span>
            )}
          </div>

          {/* Progress bar */}
          {completedCount > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <div style={{ height: 4, background: "#1a2d45", borderRadius: 999, overflow: "hidden", maxWidth: 360 }}>
                <div style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${academy!.color}, #00ff88)`,
                  borderRadius: 999,
                  transition: "width 0.5s ease",
                }} />
              </div>
              <p style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#4a6580", marginTop: 4 }}>{pct}% complete</p>
            </div>
          )}
        </div>

        {/* Topics list */}
        <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#4a6580", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
          Topics
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {module!.topics.map((topic, idx) => {
            const isDone = completedTopics.has(topic.id);
            return (
              <Link
                key={topic.id}
                href={`/lesson/${topic.id}?academyId=${academyId}&moduleId=${moduleId}&academy=${encodeURIComponent(academy!.title)}&module=${encodeURIComponent(module!.title)}&topic=${encodeURIComponent(topic.title)}&level=${topic.difficulty}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    padding: "1.1rem 1.25rem",
                    borderRadius: 10,
                    border: `1px solid ${isDone ? "rgba(0,255,136,0.3)" : "#1a2d45"}`,
                    background: isDone ? "rgba(0,255,136,0.04)" : "#0d1828",
                    display: "flex", alignItems: "center", gap: "1rem",
                    cursor: "pointer", transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = isDone ? "rgba(0,255,136,0.5)" : LEVEL_COLORS[topic.difficulty] + "44"; el.style.background = "#111f33"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = isDone ? "rgba(0,255,136,0.3)" : "#1a2d45"; el.style.background = isDone ? "rgba(0,255,136,0.04)" : "#0d1828"; }}
                >
                  <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: isDone ? "#00ff88" : "#4a6580", width: 20, textAlign: "right", flexShrink: 0 }}>
                    {isDone ? "✓" : String(idx + 1).padStart(2, "0")}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: isDone ? "#00ff88" : "#e8f4fd", marginBottom: 2 }}>{topic.title}</div>
                    <div style={{ color: "#8ba3bc", fontSize: "0.78rem" }}>{topic.description}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                    <span style={{
                      fontSize: "0.65rem", padding: "0.2rem 0.5rem", borderRadius: 4,
                      border: `1px solid ${LEVEL_COLORS[topic.difficulty]}33`,
                      background: LEVEL_COLORS[topic.difficulty] + "10",
                      color: LEVEL_COLORS[topic.difficulty], fontFamily: "monospace",
                    }}>
                      {LEVEL_LABELS[topic.difficulty]}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "#4a6580", fontFamily: "monospace" }}>{topic.estimatedMinutes}m</span>
                    <span style={{ color: isDone ? "#00ff88" : LEVEL_COLORS[topic.difficulty], fontSize: "0.9rem" }}>→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Tags */}
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {Array.from(new Set(module!.topics.flatMap((t) => t.tags))).map((tag) => (
            <span key={tag} style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: 4, border: "1px solid #1a2d45", color: "#4a6580", fontFamily: "monospace" }}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
