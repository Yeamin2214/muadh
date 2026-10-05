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
