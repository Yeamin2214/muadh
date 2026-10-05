/* Text for joining as a mentor: landing section, application, mentor sign in, application status. */
import T, { type Lang } from "./text-app";

const EN: Record<string, string> = {
  lnMentorNav: "For mentors", lnMentorT: "Are you a da'i?", lnMentorP: "Join Mu'adh as a mentor and follow up with new Muslims in their own language. You reply in Arabic, and they receive it in theirs. Every mentor is verified before joining.",
  mApplyBtn: "Apply as a mentor", mLoginBtn: "Mentor sign in", authMentorQ: "Are you a da'i?",
  maH: "Apply to become a mentor", maP: "Our team verifies every mentor before they can see any question. This keeps new Muslims safe.",
  maAccount: "Your account", maContact: "Contact and location", maBackground: "Your background",
  maFull: "Full name", maPhone: "Phone number, for verification", maLocation: "Country and city", maOrg: "Organisation or da'wah centre", maPos: "Your role there",
  maLangs: "Languages you can work in", maQual: "Islamic studies and qualifications", maQualPh: "For example: degree in Shariah, ijazah, courses, years of teaching",
  maExp: "Years of experience with new Muslims", maGenderWhy: "Brothers are matched with brothers, and sisters with sisters.",
  maAgree: "I will answer only within my knowledge, refer what I am unsure of, and keep every learner's information private.",
  maSubmit: "Submit application", maMissing: "Please fill in all required fields and accept the guidelines.",
  maLearnerAcc: "You're signed in with a learner account. Please sign out first to apply as a mentor.",
  mlH: "Mentor sign in", mlP: "For verified mentors and applicants.", mlNoAcc: "Not a mentor yet?", mlApply: "Apply to join",
  msH: "Your mentor application", msPending: "Your application has been received and is waiting for review. We'll contact you after checking your details, In shaa Allah.",
  msRejected: "Your application wasn't approved yet.", msReason: "Note from our team", msUpdate: "Update my application",
  msLearner: "This is a learner account. Mentor accounts are separate.", msGoDash: "Go to my dashboard", msSubmitted: "Submitted on {d}",
};
const AR: Record<string, string> = {
  lnMentorNav: "للمرشدين", lnMentorT: "هل أنت داعية؟", lnMentorP: "انضم إلى معاذ مرشدًا وتابع المسلمين الجدد بلغتهم. تكتب ردك بالعربية ويصلهم بلغتهم. نتحقق من كل مرشد قبل انضمامه.",
  mApplyBtn: "قدّم طلب الانضمام كمرشد", mLoginBtn: "دخول المرشدين", authMentorQ: "هل أنت داعية؟",
  maH: "طلب الانضمام كمرشد", maP: "يتحقق فريقنا من كل مرشد قبل أن يطّلع على أي سؤال، حفاظًا على المسلمين الجدد.",
  maAccount: "حسابك", maContact: "التواصل والموقع", maBackground: "خلفيتك",
  maFull: "الاسم الكامل", maPhone: "رقم الجوال للتحقق", maLocation: "الدولة والمدينة", maOrg: "الجهة أو مكتب الدعوة", maPos: "دورك فيها",
  maLangs: "اللغات التي تعمل بها", maQual: "الدراسة الشرعية والمؤهلات", maQualPh: "مثال: شهادة في الشريعة، إجازة، دورات، سنوات التدريس",
  maExp: "سنوات الخبرة مع المسلمين الجدد", maGenderWhy: "يُربط الإخوة بالإخوة والأخوات بالأخوات.",
  maAgree: "ألتزم بالإجابة في حدود علمي، وإحالة ما لا أتيقن منه، والحفاظ على خصوصية كل متعلم.",
  maSubmit: "إرسال الطلب", maMissing: "يرجى تعبئة جميع الحقول المطلوبة والموافقة على الإرشادات.",
  maLearnerAcc: "أنت مسجّل بحساب متعلم. يرجى تسجيل الخروج أولًا للتقديم كمرشد.",
  mlH: "دخول المرشدين", mlP: "للمرشدين المعتمدين والمتقدمين.", mlNoAcc: "لست مرشدًا بعد؟", mlApply: "قدّم طلبك",
  msH: "طلب الانضمام كمرشد", msPending: "استلمنا طلبك وهو قيد المراجعة. سنتواصل معك بعد التحقق من بياناتك إن شاء الله.",
  msRejected: "لم تتم الموافقة على طلبك بعد.", msReason: "ملاحظة من فريقنا", msUpdate: "تحديث طلبي",
  msLearner: "هذا حساب متعلم. حسابات المرشدين منفصلة.", msGoDash: "اذهب إلى لوحتي", msSubmitted: "أُرسل في {d}",
};
const BN: Record<string, string> = {
  lnMentorNav: "মেন্টরদের জন্য", lnMentorT: "আপনি কি একজন দাঈ?", lnMentorP: "মেন্টর হিসেবে মুআযে যোগ দিন এবং নতুন মুসলিমদের তাদের নিজের ভাষায় পাশে থাকুন। আপনি আরবিতে উত্তর দেবেন, তারা পাবেন নিজের ভাষায়। যোগ দেওয়ার আগে প্রত্যেক মেন্টর যাচাই করা হয়।",
  mApplyBtn: "মেন্টর হিসেবে আবেদন করুন", mLoginBtn: "মেন্টর সাইন ইন", authMentorQ: "আপনি কি একজন দাঈ?",
};
const ADD: Record<Lang, Record<string, string>> = { en: EN, ar: AR, bn: BN };
(Object.keys(ADD) as Lang[]).forEach((l) => Object.assign(T[l], ADD[l]));
export default T;

const TESTED: Record<Lang, Record<string, string>> = {
  en: { lnTestedT: "Tested before launch", lnTestedP: "We ran {n} test questions through Mu'adh, including fake hadith and personal questions.", lnT1: "correct behaviour", lnT2: "answers with a source on every sentence", lnT3: "fake hadith not presented as authentic", lnT4: "personal and disputed questions sent to a human" },
  ar: { lnTestedT: "مُختبَر قبل الإطلاق", lnTestedP: "اختبرنا معاذ بـ{n} سؤالًا، منها أحاديث مكذوبة وأسئلة شخصية.", lnT1: "سلوك صحيح", lnT2: "إجابات بمصدر لكل جملة", lnT3: "أحاديث مكذوبة لم تُعرض على أنها صحيحة", lnT4: "أسئلة شخصية وخلافية أُحيلت إلى إنسان" },
  bn: { lnTestedT: "চালুর আগে পরীক্ষিত", lnTestedP: "জাল হাদিস ও ব্যক্তিগত প্রশ্নসহ {n}টি পরীক্ষামূলক প্রশ্ন দিয়ে মুআয যাচাই করা হয়েছে।", lnT1: "সঠিক আচরণ", lnT2: "প্রতিটি বাক্যে উৎসসহ উত্তর", lnT3: "জাল হাদিসকে সহীহ হিসেবে দেখানো হয়নি", lnT4: "ব্যক্তিগত ও মতভেদপূর্ণ প্রশ্ন মানুষের কাছে পাঠানো হয়েছে" },
};
(Object.keys(TESTED) as Lang[]).forEach((l) => Object.assign(T[l], TESTED[l]));
