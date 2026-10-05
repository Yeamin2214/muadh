import { AsyncLocalStorage } from "node:async_hooks";
import { adminClient } from "./supabase/admin";

/** Counts AI calls and tokens during one request, then saves them for the admin dashboard. */
type Usage = { calls: number; tokens: number; models: Record<string, number> };
const store = new AsyncLocalStorage<Usage>();

export function recordUsage(model: string, tokens: number) {
  const u = store.getStore();
  if (!u) return;
  u.calls += 1;
  u.tokens += tokens;
  u.models[model] = (u.models[model] ?? 0) + tokens;
}

export async function trackUsage<T>(source: "ask" | "mentor" | "eval", work: () => Promise<T>): Promise<T> {
  const usage: Usage = { calls: 0, tokens: 0, models: {} };
  try {
    return await store.run(usage, work);
  } finally {
    if (usage.calls > 0) {
      await adminClient().from("ai_events").insert({ source, calls: usage.calls, tokens: usage.tokens, models: usage.models }).then(() => {}, () => {});
    }
  }
}
