/* Text for qibla, duas, calendar and shift planner. */
import T, { type Lang } from "./text-app";

const ADD: Record<Lang, Record<string, string | string[]>> = {
  en: {
    dcats: ["Daily life", "Night and morning", "In hard times", "In prayer", "Protection: the three Quls"],
    duaKeys: ["daily", "night", "hard", "prayer"], audioSoon: "Audio by our hafiz is coming soon.", listen: "Listen",
    city: "Your location", calib: "Compass not accurate? Move your phone in a figure 8, away from metal.",
    accuracy: "Compass accuracy", nextAt: "Next prayer", locating: "Finding your location…",
    calBtn: "Add prayer times to my calendar", calDone: "Calendar file downloaded. Open it to add 30 days of prayer times with alerts.",
    shiftH: "Plan prayers around my shift", errConfirm: "Please confirm your email first, using the link we sent you, then sign in.", shiftP: "Enter your shift, and we'll show when each prayer fits.", shiftStart: "Shift starts", shiftEnd: "Shift ends",
    shiftFree: "Not during your shift", shiftBefore: "Pray before your shift (from {a})", shiftAfter: "Pray after your shift, until {b}",
    shiftBreak: "Inside your shift: pray on a break between {a} and {b}",
  },
  ar: {
    dcats: ["الحياة اليومية", "المساء والصباح", "عند الكرب", "في الصلاة", "الحماية: المعوذات"],
    duaKeys: ["daily", "night", "hard", "prayer"], audioSoon: "صوت حافظ الفريق قريبًا.", listen: "استمع",
    city: "موقعك", calib: "البوصلة غير دقيقة؟ حرّك الجوال على شكل رقم ٨ بعيدًا عن المعادن.",
    accuracy: "دقة البوصلة", nextAt: "الصلاة القادمة", locating: "جارٍ تحديد موقعك…",
    calBtn: "أضف مواقيت الصلاة إلى تقويمي", calDone: "تم تنزيل ملف التقويم. افتحه لإضافة مواقيت ٣٠ يومًا مع التنبيهات.",
    shiftH: "رتّب صلواتك حول مناوبتك", errConfirm: "يرجى تأكيد بريدك الإلكتروني أولًا عبر الرابط الذي أرسلناه، ثم تسجيل الدخول.", shiftP: "أدخل وقت مناوبتك وسنوضح متى تؤدي كل صلاة.", shiftStart: "بداية المناوبة", shiftEnd: "نهاية المناوبة",
    shiftFree: "ليست أثناء مناوبتك", shiftBefore: "صلِّها قبل مناوبتك (من {a})", shiftAfter: "صلِّها بعد مناوبتك، حتى {b}",
    shiftBreak: "أثناء مناوبتك: صلِّها في استراحة بين {a} و{b}",
  },
  bn: {
    dcats: ["দৈনন্দিন জীবন", "রাত ও সকাল", "কঠিন সময়ে", "নামাজের ভেতরে", "সুরক্ষা: তিন কুল"],
    duaKeys: ["daily", "night", "hard", "prayer"], audioSoon: "আমাদের হাফেজের কণ্ঠে অডিও শিগগিরই আসছে।", listen: "শুনুন",
    city: "আপনার অবস্থান", calib: "কম্পাস ঠিক দেখাচ্ছে না? ধাতব জিনিস থেকে দূরে ফোনটি ৮-এর মতো করে ঘোরান।",
    accuracy: "কম্পাসের নির্ভুলতা", nextAt: "পরবর্তী নামাজ", locating: "আপনার অবস্থান খোঁজা হচ্ছে…",
    calBtn: "নামাজের সময় আমার ক্যালেন্ডারে যোগ করুন", calDone: "ক্যালেন্ডার ফাইল ডাউনলোড হয়েছে। খুললে ৩০ দিনের নামাজের সময় অ্যালার্টসহ যোগ হবে।",
    shiftH: "শিফট অনুযায়ী নামাজের পরিকল্পনা", errConfirm: "অনুগ্রহ করে আগে আমাদের পাঠানো লিংক দিয়ে ইমেইল নিশ্চিত করুন, তারপর সাইন ইন করুন।", shiftP: "আপনার শিফটের সময় দিন, আমরা দেখাব কোন নামাজ কখন পড়বেন।", shiftStart: "শিফট শুরু", shiftEnd: "শিফট শেষ",
    shiftFree: "আপনার শিফটের সময়ে নয়", shiftBefore: "শিফটের আগে পড়ুন ({a} থেকে)", shiftAfter: "শিফটের পরে পড়ুন, {b} পর্যন্ত",
    shiftBreak: "শিফটের মধ্যে: {a} থেকে {b}-এর মধ্যে বিরতিতে পড়ুন",
  },
};
(Object.keys(ADD) as Lang[]).forEach((l) => Object.assign(T[l], ADD[l]));
export default T;
