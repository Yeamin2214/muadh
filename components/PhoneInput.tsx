"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/** Countries most of our learners and mentors come from, with their dialling codes. */
const COUNTRIES: [string, string, string][] = [
  ["sa", "Saudi Arabia", "+966"], ["bd", "Bangladesh", "+880"], ["ae", "United Arab Emirates", "+971"], ["qa", "Qatar", "+974"],
  ["kw", "Kuwait", "+965"], ["bh", "Bahrain", "+973"], ["om", "Oman", "+968"], ["eg", "Egypt", "+20"], ["jo", "Jordan", "+962"],
  ["pk", "Pakistan", "+92"], ["in", "India", "+91"], ["lk", "Sri Lanka", "+94"], ["np", "Nepal", "+977"], ["id", "Indonesia", "+62"],
  ["my", "Malaysia", "+60"], ["ph", "Philippines", "+63"], ["tr", "Turkey", "+90"], ["ng", "Nigeria", "+234"], ["et", "Ethiopia", "+251"],
  ["ke", "Kenya", "+254"], ["sd", "Sudan", "+249"], ["ye", "Yemen", "+967"], ["ma", "Morocco", "+212"], ["gb", "United Kingdom", "+44"],
  ["us", "United States", "+1"], ["ca", "Canada", "+1"], ["au", "Australia", "+61"], ["de", "Germany", "+49"], ["fr", "France", "+33"],
];
const flag = (code: string) => `https://flagcdn.com/w40/${code}.png`;

/** Phone number with a country picker (flag, name and code). The value is "+966 5XXXXXXXX". */
export default function PhoneInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const initial = COUNTRIES.find(([, , dial]) => value.startsWith(dial + " ")) ?? COUNTRIES[0];
  const [country, setCountry] = useState(initial);
  const [number, setNumber] = useState(value.startsWith(initial[2] + " ") ? value.slice(initial[2].length + 1) : "");
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { onChange(number.trim() ? `${country[2]} ${number.trim()}` : ""); }, [country, number]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const list = COUNTRIES.filter(([, name, dial]) => `${name} ${dial}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="phone" ref={ref} dir="ltr">
      <button type="button" className="phone-cc" onClick={() => setOpen(!open)} aria-haspopup="listbox" aria-expanded={open}>
        <img src={flag(country[0])} alt="" width={22} height={15} />
        <span>{country[2]}</span>
        <ChevronDown className="ic" aria-hidden="true" />
      </button>
      <input className="field" type="tel" inputMode="tel" autoComplete="tel-national" value={number}
        onChange={(e) => setNumber(e.target.value.replace(/[^\d\s]/g, ""))} placeholder={placeholder} />
      {open && (
        <div className="phone-list" role="listbox">
          <input className="field" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" />
          {list.map((c) => (
            <button type="button" key={c[0] + c[2]} role="option" aria-selected={c === country} onClick={() => { setCountry(c); setOpen(false); setQ(""); }}>
              <img src={flag(c[0])} alt="" width={22} height={15} /><span>{c[1]}</span><b>{c[2]}</b>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
