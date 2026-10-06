"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/browser";
import T, { type Lang } from "@/lib/client/text-app";
import "@/lib/client/text-part2";
import "@/lib/client/text-part3";
import "@/lib/client/text-fixes";
import "@/lib/client/text-mentor";
import "@/lib/client/text-v2";
import "@/lib/client/text-mentors";
import "@/lib/client/text-admin";

export type Profile = {
  id: string;
  role: "learner" | "applicant" | "mentor" | "admin";
  name: string | null;
  gender: "male" | "female" | null;
  language: Lang;
  reads_arabic: number | null;
  work_pattern: number | null;
  lessons_done: string[];
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  list: (key: string) => string[];
  num: (n: number) => string;
  locale: string;
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AppContext = createContext<Ctx | null>(null);
const LOCALES: Record<Lang, string> = { en: "en-GB", ar: "ar-SA", bn: "bn-BD" };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => browserClient(), []);
  const router = useRouter();
  const [lang, setLangState] = useState<Lang>("en");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setProfile(null);
    } else {
      const { data: p } = await supabase
        .from("profiles")
        .select("id, role, name, gender, language, reads_arabic, work_pattern, lessons_done")
        .eq("id", data.user.id)
        .single();
      setProfile((p as Profile) ?? null);
      if (p?.language) setLangState(p.language as Lang);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("muadh.lang") as Lang | null;
      if (saved && saved in T) setLangState(saved);
    } catch { /* ignore */ }
    refresh();
  }, [refresh]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      try { localStorage.setItem("muadh.lang", l); } catch { /* ignore */ }
      if (profile) supabase.from("profiles").update({ language: l }).eq("id", profile.id).then(() => {});
    },
    [profile, supabase],
  );

  const value = useMemo<Ctx>(() => {
    const dict = T[lang];
    const locale = LOCALES[lang];
    return {
      lang,
      setLang,
      locale,
      profile,
      loading,
      refresh,
      t: (key, vars) => {
        let s = typeof dict[key] === "string" ? (dict[key] as string) : (T.en[key] as string) ?? key;
        if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
        return s;
      },
      list: (key) => (Array.isArray(dict[key]) ? dict[key] : T.en[key]) as string[],
      num: (n) => n.toLocaleString(locale),
      signOut: async () => {
        const role = profile?.role;
        const to = role === "admin" ? "/admin" : role === "mentor" || role === "applicant" ? "/mentor/login" : "/user/login";
        await supabase.auth.signOut();
        router.replace(to);
        setProfile(null);
      },
    };
  }, [lang, setLang, profile, loading, refresh, supabase, router]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

/** The signed-in profile. Only used inside the app layout, which renders pages only once a profile is loaded. */
export function useProfile(): Profile {
  const { profile } = useApp();
  if (!profile) throw new Error("useProfile is only available inside the signed-in app");
  return profile;
}
