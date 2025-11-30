import { kernelGet } from "../utils/kernelClient";

export default async function DashboardPage() {
  let health = { ok: false, status: "Kernel offline" };
  let engines = { engines: [] };
  let metadata = { models: [] };

  try {
    health = await kernelGet("/health");
    engines = await kernelGet("/engines");
    metadata = await kernelGet("/metadata/models");
  } catch (e) {
    // Kernel not running
  }

  return (
    <div style={{ color: "#fff" }}>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>🔥 AI-BOS Kernel Dashboard</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        <div style={{ background: "#16213e", padding: 20, borderRadius: 8 }}>
          <h3 style={{ color: "#50fa7b" }}>Health</h3>
          <p style={{ fontSize: 24 }}>{health.ok ? "✅ Online" : "❌ Offline"}</p>
          <p style={{ color: "#888" }}>{health.status}</p>
        </div>

        <div style={{ background: "#16213e", padding: 20, borderRadius: 8 }}>
          <h3 style={{ color: "#bd93f9" }}>Engines</h3>
          <p style={{ fontSize: 24 }}>{engines.engines?.length || 0}</p>
          <p style={{ color: "#888" }}>Registered engines</p>
        </div>

        <div style={{ background: "#16213e", padding: 20, borderRadius: 8 }}>
          <h3 style={{ color: "#ffb86c" }}>Models</h3>
          <p style={{ fontSize: 24 }}>{metadata.models?.length || 0}</p>
          <p style={{ color: "#888" }}>Metadata models</p>
        </div>
      </div>
    </div>
  );
}

