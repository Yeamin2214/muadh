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
const TIMEOUT_MS = 15_000; // a slow model is skipped quickly; another one takes over

/** Every model we may use, in order of preference. Each free model has its own daily limit, so more models means more capacity. */
const list = (v: string | undefined) => (v ?? "").split(",").map((x) => x.trim()).filter(Boolean);
export const ALL_MODELS: ModelRef[] = [
  { provider: "gemini" as const, model: env.GEMINI_MODEL || "gemini-flash-latest" },
  { provider: "groq" as const, model: env.GROQ_MODEL_LARGE || "openai/gpt-oss-120b" },
  { provider: "groq" as const, model: env.GROQ_MODEL_SMALL || "openai/gpt-oss-20b" },
  { provider: "gemini" as const, model: env.GEMINI_MODEL_ALT || "gemini-3.1-flash-lite" },
  { provider: "gemini" as const, model: env.GEMINI_MODEL_LITE || "gemini-flash-lite-latest" },
  ...list(env.GEMINI_EXTRA || "gemini-3.5-flash,gemini-3.6-flash,gemini-3.5-flash-lite").map((model) => ({ provider: "gemini" as const, model })),
  ...list(env.GROQ_EXTRA || "qwen/qwen3.8-27b").map((model) => ({ provider: "groq" as const, model })),
  ...(env.OPENROUTER_MODEL && env.OPENROUTER_API_KEY ? [{ provider: "openrouter" as const, model: env.OPENROUTER_MODEL }] : []),
].filter((m, i, all) => m.model && all.findIndex((x) => x.provider === m.provider && x.model === m.model) === i);

/** OpenRouter's free models, discovered automatically (checked at most once an hour). */
let freeCache: { at: number; models: ModelRef[] } = { at: 0, models: [] };
async function openRouterFree(): Promise<ModelRef[]> {
  if (!env.OPENROUTER_API_KEY) return [];
  if (Date.now() - freeCache.at < 3_600_000) return freeCache.models;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", { signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    const models = (data.data ?? [])
      .filter((m: { id: string; context_length?: number }) => m.id.endsWith(":free") && (m.context_length ?? 0) >= 16000)
      .slice(0, 5)
      .map((m: { id: string }) => ({ provider: "openrouter" as const, model: m.id }));
    freeCache = { at: Date.now(), models };
  } catch {
    freeCache = { at: Date.now(), models: freeCache.models };
  }
  return freeCache.models;
}

/** All models that are still working, including OpenRouter's free ones. */
export async function candidateModels(): Promise<ModelRef[]> {
  const extra = await openRouterFree();
  return [...ALL_MODELS, ...extra.filter((e) => !ALL_MODELS.some((m) => m.model === e.model))].filter(isAlive);
}

export const MODELS = {
  main: ALL_MODELS[0],
  small: ALL_MODELS.find((m) => m.model.includes("20b")) ?? ALL_MODELS[0],
  verifier: ALL_MODELS.find((m) => m.provider === "gemini") ?? ALL_MODELS[0],
};

const dead = new Set<string>();
const resting = new Map<string, number>(); // model -> time it can be tried again after a rate limit
const keyOf = (m: ModelRef) => `${m.provider}/${m.model}`;
export const isAlive = (m: ModelRef) => !dead.has(keyOf(m)) && (resting.get(keyOf(m)) ?? 0) < Date.now();

class ModelError extends Error {
  constructor(message: string, public gone: boolean, public limited = false) { super(message); }
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
  if (!res.ok) throw new ModelError(`gemini ${model} ${res.status}`, res.status === 404, res.status === 429 || res.status >= 500);
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
    throw new ModelError(`${model} ${res.status}`, gone, res.status === 429 || res.status >= 500);
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
    const timedOut = (err as Error)?.name === "TimeoutError" || /aborted due to timeout/i.test((err as Error)?.message ?? "");
    if ((err instanceof ModelError && err.limited) || timedOut) resting.set(keyOf(m), Date.now() + 120_000);
    console.error(`[llm] ${keyOf(m)} failed: ${(err as Error).message}`);
    throw err;
  }
}

/** Tries the preferred model, then every other working model, until one answers. */
export async function complete(preferred: ModelRef, p: Prompt, o: Options = {}): Promise<string> {
  if (!isAlive(preferred)) preferred = (await candidateModels())[0] ?? preferred;
  const order = [preferred, ...(await candidateModels()).filter((m) => keyOf(m) !== keyOf(preferred))].filter(isAlive);
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
