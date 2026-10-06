/** Every audio element the app plays, so playback can be stopped when the learner leaves a page. */
const playing = new Set<HTMLAudioElement>();

export function newAudio(src?: string): HTMLAudioElement {
  const a = new Audio(src);
  playing.add(a);
  a.addEventListener("ended", () => playing.delete(a));
  return a;
}

export function stopAllAudio() {
  playing.forEach((a) => a.pause());
  playing.clear();
}
