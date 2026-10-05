/**
 * How to pray, step by step (a two-rak'ah prayer such as Fajr).
 * Teaches what the four schools agree on, with the hadith source for each phrase.
 * Where the schools differ, a neutral note explains that the difference exists, without choosing one
 * (Scientific Package: no automatic preference between recognized opinions).
 * Fiqh reference: Mukhtasar Fiqh al-Salah, Dorar.net (supervised by Sh. Alawi al-Saqqaf).
 */
type T3 = { en: string; ar: string; bn: string };
export type Pose = "stand" | "takbir" | "ruku" | "sujood" | "sit";
export type Phrase = { audio?: string[]; ar: string; tr: string; en: string; bn: string; times?: number; optional?: boolean; surah?: [number, number] };
export type PrayerStep = { id: string; pose: Pose; title: T3; do: T3; say?: Phrase[]; src?: string; diff?: "hands" | "raise" };

const FATIHA = Array.from({ length: 7 }, (_, i) => `https://everyayah.com/data/Alafasy_128kbps/00100${i + 1}.mp3`);
const TAKBIR: Phrase = { audio: ["/audio/takbir.m4a"], ar: "اللَّهُ أَكْبَرُ", tr: "Allahu Akbar", en: "Allah is the Greatest.", bn: "আল্লাহ সবচেয়ে মহান।" };

export const PRAYER_STEPS: PrayerStep[] = [
  {
    id: "intention", pose: "stand", src: "Bukhari 1, Muslim 1907",
    title: { en: "Intention", ar: "النية", bn: "নিয়ত" },
    do: {
      en: "Stand facing the Qibla. Intend in your heart which prayer you are praying, for example Fajr. The intention is in the heart; you don't need to say it aloud.",
      ar: "قف مستقبلًا القبلة، وانوِ بقلبك الصلاة التي تصليها، مثل صلاة الفجر. النية محلها القلب، ولا يلزم التلفظ بها.",
      bn: "কিবলার দিকে মুখ করে দাঁড়ান। কোন নামাজ পড়ছেন, যেমন ফজর, তা মনে মনে নিয়ত করুন। নিয়ত অন্তরে হয়, মুখে বলা জরুরি নয়।",
    },
  },
  {
    id: "takbir", pose: "takbir", src: "Bukhari 735, Muslim 390", say: [TAKBIR],
    title: { en: "Opening takbir", ar: "تكبيرة الإحرام", bn: "তাকবিরে তাহরিমা" },
    do: {
      en: "Raise your hands to the level of your shoulders or ears, and say:",
      ar: "ارفع يديك حذو منكبيك أو أذنيك، وقل:",
      bn: "দুই হাত কাঁধ বা কান বরাবর তুলুন এবং বলুন:",
    },
  },
  {
    id: "recite", pose: "stand", src: "Bukhari 756, Muslim 401", diff: "hands",
    title: { en: "Standing and recitation", ar: "القيام والقراءة", bn: "দাঁড়ানো ও কিরাত" },
    do: {
      en: "Place your right hand over your left. Recite Surah Al-Fatiha, then a short surah such as Al-Ikhlas.",
      ar: "ضع يدك اليمنى على اليسرى، واقرأ سورة الفاتحة، ثم سورة قصيرة مثل سورة الإخلاص.",
      bn: "ডান হাত বাম হাতের ওপর রাখুন। সূরা আল-ফাতিহা পড়ুন, তারপর সূরা আল-ইখলাসের মতো একটি ছোট সূরা পড়ুন।",
    },
    say: [
      { audio: FATIHA, surah: [1, 7], ar: "سُورَةُ الْفَاتِحَةِ", tr: "Surah Al-Fatiha", en: "The Opening chapter of the Quran. It is recited in every rak'ah.", bn: "কুরআনের প্রথম সূরা। প্রতিটি রাকাতে পড়া হয়।" },
      { audio: ["/audio/qul-112.m4a"], surah: [112, 4], ar: "سُورَةُ الْإِخْلَاصِ", tr: "Surah Al-Ikhlas", en: "A short surah, recited after Al-Fatiha in the first two rak'ahs.", bn: "একটি ছোট সূরা, প্রথম দুই রাকাতে ফাতিহার পরে পড়া হয়।" },
    ],
  },
  {
    id: "ruku", pose: "ruku", src: "Muslim 772", diff: "raise",
    title: { en: "Bowing (ruku)", ar: "الركوع", bn: "রুকু" },
    do: {
      en: "Say Allahu Akbar and bow, with your hands on your knees and your back straight. Then say three times:",
      ar: "كبّر واركع، واضعًا يديك على ركبتيك ومستويًا بظهرك، ثم قل ثلاث مرات:",
      bn: "আল্লাহু আকবার বলে রুকুতে যান, হাত হাঁটুর ওপর রাখুন ও পিঠ সোজা রাখুন। তারপর তিনবার বলুন:",
    },
    say: [TAKBIR, { audio: ["/audio/ruku.m4a"], ar: "سُبْحَانَ رَبِّيَ الْعَظِيمِ", tr: "Subhana Rabbiyal 'Azim", en: "Glory be to my Lord, the Most Great.", bn: "আমার মহান রবের পবিত্রতা ঘোষণা করছি।", times: 3 }],
  },
  {
    id: "rise", pose: "stand", src: "Bukhari 789, 796, 799",
    title: { en: "Rising from bowing", ar: "الرفع من الركوع", bn: "রুকু থেকে ওঠা" },
    do: {
      en: "Rise back up to standing while saying the first phrase. Once standing straight, say the second. The third is a recommended addition.",
      ar: "ارفع من الركوع قائلًا العبارة الأولى، فإذا استويت قائمًا فقل الثانية، والثالثة زيادة مستحبة.",
      bn: "প্রথম বাক্যটি বলতে বলতে সোজা হয়ে দাঁড়ান। সোজা হলে দ্বিতীয়টি বলুন। তৃতীয়টি বলা উত্তম।",
    },
    say: [
      { audio: ["/audio/sami.m4a"], ar: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ", tr: "Sami'Allahu liman hamidah", en: "Allah hears whoever praises Him.", bn: "যে আল্লাহর প্রশংসা করে, আল্লাহ তা শোনেন।" },
      { audio: ["/audio/rabbana.m4a"], ar: "رَبَّنَا لَكَ الْحَمْدُ", tr: "Rabbana lakal hamd", en: "Our Lord, to You belongs all praise.", bn: "হে আমাদের রব, সব প্রশংসা আপনারই।" },
      { audio: ["/audio/hamdan.m4a"], ar: "حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ", tr: "Hamdan kathiran tayyiban mubarakan fih", en: "Abundant, good and blessed praise.", bn: "অনেক পবিত্র ও বরকতময় প্রশংসা।", optional: true },
    ],
  },
  {
    id: "sujood", pose: "sujood", src: "Bukhari 812, Muslim 772",
    title: { en: "Prostration (sujood)", ar: "السجود", bn: "সিজদা" },
    do: {
      en: "Say Allahu Akbar and prostrate on seven parts: forehead with nose, both palms, both knees and the toes of both feet. Then say three times:",
      ar: "كبّر واسجد على سبعة أعظم: الجبهة مع الأنف، والكفين، والركبتين، وأطراف القدمين، ثم قل ثلاث مرات:",
      bn: "আল্লাহু আকবার বলে সাতটি অঙ্গের ওপর সিজদা করুন: নাকসহ কপাল, দুই হাতের তালু, দুই হাঁটু ও দুই পায়ের আঙুল। তারপর তিনবার বলুন:",
    },
    say: [TAKBIR, { audio: ["/audio/sujood.m4a"], ar: "سُبْحَانَ رَبِّيَ الْأَعْلَى", tr: "Subhana Rabbiyal A'la", en: "Glory be to my Lord, the Most High.", bn: "আমার সর্বোচ্চ রবের পবিত্রতা ঘোষণা করছি।", times: 3 }],
  },
  {
    id: "between", pose: "sit", src: "Abu Dawud 874, graded authentic by al-Albani (Dorar.net)",
    title: { en: "Sitting between prostrations", ar: "الجلوس بين السجدتين", bn: "দুই সিজদার মাঝে বসা" },
    do: {
      en: "Say Allahu Akbar and sit up calmly, then say the words below. Then say Allahu Akbar and make a second prostration, exactly like the first.",
      ar: "كبّر واجلس مطمئنًا وقل ما يلي، ثم كبّر واسجد السجدة الثانية مثل الأولى.",
      bn: "আল্লাহু আকবার বলে শান্তভাবে উঠে বসুন এবং নিচের কথাটি বলুন। তারপর আল্লাহু আকবার বলে প্রথমটির মতোই দ্বিতীয় সিজদা করুন।",
    },
    say: [{ ar: "رَبِّ اغْفِرْ لِي", tr: "Rabbighfir li", en: "My Lord, forgive me.", bn: "হে আমার রব, আমাকে ক্ষমা করুন।", times: 2 }],
  },
  {
    id: "second", pose: "stand",
    title: { en: "The second rak'ah", ar: "الركعة الثانية", bn: "দ্বিতীয় রাকাত" },
    do: {
      en: "Say Allahu Akbar and stand up for the second rak'ah. Repeat the same steps: Al-Fatiha, a short surah, bowing, rising, and two prostrations.",
      ar: "كبّر وقم إلى الركعة الثانية، وكرر الخطوات نفسها: الفاتحة، وسورة قصيرة، والركوع، والرفع منه، والسجدتين.",
      bn: "আল্লাহু আকবার বলে দ্বিতীয় রাকাতের জন্য দাঁড়ান। একই ধাপগুলো আবার করুন: ফাতিহা, ছোট সূরা, রুকু, রুকু থেকে ওঠা ও দুই সিজদা।",
    },
  },
  {
    id: "tashahhud", pose: "sit", src: "Bukhari 831, Muslim 402",
    title: { en: "Tashahhud", ar: "التشهد", bn: "তাশাহহুদ" },
    do: {
      en: "After the second prostration of the second rak'ah, stay sitting and recite the tashahhud:",
      ar: "بعد السجدة الثانية من الركعة الثانية، اجلس واقرأ التشهد:",
      bn: "দ্বিতীয় রাকাতের দ্বিতীয় সিজদার পর বসে থাকুন এবং তাশাহহুদ পড়ুন:",
    },
    say: [{
      audio: ["/audio/tashahhud.m4a"],
      ar: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
      tr: "At-tahiyyatu lillahi was-salawatu wat-tayyibat. As-salamu 'alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh. As-salamu 'alayna wa 'ala 'ibadillahis-salihin. Ash-hadu an la ilaha illallah, wa ash-hadu anna Muhammadan 'abduhu wa rasuluh.",
      en: "All greetings, prayers and good things are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and Messenger.",
      bn: "সব সম্ভাষণ, নামাজ ও পবিত্র বিষয় আল্লাহর জন্য। হে নবী, আপনার ওপর শান্তি, আল্লাহর রহমত ও বরকত বর্ষিত হোক। আমাদের ওপর ও আল্লাহর নেক বান্দাদের ওপর শান্তি বর্ষিত হোক। আমি সাক্ষ্য দিচ্ছি, আল্লাহ ছাড়া কোনো ইলাহ নেই, এবং আমি সাক্ষ্য দিচ্ছি, মুহাম্মাদ তাঁর বান্দা ও রাসূল।",
    }],
  },
  {
    id: "durood", pose: "sit", src: "Bukhari 3370, Muslim 406",
    title: { en: "Blessings on the Prophet", ar: "الصلاة على النبي", bn: "দরুদ" },
    do: { en: "Still sitting, send blessings on the Prophet (peace be upon him):", ar: "وأنت جالس، صلِّ على النبي صلى الله عليه وسلم:", bn: "বসে থেকেই নবী (সা.)-এর ওপর দরুদ পড়ুন:" },
    say: [{
      audio: ["/audio/durood.m4a"],
      ar: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
      tr: "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad...",
      en: "O Allah, send prayers upon Muhammad and the family of Muhammad, as You sent prayers upon Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious.",
      bn: "হে আল্লাহ, মুহাম্মাদ ও তাঁর পরিবারের ওপর রহমত বর্ষণ করুন, যেমন ইবরাহীম ও তাঁর পরিবারের ওপর করেছেন; নিশ্চয় আপনি প্রশংসিত, মহিমান্বিত। হে আল্লাহ, মুহাম্মাদ ও তাঁর পরিবারের ওপর বরকত দিন, যেমন ইবরাহীম ও তাঁর পরিবারের ওপর দিয়েছেন; নিশ্চয় আপনি প্রশংসিত, মহিমান্বিত।",
    }],
  },
  {
    id: "dua", pose: "sit", src: "Bukhari 834, Muslim 2705",
    title: { en: "Dua before the salam", ar: "الدعاء قبل السلام", bn: "সালামের আগের দোয়া" },
    do: { en: "Before ending the prayer, you may ask Allah with this dua:", ar: "قبل السلام، ادعُ الله بهذا الدعاء:", bn: "সালাম ফেরানোর আগে এই দোয়াটি পড়তে পারেন:" },
    say: [{
      audio: ["/audio/before-salam.m4a"],
      ar: "اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا، وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ، فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ، وَارْحَمْنِي، إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ",
      tr: "Allahumma inni zalamtu nafsi zulman kathiran...",
      en: "O Allah, I have wronged myself greatly, and no one forgives sins except You. So forgive me with forgiveness from You, and have mercy on me. You are the Forgiving, the Merciful.",
      bn: "হে আল্লাহ, আমি নিজের ওপর অনেক জুলুম করেছি, আর আপনি ছাড়া কেউ গুনাহ মাফ করতে পারে না। তাই আপনার পক্ষ থেকে আমাকে ক্ষমা করুন এবং আমার ওপর রহম করুন। নিশ্চয় আপনি ক্ষমাশীল, পরম দয়ালু।",
      optional: true,
    }],
  },
  {
    id: "salam", pose: "sit", src: "Muslim 582",
    title: { en: "Ending with salam", ar: "التسليم", bn: "সালাম ফেরানো" },
    do: {
      en: "Turn your head to the right and say the words below, then turn to the left and say them again. Your prayer is complete. Alhamdulillah!",
      ar: "التفت إلى اليمين وقل ما يلي، ثم إلى اليسار وقله مرة أخرى. وبذلك تتم صلاتك، الحمد لله!",
      bn: "ডান দিকে মুখ ফিরিয়ে নিচের কথাটি বলুন, তারপর বাম দিকে ফিরে আবার বলুন। আপনার নামাজ শেষ। আলহামদুলিল্লাহ!",
    },
    say: [{ audio: ["/audio/salam.m4a"], ar: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ", tr: "Assalamu 'alaykum wa rahmatullah", en: "Peace be upon you and the mercy of Allah.", bn: "আপনাদের ওপর শান্তি ও আল্লাহর রহমত বর্ষিত হোক।", times: 2 }],
  },
];

/** Neutral notes where the four schools differ. We show that the difference exists and never choose for the learner. */
export const DIFFERENCES: Record<"hands" | "raise", T3> = {
  hands: {
    en: "Where the hands are placed while standing (on the chest, below it, or by the sides) differs between the schools of fiqh. All follow evidence. Pray as your local mosque or your mentor teaches.",
    ar: "يختلف الفقهاء في موضع اليدين أثناء القيام (على الصدر أو تحته أو إرسالهما)، ولكلٍّ دليله. صلِّ كما يُعلّمك مسجدك أو مرشدك.",
    bn: "দাঁড়ানো অবস্থায় হাত কোথায় রাখা হবে (বুকে, তার নিচে, বা দুই পাশে ছেড়ে) তা নিয়ে ফিকহের মাজহাবগুলোর মধ্যে ভিন্নমত আছে, সবারই দলিল আছে। আপনার মসজিদ বা মেন্টর যেভাবে শেখান সেভাবে পড়ুন।",
  },
  raise: {
    en: "Raising the hands again when bowing and rising is the practice of the Shafi'i and Hanbali schools; the Hanafi school and much of the Maliki school raise them only at the opening takbir. Both follow evidence. Pray as your local mosque or your mentor teaches.",
    ar: "رفع اليدين عند الركوع والرفع منه هو قول الشافعية والحنابلة، والحنفية وكثير من المالكية يقتصرون على تكبيرة الإحرام، ولكلٍّ دليله. صلِّ كما يُعلّمك مسجدك أو مرشدك.",
    bn: "রুকুতে যাওয়া ও ওঠার সময় আবার হাত তোলা শাফেয়ি ও হাম্বলি মাজহাবের আমল; হানাফি ও অনেক মালেকি আলেম শুধু শুরুর তাকবিরে হাত তোলেন। উভয়েরই দলিল আছে। আপনার মসজিদ বা মেন্টর যেভাবে শেখান সেভাবে পড়ুন।",
  },
};

/** Rak'ahs per prayer, and whether the first two are recited aloud. */
export const RAKAHS = [
  { count: 2, aloud: true }, { count: 4, aloud: false }, { count: 4, aloud: false }, { count: 3, aloud: true }, { count: 4, aloud: true },
];
