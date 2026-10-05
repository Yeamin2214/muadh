import { adminClient } from "./supabase/admin";
import { embedQuery } from "./embed";

export type Passage = {
  id: string;
  kind: "quran" | "hadith" | "lesson" | "approved_answer" | "bayyinat";
  arabic: string | null;
  translations: Record<string, string | null>;
  reference: string | null;
  grade: string | null;
  grade_source: string | null;
};

const COLUMNS = "id, kind, arabic, translations, reference, grade, grade_source";

const STOP = new Set(["how", "what", "why", "when", "where", "who", "which", "does", "did", "can", "could", "should", "would",
  "the", "and", "for", "are", "was", "is", "do", "you", "your", "make", "with", "that", "this", "have", "has", "about", "tell"]);

/** Meaningful words joined with OR, so "How do I make wudu?" searches for "wudu", not every word. */
export function keywordQuery(question: string): string | null {
  const words = question.toLowerCase().split(/[^\p{L}\p{M}\p{N}]+/u).filter((w) => w.length > 2 && !STOP.has(w));
  return words.length ? [...new Set(words)].slice(0, 8).join(" | ") : null;
}

/**
 * Hybrid search over approved passages only: vector search plus keyword search,
 * merged with reciprocal rank fusion. Returns the top passages and the best vector similarity.
 */
export async function retrieve(question: string, k = 6): Promise<{ passages: Passage[]; bestSimilarity: number; keywordHits: number }> {
  const db = adminClient();
  const vector = await embedQuery(question).catch(() => null);

  const [byVector, byKeyword] = await Promise.all([
    vector ? db.rpc("match_passages", { query_embedding: vector, match_count: 12 }) : Promise.resolve({ data: [] }),
    keywordQuery(question)
      ? db.from("passages").select("id").textSearch("fts", keywordQuery(question)!, { config: "simple" }).limit(12)
      : Promise.resolve({ data: [] }),
  ]);

  const scores = new Map<string, number>();
  const add = (ids: string[]) => ids.forEach((id, rank) => scores.set(id, (scores.get(id) ?? 0) + 1 / (60 + rank)));
  add((byVector.data ?? []).map((r: { id: string }) => r.id));
  add((byKeyword.data ?? []).map((r: { id: string }) => r.id));

  const topIds = [...scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map(([id]) => id);
  const bestSimilarity = (byVector.data?.[0] as { similarity?: number } | undefined)?.similarity ?? 0;
  const keywordHits = byKeyword.data?.length ?? 0;
  if (!topIds.length) return { passages: [], bestSimilarity, keywordHits };

  const { data } = await db.from("passages").select(COLUMNS).in("id", topIds);
  const byId = new Map((data ?? []).map((p) => [p.id, p as Passage]));
  return { passages: topIds.map((id) => byId.get(id)).filter((p): p is Passage => !!p), bestSimilarity, keywordHits };
}

/** Text of a passage for prompts: translation in the learner's language, falling back to English. */
export function passageText(p: Passage, lang: string): string {
  return p.translations?.[lang] || p.translations?.en || p.arabic || "";
}
