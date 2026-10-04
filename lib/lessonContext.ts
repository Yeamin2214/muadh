import lessons from "@/lib/content/lessons.json";
import { adminClient } from "./supabase/admin";
import type { Passage } from "./retrieve";

type Lesson = { n: number; title: string; body: string; key: string };

/**
 * When a learner asks about a lesson, the reviewed lesson text and the Quran verses it cites
 * become sources for the answer, alongside the normal search.
 */
export async function lessonPassages(n: number): Promise<Passage[]> {
  const lesson = (lessons as Lesson[]).find((l) => l.n === n);
  if (!lesson) return [];
  const ids: string[] = [];
  for (const m of lesson.body.matchAll(/\[Quran (\d+):(\d+)(?:-(\d+))?\]/g)) {
    const [s, a, b] = [Number(m[1]), Number(m[2]), Number(m[3] ?? m[2])];
    for (let v = a; v <= Math.min(b, a + 11); v++) ids.push(`quran:${s}:${v}`);
  }
  const { data } = ids.length
    ? await adminClient().from("passages").select("id, kind, arabic, translations, reference, grade, grade_source").in("id", ids)
    : { data: [] };
  const text = `${lesson.body.replace(/\[(Quran|Hadith)[^\]]*\]/g, "").replace(/\s+/g, " ")} Key point: ${lesson.key}`;
  const card: Passage = {
    id: `lesson:${n}`, kind: "lesson", arabic: null, translations: { en: text.slice(0, 3000) },
    reference: `Lesson ${n}: ${lesson.title}`, grade: null, grade_source: null,
  };
  return [card, ...((data as Passage[]) ?? [])];
}
