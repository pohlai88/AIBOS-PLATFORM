import { kernelGet } from "../../../utils/kernelClient";

export default async function EngineDetailPage({ 
  params 
}: { 
  params: Promise<{ engine: string }> 
}) {
  const { engine } = await params;
  
  let metadata = {};
  let uiSchema = {};

  try {
    metadata = await kernelGet(`/metadata/models`);
    uiSchema = await kernelGet(`/ui/${engine}`);
  } catch (e) {}

  return (
    <div style={{ color: "#fff" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>📦 Engine: {engine}</h1>
      
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "#bd93f9", marginBottom: 12 }}>Metadata</h2>
        <pre style={{ 
          background: "#16213e", 
          padding: 16, 
          borderRadius: 8, 
          overflow: "auto",
          fontSize: 13
        }}>
          {JSON.stringify(metadata, null, 2)}
        </pre>
      </section>

      <section>
        <h2 style={{ color: "#ffb86c", marginBottom: 12 }}>UI Schema</h2>
        <pre style={{ 
          background: "#16213e", 
          padding: 16, 
          borderRadius: 8, 
          overflow: "auto",
          fontSize: 13
        }}>
          {JSON.stringify(uiSchema, null, 2)}
        </pre>
      </section>
    </div>
  );
}

