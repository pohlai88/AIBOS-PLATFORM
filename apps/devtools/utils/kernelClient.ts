const KERNEL_URL = process.env.KERNEL_URL || "http://localhost:5656";

export async function kernelGet(path: string) {
  const res = await fetch(`${KERNEL_URL}${path}`, { cache: "no-store" });
  return res.json();
}

export async function kernelPost(path: string, body: any) {
  const res = await fetch(`${KERNEL_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

