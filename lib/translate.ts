import { adminClient } from "./supabase/admin";
import { complete, MODELS } from "./llm";
import { TRANSLATE } from "./prompts";

let glossaryCache: { at: number; rows: { term_ar: string; term_en: string; term_bn: string | null }[] } | null = null;

/** Approved term pairs from the Al-Jamhara glossary, cached for ten minutes. */
export async function glossaryFor(lang: string): Promise<string> {
  if (!glossaryCache || Date.now() - glossaryCache.at > 600_000) {
    const { data } = await adminClient().from("glossary").select("term_ar, term_en, term_bn");
    glossaryCache = { at: Date.now(), rows: data ?? [] };
  }
  return glossaryCache.rows
    .map((g) => `${g.term_ar} = ${lang === "bn" ? g.term_bn ?? g.term_en : g.term_en}`)
    .join("; ");
}

export async function translate(text: string, to: string): Promise<string> {
  if (!text.trim()) return text;
  const glossary = await glossaryFor(to);
  return (await complete(MODELS.main, { system: TRANSLATE(to, glossary), user: text }, { temperature: 0.1 })).trim();
}
