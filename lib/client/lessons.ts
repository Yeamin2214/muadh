import data from "@/lib/content/lessons.json";

export type Lesson = {
  n: number; title: string; stage: number; minutes: number; level: string; prereqs: number[];
  body: string; key: string; today: string; mentor: string;
};

export const LESSONS = data as Lesson[];
export const STAGE_IMAGES = ["stage-faith", "stage-purity", "stage-prayer", "stage-daily", "stage-practice"];
export const STAGE_RANGES: [number, number][] = [[1, 8], [9, 14], [15, 28], [29, 38], [39, 40]];

export const isDone = (done: string[], n: number) => done.includes(String(n));
/** Lessons open strictly in order: a lesson opens once the one before it is done. */
export const isOpen = (done: string[], l: Lesson) => l.n === 1 || isDone(done, l.n - 1);
/** The first lesson that is open and not yet done. */
export const nextLesson = (done: string[]) => LESSONS.find((l) => !isDone(done, l.n) && isOpen(done, l)) ?? LESSONS[LESSONS.length - 1];
