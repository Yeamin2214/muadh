/** City name for a location, from OpenStreetMap. Coordinates are rounded so no exact position is sent or kept. */
const cache = new Map<string, { city: string; country: string }>();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  if (q) return search(q.slice(0, 80), (url.searchParams.get("lang") ?? "en").slice(0, 2));
  const lat = Number(url.searchParams.get("lat")), lng = Number(url.searchParams.get("lng"));
  const lang = (url.searchParams.get("lang") ?? "en").slice(0, 2);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return Response.json({ error: "bad_request" }, { status: 400 });
  const key = `${lat.toFixed(2)},${lng.toFixed(2)},${lang}`;
  if (cache.has(key)) return Response.json(cache.get(key));
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=${lat.toFixed(2)}&lon=${lng.toFixed(2)}&accept-language=${lang}`,
      { headers: { "user-agent": "Muadh/1.0 (AI Challenge Serving Islamic Content)" }, signal: AbortSignal.timeout(8000) },
    );
    const data = await res.json();
    const a = data.address ?? {};
    const place = { city: a.city ?? a.town ?? a.village ?? a.state ?? "", country: a.country ?? "" };
    cache.set(key, place);
    return Response.json(place);
  } catch {
    return Response.json({ city: "", country: "" });
  }
}

/** City search by name, for when the browser cannot share a location. */
async function search(q: string, lang: string) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(q)}&accept-language=${lang}`,
      { headers: { "user-agent": "Muadh/1.0 (AI Challenge Serving Islamic Content)" }, signal: AbortSignal.timeout(8000) },
    );
    const [hit] = await res.json();
    if (!hit) return Response.json({ error: "not_found" }, { status: 404 });
    const a = hit.address ?? {};
    return Response.json({
      lat: Number(hit.lat), lng: Number(hit.lon),
      city: a.city ?? a.town ?? a.village ?? a.state ?? q, country: a.country ?? "",
    });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
