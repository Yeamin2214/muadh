import { Fragment } from "react";
import SourceBox from "./SourceBox";

/** **bold** inside a line. */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <b key={i}>{part.slice(2, -2)}</b> : <Fragment key={i}>{part}</Fragment>,
  );
}

/** A small, safe renderer for the lesson format: paragraphs, lists, tables, quotes and source boxes. */
export default function Markdown({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="md">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const source = block.match(/^\[(Quran [^\]]+|Hadith: [^\]]+)\]$/);
        if (source) return <SourceBox key={i} label={source[1]} />;
        if (lines.every((l) => l.trim().startsWith("|"))) {
          const rows = lines.filter((l) => !/^\|\s*-/.test(l.trim())).map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
          return (
            <div key={i} style={{ overflowX: "auto" }}>
              <table className="mdt"><thead><tr>{rows[0].map((c, k) => <th key={k}>{inline(c)}</th>)}</tr></thead>
                <tbody>{rows.slice(1).map((r, k) => <tr key={k}>{r.map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>)}</tbody></table>
            </div>
          );
        }
        if (lines.every((l) => /^\d+\.\s/.test(l.trim()))) return <ol key={i}>{lines.map((l, k) => <li key={k}>{inline(l.replace(/^\d+\.\s/, ""))}</li>)}</ol>;
        if (lines.every((l) => /^[-*]\s/.test(l.trim()))) return <ul key={i}>{lines.map((l, k) => <li key={k}>{inline(l.replace(/^[-*]\s/, ""))}</li>)}</ul>;
        if (lines.every((l) => l.startsWith(">"))) {
          return <blockquote key={i}>{lines.map((l, k) => <p key={k} className={/[\u0600-\u06FF]/.test(l) ? "ar-text" : ""}>{inline(l.replace(/^>\s?/, ""))}</p>)}</blockquote>;
        }
        return <p key={i}>{lines.map((l, k) => <Fragment key={k}>{k > 0 && <br />}{inline(l)}</Fragment>)}</p>;
      })}
    </div>
  );
}
