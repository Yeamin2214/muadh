/* Text for the fixes round: location, reminders, dhikr reward, audio, lesson questions. */
import T, { type Lang } from "./text-app";

const ADD: Record<Lang, Record<string, string>> = {
  en: {
    cityPh: "Or type your city", citySearch: "Search", cityNotFound: "We couldn't find that city. Try another spelling.",
    locInsecure: "Location needs a secure (https) connection, so it will work on the live site. For now, type your city.",
    locDenied: "Location is blocked for this site. Allow it in your browser settings, or type your city.",
    locUnavailable: "We couldn't find your location. Please type your city instead.",
    remDenied: "Notifications are blocked for this site. Click the lock icon next to the address, allow Notifications, then try again.",
    remDismissed: "Please choose \u201cAllow\u201d when your browser asks.", remInsecure: "Reminders need a secure (https) connection, so they will work on the live site.",
    remUnsupported: "This browser doesn't support notifications. Use the calendar option below.",
    tahlil: "La ilaha illallahu wahdahu la sharika lah", tahlilHint: "Tap once to complete the hundred",
    rewardH: "MashaAllah, you completed it", rewardP: "The Prophet (peace be upon him) said that whoever says this after every prayer will have their sins forgiven, even if they are like the foam of the sea. May Allah accept it from you.",
    hintAudio: "Quran verses in each lesson come with audio recitation", play: "Play", reciter: "Recitation: Mishary Alafasy, via EveryAyah",
    aboutLesson: "About lesson {n}: {title}", aboutPh: "Ask anything about \u201c{title}\u201d",
    aboutSugg1: "Can you explain this lesson simply?", aboutSugg2: "Why is this important for a new Muslim?", clear: "Clear",
  },
  ar: {
    cityPh: "أو اكتب اسم مدينتك", citySearch: "بحث", cityNotFound: "لم نجد هذه المدينة. جرّب كتابة أخرى.",
    locInsecure: "يحتاج الموقع إلى اتصال آمن (https)، لذا سيعمل على الموقع المنشور. اكتب مدينتك الآن.",
    locDenied: "الموقع محظور لهذا الموقع. اسمح به من إعدادات المتصفح أو اكتب مدينتك.",
    locUnavailable: "لم نتمكن من تحديد موقعك. يرجى كتابة اسم مدينتك.",
    remDenied: "الإشعارات محظورة لهذا الموقع. اضغط على رمز القفل بجانب العنوان، واسمح بالإشعارات، ثم حاول مجددًا.",
    remDismissed: "يرجى اختيار «السماح» عندما يسألك المتصفح.", remInsecure: "يحتاج التذكير إلى اتصال آمن (https)، لذا سيعمل على الموقع المنشور.",
    remUnsupported: "هذا المتصفح لا يدعم الإشعارات. استخدم خيار التقويم في الأسفل.",
    tahlil: "لا إله إلا الله وحده لا شريك له", tahlilHint: "اضغط مرة واحدة لإتمام المائة",
    rewardH: "ما شاء الله، أتممتها", rewardP: "أخبر النبي صلى الله عليه وسلم أن من قالها دبر كل صلاة غُفرت خطاياه وإن كانت مثل زبد البحر. تقبّل الله منك.",
    hintAudio: "آيات كل درس مع تلاوة صوتية", play: "تشغيل", reciter: "التلاوة: مشاري العفاسي، عبر EveryAyah",
    aboutLesson: "عن الدرس {n}: {title}", aboutPh: "اسأل أي شيء عن «{title}»",
    aboutSugg1: "هل يمكنك شرح هذا الدرس ببساطة؟", aboutSugg2: "لماذا هذا مهم للمسلم الجديد؟", clear: "إزالة",
  },
  bn: {
    cityPh: "অথবা আপনার শহরের নাম লিখুন", citySearch: "খুঁজুন", cityNotFound: "শহরটি পাওয়া যায়নি। অন্য বানানে চেষ্টা করুন।",
    locInsecure: "লোকেশনের জন্য নিরাপদ (https) সংযোগ লাগে, তাই লাইভ সাইটে এটি কাজ করবে। এখন আপনার শহরের নাম লিখুন।",
    locDenied: "এই সাইটের জন্য লোকেশন বন্ধ। ব্রাউজারের সেটিংসে অনুমতি দিন, অথবা শহরের নাম লিখুন।",
    locUnavailable: "আপনার লোকেশন পাওয়া যায়নি। অনুগ্রহ করে শহরের নাম লিখুন।",
    remDenied: "এই সাইটের নোটিফিকেশন বন্ধ। ঠিকানার পাশের তালা চিহ্নে ক্লিক করে নোটিফিকেশন চালু করুন, তারপর আবার চেষ্টা করুন।",
    remDismissed: "ব্রাউজার জিজ্ঞেস করলে অনুগ্রহ করে \u201cAllow\u201d বেছে নিন।", remInsecure: "রিমাইন্ডারের জন্য নিরাপদ (https) সংযোগ লাগে, তাই লাইভ সাইটে এটি কাজ করবে।",
    remUnsupported: "এই ব্রাউজার নোটিফিকেশন সমর্থন করে না। নিচের ক্যালেন্ডার অপশনটি ব্যবহার করুন।",
    tahlil: "লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারিকা লাহ", tahlilHint: "একশ পূর্ণ করতে একবার চাপুন",
    rewardH: "মাশাআল্লাহ, আপনি সম্পন্ন করেছেন", rewardP: "নবী (সা.) বলেছেন, যে প্রতি নামাজের পর এটি পড়ে, তার গুনাহ মাফ করে দেওয়া হয়, যদিও তা সমুদ্রের ফেনার মতো হয়। আল্লাহ আপনার পক্ষ থেকে কবুল করুন।",
    hintAudio: "প্রতিটি পাঠের আয়াতের সাথে অডিও তিলাওয়াত আছে", play: "চালান", reciter: "তিলাওয়াত: মিশারি আলআফাসি, EveryAyah থেকে",
    aboutLesson: "পাঠ {n} সম্পর্কে: {title}", aboutPh: "\u201c{title}\u201d নিয়ে যেকোনো প্রশ্ন করুন",
    aboutSugg1: "পাঠটি কি সহজভাবে বুঝিয়ে বলবেন?", aboutSugg2: "নতুন মুসলিমের জন্য এটি কেন গুরুত্বপূর্ণ?", clear: "মুছুন",
  },
};
(Object.keys(ADD) as Lang[]).forEach((l) => Object.assign(T[l], ADD[l]));
export default T;
