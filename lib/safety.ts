/**
 * Rule-based checks that run before any AI call. They only ever make the system more careful:
 * a match can raise a question to a human, never lower it.
 */
const CRISIS = [
  /suicid|kill (myself|me)|end my life|self[- ]?harm|hurt(ing)? myself|want to die|being (beaten|abused)|in danger/i,
  /انتحار|أقتل نفسي|أنهي حياتي|أؤذي نفسي|أتعرض (للضرب|للأذى)/,
  /আত্মহত্যা|নিজেকে (শেষ|মেরে)|নিজের ক্ষতি|মারধর|বিপদে আছি/,
];

const PERSONAL_RULING = [
  /\b(marri|wife|husband|divorc|inherit|loan|interest|riba|pregnan|medicine|tattoo|circumcis)|is my .{1,40} (valid|allowed|halal|haram)|can i (marry|keep|go to|attend|work)/i,
  /زواج|زوجتي|زوجي|طلاق|ميراث|قرض|ربا|حامل|دواء|هل يجوز لي/,
  /বিয়ে|স্ত্রী|স্বামী|তালাক|উত্তরাধিকার|ঋণ|সুদ|গর্ভবতী|ওষুধ|আমি কি .{1,30} পারব/,
];

const HADITH_CHECK = [
  /is (this|it|that) (a )?(hadith|authentic|sahih)|authentic hadith|is .{1,60} a hadith|did the prophet (say|said)/i,
  /هل (هذا|هذه)? ?(الحديث|حديث) (صحيح|ثابت)|هل .{1,60} حديث/,
  /এটা কি (হাদিস|সহীহ)|হাদিস কি সহীহ/,
];

export const isCrisis = (t: string) => CRISIS.some((r) => r.test(t));
export const isPersonalRuling = (t: string) => PERSONAL_RULING.some((r) => r.test(t));
export const isHadithCheck = (t: string) => HADITH_CHECK.some((r) => r.test(t));

/** Any sentence attributing words to Allah or the Prophet must cite a source. */
const ATTRIBUTION = /allah (says|said|tells)|the prophet .{0,30}(said|says|told)|in a hadith|قال (الله|رسول الله|النبي)|في الحديث|আল্লাহ (বলেন|বলেছেন)|নবী .{0,12}(বলেছেন|বলেন)|হাদিসে/i;
export const needsCitation = (sentence: string) => ATTRIBUTION.test(sentence);

export function normalise(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}
