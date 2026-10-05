/**
 * One wrapper for every LLM call, with automatic fallback across providers.
 * Models that no longer exist are remembered and skipped for the rest of the process.
 */
import { recordUsage } from "./usage";

type Provider = "gemini" | "groq" | "openrouter";
export type ModelRef = { provider: Provider; model: string };
type Prompt = { system: string; user: string };
type Options = { json?: boolean; temperature?: number };

const env = process.env;
const TIMEOUT_MS = 25_000;

/** Every model we may use, in order of preference. Names come from .env.local when set. */
export const ALL_MODELS: ModelRef[] = [
  { provider: "gemini" as const, model: env.GEMINI_MODEL || "gemini-flash-latest" },
  { provider: "groq" as const, model: env.GROQ_MODEL_LARGE || "openai/gpt-oss-120b" },
  { provider: "groq" as const, model: env.GROQ_MODEL_SMALL || "openai/gpt-oss-20b" },
  { provider: "gemini" as const, model: env.GEMINI_MODEL_ALT || "gemini-2.5-flash" },
  { provider: "gemini" as const, model: env.GEMINI_MODEL_LITE || "gemini-flash-lite-latest" },
  ...(env.OPENROUTER_MODEL && env.OPENROUTER_API_KEY ? [{ provider: "openrouter" as const, model: env.OPENROUTER_MODEL }] : []),
].filter((m, i, list) => m.model && list.findIndex((x) => x.provider === m.provider && x.model === m.model) === i);

export const MODELS = {
  main: ALL_MODELS[0],
  small: ALL_MODELS.find((m) => m.model.includes("20b")) ?? ALL_MODELS[0],
  verifier: ALL_MODELS.find((m) => m.provider === "gemini") ?? ALL_MODELS[0],
};

const dead = new Set<string>();
const keyOf = (m: ModelRef) => `${m.provider}/${m.model}`;
export const isAlive = (m: ModelRef) => !dead.has(keyOf(m));

class ModelError extends Error {
  constructor(message: string, public gone: boolean) { super(message); }
}

async function callGemini(model: string, p: Prompt, o: Options): Promise<string> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: p.system }] },
      contents: [{ role: "user", parts: [{ text: p.user }] }],
      generationConfig: o.json ? { responseMimeType: "application/json" } : {},
    }),
  });
  if (!res.ok) throw new ModelError(`gemini ${model} ${res.status}`, res.status === 404);
  const data = await res.json();
  recordUsage(model, Number(data.usageMetadata?.totalTokenCount ?? 0));
  const text = (data.candidates?.[0]?.content?.parts ?? []).map((x: { text?: string }) => x.text ?? "").join("");
  if (!text) throw new ModelError(`gemini ${model} empty reply`, false);
  return text;
}

async function callOpenAICompatible(base: string, key: string | undefined, model: string, p: Prompt, o: Options) {
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      model,
      temperature: o.temperature ?? 0.3,
      messages: [{ role: "system", content: p.system }, { role: "user", content: p.user }],
      ...(o.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const gone = res.status === 404 || /model_not_found|decommissioned|does not exist/i.test(body);
    throw new ModelError(`${model} ${res.status}`, gone);
  }
  const data = await res.json();
  recordUsage(model, Number(data.usage?.total_tokens ?? 0));
  return String(data.choices?.[0]?.message?.content ?? "");
}

/** Calls exactly one model, with no fallback. Used where each answer must come from a different model. */
export async function callModel(m: ModelRef, p: Prompt, o: Options = {}): Promise<string> {
  try {
    if (m.provider === "gemini") return await callGemini(m.model, p, o);
    if (m.provider === "groq") return await callOpenAICompatible("https://api.groq.com/openai/v1", env.GROQ_API_KEY, m.model, p, o);
    return await callOpenAICompatible("https://openrouter.ai/api/v1", env.OPENROUTER_API_KEY, m.model, p, o);
  } catch (err) {
    if (err instanceof ModelError && err.gone) dead.add(keyOf(m));
    console.error(`[llm] ${keyOf(m)} failed: ${(err as Error).message}`);
    throw err;
  }
}

/** Tries the preferred model, then every other working model, until one answers. */
export async function complete(preferred: ModelRef, p: Prompt, o: Options = {}): Promise<string> {
  const order = [preferred, ...ALL_MODELS.filter((m) => keyOf(m) !== keyOf(preferred))].filter(isAlive);
  const errors: string[] = [];
  for (const m of order) {
    try { return await callModel(m, p, o); } catch (err) { errors.push((err as Error).message); }
  }
  throw new Error(`all models failed: ${errors.join("; ")}`);
}

export async function completeJSON<T>(preferred: ModelRef, p: Prompt, o: Options = {}): Promise<T | null> {
  return parseJSON<T>(await complete(preferred, p, { ...o, json: true }));
}

export function parseJSON<T>(text: string): T | null {
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{"), end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    try { return JSON.parse(cleaned.slice(start, end + 1)) as T; } catch { return null; }
  }
}
