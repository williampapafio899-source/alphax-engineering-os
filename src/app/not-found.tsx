import Link from "next/link";

export default function NotFound() {
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
      <div style={{ fontFamily: "monospace", fontSize: "5rem", fontWeight: 800, color: "#1a2d45", marginBottom: "1rem" }}>
        404
      </div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
        This node doesn&apos;t exist yet
      </h1>
      <p style={{ color: "#8ba3bc", fontSize: "0.9rem", marginBottom: "2rem", maxWidth: 380, lineHeight: 1.7 }}>
        Looks like this part of the knowledge graph hasn&apos;t been unlocked. Head back to the main path.
      </p>
      <Link
        href="/"
        style={{
          padding: "0.75rem 1.75rem",
          borderRadius: 8,
          background: "linear-gradient(135deg, #00d4ff, #00cc6a)",
          color: "#050a0f",
          fontWeight: 700,
          textDecoration: "none",
          fontSize: "0.9rem",
        }}
      >
        Back to Engineering OS →
      </Link>
    </div>
  );
}
