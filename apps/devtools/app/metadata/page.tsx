import { kernelGet } from "../../utils/kernelClient";

export default async function MetadataPage() {
  let data = { models: [] };
  
  try {
    data = await kernelGet("/metadata/models");
  } catch (e) {}

  return (
    <div style={{ color: "#fff" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>📋 Metadata Models</h1>
      
      {data.models.length === 0 ? (
        <p style={{ color: "#888" }}>No models registered.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {data.models.map((name: string) => (
            <li key={name} style={{ marginBottom: 12 }}>
              <a 
                href={`/metadata/${name}`} 
                style={{ 
                  color: "#50fa7b", 
                  background: "#16213e", 
                  padding: "12px 20px", 
                  borderRadius: 8,
                  display: "inline-block"
                }}
              >
                📄 {name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

