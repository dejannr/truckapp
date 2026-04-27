const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function groqChatCompletion(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY missing");
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are an operations analyst. Return strict JSON only." },
        { role: "user", content: prompt }
      ],
    })
  });

  if (!response.ok) {
    throw new Error(`Groq request failed: ${response.status}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content || "";
}
