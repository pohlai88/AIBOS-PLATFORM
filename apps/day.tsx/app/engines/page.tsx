import { kernelGet } from "../../utils/kernelClient";

export default async function EnginesPage() {
  let data = { engines: [] };
  
  try {
    data = await kernelGet("/engines");
  } catch (e) {}

  return (
    <div style={{ color: "#fff" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>🚀 Engines</h1>
      
      {data.engines.length === 0 ? (
        <p style={{ color: "#888" }}>No engines registered. Create an engine in /engines folder.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {data.engines.map((name: string) => (
            <li key={name} style={{ marginBottom: 12 }}>
              <a 
                href={`/engines/${name}`} 
                style={{ 
                  color: "#8be9fd", 
                  background: "#16213e", 
                  padding: "12px 20px", 
                  borderRadius: 8,
                  display: "inline-block"
                }}
              >
                📦 {name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

