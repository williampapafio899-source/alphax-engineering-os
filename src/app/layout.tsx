import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Engineering OS — Master Software Engineering",
  description:
    "The world's most effective engineering education platform. From complete beginner to world-class engineer, AI builder, and founder.",
  keywords: ["engineering", "programming", "AI", "computer science", "education", "mastery"],
  authors: [{ name: "Engineering OS" }],
};

export const viewport: Viewport = {
  themeColor: "#050a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/*
          Fonts loaded via standard <link> so they are non-blocking
          and don't require a network call at build time.
          Inter + JetBrains Mono from bunny.net (GDPR-friendly CDN mirror).
        */}
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=inter:300,400,500,600,700,800,900|jetbrains-mono:400,500,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased min-h-screen"
        style={{
          fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
