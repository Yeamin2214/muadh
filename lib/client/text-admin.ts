/* Text for the admin panel. */
import T, { type Lang } from "./text-app";

const EN: Record<string, string> = {
  adminNav: "Admin", adOverview: "Overview", adMentors: "Mentors",
  adLearners: "Learners", adActive: "Active this week", adNewWeek: "+{n} new this week", adQuestions: "Questions", adWeek: "{n} this week",
  adAnswered: "Answered with sources", adReferred: "Sent to mentors", adOpen: "Open mentor questions", adUrgent: "{n} urgent",
  adResponse: "Average mentor reply time", adHours: "{n} h", adMentorsCount: "Active mentors", adPending: "{n} waiting for review",
  adTokens: "AI tokens (30 days)", adCalls: "{n} AI calls", adLessons: "Lessons completed", adCache: "Cached questions",
  adDaily: "Questions per day (last 14 days)", adLevels: "Questions by level", adActions: "What happened to questions", adLangs: "Learners by language",
  adInbox: "Open questions by inbox", adModels: "Tokens by model (30 days)", adNone: "No data yet",
  a_answer: "Answered", a_refer: "Sent to mentor", a_not_found: "Hadith check", a_crisis: "Crisis", a_other: "Other",
  adApps: "Applications", adActiveMentors: "Active mentors", adNoApps: "No applications yet.", adNoMentors: "No active mentors yet.",
  adApprove: "Approve", adReject: "Reject", adRevoke: "Remove access", adNote: "Note to the applicant (optional)",
  st_pending: "Pending", st_approved: "Approved", st_rejected: "Rejected",
  adOrg: "Organisation", adPhone: "Phone", adPlace: "Location", adLangsW: "Languages", adQual: "Qualifications", adExp: "Experience", adYears: "{n} years",
  adAnsweredN: "{n} answered", adConfirmRevoke: "Remove this mentor's access to the portal?", adSentDate: "Applied {d}",
};
const AR: Record<string, string> = {
  adminNav: "الإدارة", adOverview: "نظرة عامة", adMentors: "المرشدون",
  adLearners: "المتعلمون", adActive: "نشطون هذا الأسبوع", adNewWeek: "+{n} جديد هذا الأسبوع", adQuestions: "الأسئلة", adWeek: "{n} هذا الأسبوع",
  adAnswered: "أُجيب عنها بمصادر", adReferred: "أُحيلت إلى المرشدين", adOpen: "أسئلة مفتوحة للمرشدين", adUrgent: "{n} عاجلة",
  adResponse: "متوسط زمن رد المرشد", adHours: "{n} ساعة", adMentorsCount: "المرشدون النشطون", adPending: "{n} بانتظار المراجعة",
  adTokens: "رموز الذكاء الاصطناعي (٣٠ يومًا)", adCalls: "{n} استدعاء", adLessons: "الدروس المكتملة", adCache: "أسئلة محفوظة",
  adDaily: "الأسئلة يوميًا (آخر ١٤ يومًا)", adLevels: "الأسئلة حسب المستوى", adActions: "مآل الأسئلة", adLangs: "المتعلمون حسب اللغة",
  adInbox: "الأسئلة المفتوحة حسب الصندوق", adModels: "الرموز حسب النموذج (٣٠ يومًا)", adNone: "لا توجد بيانات بعد",
  a_answer: "أُجيب", a_refer: "أُحيل إلى مرشد", a_not_found: "تحقق من حديث", a_crisis: "حالة طارئة", a_other: "أخرى",
  adApps: "الطلبات", adActiveMentors: "المرشدون النشطون", adNoApps: "لا توجد طلبات بعد.", adNoMentors: "لا يوجد مرشدون نشطون بعد.",
  adApprove: "قبول", adReject: "رفض", adRevoke: "إيقاف الصلاحية", adNote: "ملاحظة للمتقدم (اختياري)",
  st_pending: "قيد المراجعة", st_approved: "مقبول", st_rejected: "مرفوض",
  adOrg: "الجهة", adPhone: "الجوال", adPlace: "الموقع", adLangsW: "اللغات", adQual: "المؤهلات", adExp: "الخبرة", adYears: "{n} سنوات",
  adAnsweredN: "{n} ردًا", adConfirmRevoke: "هل تريد إيقاف صلاحية هذا المرشد في البوابة؟", adSentDate: "تقدّم في {d}",
};
const ADD: Record<Lang, Record<string, string>> = { en: EN, ar: AR, bn: { adminNav: "অ্যাডমিন" } };
(Object.keys(ADD) as Lang[]).forEach((l) => Object.assign(T[l], ADD[l]));
export default T;

const EVAL: Record<Lang, Record<string, string>> = {
  en: {
    evTab: "Evaluation", evNone: "No evaluation run yet. Run it from the project folder:", evRun: "{n} test cases · {d}", evPartial: "sample run", evTime: "median {m} s per question",
    evCorrect: "Correct behaviour", evAbstain: "Abstention where required", evFake: "Fabricated hadith caught", evCited: "Answers fully cited", evQuran: "Expected Quran source cited",
    evPrecision: "Referral precision", evRecall: "Referral recall", evOver: "Over-abstention", evLower: "lower is better",
    evCritical: "Critical failures", evCriticalP: "AI answered where it must not", evLevel: "Level classified correctly",
    evByGroup: "Correct behaviour by test category", evProblems: "Errors to review", evNoProblems: "No errors in this run.",
    evQuestion: "Question", evExpected: "Expected", evActual: "Actual",
  },
  ar: {
    evTab: "التقييم", evNone: "لم يُجرَ تقييم بعد. شغّله من مجلد المشروع:", evRun: "{n} حالة اختبار · {d}", evPartial: "تشغيل تجريبي", evTime: "الوسيط {m} ثانية للسؤال",
    evCorrect: "السلوك الصحيح", evAbstain: "الامتناع حيث يجب", evFake: "اكتشاف الأحاديث المكذوبة", evCited: "إجابات موثقة بالكامل", evQuran: "ذكر الآية المتوقعة",
    evPrecision: "دقة الإحالة", evRecall: "شمول الإحالة", evOver: "امتناع زائد", evLower: "الأقل أفضل",
    evCritical: "أخطاء حرجة", evCriticalP: "أجاب الذكاء الاصطناعي حيث لا يجوز", evLevel: "تصنيف المستوى صحيح",
    evByGroup: "السلوك الصحيح حسب فئة الاختبار", evProblems: "أخطاء للمراجعة", evNoProblems: "لا أخطاء في هذا التشغيل.",
    evQuestion: "السؤال", evExpected: "المتوقع", evActual: "الفعلي",
  },
  bn: {},
};
(Object.keys(EVAL) as Lang[]).forEach((l) => Object.assign(T[l], EVAL[l]));

const GRADES: Record<Lang, Record<string, string>> = {
  en: { gradeCollection: "Authentic: in the Sahih collection", gradeAlbani: "Authentic (sahih), graded by al-Albani, via Dorar.net" },
  ar: { gradeCollection: "صحيح: في الصحيح", gradeAlbani: "صحيح، صححه الألباني، كما في الدرر السنية" },
  bn: { gradeCollection: "সহীহ: সহীহ গ্রন্থে বর্ণিত", gradeAlbani: "সহীহ, আলবানি সহীহ বলেছেন, Dorar.net অনুযায়ী" },
};
(Object.keys(GRADES) as Lang[]).forEach((l) => Object.assign(T[l], GRADES[l]));

const RATE: Record<Lang, Record<string, string>> = {
  en: {
    rtButton: "Rate Mu'adh", rtH: "How is Mu'adh for you?", rtP: "Your honest rating helps us improve. It takes 20 seconds.",
    rtOverall: "Overall", rtEase: "Easy to use", rtTrust: "Trust in the answers", rtUseful: "Useful for my journey", rtComment: "Anything you'd like to tell us? (optional)",
    rtSend: "Send rating", rtThanks: "JazakAllahu khairan!", rtThanksP: "Thank you for helping us make Mu'adh better.", rtPrompt: "Enjoying Mu'adh? Tell us how it's going.",
    fbQ: "Was this helpful?", fbThanks: "Thank you for your feedback",
    rtTab: "Ratings", rtReal: "Real accounts", rtDemo: "Demo accounts", rtAvg: "Average rating", rtCount: "Ratings", rtWho: "{l} learners · {m} mentors",
    rtHelpful: "Answers marked helpful", rtDist: "Rating distribution", rtComments: "Latest comments", roleLearner: "Learner",
  },
  ar: {
    rtButton: "قيّم معاذ", rtH: "ما رأيك في معاذ؟", rtP: "تقييمك الصادق يساعدنا على التحسين، ويستغرق ٢٠ ثانية.",
    rtOverall: "التقييم العام", rtEase: "سهولة الاستخدام", rtTrust: "الثقة في الإجابات", rtUseful: "الفائدة في رحلتي", rtComment: "هل تود أن تخبرنا بشيء؟ (اختياري)",
    rtSend: "إرسال التقييم", rtThanks: "جزاك الله خيرًا!", rtThanksP: "شكرًا لمساعدتنا في تحسين معاذ.", rtPrompt: "هل أعجبك معاذ؟ أخبرنا برأيك.",
    fbQ: "هل كانت الإجابة مفيدة؟", fbThanks: "شكرًا على رأيك",
    rtTab: "التقييمات", rtReal: "حسابات حقيقية", rtDemo: "حسابات تجريبية", rtAvg: "متوسط التقييم", rtCount: "عدد التقييمات", rtWho: "{l} متعلمًا · {m} مرشدًا",
    rtHelpful: "إجابات وُصفت بأنها مفيدة", rtDist: "توزيع التقييمات", rtComments: "أحدث التعليقات", roleLearner: "متعلم",
  },
  bn: {
    rtButton: "মুআযকে রেটিং দিন", rtH: "মুআয আপনার কেমন লাগছে?", rtP: "আপনার সৎ রেটিং আমাদের উন্নতিতে সাহায্য করবে। মাত্র ২০ সেকেন্ড লাগবে।",
    rtOverall: "সামগ্রিক", rtEase: "ব্যবহারে সহজ", rtTrust: "উত্তরের ওপর আস্থা", rtUseful: "আমার যাত্রায় উপকারী", rtComment: "আর কিছু বলতে চান? (ঐচ্ছিক)",
    rtSend: "রেটিং পাঠান", rtThanks: "জাযাকাল্লাহু খাইরান!", rtThanksP: "মুআযকে আরও ভালো করতে সাহায্য করার জন্য ধন্যবাদ।", rtPrompt: "মুআয কেমন লাগছে? আমাদের জানান।",
    fbQ: "উত্তরটি কি উপকারী ছিল?", fbThanks: "আপনার মতামতের জন্য ধন্যবাদ",
  },
};
(Object.keys(RATE) as Lang[]).forEach((l) => Object.assign(T[l], RATE[l]));

const MORE: Record<Lang, Record<string, string>> = {
  en: {
    alH: "Admin sign in", alP: "For the Mu'adh admin team.", alDemo: "For judges",
    errUseAdmin: "This is an admin account. Please sign in at /admin.", errUseLearner: "This is a learner account. Please use the learner sign in.", errUseMentor: "This is a mentor account. Please use Mentor sign in.",
    fpLink: "Forgot password?", fpH: "Reset your password", fpP: "Enter your email and we'll send you a link to set a new password.", fpSend: "Send reset link",
    fpSent: "If an account exists for this email, a reset link is on its way. Please check your inbox and spam folder.", fpErr: "We couldn't send the email right now. Please try again in a few minutes.",
    rpH: "Set a new password", rpNew: "New password", rpSave: "Save new password", rpExpired: "This link has expired or was already used. Please request a new one.",
    usTab: "Users", usH: "Learners", usSearch: "Search by name or email", usName: "Name", usLang: "Language", usLessons: "Lessons", usQuestions: "Questions", usJoined: "Joined", usChats: "Chats",
    mailBtn: "Email the mentor", mailSubject: "Your Mu'adh mentor account is approved",
    mailBody: "Assalamu alaikum {name},\n\nYour mentor application for Mu'adh has been reviewed and approved. JazakAllahu khairan for joining us.\n\nYou can now sign in through \"Mentor sign in\" on the Mu'adh website and start helping new Muslims.\n\nThe Mu'adh team",
  },
  ar: {
    alH: "دخول الإدارة", alP: "لفريق إدارة معاذ.", alDemo: "للمحكّمين",
    errUseAdmin: "هذا حساب إدارة. يرجى الدخول من /admin.", errUseLearner: "هذا حساب متعلم. يرجى استخدام دخول المتعلمين.", errUseMentor: "هذا حساب مرشد. يرجى استخدام دخول المرشدين.",
    fpLink: "نسيت كلمة المرور؟", fpH: "إعادة تعيين كلمة المرور", fpP: "أدخل بريدك الإلكتروني وسنرسل لك رابطًا لتعيين كلمة مرور جديدة.", fpSend: "إرسال الرابط",
    fpSent: "إن كان هناك حساب بهذا البريد فسيصلك رابط إعادة التعيين. تحقق من البريد الوارد والرسائل غير المرغوبة.", fpErr: "تعذر إرسال البريد الآن. حاول بعد دقائق.",
    rpH: "تعيين كلمة مرور جديدة", rpNew: "كلمة المرور الجديدة", rpSave: "حفظ كلمة المرور", rpExpired: "انتهت صلاحية هذا الرابط أو استُخدم. اطلب رابطًا جديدًا.",
    usTab: "المستخدمون", usH: "المتعلمون", usSearch: "ابحث بالاسم أو البريد", usName: "الاسم", usLang: "اللغة", usLessons: "الدروس", usQuestions: "الأسئلة", usJoined: "تاريخ الانضمام", usChats: "المحادثات",
    mailBtn: "راسل المرشد", mailSubject: "تم قبول حسابك كمرشد في معاذ",
    mailBody: "السلام عليكم {name}،\n\nتمت مراجعة طلب انضمامك كمرشد في معاذ وقبوله. جزاك الله خيرًا على انضمامك.\n\nيمكنك الآن الدخول عبر «دخول المرشدين» في موقع معاذ والبدء في مساعدة المسلمين الجدد.\n\nفريق معاذ",
  },
  bn: {
    errUseAdmin: "এটি অ্যাডমিন অ্যাকাউন্ট। /admin থেকে সাইন ইন করুন।", errUseLearner: "এটি শিক্ষার্থীর অ্যাকাউন্ট। শিক্ষার্থী সাইন ইন ব্যবহার করুন।", errUseMentor: "এটি মেন্টরের অ্যাকাউন্ট। মেন্টর সাইন ইন ব্যবহার করুন।",
    fpLink: "পাসওয়ার্ড ভুলে গেছেন?", fpH: "পাসওয়ার্ড রিসেট করুন", fpP: "আপনার ইমেইল দিন, নতুন পাসওয়ার্ড সেট করার লিংক পাঠানো হবে।", fpSend: "রিসেট লিংক পাঠান",
    fpSent: "এই ইমেইলে অ্যাকাউন্ট থাকলে রিসেট লিংক পাঠানো হয়েছে। ইনবক্স ও স্প্যাম ফোল্ডার দেখুন।", fpErr: "এখন ইমেইল পাঠানো যাচ্ছে না। কয়েক মিনিট পর আবার চেষ্টা করুন।",
    rpH: "নতুন পাসওয়ার্ড দিন", rpNew: "নতুন পাসওয়ার্ড", rpSave: "পাসওয়ার্ড সংরক্ষণ করুন", rpExpired: "লিংকটির মেয়াদ শেষ বা আগে ব্যবহার হয়েছে। নতুন লিংক চান।",
  },
};
(Object.keys(MORE) as Lang[]).forEach((l) => Object.assign(T[l], MORE[l]));

const CODES: Record<Lang, Record<string, string>> = {
  en: {
    vH: "Check your email", vP: "We sent a 6-digit code to {email}. Enter it below to verify your account. If you can't find it, check your spam folder.",
    vCode: "6-digit code", vBtn: "Verify", vResend: "Send a new code", vResent: "A new code is on its way.", vWrong: "That code isn't correct or has expired. Please try again or send a new code.",
    fpP: "Enter your email and we'll send you a 6-digit code.", fpSend: "Send code", fpCodeP: "Enter the code we sent to {email}, then choose a new password.",
    mailSent: "Done. The mentor has been emailed.", mailNotSent: "Done. The email could not be sent, so please let the mentor know directly.",
  },
  ar: {
    vH: "تحقق من بريدك", vP: "أرسلنا رمزًا من ٦ أرقام إلى {email}. أدخله أدناه لتأكيد حسابك. إن لم تجده فتحقق من الرسائل غير المرغوبة.",
    vCode: "الرمز المكوّن من ٦ أرقام", vBtn: "تأكيد", vResend: "إرسال رمز جديد", vResent: "رمز جديد في الطريق إليك.", vWrong: "الرمز غير صحيح أو انتهت صلاحيته. حاول مجددًا أو اطلب رمزًا جديدًا.",
    fpP: "أدخل بريدك وسنرسل لك رمزًا من ٦ أرقام.", fpSend: "إرسال الرمز", fpCodeP: "أدخل الرمز المرسل إلى {email} ثم اختر كلمة مرور جديدة.",
    mailSent: "تم. أُرسل بريد إلى المرشد.", mailNotSent: "تم. تعذر إرسال البريد، فيرجى إبلاغ المرشد مباشرة.",
  },
  bn: {
    vH: "ইমেইল দেখুন", vP: "{email}-এ ৬ সংখ্যার একটি কোড পাঠানো হয়েছে। অ্যাকাউন্ট যাচাই করতে নিচে কোডটি দিন। না পেলে স্প্যাম ফোল্ডার দেখুন।",
    vCode: "৬ সংখ্যার কোড", vBtn: "যাচাই করুন", vResend: "নতুন কোড পাঠান", vResent: "নতুন কোড পাঠানো হচ্ছে।", vWrong: "কোডটি সঠিক নয় বা মেয়াদ শেষ। আবার চেষ্টা করুন বা নতুন কোড নিন।",
    fpP: "আপনার ইমেইল দিন, ৬ সংখ্যার একটি কোড পাঠানো হবে।", fpSend: "কোড পাঠান", fpCodeP: "{email}-এ পাঠানো কোডটি দিন, তারপর নতুন পাসওয়ার্ড বেছে নিন।",
  },
};
(Object.keys(CODES) as Lang[]).forEach((l) => Object.assign(T[l], CODES[l]));

const PRAY: Record<Lang, Record<string, string>> = {
  en: {
    navPrayer: "Prayer", prLearn: "Learn to pray", prRakTab: "Rak'ahs", prGuided: "Guided practice", prStop: "Stop",
    prTimes: "{n} times", prOptional: "Recommended, not required", prDiffH: "Scholars differ here", prSource: "Source",
    prPracticeNote: "For learning outside of prayer. Once you've memorized the words, pray without the phone.",
    prFiqhRef: "Fiqh reference: Mukhtasar Fiqh al-Salah, Dorar.net. Hadith sources are shown under each step.",
    prRakH: "How many rak'ahs?", prRakP: "Each daily prayer has a set number of rak'ahs. In the 3rd and 4th rak'ahs, recite only Al-Fatiha.",
    prRakCount: "{n} rak'ahs", prAloud: "first two recited aloud", prSilent: "recited silently", prTashahhud: "Sit for tashahhud",
    prSitLegend: "Sit for tashahhud here: after the 2nd rak'ah in longer prayers, and at the end of every prayer.", prLessons: "The prayer lessons explain each step in more detail",
    fullSurah: "Full surah, recited by our hafiz", mClaimFirst: "First click \u201cI'll take this\u201d, then you can write and send your reply.",
  },
  ar: {
    navPrayer: "الصلاة", prLearn: "تعلّم الصلاة", prRakTab: "الركعات", prGuided: "تدريب موجّه", prStop: "إيقاف",
    prTimes: "{n} مرات", prOptional: "مستحب وليس واجبًا", prDiffH: "مسألة خلافية", prSource: "المصدر",
    prPracticeNote: "للتعلم خارج الصلاة. بعد حفظ الأذكار صلِّ دون الجوال.",
    prFiqhRef: "المرجع الفقهي: مختصر فقه الصلاة، الدرر السنية. ومصادر الأحاديث تحت كل خطوة.",
    prRakH: "كم عدد الركعات؟", prRakP: "لكل صلاة مفروضة عدد محدد من الركعات. في الركعتين الثالثة والرابعة تُقرأ الفاتحة فقط.",
    prRakCount: "{n} ركعات", prAloud: "جهرية في الركعتين الأوليين", prSilent: "سرية", prTashahhud: "الجلوس للتشهد",
    prSitLegend: "اجلس للتشهد هنا: بعد الركعة الثانية في الصلاة الطويلة، وفي آخر كل صلاة.", prLessons: "دروس الصلاة تشرح كل خطوة بتفصيل أكثر",
    fullSurah: "السورة كاملة بصوت حافظ الفريق", mClaimFirst: "اضغط أولًا على «سأتولى هذا السؤال»، ثم يمكنك كتابة ردك وإرساله.",
  },
  bn: {
    navPrayer: "নামাজ", prLearn: "নামাজ শিখুন", prRakTab: "রাকাত", prGuided: "গাইডেড অনুশীলন", prStop: "থামুন",
    prTimes: "{n} বার", prOptional: "মুস্তাহাব, বাধ্যতামূলক নয়", prDiffH: "এখানে আলেমদের মতভেদ আছে", prSource: "উৎস",
    prPracticeNote: "নামাজের বাইরে শেখার জন্য। দোয়াগুলো মুখস্থ হলে ফোন ছাড়াই নামাজ পড়ুন।",
    prFiqhRef: "ফিকহ রেফারেন্স: মুখতাসার ফিকহুস সালাহ, Dorar.net। প্রতিটি ধাপের নিচে হাদিসের উৎস দেওয়া আছে।",
    prRakH: "কত রাকাত?", prRakP: "প্রতিটি ফরজ নামাজের নির্দিষ্ট রাকাত আছে। তৃতীয় ও চতুর্থ রাকাতে শুধু সূরা ফাতিহা পড়া হয়।",
    prRakCount: "{n} রাকাত", prAloud: "প্রথম দুই রাকাত উচ্চস্বরে", prSilent: "নিচু স্বরে", prTashahhud: "তাশাহহুদের জন্য বসা",
    prSitLegend: "এখানে তাশাহহুদের জন্য বসুন: দীর্ঘ নামাজে দ্বিতীয় রাকাতের পর, এবং প্রতিটি নামাজের শেষে।", prLessons: "নামাজের পাঠগুলোতে প্রতিটি ধাপ আরও বিস্তারিত বোঝানো আছে",
    fullSurah: "পূর্ণ সূরা, আমাদের হাফেজের কণ্ঠে", mClaimFirst: "প্রথমে «আমি এটি নেব» চাপুন, তারপর উত্তর লিখে পাঠাতে পারবেন।",
  },
};
(Object.keys(PRAY) as Lang[]).forEach((l) => Object.assign(T[l], PRAY[l]));

const QULS: Record<Lang, Record<string, string>> = {
  en: { qul112: "Surah Al-Ikhlas (112)", qul113: "Surah Al-Falaq (113)", qul114: "Surah An-Nas (114)" },
  ar: { qul112: "سورة الإخلاص", qul113: "سورة الفلق", qul114: "سورة الناس" },
  bn: { qul112: "সূরা আল-ইখলাস (১১২)", qul113: "সূরা আল-ফালাক (১১৩)", qul114: "সূরা আন-নাস (১১৪)" },
};
(Object.keys(QULS) as Lang[]).forEach((l) => Object.assign(T[l], QULS[l]));

const PRACTICE: Record<Lang, Record<string, string>> = {
  en: {
    ppTab: "Practice (demo)", ppWarn: "Demonstration for learning only. Watch and listen to learn the order and the words. Do not use this inside your real prayer; in your prayer, recite yourself.",
    ppRakah: "Rak'ah {r} of {n}", ppStart: "Start demonstration", ppResume: "Resume", ppPause: "Pause", ppRestart: "Restart",
    ppDone: "The prayer is complete", ppDoneP: "That is the full prayer from beginning to end. Practise it a few times, then pray on your own. Alhamdulillah!",
    ppNewH: "Still learning Al-Fatiha?", ppNewP: "The Prophet (peace be upon him) taught a man who could not yet memorize any Quran to say instead: SubhanAllah, walhamdulillah, wa la ilaha illallah, wallahu akbar, wa la hawla wa la quwwata illa billah (Sunan Abi Dawud; its chain was judged acceptable by Sh. Ibn Baz). This was until he could learn. Ask your mentor how to apply this while you learn.",
  },
  ar: {
    ppTab: "تدريب (عرض)", ppWarn: "عرض تعليمي فقط: شاهد واستمع لتتعلم الترتيب والأذكار. لا تستخدمه داخل صلاتك الحقيقية، بل اقرأ بنفسك في صلاتك.",
    ppRakah: "الركعة {r} من {n}", ppStart: "ابدأ العرض", ppResume: "متابعة", ppPause: "إيقاف مؤقت", ppRestart: "من البداية",
    ppDone: "اكتملت الصلاة", ppDoneP: "هذه الصلاة كاملة من أولها إلى آخرها. تدرّب عليها مرات، ثم صلِّ بنفسك. الحمد لله!",
    ppNewH: "ما زلت تتعلم الفاتحة؟", ppNewP: "علّم النبي صلى الله عليه وسلم رجلًا لم يستطع أن يأخذ من القرآن شيئًا أن يقول: سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر، ولا حول ولا قوة إلا بالله (سنن أبي داود، وقال الشيخ ابن باز: إسناده لا بأس به). وذلك حتى يتعلم. اسأل مرشدك كيف تطبق ذلك وأنت تتعلم.",
  },
  bn: {
    ppTab: "অনুশীলন (ডেমো)", ppWarn: "শুধু শেখার জন্য প্রদর্শন। দেখে ও শুনে ক্রম ও দোয়াগুলো শিখুন। আসল নামাজের ভেতরে এটি ব্যবহার করবেন না; নামাজে নিজে পড়ুন।",
    ppRakah: "{n} রাকাতের {r} নম্বর রাকাত", ppStart: "প্রদর্শন শুরু করুন", ppResume: "চালিয়ে যান", ppPause: "বিরতি", ppRestart: "আবার শুরু",
    ppDone: "নামাজ সম্পূর্ণ হয়েছে", ppDoneP: "শুরু থেকে শেষ পর্যন্ত এটাই পুরো নামাজ। কয়েকবার অনুশীলন করুন, তারপর নিজে নামাজ পড়ুন। আলহামদুলিল্লাহ!",
    ppNewH: "এখনো সূরা ফাতিহা শিখছেন?", ppNewP: "যে ব্যক্তি তখনো কুরআনের কিছুই মুখস্থ করতে পারেননি, নবী (সা.) তাকে এর বদলে বলতে শিখিয়েছিলেন: সুবহানাল্লাহ, ওয়ালহামদুলিল্লাহ, ওয়া লা ইলাহা ইল্লাল্লাহ, ওয়াল্লাহু আকবার, ওয়া লা হাওলা ওয়া লা কুওয়াতা ইল্লা বিল্লাহ (সুনানে আবু দাউদ; শায়খ ইবনে বায সনদটিকে গ্রহণযোগ্য বলেছেন)। এটা শেখা পর্যন্ত। শেখার সময় কীভাবে করবেন তা আপনার মেন্টরকে জিজ্ঞেস করুন।",
  },
};
(Object.keys(PRACTICE) as Lang[]).forEach((l) => Object.assign(T[l], PRACTICE[l]));

const PRACTICE2: Record<Lang, Record<string, string>> = {
  en: { ppNext: "Stand for the next rak'ah", ppNextP: "Say Allahu Akbar and stand up for the next rak'ah.", ppFatihaOnly: "In this rak'ah, recite only Surah Al-Fatiha." },
  ar: { ppNext: "القيام للركعة التالية", ppNextP: "كبّر وقم إلى الركعة التالية.", ppFatihaOnly: "في هذه الركعة تُقرأ الفاتحة فقط." },
  bn: { ppNext: "পরের রাকাতের জন্য দাঁড়ান", ppNextP: "আল্লাহু আকবার বলে পরের রাকাতের জন্য দাঁড়ান।", ppFatihaOnly: "এই রাকাতে শুধু সূরা ফাতিহা পড়া হয়।" },
};
(Object.keys(PRACTICE2) as Lang[]).forEach((l) => Object.assign(T[l], PRACTICE2[l]));

const BUSY: Record<Lang, Record<string, string>> = {
  en: { busyH: "Mu'adh is very busy right now", busyP: "Too many questions are being answered at the moment. Please try again in a minute. Your question was not lost." },
  ar: { busyH: "معاذ مشغول جدًا الآن", busyP: "هناك أسئلة كثيرة في هذه اللحظة. يرجى المحاولة بعد دقيقة، ولم يضع سؤالك." },
  bn: { busyH: "মুআয এখন খুব ব্যস্ত", busyP: "এই মুহূর্তে অনেক প্রশ্নের উত্তর দেওয়া হচ্ছে। এক মিনিট পর আবার চেষ্টা করুন। আপনার প্রশ্ন হারায়নি।" },
};
(Object.keys(BUSY) as Lang[]).forEach((l) => Object.assign(T[l], BUSY[l]));

const PW: Record<Lang, Record<string, string>> = {
  en: { pwShow: "Show password", pwHide: "Hide password" },
  ar: { pwShow: "إظهار كلمة المرور", pwHide: "إخفاء كلمة المرور" },
  bn: { pwShow: "পাসওয়ার্ড দেখান", pwHide: "পাসওয়ার্ড লুকান" },
};
(Object.keys(PW) as Lang[]).forEach((l) => Object.assign(T[l], PW[l]));

const MISC: Record<Lang, Record<string, string>> = {
  en: { skip: "Skip", setLangNote: "Mu'adh, your lessons and your mentor's replies will use this language." },
  ar: { skip: "تخطَّ", setLangNote: "سيستخدم معاذ والدروس وردود مرشدك هذه اللغة." },
  bn: { skip: "এড়িয়ে যান", setLangNote: "মুআয, আপনার পাঠ ও মেন্টরের উত্তর এই ভাষায় দেখাবে।" },
};
(Object.keys(MISC) as Lang[]).forEach((l) => Object.assign(T[l], MISC[l]));

const PHONE: Record<Lang, Record<string, string>> = {
  en: { phoneL: "Phone number", setPhoneNum: "Phone number" },
  ar: { phoneL: "رقم الجوال", setPhoneNum: "رقم الجوال" },
  bn: { phoneL: "ফোন নম্বর", setPhoneNum: "ফোন নম্বর" },
};
(Object.keys(PHONE) as Lang[]).forEach((l) => Object.assign(T[l], PHONE[l]));

const QIBLA2: Record<Lang, Record<string, string>> = {
  en: { qTap: "Tap anywhere to start the compass" },
  ar: { qTap: "اضغط في أي مكان لتشغيل البوصلة" },
  bn: { qTap: "কম্পাস চালু করতে যেকোনো জায়গায় চাপুন" },
};
(Object.keys(QIBLA2) as Lang[]).forEach((l) => Object.assign(T[l], QIBLA2[l]));

const FOOT: Record<Lang, Record<string, string>> = {
  en: { ftTag: "A gentle companion for new Muslims, with a human mentor always in the loop.", ftExplore: "Explore", ftAccount: "Account", ftSources: "Approved sources", ftRights: "Built to serve new Muslims, with trusted sources." },
  ar: { ftTag: "رفيق لطيف للمسلمين الجدد، مع مرشد حقيقي دائمًا.", ftExplore: "استكشف", ftAccount: "الحساب", ftSources: "المصادر المعتمدة", ftRights: "صُمّم لخدمة المسلمين الجدد بمصادر موثوقة." },
  bn: { ftTag: "নতুন মুসলিমদের এক কোমল সঙ্গী, সাথে সবসময় একজন সত্যিকারের মেন্টর।", ftExplore: "দেখুন", ftAccount: "অ্যাকাউন্ট", ftSources: "অনুমোদিত উৎস", ftRights: "বিশ্বস্ত উৎসের মাধ্যমে নতুন মুসলিমদের সেবায় তৈরি।" },
};
(Object.keys(FOOT) as Lang[]).forEach((l) => Object.assign(T[l], FOOT[l]));

const MORE2: Record<Lang, Record<string, string>> = {
  en: { learnerQ: "Are you a learner?", learnerLogin: "Sign in here", afterH: "After the prayer", stH: "Stories of new Muslims", stRead: "Read more", stLess: "Show less", stAnon: "A brother or sister", stShareH: "Share your story", stShareP: "How did you come to Islam? Your story can encourage others. Our team reviews every story before it is published.", stTitle: "Title", stBody: "Your story", stName: "Show my first name", stSend: "Submit for review", stSent: "JazakAllahu khairan! Your story will appear after our team reviews it.", stTab: "Stories", stApprove: "Publish", stReject: "Reject", docsH: "Certificates (optional)", docsP: "Upload up to 3 files (PDF or image), such as a degree, ijazah or experience letter. Only our admin team can see them.", docsTab: "Files" },
  ar: { learnerQ: "هل أنت متعلم؟", learnerLogin: "سجّل الدخول هنا", afterH: "بعد الصلاة", stH: "قصص المسلمين الجدد", stRead: "اقرأ المزيد", stLess: "عرض أقل", stAnon: "أخ أو أخت", stShareH: "شارك قصتك", stShareP: "كيف وصلت إلى الإسلام؟ قصتك قد تشجع غيرك. يراجع فريقنا كل قصة قبل نشرها.", stTitle: "العنوان", stBody: "قصتك", stName: "أظهر اسمي الأول", stSend: "إرسال للمراجعة", stSent: "جزاك الله خيرًا! ستظهر قصتك بعد مراجعة فريقنا.", stTab: "القصص", stApprove: "نشر", stReject: "رفض", docsH: "الشهادات (اختياري)", docsP: "ارفع حتى ٣ ملفات (PDF أو صورة) مثل شهادة أو إجازة أو خطاب خبرة. لا يراها إلا فريق الإدارة.", docsTab: "الملفات" },
  bn: { learnerQ: "আপনি কি শিক্ষার্থী?", learnerLogin: "এখানে সাইন ইন করুন", afterH: "নামাজের পরে", stH: "নতুন মুসলিমদের গল্প", stRead: "আরও পড়ুন", stLess: "কম দেখান", stAnon: "একজন ভাই বা বোন", stShareH: "আপনার গল্প শেয়ার করুন", stShareP: "আপনি কীভাবে ইসলামে এলেন? আপনার গল্প অন্যদের অনুপ্রাণিত করতে পারে। প্রকাশের আগে আমাদের টিম প্রতিটি গল্প পর্যালোচনা করে।", stTitle: "শিরোনাম", stBody: "আপনার গল্প", stName: "আমার প্রথম নাম দেখান", stSend: "পর্যালোচনার জন্য পাঠান", stSent: "জাযাকাল্লাহু খাইরান! আমাদের টিম পর্যালোচনার পর আপনার গল্প প্রকাশিত হবে।" },
};
(Object.keys(MORE2) as Lang[]).forEach((l) => Object.assign(T[l], MORE2[l]));

const AFTER: Record<Lang, Record<string, string>> = {
  en: {
    af1: "Say Astaghfirullah (I ask Allah's forgiveness) three times, then: Allahumma antas-salam wa minkas-salam, tabarakta ya dhal-jalali wal-ikram.",
    af2: "Say SubhanAllah 33 times, Alhamdulillah 33 times and Allahu Akbar 33 times, then once: La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir.",
    af3: "Recite the three Quls: Al-Ikhlas, Al-Falaq and An-Nas.", af3g: "graded authentic by al-Albani",
    afCounter: "Use the dhikr counter on your dashboard",
  },
  ar: {
    af1: "قل: أستغفر الله ثلاث مرات، ثم: اللهم أنت السلام ومنك السلام، تباركت يا ذا الجلال والإكرام.",
    af2: "سبّح الله ٣٣ مرة، واحمده ٣٣ مرة، وكبّره ٣٣ مرة، ثم قل مرة: لا إله إلا الله وحده لا شريك له، له الملك وله الحمد، وهو على كل شيء قدير.",
    af3: "اقرأ المعوذات: الإخلاص والفلق والناس.", af3g: "صححه الألباني",
    afCounter: "استخدم عدّاد الذكر في لوحتك",
  },
  bn: {
    af1: "তিনবার আস্তাগফিরুল্লাহ বলুন, তারপর: আল্লাহুম্মা আনতাস সালাম ওয়া মিনকাস সালাম, তাবারাকতা ইয়া যাল জালালি ওয়াল ইকরাম।",
    af2: "৩৩ বার সুবহানাল্লাহ, ৩৩ বার আলহামদুলিল্লাহ ও ৩৩ বার আল্লাহু আকবার বলুন, তারপর একবার: লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারিকা লাহ, লাহুল মুলকু ওয়া লাহুল হামদ, ওয়া হুয়া আলা কুল্লি শাইয়িন কাদির।",
    af3: "তিন কুল পড়ুন: সূরা ইখলাস, ফালাক ও নাস।", af3g: "আলবানি সহীহ বলেছেন",
    afCounter: "ড্যাশবোর্ডের যিকির কাউন্টার ব্যবহার করুন",
  },
};
(Object.keys(AFTER) as Lang[]).forEach((l) => Object.assign(T[l], AFTER[l]));

const FIX7: Record<Lang, Record<string, string>> = {
  en: { nameL: "Full name", setName: "Full name", stMin: "{n} more characters needed", stShort: "Please write a little more: a title and at least 30 characters.", stNotReady: "Stories aren't switched on yet. Please try again later." },
  ar: { nameL: "الاسم الكامل", setName: "الاسم الكامل", stMin: "تحتاج {n} حرفًا إضافيًا", stShort: "اكتب قليلًا أكثر: عنوانًا و٣٠ حرفًا على الأقل.", stNotReady: "خاصية القصص غير مفعّلة بعد. حاول لاحقًا." },
  bn: { nameL: "পূর্ণ নাম", setName: "পূর্ণ নাম", stMin: "আরও {n}টি অক্ষর লাগবে", stShort: "আরেকটু লিখুন: একটি শিরোনাম ও কমপক্ষে ৩০টি অক্ষর।", stNotReady: "গল্পের অংশটি এখনো চালু হয়নি। পরে চেষ্টা করুন।" },
};
(Object.keys(FIX7) as Lang[]).forEach((l) => Object.assign(T[l], FIX7[l]));
