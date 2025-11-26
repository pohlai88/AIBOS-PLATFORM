"use client";

import { useEffect, useState } from "react";

interface KernelEvent {
  name: string;
  tenant: string;
  engine: string;
  timestamp: number;
  payload: any;
}

export default function EventsPage() {
  const [events, setEvents] = useState<KernelEvent[]>([]);

  // In v1, events are not streamed - this is a placeholder
  // Future: SSE or WebSocket connection to kernel

  return (
    <div style={{ color: "#fff" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>📡 Event Stream</h1>
      
      <p style={{ color: "#888", marginBottom: 20 }}>
        Real-time event streaming coming in v2. 
        Currently events are logged to kernel console.
      </p>

      <div style={{ 
        background: "#16213e", 
        padding: 16, 
        borderRadius: 8,
        fontFamily: "monospace",
        fontSize: 13,
        minHeight: 300
      }}>
        {events.length === 0 ? (
          <span style={{ color: "#666" }}>Waiting for events...</span>
        ) : (
          events.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <span style={{ color: "#50fa7b" }}>[{e.tenant}]</span>{" "}
              <span style={{ color: "#8be9fd" }}>{e.name}</span>{" "}
              <span style={{ color: "#888" }}>{JSON.stringify(e.payload)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

