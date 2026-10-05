"use client";
import { useEffect, useState } from "react";
import { browserClient } from "@/lib/supabase/browser";
import { useApp } from "./AppProvider";

type Row = { id: string; arabic: string | null; translations: Record<string, string | null> };
const arabicDigits = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

/** A whole surah shown at once: the Arabic with verse markers, then the full approved translation. */
export default function SurahText({ surah, verses }: { surah: number; verses: number }) {
  const { t, lang } = useApp();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    const ids = Array.from({ length: verses }, (_, i) => `quran:${surah}:${i + 1}`);
    browserClient().from("passages").select("id, arabic, translations").in("id", ids)
      .then(({ data }) => setRows(((data as Row[]) ?? []).sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))));
  }, [surah, verses]);

  if (!rows) return <p className="b2 mid">{t("loadingSrc")}</p>;
  if (!rows.length) return <p className="b2 mid">{t("srcMissing")}</p>;
  return (
    <div className="surah">
      <p className="ar-text surah-ar" lang="ar" dir="rtl">
        {rows.map((r, i) => <span key={r.id}>{r.arabic} <span className="ayah-no">﴿{arabicDigits(i + 1)}﴾</span> </span>)}
      </p>
      {lang !== "ar" && (
        <p className="surah-tr">
          {rows.map((r, i) => <span key={r.id}><sup>{i + 1}</sup> {r.translations?.[lang] || r.translations?.en} </span>)}
        </p>
      )}
      <span className="b2 mid">{t("srcCredit")}</span>
    </div>
  );
}
