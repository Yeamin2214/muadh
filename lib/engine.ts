import { adminClient } from "./supabase/admin";
import { complete, completeJSON, MODELS } from "./llm";
import { embedTexts, cosine, wordOverlap } from "./embed";
import { retrieve, passageText, type Passage } from "./retrieve";
import { glossaryFor, translate } from "./translate";
import { lookupDorar, type DorarResult } from "./dorar";
import { CLASSIFY, DRAFT, VERIFY, MENTOR_DRAFT } from "./prompts";
import { isCrisis, isPersonalRuling, isHadithCheck, needsCitation, normalise } from "./safety";
import { lessonPassages } from "./lessonContext";

export type Lang = "en" | "ar" | "bn";
export type Level = "A" | "B" | "C" | "D";
export type Sentence = { text: string; ids: string[] };
export type ReferReason = "level_c" | "level_d" | "low_confidence" | "no_source" | "crisis";

export type AskResult = {
  action: "answer" | "refer" | "not_found" | "crisis" | "other";
  level?: Level;
  reason?: ReferReason;
  sentences?: Sentence[];
  sources?: Passage[];
  dorar?: DorarResult;
  questionId?: string;
  ticketId?: string;
  cached?: boolean;
};

type Learner = { id: string; gender: "male" | "female" };
type Draft = { bottom_line?: string; sentences?: Sentence[]; insufficient?: boolean };
type Trace = Record<string, unknown>;

const setting = (key: string, fallback: number) => Number(process.env[key] ?? fallback);
const LEVELS: Level[] = ["A", "B", "C", "D"];
const higher = (a: Level, b: Level) => (LEVELS.indexOf(a) >= LEVELS.indexOf(b) ? a : b);
const asLevel = (v: unknown): Level => (LEVELS.includes(v as Level) ? (v as Level) : "C");

/** The full answer pipeline. Any step can stop and hand the question to a human mentor. */
export async function ask(text: string, lang: Lang, learner: Learner, lesson?: number): Promise<AskResult> {
  const db = adminClient();
  const question = text.trim().slice(0, 1000);
  const norm = normalise(lesson ? `lesson ${lesson} ${question}` : question);
  const trace: Trace = { started: new Date().toISOString() };

  // 0. Cache: the same question in the same language gets the stored, already verified answer.
  const { data: hit } = await db
    .from("questions").select("answer").eq("norm", norm).eq("lang", lang).eq("action", "answer")
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (hit?.answer) return save({ ...(hit.answer as AskResult), cached: true }, { cache: true });

  // 1. Safety first: crisis messages go straight to a human, with no religious answer generated.
  if (isCrisis(question)) return refer("crisis", "D", [], { safety: "crisis" });

  // 2. Level and intent. Rules can only raise the level, never lower it.
  const cls = await completeJSON<{ level: string; intent: string; reason: string }>(
    MODELS.small, { system: CLASSIFY, user: question }, { temperature: 0 },
  ).catch(() => null);
  let level = asLevel(cls?.level);
  if (isPersonalRuling(question)) level = higher(level, "D");
  trace.classifier = cls ?? "failed";
  if (cls?.intent === "greeting" || cls?.intent === "off_topic") return save({ action: "other", level }, {});

  // 3. Retrieval from approved passages only.
  const found = await retrieve(question);
  const lessonCtx = lesson ? await lessonPassages(lesson) : [];
  const passages = [...lessonCtx, ...found.passages.filter((p) => !lessonCtx.some((c) => c.id === p.id))].slice(0, 8);
  const { bestSimilarity, keywordHits } = found;
  trace.retrieval = { ids: passages.map((p) => p.id), bestSimilarity, keywordHits, lesson: lesson ?? null };

  // 4. "Is this a hadith?" questions: answer from our collection if it is clearly there; otherwise report Dorar.
  if (cls?.intent === "hadith_check" || isHadithCheck(question)) {
    const strongHadith = passages[0]?.kind === "hadith" && bestSimilarity >= setting("STRONG_MATCH", 0.6);
    if (!strongHadith) {
      const quoted = question.match(/["“«](.+?)["”»]/)?.[1] ?? question;
      return save({ action: "not_found", level, dorar: await lookupDorar(quoted) }, { dorar: true });
    }
  }

  if (level === "C") return refer("level_c", level, passages, {});
  if (level === "D") return refer("level_d", level, passages, {});
  // Enough evidence to try: lesson context, a close meaning match, or solid keyword matches. The drafts and verifier still decide.
  const evidence = lessonCtx.length > 0 || bestSimilarity >= setting("MIN_SIMILARITY", 0.4) || keywordHits >= 2 || (bestSimilarity === 0 && keywordHits > 0);
  if (!passages.length || !evidence) return refer("no_source", level, passages, {});

  // 5. Three drafts from three different models, in parallel.
  const known = new Set(passages.map((p) => p.id));
  const context = passages.map((p) => `[${p.id}] ${p.reference ?? ""}: ${passageText(p, "en")}`).join("\n");
  const prompt = { system: DRAFT(lang, await glossaryFor(lang)), user: `Passages:\n${context}\n\nQuestion: ${question}` };
  const settled = await Promise.allSettled(
    [MODELS.draftA, MODELS.draftB, MODELS.draftC].map((m) => completeJSON<Draft>(m, prompt, { temperature: 0.7 })),
  );
  const raw = settled.map((s) => (s.status === "fulfilled" ? s.value : null));
  const insufficient = raw.filter((d) => d?.insufficient).length;
  const drafts = raw
    .filter((d): d is Draft => !!d && !d.insufficient && Array.isArray(d.sentences) && d.sentences.length > 0)
    .map((d) => ({
      bottom: d.bottom_line ?? "",
      sentences: d.sentences!
        .filter((s) => typeof s?.text === "string")
        .map((s) => ({ text: s.text.trim(), ids: (s.ids ?? []).filter((id) => known.has(id)) })),
    }));
  trace.drafts = { returned: drafts.length, insufficient };
  if (insufficient >= 2) return refer("no_source", level, passages, trace);
  if (drafts.length < 2) return refer("low_confidence", level, passages, trace);

  // 6. Agreement on substance: overlap of cited sources plus similarity of the bottom-line answers.
  const bottoms = drafts.map((d) => d.bottom || d.sentences.map((s) => s.text).join(" "));
  const vectors = await embedTexts(bottoms).catch(() => null);
  const citedSets = drafts.map((d) => new Set(d.sentences.flatMap((s) => s.ids)));
  const pairScore = (i: number, j: number) => {
    const a = citedSets[i], b = citedSets[j];
    const union = new Set([...a, ...b]).size;
    const jaccard = union ? [...a].filter((x) => b.has(x)).length / union : 0;
    const meaning = vectors ? cosine(vectors[i], vectors[j]) : wordOverlap(bottoms[i], bottoms[j]);
    return 0.5 * jaccard + 0.5 * meaning;
  };
  const totals = drafts.map((_, i) => drafts.reduce((sum, __, j) => (i === j ? sum : sum + pairScore(i, j)), 0));
  const pairs = drafts.length * (drafts.length - 1);
  const agreement = totals.reduce((a, b) => a + b, 0) / pairs;
  const chosen = drafts[totals.indexOf(Math.max(...totals))];
  trace.agreement = Number(agreement.toFixed(3));
  if (agreement < setting("AGREEMENT_MIN", 0.55)) return refer("low_confidence", level, passages, trace);

  // 7. Hard rules: every sentence needs a valid source; attributions to Allah or the Prophet doubly so.
  const cited = chosen.sentences.filter((s) => s.ids.length > 0);
  const droppedByRule = chosen.sentences.length - cited.length;
  const attributionsWithoutSource = chosen.sentences.filter((s) => !s.ids.length && needsCitation(s.text)).length;

  // 8. Sentence verifier: one call checks each sentence against the passages it cites.
  const byId = new Map(passages.map((p) => [p.id, p]));
  const check = await completeJSON<{ results: { i: number; supported: boolean }[] }>(
    MODELS.verifier,
    {
      system: VERIFY,
      user: cited
        .map((s, i) => `Sentence ${i}: ${s.text}\nCited passages:\n${s.ids.map((id) => `[${id}] ${passageText(byId.get(id)!, "en")}`).join("\n")}`)
        .join("\n\n"),
    },
    { temperature: 0 },
  ).catch(() => null);
  if (!check?.results) return refer("low_confidence", level, passages, { ...trace, verifier: "failed" });
  const supported = new Set(check.results.filter((r) => r.supported).map((r) => r.i));
  const final = cited.filter((_, i) => supported.has(i));
  const unsupportedShare = 1 - final.length / Math.max(1, chosen.sentences.length);
  trace.verifier = { kept: final.length, droppedByRule, attributionsWithoutSource, unsupportedShare: Number(unsupportedShare.toFixed(2)) };
  if (!final.length || unsupportedShare > setting("MAX_UNSUPPORTED", 0.25)) return refer("low_confidence", level, passages, trace);

  // 9. Answer: the app renders the cited passages word for word from the database.
  const sourceIds = new Set(final.flatMap((s) => s.ids));
  return save({ action: "answer", level, sentences: final, sources: passages.filter((p) => sourceIds.has(p.id)) }, trace);

  // ---- helpers ----
  async function save(result: AskResult, extra: Trace): Promise<AskResult> {
    const { data } = await db
      .from("questions")
      .insert({ learner_id: learner.id, text: question, lang, norm, level: result.level ?? null, action: result.action, answer: result, trace: { ...trace, ...extra } })
      .select("id").single();
    return { ...result, questionId: data?.id };
  }

  async function refer(reason: ReferReason, lvl: Level, found: Passage[], extra: Trace): Promise<AskResult> {
    const saved = await save({ action: reason === "crisis" ? "crisis" : "refer", level: lvl, reason }, { ...extra, referral: reason });
    const [questionAr, draftAr, lastMentor] = await Promise.all([
      lang === "ar" ? question : translate(question, "ar").catch(() => question),
      reason === "crisis" || !found.length
        ? null
        : complete(MODELS.draftA, {
            system: MENTOR_DRAFT,
            user: `Question: ${question}\n\nPassages:\n${found.map((p) => `[${p.id}] ${passageText(p, "ar")}`).join("\n")}`,
          }).catch(() => null),
      db.from("tickets").select("claimed_by").eq("learner_id", learner.id).eq("status", "answered")
        .order("answered_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    const { data: ticket } = await db
      .from("tickets")
      .insert({
        question_id: saved.questionId, learner_id: learner.id, gender: learner.gender, reason,
        urgent: reason === "crisis", original: question, original_lang: lang, question_ar: questionAr,
        draft_ar: draftAr, preferred_mentor: lastMentor.data?.claimed_by ?? null,
      })
      .select("id").single();
    return { ...saved, ticketId: ticket?.id };
  }
}
