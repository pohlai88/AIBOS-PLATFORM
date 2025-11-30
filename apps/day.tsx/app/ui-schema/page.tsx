import { kernelGet } from "../../utils/kernelClient";

export default async function UISchemaPage() {
  let data = { models: [] };
  
  try {
    data = await kernelGet("/ui");
  } catch (e) {}

  return (
    <div style={{ color: "#fff" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>🎨 UI Schemas</h1>
      
      {data.models.length === 0 ? (
        <p style={{ color: "#888" }}>No UI schemas registered.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {data.models.map((name: string) => (
            <li key={name} style={{ marginBottom: 12 }}>
              <a 
                href={`/ui-schema/${name}`} 
                style={{ 
                  color: "#ff79c6", 
                  background: "#16213e", 
                  padding: "12px 20px", 
                  borderRadius: 8,
                  display: "inline-block"
                }}
              >
                🎨 {name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

