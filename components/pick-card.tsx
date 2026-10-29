"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { track } from "@/lib/analytics";
import type { Pick } from "@/lib/format";
import { findTerpene, type Terpene } from "@/lib/terpenes";
import { Markdown } from "./markdown";

const TONE: Record<Terpene["tone"], string> = {
  fjord: "bg-fjord-wash text-fjord-deep border-fjord/15",
  sage: "bg-sage-wash text-sage-deep border-sage/20",
  sand: "bg-sand-wash text-sand-deep border-sand/30",
};

export function PickCard({ pick }: { pick: Pick }) {
  const [open, setOpen] = useState<Terpene | null>(null);

  return (
    <article className="animate-rise overflow-hidden rounded-card border border-line bg-surface shadow-soft">
      <header className="flex items-start gap-3.5 px-5 pt-5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-fjord text-sm font-semibold text-white">
          {pick.rank}
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-[1.3rem] leading-tight text-ink">{pick.name}</h3>
          {pick.meta && <p className="mt-1 text-[0.8rem] font-medium tracking-wide text-ink-faint">{pick.meta}</p>}
        </div>
      </header>

      {pick.terpenes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5 pt-4">
          {pick.terpenes.map((label) => (
            <TerpeneChip
              key={label}
              label={label}
              active={open?.name}
              onSelect={(t) => {
                if (t) track('terpene_opened', { terpene: t.name });
                setOpen(t);
              }}
            />
          ))}
        </div>
      )}

      {open && (
        <div className="animate-rise mx-5 mt-3 rounded-control bg-mist px-4 py-3 text-sm text-ink-soft">
          <div className="flex items-start justify-between gap-3">
            <p>
              <span className="font-semibold text-ink">{open.name}</span>
              <span className="text-ink-faint"> · {open.aroma}</span>
            </p>
            <button
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="-mr-1 -mt-0.5 rounded-full p-1 text-ink-faint hover:bg-surface hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <p className="mt-1.5 leading-relaxed">{open.simple}</p>
          <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-faint">{open.deeper}</p>
        </div>
      )}

      {pick.body && <Markdown text={pick.body} className="px-5 pb-5 pt-4 text-[0.94rem] text-ink-soft" />}
    </article>
  );
}

export function TerpeneChip({
  label,
  active,
  onSelect,
}: {
  label: string;
  active?: string;
  onSelect?: (t: Terpene | null) => void;
}) {
  const terp = findTerpene(label);
  const tone = terp ? TONE[terp.tone] : "bg-mist text-ink-soft border-line";
  const isActive = terp && active === terp.name;

  if (!terp || !onSelect) {
    return <span className={`rounded-full border px-3 py-1 text-xs font-medium ${tone}`}>{label}</span>;
  }
  return (
    <button
      type="button"
      onClick={() => onSelect(isActive ? null : terp)}
      aria-expanded={isActive}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${tone} ${
        isActive ? "ring-2 ring-current/25" : "hover:brightness-[0.97]"
      }`}
    >
      {label}
    </button>
  );
}
