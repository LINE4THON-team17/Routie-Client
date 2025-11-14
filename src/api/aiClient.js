export async function callLutiAgent({ systemPrompt, userPrompt }) {
  const res = await fetch("/api/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemPrompt, userPrompt }),
  });

  if (!res.ok) throw new Error("API Error");
  return await res.json();
}
