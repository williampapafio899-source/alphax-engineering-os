"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ACADEMIES } from "@/data/academies";

const TYPING_PHRASES = [
  "Software Engineer.",
  "AI Engineer.",
  "System Architect.",
  "Open Source Contributor.",
  "Tech Founder.",
  "World-Class Engineer.",
];

function TypingEffect() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = TYPING_PHRASES[phraseIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < phrase.length) {
      timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 60);
    } else if (!deleting && displayed.length === phrase.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setPhraseIndex((i) => (i + 1) % TYPING_PHRASES.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, phraseIndex]);

  return (
    <span style={{ color: "#00d4ff" }}>
      {displayed}
      <span className="animate-cursor" style={{ borderRight: "2px solid #00d4ff", marginLeft: 2 }} />
    </span>
  );
}

const STATS = [
  { value: "7",    label: "Academies"         },
  { value: "40+",  label: "Modules"           },
  { value: "200+", label: "Topics"            },
  { value: "∞",    label: "AI-Generated Lessons" },
];

const FEATURES = [
  {
    icon: "🧠",
    title: "AI Professor",
    description:
      "Claude-powered tutor that teaches using a 22-section mastery framework — explanations, analogies, Socratic questions, real examples, and expert insights.",
  },
  {
    icon: "🔒",
    title: "Mastery Gates",
    description:
      "No fake progress. The next topic stays locked until you demonstrate real understanding through projects, quizzes, and explanations.",
  },
  {
    icon: "💻",
    title: "Integrated Workspace",
    description:
      "Monaco editor + live code execution. Write Python, C, JavaScript, and more — run it instantly, see real output, build real projects.",
  },
  {
    icon: "🗺️",
    title: "Knowledge Graph",
    description:
      "Every concept is a node in an interconnected graph. See exactly where you are, what unlocks next, and how everything connects.",
  },
  {
    icon: "🚀",
    title: "AI Roadmap Generator",
    description:
      'Tell the platform what you want to build. It generates your personalized engineering path — from "hello world" to shipped product.',
  },
  {
    icon: "📊",
    title: "Portfolio Tracking",
    description:
      "Every project you build is tracked. Graduate with a portfolio of real work — not certificates, but proof of engineering capability.",
  },
];

export default function LandingPage() {
  return (
    <div
      style={{
        background: "#050a0f",
        color: "#e8f4fd",
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* ─── Navigation ─────────────────────────────────────────────────── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid #1a2d45",
          background: "rgba(5,10,15,0.9)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 1.5rem",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>⚡</span>
            <span
              style={{
                fontWeight: 700,
                fontSize: "1.1rem",
                background: "linear-gradient(135deg, #00d4ff, #00ff88)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Engineering OS
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Link
              href="/academy"
              style={{ color: "#8ba3bc", textDecoration: "none", fontSize: "0.9rem" }}
            >
              Academies
            </Link>
            <Link
              href="/workspace"
              style={{ color: "#8ba3bc", textDecoration: "none", fontSize: "0.9rem" }}
            >
              Workspace
            </Link>
            <Link
              href="/auth"
              style={{
                padding: "0.45rem 1.2rem",
                borderRadius: 8,
                background: "transparent",
                border: "1px solid #1a2d45",
                color: "#e8f4fd",
                textDecoration: "none",
                fontSize: "0.875rem",
              }}
            >
              Sign in
            </Link>
            <Link
              href="/onboarding"
              style={{
                padding: "0.45rem 1.2rem",
                borderRadius: 8,
                background: "linear-gradient(135deg, #00d4ff, #00cc6a)",
                color: "#050a0f",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "0.875rem",
              }}
            >
              Start Learning →
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          overflow: "hidden",
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        {/* Glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "10%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 880, padding: "0 1.5rem" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "0.4rem 1rem",
              borderRadius: 999,
              border: "1px solid rgba(0,212,255,0.3)",
              background: "rgba(0,212,255,0.05)",
              fontSize: "0.8rem",
              color: "#00d4ff",
              marginBottom: "2rem",
              fontFamily: "monospace",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#00ff88",
                display: "inline-block",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            Alpha School × Engineering Mastery
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
            }}
          >
            From Zero to
            <br />
            <TypingEffect />
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              color: "#8ba3bc",
              lineHeight: 1.8,
              maxWidth: 640,
              margin: "0 auto 2.5rem",
            }}
          >
            The world&apos;s most effective engineering education platform. Mastery-based, AI-powered,
            project-driven. Turn your ambition into world-class engineering capability — with nothing
            but a laptop and the will to build.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            <Link
              href="/onboarding"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "0.85rem 2rem",
                borderRadius: 10,
                background: "linear-gradient(135deg, #00d4ff, #00cc6a)",
                color: "#050a0f",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "1rem",
                boxShadow: "0 0 30px rgba(0,212,255,0.3)",
              }}
            >
              Start Your Journey →
            </Link>
            <Link
              href="/academy"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "0.85rem 2rem",
                borderRadius: 10,
                border: "1px solid #1e3a5f",
                color: "#e8f4fd",
                textDecoration: "none",
                fontSize: "1rem",
                background: "rgba(13,24,40,0.7)",
              }}
            >
              Explore Curriculum
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats ──────────────────────────────────────────────────────── */}
      <section
        style={{
          borderTop: "1px solid #1a2d45",
          borderBottom: "1px solid #1a2d45",
          background: "#0a1220",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "2rem 1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "2rem",
            textAlign: "center",
          }}
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #00d4ff, #00ff88)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "monospace",
                }}
              >
                {s.value}
              </div>
              <div style={{ color: "#8ba3bc", fontSize: "0.875rem", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Academies ──────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "6rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <p
            style={{
              color: "#00d4ff",
              fontFamily: "monospace",
              fontSize: "0.8rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            THE CURRICULUM
          </p>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: "1rem",
            }}
          >
            7 Academies. One Complete Path.
          </h2>
          <p style={{ color: "#8ba3bc", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
            A structured progression from Foundations to Founder. Every academy unlocks only after
            mastery of the previous — no shortcuts, no fakers.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {ACADEMIES.map((academy) => (
            <Link
              key={academy.id}
              href={`/academy/${academy.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  padding: "1.5rem",
                  borderRadius: 12,
                  border: "1px solid #1a2d45",
                  background: "#0d1828",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = academy.color + "66";
                  el.style.background = "#111f33";
                  el.style.transform = "translateY(-2px)";
                  el.style.boxShadow = `0 8px 32px ${academy.color}1a`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "#1a2d45";
                  el.style.background = "#0d1828";
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                }}
              >
                {/* Number */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 16,
                    fontFamily: "monospace",
                    fontSize: "0.7rem",
                    color: "#4a6580",
                  }}
                >
                  {String(academy.number).padStart(2, "0")}
                </div>

                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: academy.color + "15",
                    border: `1px solid ${academy.color}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    marginBottom: "1rem",
                  }}
                >
                  {academy.icon}
                </div>

                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#e8f4fd",
                    marginBottom: 4,
                  }}
                >
                  Academy {academy.number}: {academy.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: academy.color,
                    marginBottom: "0.75rem",
                    fontFamily: "monospace",
                  }}
                >
                  {academy.subtitle}
                </p>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#8ba3bc",
                    lineHeight: 1.6,
                    marginBottom: "1rem",
                  }}
                >
                  {academy.description.slice(0, 120)}...
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "1px solid #1a2d45",
                    paddingTop: "0.75rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <span
                    style={{ fontSize: "0.75rem", color: "#4a6580", fontFamily: "monospace" }}
                  >
                    {academy.modules.length} modules · ~{academy.estimatedWeeks}w
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: academy.color,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Explore →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────────────── */}
      <section
        style={{
          background: "#0a1220",
          borderTop: "1px solid #1a2d45",
          borderBottom: "1px solid #1a2d45",
          padding: "6rem 1.5rem",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p
              style={{
                color: "#00ff88",
                fontFamily: "monospace",
                fontSize: "0.8rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              HOW IT WORKS
            </p>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Built for Mastery. Not for Completion.
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                style={{
                  padding: "1.5rem",
                  borderRadius: 12,
                  border: "1px solid #1a2d45",
                  background: "#050a0f",
                }}
              >
                <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{feature.icon}</div>
                <h3
                  style={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#e8f4fd",
                    marginBottom: "0.5rem",
                  }}
                >
                  {feature.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#8ba3bc", lineHeight: 1.7 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mastery Framework ──────────────────────────────────────────── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "6rem 1.5rem", textAlign: "center" }}>
        <p
          style={{
            color: "#00d4ff",
            fontFamily: "monospace",
            fontSize: "0.8rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          THE MASTERY LOOP
        </p>
        <h2
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "3rem",
          }}
        >
          Every topic. Every time.
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {["Learn", "Practice", "Build", "Explain", "Demonstrate", "Unlock"].map((step, i, arr) => (
            <div key={step} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 110,
                  padding: "0.75rem 1rem",
                  borderRadius: 10,
                  border: "1px solid #1e3a5f",
                  background: "#0d1828",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.65rem",
                    color: "#4a6580",
                    marginBottom: 4,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: i === arr.length - 1 ? "#00ff88" : "#00d4ff",
                  }}
                >
                  {step}
                </div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ color: "#1e3a5f", fontSize: "1.25rem", padding: "0 0.25rem" }}>
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        <p style={{ color: "#4a6580", fontSize: "0.875rem", marginTop: "2rem", fontFamily: "monospace" }}>
          Progress is earned, not given. The next topic stays locked until you prove mastery.
        </p>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg, #0a1220, #0d1f35)",
          borderTop: "1px solid #1a2d45",
          padding: "6rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: "1rem",
            }}
          >
            Your engineering journey
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #00d4ff, #00ff88)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              starts with one question.
            </span>
          </h2>
          <p style={{ color: "#8ba3bc", fontSize: "1.1rem", marginBottom: "2.5rem", lineHeight: 1.7 }}>
            What do you want to build?
          </p>
          <Link
            href="/onboarding"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "1rem 2.5rem",
              borderRadius: 12,
              background: "linear-gradient(135deg, #00d4ff, #00cc6a)",
              color: "#050a0f",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "1.05rem",
              boxShadow: "0 0 40px rgba(0,212,255,0.25)",
            }}
          >
            Begin Your Journey →
          </Link>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid #1a2d45",
          padding: "2rem 1.5rem",
          textAlign: "center",
          color: "#4a6580",
          fontSize: "0.8rem",
          fontFamily: "monospace",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <span
            style={{
              background: "linear-gradient(135deg, #00d4ff, #00ff88)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
              marginRight: 8,
            }}
          >
            Engineering OS
          </span>
          — Built for engineers who want to build the future. · v1.0.0-alpha
        </div>
      </footer>
    </div>
  );
}
