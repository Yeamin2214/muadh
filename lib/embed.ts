/** Gemini embeddings, 768 dimensions, matching the stored passage embeddings. */
export async function embed(texts: string[]): Promise<number[][]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(20_000),
    body: JSON.stringify({
      requests: texts.map((text) => ({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text: text.slice(0, 2000) }] },
        outputDimensionality: 768,
      })),
    }),
  });
  if (!res.ok) throw new Error(`embed ${res.status}`);
  const data = await res.json();
  return data.embeddings.map((e: { values: number[] }) => e.values);
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}
