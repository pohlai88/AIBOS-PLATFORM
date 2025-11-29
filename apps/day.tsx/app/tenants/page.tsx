import { kernelGet } from "../../utils/kernelClient";

export default async function TenantsPage() {
  let data = { tenants: [] };
  
  try {
    data = await kernelGet("/tenants");
  } catch (e) {}

  return (
    <div style={{ color: "#fff" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>🏢 Tenants</h1>
      
      {data.tenants.length === 0 ? (
        <p style={{ color: "#888" }}>No tenants created.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {data.tenants.map((t: any) => (
            <li key={t.id} style={{ marginBottom: 12 }}>
              <a 
                href={`/tenants/${t.id}`} 
                style={{ 
                  color: "#ff79c6", 
                  background: "#16213e", 
                  padding: "12px 20px", 
                  borderRadius: 8,
                  display: "inline-block"
                }}
              >
                🏢 {t.name} ({t.id}) — Plan: {t.plan}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

