"use client";

import Link from "next/link";
import { ACADEMIES } from "@/data/academies";

export default function AcademiesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#050a0f", color: "#e8f4fd" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #1a2d45", background: "rgba(5,10,15,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", background: "linear-gradient(135deg, #00d4ff, #00ff88)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Engineering OS
            </span>
          </Link>
          <span style={{ color: "#1a2d45" }}>›</span>
          <span style={{ color: "#8ba3bc", fontSize: "0.875rem" }}>Academies</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem" }}>
            <Link href="/workspace" style={{ padding: "0.4rem 0.9rem", borderRadius: 6, border: "1px solid #1a2d45", color: "#8ba3bc", textDecoration: "none", fontSize: "0.8rem" }}>Workspace</Link>
            <Link href="/auth" style={{ padding: "0.4rem 0.9rem", borderRadius: 6, background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff", textDecoration: "none", fontSize: "0.8rem" }}>Sign in</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 1.5rem" }}>
        <div style={{ marginBottom: "3rem" }}>
          <p style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#00d4ff", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>THE CURRICULUM</p>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
            7 Academies. One Complete Path.
          </h1>
          <p style={{ color: "#8ba3bc", maxWidth: 560, lineHeight: 1.7, fontSize: "0.95rem" }}>
            Each academy builds on the previous. Master every concept before moving forward.
          </p>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: "3rem", flexWrap: "wrap" }}>
          {ACADEMIES.map((a, i) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.color }} />
              <span style={{ fontSize: "0.75rem", color: "#4a6580", fontFamily: "monospace" }}>A{a.number}</span>
              {i < ACADEMIES.length - 1 && <span style={{ color: "#1a2d45", fontSize: "0.7rem" }}>→</span>}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {ACADEMIES.map((academy) => (
            <Link key={academy.id} href={`/academy/${academy.id}`} style={{ textDecoration: "none" }}>
              <div
                className="academy-row-card"
                style={{
                  padding: "1.5rem",
                  borderRadius: 12,
                  border: "1px solid #1a2d45",
                  background: "#0d1828",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  gap: "1.25rem",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  // CSS custom property trick for hover color
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = academy.color + "55";
                  el.style.background = "#111f33";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "#1a2d45";
                  el.style.background = "#0d1828";
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 10, background: academy.color + "15", border: `1px solid ${academy.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                    {academy.icon}
                  </div>
                  <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#4a6580" }}>{String(academy.number).padStart(2, "0")}</span>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.3rem", flexWrap: "wrap" }}>
                    <h2 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#e8f4fd" }}>{academy.title}</h2>
                    <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: academy.color, background: academy.color + "15", border: `1px solid ${academy.color}33`, padding: "0.15rem 0.5rem", borderRadius: 4 }}>
                      {academy.subtitle}
                    </span>
                  </div>
                  <p style={{ color: "#8ba3bc", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "0.75rem" }}>{academy.description}</p>
                  <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.75rem", color: "#4a6580", fontFamily: "monospace" }}>📦 {academy.modules.length} modules</span>
                    <span style={{ fontSize: "0.75rem", color: "#4a6580", fontFamily: "monospace" }}>⏱ ~{academy.estimatedWeeks} weeks</span>
                    <span style={{ fontSize: "0.75rem", color: "#4a6580", fontFamily: "monospace" }}>🏗️ {academy.projects.length} projects</span>
                  </div>
                </div>
                <div style={{ color: academy.color, fontSize: "1.25rem", padding: "0.5rem" }}>→</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
