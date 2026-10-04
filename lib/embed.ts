import { adminClient } from "./supabase/admin";

/**
 * Two kinds of embeddings:
 * - embedQuery: Cohere multilingual (1024 dims), matching the stored passages. Cached in the database.
 * - embedTexts: Gemini, only to compare the three drafts with each other (never stored).
 */
const COHERE_MODEL = "embed-multilingual-v3.0";

export async function embedQuery(text: string): Promise<number[]> {
  const key = text.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 500);
  const db = adminClient();
  const { data: hit } = await db.from("embedding_cache").select("embedding").eq("key", key).maybeSingle();
  if (hit?.embedding) return typeof hit.embedding === "string" ? JSON.parse(hit.embedding) : hit.embedding;

  const res = await fetch("https://api.cohere.com/v2/embed", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.COHERE_API_KEY}` },
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({ model: COHERE_MODEL, texts: [text.slice(0, 2000)], input_type: "search_query", embedding_types: ["float"] }),
  });
  if (!res.ok) throw new Error(`cohere ${res.status}`);
  const vector: number[] = (await res.json()).embeddings.float[0];
  await db.from("embedding_cache").upsert({ key, embedding: vector });
  return vector;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({
      requests: texts.map((text) => ({ model: "models/gemini-embedding-001", content: { parts: [{ text: text.slice(0, 2000) }] }, outputDimensionality: 768 })),
    }),
  });
  if (!res.ok) throw new Error(`embed ${res.status}`);
  return (await res.json()).embeddings.map((e: { values: number[] }) => e.values);
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/** Word overlap between two texts, used if the embedding service is unavailable. */
export function wordOverlap(a: string, b: string): number {
  const words = (s: string) => new Set(s.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2));
  const x = words(a), y = words(b);
  const union = new Set([...x, ...y]).size;
  return union ? [...x].filter((w) => y.has(w)).length / union : 0;
}
