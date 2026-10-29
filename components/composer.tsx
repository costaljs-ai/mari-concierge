"use client";

import { useEffect, useRef } from "react";
import { ArrowUp, Camera, Square, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  image: string | null;
  preparingImage: boolean;
  onFile: (file: File) => void;
  onClearImage: () => void;
  onSubmit: () => void;
  onStop: () => void;
  busy: boolean;
  placeholder: string;
  autoFocus?: boolean;
};

export function Composer({
  value,
  onChange,
  image,
  preparingImage,
  onFile,
  onClearImage,
  onSubmit,
  onStop,
  busy,
  placeholder,
  autoFocus,
}: Props) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const canSend = !busy && !preparingImage && (value.trim().length > 0 || Boolean(image));

  // Grow the text box with its content (up to ~6 lines).
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "";
    if (!value) return;
    const height = Math.min(el.scrollHeight, 160);
    el.style.height = `${height}px`;
    el.style.overflowY = height >= 160 ? "auto" : "hidden";
  }, [value]);

  useEffect(() => {
    if (autoFocus && window.matchMedia("(pointer: fine)").matches) textRef.current?.focus();
  }, [autoFocus]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSend) onSubmit();
      }}
      className="rounded-[1.6rem] border border-line bg-surface p-2 shadow-lift transition focus-within:border-fjord/40"
    >
      {(image || preparingImage) && (
        <div className="animate-rise flex items-center gap-3 px-2 pb-2 pt-1">
          <div className="relative size-14 overflow-hidden rounded-xl border border-line bg-mist">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="Menu ready to send" className="size-full object-cover" />
            ) : (
              <div className="size-full animate-pulse bg-mist" />
            )}
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium text-ink">{preparingImage ? "Preparing photo…" : "Menu attached"}</p>
            <p className="text-xs text-ink-faint">Mari will read every product on it.</p>
          </div>
          <button
            type="button"
            onClick={onClearImage}
            aria-label="Remove photo"
            className="rounded-full p-2 text-ink-faint transition hover:bg-mist hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-1.5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Add a menu photo"
          title="Add a menu photo"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-fjord transition hover:bg-fjord-wash"
        >
          <Camera className="size-5" strokeWidth={1.8} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />

        <textarea
          ref={textRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (canSend) onSubmit();
            }
          }}
          onPaste={(e) => {
            const f = Array.from(e.clipboardData.files).find((x) => x.type.startsWith("image/"));
            if (f) {
              e.preventDefault();
              onFile(f);
            }
          }}
          placeholder={placeholder}
          aria-label="Message Mari"
          className="max-h-40 min-h-11 flex-1 resize-none overflow-y-hidden bg-transparent px-1 py-2.5 text-[1rem] leading-6 text-ink outline-none placeholder:text-ink-faint focus-visible:outline-none"
        />

        {busy ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-mist text-ink transition hover:bg-line"
          >
            <Square className="size-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-fjord text-white transition hover:bg-fjord-deep disabled:bg-mist disabled:text-ink-faint"
          >
            <ArrowUp className="size-5" strokeWidth={2.2} />
          </button>
        )}
      </div>
    </form>
  );
}
