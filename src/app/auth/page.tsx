"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleGoogleSignIn() {
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    }
    // On success the browser redirects — no further action needed
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Check your email to confirm your account!" });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050a0f",
        color: "#e8f4fd",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        backgroundImage:
          "linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <div style={{ position: "absolute", top: 24, left: 24 }}>
        <Link href="/" style={{ color: "#4a6580", textDecoration: "none", fontSize: "0.85rem", fontFamily: "monospace" }}>
          ← Engineering OS
        </Link>
      </div>

      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span style={{ fontSize: "2.5rem" }}>⚡</span>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              marginTop: "0.5rem",
              background: "linear-gradient(135deg, #00d4ff, #00ff88)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Engineering OS
          </h1>
          <p style={{ color: "#4a6580", fontSize: "0.85rem", marginTop: 4 }}>
            {mode === "signin" ? "Welcome back, engineer." : "Start your mastery journey."}
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            padding: "2rem",
            borderRadius: 12,
            border: "1px solid #1a2d45",
            background: "#0d1828",
          }}
        >
          {/* Tab toggle */}
          <div
            style={{
              display: "flex",
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid #1a2d45",
              marginBottom: "1.75rem",
            }}
          >
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setMessage(null); }}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  border: "none",
                  background: mode === m ? "rgba(0,212,255,0.1)" : "transparent",
                  color: mode === m ? "#00d4ff" : "#4a6580",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: mode === m ? 600 : 400,
                  borderBottom: mode === m ? "2px solid #00d4ff" : "2px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: 8,
              border: "1px solid #1a2d45",
              background: "transparent",
              color: "#e8f4fd",
              fontSize: "0.9rem",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              marginBottom: "1.25rem",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(0,212,255,0.06)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{ flex: 1, height: 1, background: "#1a2d45" }} />
            <span style={{ fontSize: "0.75rem", color: "#4a6580", fontFamily: "monospace" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#1a2d45" }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "#4a6580", fontFamily: "monospace", marginBottom: "0.4rem" }}>
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "0.7rem 0.9rem",
                  borderRadius: 8,
                  border: "1px solid #1e3a5f",
                  background: "#070d16",
                  color: "#e8f4fd",
                  fontSize: "0.9rem",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "#4a6580", fontFamily: "monospace", marginBottom: "0.4rem" }}>
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                style={{
                  width: "100%",
                  padding: "0.7rem 0.9rem",
                  borderRadius: 8,
                  border: "1px solid #1e3a5f",
                  background: "#070d16",
                  color: "#e8f4fd",
                  fontSize: "0.9rem",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {message && (
              <div
                style={{
                  padding: "0.75rem",
                  borderRadius: 6,
                  border: `1px solid ${message.type === "error" ? "rgba(244,63,94,0.3)" : "rgba(0,255,136,0.3)"}`,
                  background: message.type === "error" ? "rgba(244,63,94,0.08)" : "rgba(0,255,136,0.08)",
                  color: message.type === "error" ? "#f43f5e" : "#00ff88",
                  fontSize: "0.8rem",
                  marginBottom: "1rem",
                }}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.8rem",
                borderRadius: 8,
                background: loading ? "#1a2d45" : "linear-gradient(135deg, #00d4ff, #00cc6a)",
                color: "#050a0f",
                fontWeight: 700,
                fontSize: "0.9rem",
                border: "none",
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading
                ? (mode === "signin" ? "Signing in..." : "Creating account...")
                : (mode === "signin" ? "Sign In →" : "Create Account →")
              }
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem", color: "#4a6580" }}>
          Or{" "}
          <Link href="/academy" style={{ color: "#00d4ff", textDecoration: "none" }}>
            explore without an account →
          </Link>
        </p>
      </div>
    </div>
  );
}
