/** One wrapper for every LLM call. Providers are a config change, not a rewrite. */
type Provider = "gemini" | "groq" | "openrouter";
export type ModelRef = { provider: Provider; model: string };
type Prompt = { system: string; user: string };
type Options = { json?: boolean; temperature?: number };

const env = process.env;
export const MODELS = {
  draftA: { provider: "gemini", model: env.GEMINI_MODEL ?? "gemini-2.5-flash" },
  draftB: { provider: "groq", model: env.GROQ_MODEL_LARGE ?? "openai/gpt-oss-120b" },
  draftC: { provider: "groq", model: env.GROQ_MODEL_ALT ?? "qwen/qwen3-32b" },
  small: { provider: "groq", model: env.GROQ_MODEL_SMALL ?? "openai/gpt-oss-20b" },
  verifier: { provider: "gemini", model: env.GEMINI_MODEL_LITE ?? "gemini-2.5-flash-lite" },
  backup: { provider: "openrouter", model: env.OPENROUTER_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free" },
} satisfies Record<string, ModelRef>;

const TIMEOUT_MS = 25_000;

async function callGemini(model: string, p: Prompt, o: Options): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: p.system }] },
      contents: [{ role: "user", parts: [{ text: p.user }] }],
      generationConfig: { temperature: o.temperature ?? 0.3, ...(o.json ? { responseMimeType: "application/json" } : {}) },
    }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const data = await res.json();
  return (data.candidates?.[0]?.content?.parts ?? []).map((x: { text?: string }) => x.text ?? "").join("");
}

async function callOpenAICompatible(base: string, key: string | undefined, model: string, p: Prompt, o: Options) {
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      model,
      temperature: o.temperature ?? 0.3,
      messages: [
        { role: "system", content: p.system },
        { role: "user", content: p.user },
      ],
      ...(o.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`${base} ${res.status}`);
  const data = await res.json();
  return String(data.choices?.[0]?.message?.content ?? "");
}

function call(ref: ModelRef, p: Prompt, o: Options) {
  if (ref.provider === "gemini") return callGemini(ref.model, p, o);
  if (ref.provider === "groq") return callOpenAICompatible("https://api.groq.com/openai/v1", env.GROQ_API_KEY, ref.model, p, o);
  return callOpenAICompatible("https://openrouter.ai/api/v1", env.OPENROUTER_API_KEY, ref.model, p, o);
}

/** Calls the chosen model; on a rate limit or outage, falls back to the backup provider. */
export async function complete(ref: ModelRef, p: Prompt, o: Options = {}): Promise<string> {
  try {
    return await call(ref, p, o);
  } catch (err) {
    if (ref.provider === MODELS.backup.provider) throw err;
    return call(MODELS.backup, p, o);
  }
}

/** Same as complete, but parses the reply as JSON. Returns null if the model did not return valid JSON. */
export async function completeJSON<T>(ref: ModelRef, p: Prompt, o: Options = {}): Promise<T | null> {
  const text = await complete(ref, p, { ...o, json: true });
  return parseJSON<T>(text);
}

export function parseJSON<T>(text: string): T | null {
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    } catch {
      return null;
    }
  }
}
