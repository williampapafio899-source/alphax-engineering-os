"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
        textAlign: "center",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          fontSize: "0.7rem",
          color: "#ff4444",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          marginBottom: "1rem",
          padding: "0.3rem 0.75rem",
          borderRadius: 4,
          border: "1px solid #ff444433",
          background: "#ff44440d",
        }}
      >
        Page Error
      </div>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>
        This page hit a problem
      </h2>
      <p
        style={{
          color: "#8ba3bc",
          fontSize: "0.85rem",
          marginBottom: "2rem",
          maxWidth: 420,
          lineHeight: 1.6,
        }}
      >
        {error?.message ?? "Something unexpected happened on this page."}
      </p>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          onClick={reset}
          style={{
            padding: "0.65rem 1.5rem",
            borderRadius: 8,
            background: "linear-gradient(135deg, #00d4ff, #00cc6a)",
            color: "#050a0f",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{
            padding: "0.65rem 1.5rem",
            borderRadius: 8,
            border: "1px solid #1a2d45",
            color: "#8ba3bc",
            textDecoration: "none",
            fontSize: "0.875rem",
          }}
        >
          Go home
        </a>
      </div>
    </div>
  );
}
