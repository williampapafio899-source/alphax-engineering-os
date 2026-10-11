"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ACADEMIES, LEVEL_COLORS } from "@/data/academies";

export default function AcademyPage() {
  const { academyId } = useParams<{ academyId: string }>();
  const academy = ACADEMIES.find((a) => a.id === academyId);
  if (!academy) notFound();

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

  const allTopics = academy!.modules.flatMap((m) => m.topics);
  const totalDone  = allTopics.filter((t) => completedTopics.has(t.id)).length;
  const totalPct   = Math.round((totalDone / allTopics.length) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#050a0f", color: "#e8f4fd" }}>
      <nav style={{ borderBottom: "1px solid #1a2d45", background: "rgba(5,10,15,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/" style={{ textDecoration: "none", color: "#4a6580", fontSize: "0.8rem", fontFamily: "monospace" }}>Engineering OS</Link>
          <span style={{ color: "#1a2d45" }}>›</span>
          <Link href="/academy" style={{ textDecoration: "none", color: "#4a6580", fontSize: "0.8rem", fontFamily: "monospace" }}>Academies</Link>
          <span style={{ color: "#1a2d45" }}>›</span>
          <span style={{ color: academy!.color, fontSize: "0.8rem", fontFamily: "monospace" }}>{academy!.title}</span>
          {totalDone > 0 && (
            <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: "0.7rem", color: academy!.color }}>
              {totalDone}/{allTopics.length} topics · {totalPct}%
            </span>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem" }}>

        {/* ─── Hero header ─────────────────────────────────────────────── */}
        <div style={{
          padding: "2.5rem",
          borderRadius: 16,
          border: `1px solid ${academy!.color}33`,
          background: `linear-gradient(135deg, ${academy!.color}08, #0a1220)`,
          marginBottom: "2.5rem",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, right: 0, fontFamily: "monospace", fontSize: "8rem", opacity: 0.04, lineHeight: 1, userSelect: "none" }}>
            {String(academy!.number).padStart(2, "0")}
          </div>

          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{academy!.icon}</div>
          <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: academy!.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Academy {academy!.number}
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>{academy!.title}</h1>
          <p style={{ color: academy!.color, fontFamily: "monospace", fontSize: "0.85rem", marginBottom: "1rem" }}>{academy!.subtitle}</p>
          <p style={{ color: "#8ba3bc", maxWidth: 640, lineHeight: 1.7, marginBottom: "1.5rem" }}>{academy!.description}</p>

          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            {[
              { label: "Modules",  value: academy!.modules.length },
              { label: "Weeks",    value: `~${academy!.estimatedWeeks}` },
              { label: "Projects", value: academy!.projects.length },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: academy!.color, fontFamily: "monospace" }}>{stat.value}</div>
                <div style={{ fontSize: "0.75rem", color: "#4a6580" }}>{stat.label}</div>
              </div>
            ))}

            {/* Overall progress */}
            {totalDone > 0 && (
              <div style={{ marginLeft: "auto" }}>
                <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#4a6580", marginBottom: 4, textTransform: "uppercase" }}>Progress</div>
                <div style={{ height: 6, width: 180, background: "#1a2d45", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${totalPct}%`, background: `linear-gradient(90deg, ${academy!.color}, #00ff88)`, borderRadius: 999, transition: "width 0.6s ease" }} />
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "0.62rem", color: academy!.color, marginTop: 4 }}>
                  {totalDone} / {allTopics.length} topics complete
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Outcome ─────────────────────────────────────────────────── */}
        <div style={{ padding: "1rem 1.25rem", borderRadius: 8, border: "1px solid #1a2d45", background: "#0d1828", marginBottom: "2rem", display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ color: "#00ff88", fontSize: "1rem" }}>🎯</span>
          <div>
            <div style={{ fontSize: "0.7rem", color: "#4a6580", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 4 }}>Academy Outcome</div>
            <p style={{ color: "#e8f4fd", fontSize: "0.9rem", lineHeight: 1.6 }}>{academy!.outcome}</p>
          </div>
        </div>

        {/* ─── Modules ─────────────────────────────────────────────────── */}
        <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#4a6580", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.25rem" }}>
          Modules
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {academy!.modules.map((module, idx) => {
            const moduleDone = module.topics.filter((t) => completedTopics.has(t.id)).length;
            const modulePct  = Math.round((moduleDone / module.topics.length) * 100);
            const allDone    = moduleDone === module.topics.length;

            return (
              <Link key={module.id} href={`/academy/${academy!.id}/module/${module.id}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    padding: "1.25rem 1.5rem",
                    borderRadius: 10,
                    border: `1px solid ${allDone ? "rgba(0,255,136,0.3)" : "#1a2d45"}`,
                    background: allDone ? "rgba(0,255,136,0.04)" : "#0d1828",
                    cursor: "pointer", transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = allDone ? "rgba(0,255,136,0.5)" : academy!.color + "44"; el.style.background = "#111f33"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = allDone ? "rgba(0,255,136,0.3)" : "#1a2d45"; el.style.background = allDone ? "rgba(0,255,136,0.04)" : "#0d1828"; }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.3rem" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: allDone ? "#00ff88" : "#4a6580" }}>
                          {allDone ? "✓" : String(idx + 1).padStart(2, "0")}
                        </span>
                        <h3 style={{ fontWeight: 600, fontSize: "0.95rem", color: allDone ? "#00ff88" : "#e8f4fd" }}>{module.title}</h3>
                        {allDone && (
                          <span style={{ fontSize: "0.6rem", padding: "0.15rem 0.4rem", borderRadius: 3, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", color: "#00ff88", fontFamily: "monospace" }}>
                            COMPLETE
                          </span>
                        )}
                      </div>
                      <p style={{ color: "#8ba3bc", fontSize: "0.8rem", lineHeight: 1.5, marginBottom: "0.75rem" }}>{module.description}</p>

                      {/* Progress bar */}
                      {moduleDone > 0 && (
                        <div style={{ marginBottom: "0.75rem" }}>
                          <div style={{ height: 3, background: "#1a2d45", borderRadius: 999, overflow: "hidden", maxWidth: 200 }}>
                            <div style={{ height: "100%", width: `${modulePct}%`, background: allDone ? "#00ff88" : academy!.color, borderRadius: 999 }} />
                          </div>
                          <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: allDone ? "#00ff88" : "#4a6580", marginTop: 2, display: "block" }}>
                            {moduleDone}/{module.topics.length} topics
                          </span>
                        </div>
                      )}

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                        {module.topics.map((topic) => {
                          const done = completedTopics.has(topic.id);
                          return (
                            <span
                              key={topic.id}
                              style={{
                                fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: 4,
                                border: `1px solid ${done ? "rgba(0,255,136,0.3)" : LEVEL_COLORS[topic.difficulty] + "22"}`,
                                background: done ? "rgba(0,255,136,0.08)" : LEVEL_COLORS[topic.difficulty] + "0d",
                                color: done ? "#00ff88" : LEVEL_COLORS[topic.difficulty],
                                fontFamily: "monospace",
                              }}
                            >
                              {done ? "✓ " : ""}{topic.title}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#4a6580" }}>{module.topics.length} topics</div>
                      <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#4a6580" }}>~{module.estimatedHours}h</div>
                      {moduleDone > 0 && !allDone && (
                        <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: academy!.color, marginTop: 2 }}>{modulePct}%</div>
                      )}
                      <div style={{ color: allDone ? "#00ff88" : academy!.color, marginTop: "0.5rem", fontSize: "1rem" }}>→</div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ─── Projects ────────────────────────────────────────────────── */}
        <div style={{ marginTop: "2.5rem" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#4a6580", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
            Academy Projects
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "0.75rem" }}>
            {academy!.projects.map((project) => (
              <div key={project} style={{ padding: "1rem 1.25rem", borderRadius: 8, border: "1px solid #1a2d45", background: "#0d1828" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: academy!.color }}>🏗️</span>
                  <span style={{ fontSize: "0.875rem", color: "#e8f4fd" }}>{project}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
