"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { EOS_LANGUAGES, STARTER_CODE } from "@/lib/piston";
import type { ExecuteResult } from "@/types";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: "100%", background: "#070d16", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a6580", fontFamily: "monospace", fontSize: "0.8rem" }}>
        Loading editor...
      </div>
    ),
  }
);

const MONACO_LANGUAGE_MAP: Record<string, string> = {
  python: "python", javascript: "javascript", typescript: "typescript",
  c: "c", cpp: "cpp", java: "java", go: "go", rust: "rust", bash: "shell",
};

type PistonStatus = "checking" | "online" | "offline";

const SETUP_STEPS = [
  { step: "01", title: "Install WSL2",        cmd: "wsl --install",                             note: "Run in PowerShell as Administrator → Restart PC" },
  { step: "02", title: "Install Docker Desktop", cmd: "https://docker.com/products/docker-desktop", note: "Enable 'Use WSL2 backend' during install → Restart" },
  { step: "03", title: "Start Piston API",    cmd: "docker compose up -d api",                  note: "Run in: C:\\Users\\scrut\\Desktop\\piston-master" },
  { step: "04", title: "Install Python runtime", cmd: "node index.js ppman install python",     note: "Run in: piston-master\\cli  (after npm install)" },
  { step: "05", title: "Install Node.js runtime", cmd: "node index.js ppman install node",      note: "Enables JavaScript execution" },
];

export default function WorkspacePage() {
  const [selectedLang, setSelectedLang]   = useState(EOS_LANGUAGES[0]);
  const [code, setCode]                   = useState(STARTER_CODE["python"]);
  const [stdin, setStdin]                 = useState("");
  const [result, setResult]               = useState<ExecuteResult | null>(null);
  const [running, setRunning]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [activeTab, setActiveTab]         = useState<"output" | "stdin" | "setup">("output");
  const [pistonStatus, setPistonStatus]   = useState<PistonStatus>("checking");
  const [showSetup, setShowSetup]         = useState(false);
  const [copied, setCopied]               = useState<string | null>(null);

  // ── Check Piston health on mount + every 15s ────────────────────────────
  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/execute", { method: "GET" });
        if (res.ok) {
          const runtimes = await res.json();
          setPistonStatus(Array.isArray(runtimes) && runtimes.length > 0 ? "online" : "offline");
        } else {
          setPistonStatus("offline");
        }
      } catch {
        setPistonStatus("offline");
      }
    }
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  const selectLanguage = useCallback((lang: typeof EOS_LANGUAGES[0]) => {
    setSelectedLang(lang);
    setCode(STARTER_CODE[lang.id] ?? `// ${lang.label} workspace\n`);
    setResult(null);
    setError(null);
  }, []);

  async function runCode() {
    if (pistonStatus === "offline") {
      setActiveTab("setup");
      setShowSetup(true);
      return;
    }

    setRunning(true);
    setError(null);
    setResult(null);
    setActiveTab("output");

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLang.id,
          version: selectedLang.version,
          code,
          stdin: stdin || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 503) {
          setPistonStatus("offline");
          setActiveTab("setup");
          setShowSetup(true);
          setError(null);
        } else {
          setError(data.error ?? "Execution failed");
        }
      } else {
        setResult(data);
        setPistonStatus("online");
      }
    } catch {
      setPistonStatus("offline");
      setActiveTab("setup");
      setShowSetup(true);
    } finally {
      setRunning(false);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    });
  }

  const output = result
    ? (result.compile?.stderr ? `[Compile Error]\n${result.compile.stderr}\n\n` : "")
      + (result.run.stdout || result.run.stderr || result.run.output || "(no output)")
    : null;

  const hasRuntimeError = result
    ? result.run.code !== 0 || !!result.compile?.code
    : !!error;

  const statusDot = {
    checking: { color: "#fbbf24", label: "Checking..." },
    online:   { color: "#00ff88", label: "Piston online" },
    offline:  { color: "#f43f5e", label: "Piston offline" },
  }[pistonStatus];

  return (
    <div style={{ height: "100vh", background: "#050a0f", color: "#e8f4fd", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Offline banner ──────────────────────────────────────────────── */}
      {pistonStatus === "offline" && (
        <div style={{
          background: "rgba(244,63,94,0.08)", borderBottom: "1px solid rgba(244,63,94,0.25)",
          padding: "0.5rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem",
          flexShrink: 0,
        }}>
          <span style={{ color: "#f43f5e", fontSize: "0.8rem" }}>⚠</span>
          <span style={{ color: "#f43f5e", fontSize: "0.78rem", fontFamily: "monospace" }}>
            Piston execution engine is offline — Docker is not running yet.
          </span>
          <button
            onClick={() => { setActiveTab("setup"); setShowSetup(true); }}
            style={{
              marginLeft: "auto", padding: "0.25rem 0.75rem", borderRadius: 4,
              border: "1px solid rgba(244,63,94,0.4)", background: "rgba(244,63,94,0.1)",
              color: "#f43f5e", cursor: "pointer", fontSize: "0.72rem", fontFamily: "monospace",
            }}
          >
            View Setup Guide →
          </button>
        </div>
      )}

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div style={{ height: 52, borderBottom: "1px solid #1a2d45", background: "#0a1220", display: "flex", alignItems: "center", padding: "0 1rem", gap: "0.75rem", flexShrink: 0 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", marginRight: "0.5rem", flexShrink: 0 }}>
          <span>⚡</span>
          <span style={{ fontWeight: 700, fontSize: "0.85rem", background: "linear-gradient(135deg,#00d4ff,#00ff88)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Engineering OS
          </span>
        </Link>
        <span style={{ color: "#1a2d45" }}>|</span>
        <span style={{ color: "#4a6580", fontSize: "0.75rem", fontFamily: "monospace", flexShrink: 0 }}>Workspace</span>

        {/* Language tabs */}
        <div style={{ display: "flex", gap: "0.35rem", overflowX: "auto", scrollbarWidth: "none" }}>
          {EOS_LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => selectLanguage(lang)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "0.25rem 0.6rem", borderRadius: 5, flexShrink: 0,
                border: `1px solid ${selectedLang.id === lang.id ? "rgba(0,212,255,0.5)" : "#1a2d45"}`,
                background: selectedLang.id === lang.id ? "rgba(0,212,255,0.1)" : "transparent",
                color: selectedLang.id === lang.id ? "#00d4ff" : "#4a6580",
                cursor: "pointer", fontSize: "0.72rem", fontFamily: "monospace",
                whiteSpace: "nowrap",
              }}
            >
              {lang.icon} {lang.label}
            </button>
          ))}
        </div>

        {/* Run button */}
        <button
          onClick={runCode}
          disabled={running}
          style={{
            marginLeft: "auto", flexShrink: 0,
            display: "flex", alignItems: "center", gap: 6,
            padding: "0.4rem 1.25rem", borderRadius: 6,
            background: running
              ? "#1a2d45"
              : pistonStatus === "offline"
                ? "rgba(244,63,94,0.15)"
                : "linear-gradient(135deg,#00d4ff,#00cc6a)",
            color: running ? "#4a6580" : pistonStatus === "offline" ? "#f43f5e" : "#050a0f",
            fontWeight: 700, fontSize: "0.82rem", border: "none",
            cursor: running ? "wait" : "pointer",
          }}
        >
          {running ? "⟳ Running..." : pistonStatus === "offline" ? "▶ Run (offline)" : "▶ Run"}
        </button>
      </div>

      {/* ── Editor + Panel ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Monaco Editor */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <MonacoEditor
            height="100%"
            language={MONACO_LANGUAGE_MAP[selectedLang.id] ?? selectedLang.id}
            value={code}
            onChange={(v) => setCode(v ?? "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              lineNumbers: "on",
              wordWrap: "on",
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              smoothScrolling: true,
              cursorBlinking: "smooth",
              renderWhitespace: "selection",
              bracketPairColorization: { enabled: true },
              formatOnPaste: true,
            }}
          />
        </div>

        {/* Right panel */}
        <div style={{ width: 440, borderLeft: "1px solid #1a2d45", display: "flex", flexDirection: "column", background: "#070d16", flexShrink: 0 }}>

          {/* Panel tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #1a2d45", flexShrink: 0 }}>
            {(["output", "stdin", "setup"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: "0.55rem 0.5rem",
                  border: "none",
                  borderBottom: `2px solid ${activeTab === tab ? (tab === "setup" ? "#f43f5e" : "#00d4ff") : "transparent"}`,
                  background: activeTab === tab ? "rgba(0,212,255,0.04)" : "transparent",
                  color: activeTab === tab
                    ? tab === "setup" ? "#f43f5e" : "#00d4ff"
                    : "#4a6580",
                  cursor: "pointer", fontSize: "0.7rem",
                  fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.06em",
                }}
              >
                {tab === "setup" ? "⚙ Setup" : tab.toUpperCase()}
                {tab === "setup" && pistonStatus === "offline" && (
                  <span style={{ marginLeft: 4, background: "#f43f5e", color: "#fff", borderRadius: 3, padding: "0 4px", fontSize: "0.6rem" }}>!</span>
                )}
              </button>
            ))}
          </div>

          {/* ── OUTPUT tab ────────────────────────────────────────────── */}
          {activeTab === "output" && (
            <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
              {result && (
                <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: 8, fontFamily: "monospace", fontSize: "0.7rem" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: hasRuntimeError ? "#f43f5e" : "#00ff88" }} />
                  <span style={{ color: hasRuntimeError ? "#f43f5e" : "#00ff88" }}>
                    {hasRuntimeError ? "Error" : "Success"}
                  </span>
                  <span style={{ color: "#4a6580" }}>exit {result.run.code}</span>
                  <span style={{ marginLeft: "auto", color: "#4a6580" }}>{selectedLang.label} {result.version}</span>
                </div>
              )}

              {error && (
                <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#f43f5e", background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 6, padding: "0.75rem", lineHeight: 1.6 }}>
                  {error}
                </div>
              )}

              {output && (
                <pre style={{ fontFamily: "monospace", fontSize: "0.82rem", color: hasRuntimeError ? "#ff6b35" : "#00ff88", background: "transparent", border: "none", padding: 0, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.75 }}>
                  {output}
                </pre>
              )}

              {!output && !error && !running && (
                <div style={{ color: "#4a6580", fontFamily: "monospace", fontSize: "0.78rem", textAlign: "center", paddingTop: "3rem" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.4 }}>▶</div>
                  {pistonStatus === "online"
                    ? "Press Run to execute your code"
                    : "Start Docker + Piston first (see Setup tab)"}
                </div>
              )}

              {running && (
                <div style={{ color: "#00d4ff", fontFamily: "monospace", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>◌</span>
                  Executing...
                </div>
              )}
            </div>
          )}

          {/* ── STDIN tab ─────────────────────────────────────────────── */}
          {activeTab === "stdin" && (
            <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
              <p style={{ color: "#4a6580", fontSize: "0.75rem", fontFamily: "monospace", marginBottom: "0.5rem" }}>
                Input to pass via stdin (optional):
              </p>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter input here..."
                style={{ width: "100%", minHeight: 120, padding: "0.75rem", borderRadius: 6, border: "1px solid #1a2d45", background: "#0a1220", color: "#e8f4fd", fontFamily: "monospace", fontSize: "0.8rem", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          )}

          {/* ── SETUP tab ─────────────────────────────────────────────── */}
          {activeTab === "setup" && (
            <div style={{ flex: 1, overflow: "auto", padding: "1.25rem" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusDot.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: statusDot.color }}>{statusDot.label}</span>
                </div>
                <p style={{ color: "#8ba3bc", fontSize: "0.8rem", lineHeight: 1.65 }}>
                  {pistonStatus === "online"
                    ? "✅ Piston is running. You can run code now."
                    : "Piston runs code inside a Docker container on your machine. Follow these steps to set it up. You only need to do this once."}
                </p>
              </div>

              {pistonStatus === "online" ? (
                <div style={{ padding: "1rem", borderRadius: 8, border: "1px solid rgba(0,255,136,0.25)", background: "rgba(0,255,136,0.05)", textAlign: "center" }}>
                  <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🎉</div>
                  <p style={{ color: "#00ff88", fontFamily: "monospace", fontSize: "0.8rem" }}>Execution engine is live!</p>
                  <p style={{ color: "#4a6580", fontSize: "0.75rem", marginTop: "0.25rem" }}>Switch to the Output tab and click Run.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {SETUP_STEPS.map((s) => (
                    <div key={s.step} style={{ padding: "0.875rem 1rem", borderRadius: 8, border: "1px solid #1a2d45", background: "#0a1220" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#00d4ff", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 4, padding: "0.1rem 0.4rem", flexShrink: 0, marginTop: 1 }}>
                          {s.step}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "#e8f4fd", marginBottom: "0.3rem" }}>{s.title}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "0.3rem" }}>
                            <code style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#00ff88", background: "#040810", border: "1px solid #1e3a5f", borderRadius: 4, padding: "0.15rem 0.5rem", flex: 1, wordBreak: "break-all", lineHeight: 1.5 }}>
                              {s.cmd}
                            </code>
                            {!s.cmd.startsWith("http") && (
                              <button
                                onClick={() => copyToClipboard(s.cmd, s.step)}
                                style={{ flexShrink: 0, padding: "0.15rem 0.4rem", borderRadius: 3, border: "1px solid #1a2d45", background: "transparent", color: copied === s.step ? "#00ff88" : "#4a6580", cursor: "pointer", fontSize: "0.65rem", fontFamily: "monospace" }}
                              >
                                {copied === s.step ? "✓" : "copy"}
                              </button>
                            )}
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "#4a6580", lineHeight: 1.5 }}>{s.note}</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div style={{ padding: "0.75rem 1rem", borderRadius: 8, border: "1px solid #1a2d45", background: "#0a1220", marginTop: "0.25rem" }}>
                    <p style={{ fontSize: "0.72rem", color: "#4a6580", lineHeight: 1.6, fontFamily: "monospace" }}>
                      Once Docker + Piston are running, this page auto-checks every 15 seconds. The status dot above will turn green.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: "0.45rem 1rem", borderTop: "1px solid #1a2d45", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusDot.color }} />
              <span style={{ fontFamily: "monospace", fontSize: "0.62rem", color: "#4a6580" }}>
                Piston · localhost:2000
              </span>
            </div>
            <Link href="/academy" style={{ fontFamily: "monospace", fontSize: "0.62rem", color: "#4a6580", textDecoration: "none" }}>
              ← Back to learning
            </Link>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
