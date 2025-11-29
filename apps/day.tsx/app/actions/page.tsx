import { kernelGet } from "../../utils/kernelClient";

export default async function ActionsPage() {
  let data = { engines: [] };
  
  try {
    data = await kernelGet("/engines");
  } catch (e) {}

  return (
    <div style={{ color: "#fff" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>⚡ Action Tester</h1>
      
      <p style={{ color: "#888", marginBottom: 20 }}>
        Select an engine to test its actions.
      </p>

      {data.engines.length === 0 ? (
        <p style={{ color: "#888" }}>No engines registered.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {data.engines.map((name: string) => (
            <li key={name} style={{ marginBottom: 12 }}>
              <a 
                href={`/actions/${name}`} 
                style={{ 
                  color: "#f1fa8c", 
                  background: "#16213e", 
                  padding: "12px 20px", 
                  borderRadius: 8,
                  display: "inline-block"
                }}
              >
                ⚡ {name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

