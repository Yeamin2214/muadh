/* Text for the mentor portal and demo buttons. Mentors work in Arabic, with English available. */
import T, { type Lang } from "./text-app";

const EN: Record<string, string> = {
  mTitle: "Mentor portal", mBrothers: "Brothers' inbox", mSisters: "Sisters' inbox",
  mOpen: "Open", mMine: "Mine", mAnswered: "Answered", mEmpty: "No questions here right now. Alhamdulillah.",
  mPick: "Choose a question from the list.", mClaim: "I'll take this", mRelease: "Release", mOther: "Another mentor is handling this",
  mOriginal: "Original question", mReply: "Your reply", mReplyHint: "Write in Arabic or English. The learner receives it in their own language.", bellNewQ: "New question from {name}", mDraft: "AI-suggested draft. Review and edit it before sending.",
  mCheck: "Preview what the learner receives", mBack: "What the learner will receive ({lang})", mSend: "Approve and send",
  mSent: "Sent in the learner's language", mReceived: "What the learner received", mContact: "Agreed to be contacted",
  mBefore: "You helped this learner before", mNotMentor: "This page is for mentors only.",
  r_level_d: "Personal case", r_level_c: "Scholars differ", r_no_source: "No clear source", r_low_confidence: "No clear source", r_crisis: "Urgent: needs support now",
  l_en: "English", l_ar: "Arabic", l_bn: "Bangla",
  demoH: "Just looking around?", demoLearner: "Try the learner demo", demoMentor: "Try the mentor demo", demoMentorF: "Sisters' mentor demo",
  demoFail: "The demo isn't available right now. Please try again shortly.",
};
const AR: Record<string, string> = {
  mTitle: "بوابة المرشد", mBrothers: "صندوق الإخوة", mSisters: "صندوق الأخوات",
  mOpen: "المفتوحة", mMine: "أسئلتي", mAnswered: "تم الرد", mEmpty: "لا توجد أسئلة هنا الآن. الحمد لله.",
  mPick: "اختر سؤالًا من القائمة.", mClaim: "سأتولى هذا السؤال", mRelease: "إلغاء التولي", mOther: "يتولاه مرشد آخر",
  mOriginal: "السؤال الأصلي", mReply: "ردّك", mReplyHint: "اكتب بالعربية أو الإنجليزية، ويصل ردك إلى المتعلم بلغته.", bellNewQ: "سؤال جديد من {name}", mDraft: "مسودة مقترحة من الذكاء الاصطناعي، راجعها وعدّلها قبل الإرسال.",
  mCheck: "معاينة ما سيصل إلى المتعلم", mBack: "ما سيصل إلى المتعلم ({lang})", mSend: "اعتماد وإرسال",
  mSent: "أُرسل الرد إلى المتعلم بلغته", mReceived: "ما وصل إلى المتعلم", mContact: "وافق على التواصل",
  mBefore: "سبق أن ساعدت هذا المتعلم", mNotMentor: "هذه الصفحة للمرشدين فقط.",
  r_level_d: "حالة شخصية", r_level_c: "مسألة خلافية", r_no_source: "لا يوجد مصدر واضح", r_low_confidence: "لا يوجد مصدر واضح", r_crisis: "عاجل: يحتاج دعمًا فوريًا",
  l_en: "الإنجليزية", l_ar: "العربية", l_bn: "البنغالية",
  demoH: "تريد التجربة فقط؟", demoLearner: "جرّب حساب المتعلم", demoMentor: "جرّب حساب المرشد", demoMentorF: "تجربة مرشدة الأخوات",
  demoFail: "التجربة غير متاحة الآن. حاول بعد قليل.",
};
const BN: Record<string, string> = {
  ...EN,
  mTitle: "মেন্টর পোর্টাল", mBrothers: "ভাইদের ইনবক্স", mSisters: "বোনদের ইনবক্স",
  mOpen: "খোলা", mMine: "আমার", mAnswered: "উত্তর দেওয়া", mEmpty: "এখন এখানে কোনো প্রশ্ন নেই। আলহামদুলিল্লাহ।",
  mPick: "তালিকা থেকে একটি প্রশ্ন বেছে নিন।", mClaim: "আমি এটি নেব", mRelease: "ছেড়ে দিন", mOther: "অন্য একজন মেন্টর এটি দেখছেন",
  mOriginal: "মূল প্রশ্ন", mReply: "আপনার উত্তর", mReplyHint: "আরবি বা ইংরেজিতে লিখুন। শিক্ষার্থী নিজের ভাষায় পাবেন।",
  mDraft: "এআই-প্রস্তাবিত খসড়া। পাঠানোর আগে দেখে সম্পাদনা করুন।", mCheck: "শিক্ষার্থী যা পাবেন তা দেখুন", mBack: "শিক্ষার্থী যা পাবেন ({lang})",
  mSend: "অনুমোদন করে পাঠান", mSent: "শিক্ষার্থীর ভাষায় পাঠানো হয়েছে", mReceived: "শিক্ষার্থী যা পেয়েছেন", mContact: "যোগাযোগে সম্মত",
  mBefore: "আপনি আগে এই শিক্ষার্থীকে সাহায্য করেছেন", mNotMentor: "এই পাতা শুধু মেন্টরদের জন্য।", bellNewQ: "{name}-এর নতুন প্রশ্ন",
  r_level_d: "ব্যক্তিগত বিষয়", r_level_c: "আলেমদের মধ্যে মতভেদ", r_no_source: "স্পষ্ট উৎস নেই", r_low_confidence: "স্পষ্ট উৎস নেই", r_crisis: "জরুরি: এখনই সহায়তা দরকার",
  l_en: "ইংরেজি", l_ar: "আরবি", l_bn: "বাংলা",
  demoH: "শুধু ঘুরে দেখতে চান?", demoLearner: "শিক্ষার্থী ডেমো দেখুন", demoMentor: "মেন্টর ডেমো দেখুন", demoMentorF: "বোনদের মেন্টর ডেমো",
  demoFail: "ডেমো এখন পাওয়া যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।",
};
const ADD: Record<Lang, Record<string, string>> = { en: EN, ar: AR, bn: BN };
(Object.keys(ADD) as Lang[]).forEach((l) => Object.assign(T[l], ADD[l]));
export default T;
