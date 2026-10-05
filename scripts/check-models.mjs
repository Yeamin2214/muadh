// Tests every AI key and model in a few seconds.  Run: node scripts/check-models.mjs
try { process.loadEnvFile(".env.local"); } catch { /* use existing environment */ }
const e = process.env;
const ok = (s) => console.log("  ✅", s), bad = (s) => console.log("  ❌", s);

async function gemini(model) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${e.GEMINI_API_KEY}`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Reply with: ok" }] }] }),
  });
  return r.ok ? ok(`gemini  ${model}`) : bad(`gemini  ${model}  (${r.status}) ${(await r.text()).slice(0, 120)}`);
}
async function groq(model) {
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${e.GROQ_API_KEY}` },
    body: JSON.stringify({ model, messages: [{ role: "user", content: "Reply with: ok" }], max_tokens: 20 }),
  });
  return r.ok ? ok(`groq    ${model}`) : bad(`groq    ${model}  (${r.status}) ${(await r.text()).slice(0, 120)}`);
}
async function cohere() {
  const r = await fetch("https://api.cohere.com/v2/embed", {
    method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${e.COHERE_API_KEY}` },
    body: JSON.stringify({ model: "embed-multilingual-v3.0", texts: ["test"], input_type: "search_query", embedding_types: ["float"] }),
  });
  return r.ok ? ok("cohere  embed-multilingual-v3.0") : bad(`cohere  (${r.status})`);
}

console.log("Configured models:");
await gemini(e.GEMINI_MODEL || "gemini-flash-latest");
await gemini(e.GEMINI_MODEL_ALT || "gemini-2.5-flash");
await gemini(e.GEMINI_MODEL_LITE || "gemini-flash-lite-latest");
await groq(e.GROQ_MODEL_LARGE || "openai/gpt-oss-120b");
await groq(e.GROQ_MODEL_SMALL || "openai/gpt-oss-20b");
await cohere();

const list = await fetch("https://api.groq.com/openai/v1/models", { headers: { authorization: `Bearer ${e.GROQ_API_KEY}` } }).then((r) => r.json()).catch(() => null);
if (list?.data) console.log("\nGroq models available to your key:", list.data.map((m) => m.id).filter((id) => !/whisper|tts|guard|orpheus/i.test(id)).join(", "));
const g = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${e.GEMINI_API_KEY}`).then((r) => r.json()).catch(() => null);
if (g?.models) console.log("\nGemini text models:", g.models.filter((m) => m.supportedGenerationMethods?.includes("generateContent") && /flash/.test(m.name)).map((m) => m.name.replace("models/", "")).join(", "));
