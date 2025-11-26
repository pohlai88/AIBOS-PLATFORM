import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI-BOS DevTools",
  description: "Kernel Diagnostics & Developer Tools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <nav style={{ width: 220, background: "#1a1a2e", color: "#fff", padding: 20 }}>
            <h2 style={{ fontSize: 18, marginBottom: 24 }}>🔧 DevTools</h2>
            <ul style={{ listStyle: "none", padding: 0, lineHeight: 2 }}>
              <li><a href="/" style={{ color: "#8be9fd" }}>Dashboard</a></li>
              <li><a href="/engines" style={{ color: "#8be9fd" }}>Engines</a></li>
              <li><a href="/metadata" style={{ color: "#8be9fd" }}>Metadata</a></li>
              <li><a href="/ui-schema" style={{ color: "#8be9fd" }}>UI Schemas</a></li>
              <li><a href="/actions" style={{ color: "#8be9fd" }}>Actions</a></li>
              <li><a href="/events" style={{ color: "#8be9fd" }}>Events</a></li>
              <li><a href="/tenants" style={{ color: "#8be9fd" }}>Tenants</a></li>
              <li><a href="/contracts" style={{ color: "#8be9fd" }}>Contracts</a></li>
            </ul>
          </nav>
          <main style={{ flex: 1, padding: 32, background: "#0f0f23" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

