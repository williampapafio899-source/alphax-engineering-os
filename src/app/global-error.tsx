"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
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
          }}
        >
          ⚠ Runtime Error
        </div>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
          }}
        >
          Something went wrong
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
          {error?.message ?? "An unexpected error occurred. The engineering team has been notified."}
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.75rem 1.75rem",
            borderRadius: 8,
            background: "linear-gradient(135deg, #00d4ff, #00cc6a)",
            color: "#050a0f",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
