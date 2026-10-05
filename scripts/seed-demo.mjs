// Creates the demo accounts and synthetic sample data for judging.
// Run once: node scripts/seed-demo.mjs   (safe to run again; it resets the demo data)
import { createClient } from "@supabase/supabase-js";

try { process.loadEnvFile(".env.local"); } catch { /* use the existing environment */ }
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SECRET_KEY, password = process.env.DEMO_PASSWORD;
if (!url || !key || !password) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY and DEMO_PASSWORD in .env.local");
const db = createClient(url, key, { auth: { persistSession: false } });

const ACCOUNTS = [
  { email: "learner.demo@muadh.app", name: "Karim", gender: "male", language: "en", role: "learner", lessons: 10 },
  { email: "rahim.demo@muadh.app", name: "Rahim", gender: "male", language: "bn", role: "learner", lessons: 4 },
  { email: "yusuf.demo@muadh.app", name: "Yusuf", gender: "male", language: "en", role: "learner", lessons: 7 },
  { email: "sister.demo@muadh.app", name: "Maryam", gender: "female", language: "bn", role: "learner", lessons: 6 },
  { email: "mentor.demo@muadh.app", name: "Ustadh Abdullah", gender: "male", language: "ar", role: "mentor" },
  { email: "sister-mentor.demo@muadh.app", name: "Ustadha Aisha", gender: "female", language: "ar", role: "mentor" },
];

async function account(a) {
  const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
  let user = list.users.find((u) => u.email === a.email);
  if (!user) {
    const { data, error } = await db.auth.admin.createUser({
      email: a.email, password, email_confirm: true, user_metadata: { name: a.name, gender: a.gender, language: a.language },
    });
    if (error) throw error;
    user = data.user;
  } else {
    await db.auth.admin.updateUserById(user.id, { password });
  }
  const lessons = Array.from({ length: a.lessons ?? 0 }, (_, i) => String(i + 1));
  await db.from("profiles").update({
    role: a.role, name: a.name, gender: a.gender, language: a.language,
    reads_arabic: a.role === "mentor" ? 2 : 0, work_pattern: a.email.startsWith("learner") ? 1 : 0, lessons_done: lessons,
    phone: a.name === "Rahim" ? "+966 5X XXX XXXX" : null, phone_consent: a.name === "Rahim",
  }).eq("id", user.id);
  console.log("ready:", a.email, `(${a.role})`);
  return user.id;
}

const ids = {};
for (const a of ACCOUNTS) ids[a.name] = await account(a);

// Fresh sample data: remove old demo chats and questions (tickets go with them).
await db.from("conversations").delete().in("learner_id", Object.values(ids));
await db.from("questions").delete().in("learner_id", Object.values(ids));

async function referred(learner, lang, text, questionAr, reason, opts = {}) {
  const { data: chat } = await db.from("conversations").insert({ learner_id: ids[learner], title: text.slice(0, 60) }).select("id").single();
  const { data: q } = await db.from("questions").insert({
    learner_id: ids[learner], conversation_id: chat.id, text, lang, norm: text.toLowerCase(), level: reason === "level_c" ? "C" : "D",
    action: reason === "crisis" ? "crisis" : "refer", answer: { action: "refer", level: "D", reason }, trace: { demo: true },
  }).select("id").single();
  await db.from("tickets").insert({
    question_id: q.id, learner_id: ids[learner], gender: opts.gender ?? "male", reason, urgent: reason === "crisis",
    original: text, original_lang: lang, question_ar: questionAr, draft_ar: opts.draft ?? null,
    status: opts.reply ? "answered" : "new", claimed_by: opts.reply ? ids[opts.by] : null,
    reply_ar: opts.reply?.ar ?? null, reply_learner: opts.reply?.learner ?? null, answered_at: opts.reply ? new Date().toISOString() : null,
  });
}

// Brothers' inbox (male mentor)
await referred("Rahim", "bn", "আমার বাবা-মা চান আমি আগের ধর্মের উৎসবে যাই, আমি কি যেতে পারব?",
  "والداي يريدان أن أحضر عيد ديني السابق، فهل يجوز لي الذهاب؟", "level_d",
  { draft: "أخي الكريم، جزاك الله خيرًا على حرصك على برّ والديك، فهذا من الإسلام. مسألة حضور الأعياد تختلف بحسب التفاصيل، فأخبرني أكثر عن طبيعة المناسبة وما يحدث فيها لأساعدك." });
await referred("Yusuf", "en", "My wife is Christian. Is our marriage still valid now that I am Muslim?",
  "زوجتي مسيحية، فهل ما زال زواجنا صحيحًا بعد إسلامي؟", "level_d",
  { draft: "أخي الكريم، سؤالك مهم ويحتاج إلى معرفة تفاصيل حالتك. سأتواصل معك قريبًا إن شاء الله لنتحدث عنه." });
await referred("Yusuf", "en", "Does touching a woman break wudu?", "هل لمس المرأة ينقض الوضوء؟", "level_c");
await referred("Karim", "en", "Can I pray all five prayers together at night because of my shift?",
  "هل يجوز لي أن أصلي الصلوات الخمس معًا في الليل بسبب مناوبتي؟", "level_d", {
    by: "Ustadh Abdullah",
    reply: {
      ar: "أخي الكريم، لا تُجمع الصلوات الخمس كلها في وقت واحد. صلِّ كل صلاة في وقتها قدر استطاعتك، واستفد من فترات الراحة في عملك. وسأتواصل معك لنرتب جدولك معًا إن شاء الله.",
      learner: "My dear brother, the five prayers are not all combined at one time. Pray each prayer in its time as best you can, and use the breaks in your work. I'll get in touch so we can plan your schedule together, In shaa Allah.",
    },
  });
// Sisters' inbox (female mentor only)
await referred("Maryam", "bn", "আমি কি এখনই হিজাব পরা শুরু করব? কর্মস্থলে সমস্যা হতে পারে।",
  "هل أبدأ بارتداء الحجاب الآن؟ قد تواجهني مشكلة في العمل.", "level_d", { gender: "female" });

console.log("Demo data ready.");
