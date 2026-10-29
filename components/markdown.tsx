import { Fragment, type ReactNode } from "react";

/**
 * A small, fast markdown renderer for Mari's replies.
 * Handles headings, paragraphs, bullet/numbered lists, **bold** and *italic*.
 */
export function Markdown({ text, className = "" }: { text: string; className?: string }) {
  const nodes: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      nodes.push(
        <p key={nodes.length} className="leading-relaxed">
          {inline(para.join(" "))}
        </p>,
      );
      para = [];
    }
  };
  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    nodes.push(
      <Tag
        key={nodes.length}
        className={`space-y-1.5 pl-5 leading-relaxed ${list.ordered ? "list-decimal" : "list-disc"} marker:text-sage`}
      >
        {list.items.map((item, i) => (
          <li key={i} className="pl-1">
            {inline(item)}
          </li>
        ))}
      </Tag>,
    );
    list = null;
  };

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    const heading = line.match(/^#{1,4}\s+(.*)$/);
    if (heading) {
      flushPara();
      flushList();
      nodes.push(
        <h3 key={nodes.length} className="pt-1 text-[0.95rem] font-semibold text-ink">
          {inline(heading[1])}
        </h3>,
      );
      continue;
    }
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      flushPara();
      const ordered = Boolean(numbered);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push((bullet ?? numbered)![1]);
      continue;
    }
    flushList();
    // A line opening with a bold label ("**Good to know:** …") starts its own paragraph.
    if (/^\*\*[^*]+:\*\*/.test(line) || /^\*\*[^*]+\*\*:/.test(line)) flushPara();
    para.push(line);
  }
  flushPara();
  flushList();

  return <div className={`space-y-3 ${className}`}>{nodes}</div>;
}

function inline(s: string): ReactNode {
  const parts = s.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^(\*[^*].*\*|_.+_)$/.test(part)) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
