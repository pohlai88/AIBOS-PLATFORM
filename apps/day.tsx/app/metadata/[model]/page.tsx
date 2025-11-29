import { kernelGet } from "../../../utils/kernelClient";

export default async function ModelDetailPage({ 
  params 
}: { 
  params: Promise<{ model: string }> 
}) {
  const { model } = await params;
  
  let schema = {};

  try {
    schema = await kernelGet(`/metadata/model/${model}`);
  } catch (e) {}

  return (
    <div style={{ color: "#fff" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>📄 Model: {model}</h1>
      
      <pre style={{ 
        background: "#16213e", 
        padding: 16, 
        borderRadius: 8, 
        overflow: "auto",
        fontSize: 13
      }}>
        {JSON.stringify(schema, null, 2)}
      </pre>
    </div>
  );
}

