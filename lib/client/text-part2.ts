/* Text for lessons and Ask. */
import T, { type Lang } from "./text-app";

const ADD: Record<Lang, Record<string, string>> = {
  en: {
    lessonLangNote: "This lesson is in English for now. The reviewed Bangla and Arabic versions are coming soon.",
    markedDone: "Lesson complete. Well done!", nextLesson: "Next lesson", locked: "Finish the earlier lessons first",
    askAbout: "Ask about this lesson", minutesW: "{m} min", srcCredit: "Translation: King Fahd Complex, via QuranEnc",
    hadithRef: "Hadith reference, checked on Dorar.net", loadingSrc: "Loading the text…", srcMissing: "The text will appear here once the source library is loaded.",
    noSrcH: "I couldn't find a clear answer", noSrcP: "Our approved sources don't answer this clearly, so I've sent your question to your mentor. The reply will appear here.",
    crisisH: "You are not alone", crisisP: "Thank you for telling me. Your mentor has been alerted and will reach out to you as soon as possible. If you are in danger right now, please contact your local emergency number or someone you trust nearby.",
    otherP: "I'm here for questions about Islam and your journey as a new Muslim. Ask me anything about faith, prayer or daily life.",
    errSlow: "You're asking quickly. Please wait a minute, then try again.", errBusy: "Mu'adh is busy right now. Please try again in a moment.",
    errProfile: "Please finish your profile first.", waiting: "Waiting for your mentor's reply",
    dorarH: "What Dorar.net shows", dorarGrade: "Grade", dorarScholar: "Scholar", dorarSource: "Book", dorarOpen: "Open on Dorar.net",
    youSaid: "You", muadh: "Mu'adh",
  },
  ar: {
    lessonLangNote: "هذا الدرس بالإنجليزية حاليًا. النسختان العربية والبنغالية المراجعتان قريبًا.",
    markedDone: "أتممت الدرس. أحسنت!", nextLesson: "الدرس التالي", locked: "أكمل الدروس السابقة أولًا",
    askAbout: "اسأل عن هذا الدرس", minutesW: "{m} د", srcCredit: "من موقع QuranEnc",
    hadithRef: "مرجع الحديث، تم التحقق منه في الدرر السنية", loadingSrc: "جارٍ تحميل النص…", srcMissing: "سيظهر النص هنا بعد تحميل مكتبة المصادر.",
    noSrcH: "لم أجد إجابة واضحة", noSrcP: "مصادرنا المعتمدة لا تجيب عن هذا بوضوح، لذلك أرسلت سؤالك إلى مرشدك. سيظهر الرد هنا.",
    crisisH: "لست وحدك", crisisP: "شكرًا لأنك أخبرتني. تم تنبيه مرشدك وسيتواصل معك في أقرب وقت. إن كنت في خطر الآن فاتصل برقم الطوارئ المحلي أو بشخص تثق به قريب منك.",
    otherP: "أنا هنا لأسئلتك عن الإسلام ورحلتك كمسلم جديد. اسألني عن الإيمان أو الصلاة أو الحياة اليومية.",
    errSlow: "أسئلتك سريعة. انتظر دقيقة ثم حاول مرة أخرى.", errBusy: "معاذ مشغول الآن. حاول بعد قليل.",
    errProfile: "يرجى إكمال ملفك أولًا.", waiting: "بانتظار رد مرشدك",
    dorarH: "ما يظهر في الدرر السنية", dorarGrade: "الحكم", dorarScholar: "المحدث", dorarSource: "المصدر", dorarOpen: "افتح في الدرر السنية",
    youSaid: "أنت", muadh: "معاذ",
  },
  bn: {
    lessonLangNote: "এই পাঠটি আপাতত ইংরেজিতে। যাচাই করা বাংলা ও আরবি সংস্করণ শিগগিরই আসছে।",
    markedDone: "পাঠ শেষ। মাশাআল্লাহ!", nextLesson: "পরের পাঠ", locked: "আগের পাঠগুলো আগে শেষ করুন",
    askAbout: "এই পাঠ নিয়ে প্রশ্ন করুন", minutesW: "{m} মিনিট", srcCredit: "অনুবাদ: বাদশাহ ফাহাদ কমপ্লেক্স, QuranEnc থেকে",
    hadithRef: "হাদিসের সূত্র, Dorar.net-এ যাচাই করা", loadingSrc: "পাঠ লোড হচ্ছে…", srcMissing: "উৎস লাইব্রেরি লোড হলে এখানে পাঠ দেখা যাবে।",
    noSrcH: "স্পষ্ট উত্তর পাইনি", noSrcP: "আমাদের অনুমোদিত উৎসে এর স্পষ্ট উত্তর নেই, তাই প্রশ্নটি আপনার মেন্টরের কাছে পাঠানো হয়েছে। উত্তর এখানেই আসবে।",
    crisisH: "আপনি একা নন", crisisP: "আমাকে জানানোর জন্য ধন্যবাদ। আপনার মেন্টরকে জানানো হয়েছে, তিনি যত দ্রুত সম্ভব আপনার সাথে যোগাযোগ করবেন। এই মুহূর্তে বিপদে থাকলে স্থানীয় জরুরি নম্বরে বা কাছের বিশ্বস্ত কারো সাথে যোগাযোগ করুন।",
    otherP: "আমি ইসলাম এবং নতুন মুসলিম হিসেবে আপনার যাত্রা নিয়ে প্রশ্নের জন্য আছি। ঈমান, নামাজ বা দৈনন্দিন জীবন নিয়ে যেকোনো প্রশ্ন করুন।",
    errSlow: "আপনি খুব দ্রুত প্রশ্ন করছেন। এক মিনিট অপেক্ষা করে আবার চেষ্টা করুন।", errBusy: "মুআয এখন ব্যস্ত। একটু পরে আবার চেষ্টা করুন।",
    errProfile: "অনুগ্রহ করে আগে আপনার প্রোফাইল সম্পূর্ণ করুন।", waiting: "আপনার মেন্টরের উত্তরের অপেক্ষায়",
    dorarH: "Dorar.net যা দেখায়", dorarGrade: "মান", dorarScholar: "মুহাদ্দিস", dorarSource: "গ্রন্থ", dorarOpen: "Dorar.net-এ খুলুন",
    youSaid: "আপনি", muadh: "মুআয",
  },
};
(Object.keys(ADD) as Lang[]).forEach((l) => Object.assign(T[l], ADD[l]));
export default T;
