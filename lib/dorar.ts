/** Looks up a saying on Dorar.net. We only report what Dorar shows; we never judge a hadith ourselves. */
export type DorarResult = { found: boolean; text?: string; scholar?: string; source?: string; grade?: string; url: string };

const strip = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

function field(block: string, label: string): string | undefined {
  const re = new RegExp(`${label}\\s*:?\\s*</span>([\\s\\S]*?)(?=<span class="info-subtitle"|</div>)`);
  const m = block.match(re);
  return m ? strip(m[1]) || undefined : undefined;
}

export async function lookupDorar(text: string): Promise<DorarResult> {
  const url = `https://dorar.net/hadith/search?q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(`https://dorar.net/dorar_api.json?skey=${encodeURIComponent(text)}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { found: false, url };
    const html: string = (await res.json())?.ahadith?.result ?? "";
    const blocks = html.split('<div class="hadith"').slice(1);
    if (!blocks.length) return { found: false, url };
    const first = blocks[0];
    return {
      found: true,
      text: strip(first.split("</div>")[0].replace(/^[^>]*>/, "")),
      scholar: field(first, "المحدث"),
      source: field(first, "المصدر"),
      grade: field(first, "خلاصة حكم المحدث"),
      url,
    };
  } catch {
    return { found: false, url };
  }
}
