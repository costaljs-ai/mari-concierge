'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type FileUIPart, type UIMessage } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Camera, Leaf, MessageCircle, RotateCcw } from 'lucide-react';
import { Composer } from '@/components/composer';
import { Markdown } from '@/components/markdown';
import { MariMark } from '@/components/mari-mark';
import { PickCard } from '@/components/pick-card';
import { extractPickNames, toBlocks } from '@/lib/format';
import { compressImage, MAX_INPUT_BYTES } from '@/lib/image';
import {
  getMemorySnapshot,
  isCheckInDue,
  loadMemory,
  memoryForPrompt,
  rememberNote,
  saveMemory,
  subscribeMemory,
} from '@/lib/memory';
import { keepLatestImageOnly } from '@/lib/messages';

const STARTERS = [
  "I've never tried cannabis. Where do I even start?",
  'I know what I like. Help me find it on a menu.',
];

export default function Home() {
  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: '/api/chat',
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { messages: keepLatestImageOnly(messages), memory: memoryForPrompt(loadMemory()) },
        }),
      }),
    [],
  );

  const { messages, sendMessage, setMessages, status, stop, error, regenerate, clearError } = useChat({
    transport,
    throttle: 40,
    onFinish: ({ message, isError, isAbort }) => {
      if (isError || isAbort) return;
      const names = extractPickNames(textOf(message));
      if (names.length) saveMemory({ lastPicks: names, lastPicksAt: Date.now() });
    },
  });

  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [preparingImage, setPreparingImage] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const memory = useSyncExternalStore(subscribeMemory, getMemorySnapshot, () => null);
  const checkInDue =
    memory !== null &&
    isCheckInDue(memory, { force: new URLSearchParams(window.location.search).has('checkin') });
  const endRef = useRef<HTMLDivElement>(null);
  const pinnedToBottom = useRef(true);

  const busy = status === 'submitted' || status === 'streaming';
  const started = messages.length > 0;
  const lastMessage = messages[messages.length - 1];
  const waitingForFirstWords = busy && (lastMessage?.role === 'user' || !textOf(lastMessage).trim());
  const readingMenu = waitingForFirstWords && messages.findLast((m) => m.role === 'user')?.parts.some((p) => p.type === 'file');

  // Follow the conversation as it grows, unless the guest scrolled up to re-read.
  useEffect(() => {
    const onScroll = () => {
      const fromBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      pinnedToBottom.current = fromBottom < 160;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (messages.length && pinnedToBottom.current) scrollToLatest();
  }, [messages, status]);

  // Photos finish loading after they're added, which pushes content down; follow them too.
  useEffect(() => {
    const el = endRef.current?.parentElement;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (messages.length && pinnedToBottom.current) scrollToLatest();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [messages.length]);

  const attach = useCallback(async (file: File) => {
    setNotice(null);
    if (!file.type.startsWith('image/')) return setNotice('That file isn’t a photo. Try a screenshot or a picture of the menu.');
    if (file.size > MAX_INPUT_BYTES) return setNotice('That photo is very large. A screenshot works best.');
    setPreparingImage(true);
    try {
      setImage(await compressImage(file));
    } catch {
      setNotice('I couldn’t open that photo format. A screenshot or JPEG works best.');
    } finally {
      setPreparingImage(false);
    }
  }, []);

  const send = (text: string, withImage: string | null = image) => {
    const body = text.trim() || (withImage ? 'Here’s the menu. What would you recommend for me?' : '');
    if (!body || busy) return;
    if (text.trim()) rememberNote(text);
    const files: FileUIPart[] | undefined = withImage
      ? [{ type: 'file', mediaType: 'image/jpeg', url: withImage, filename: 'menu.jpg' }]
      : undefined;
    pinnedToBottom.current = true;
    clearError();
    setNotice(null);
    setInput('');
    setImage(null);
    void sendMessage({ text: body, files });
  };

  const reset = () => {
    stop();
    setMessages([]);
    setInput('');
    setImage(null);
    setNotice(null);
    clearError();
    window.scrollTo({ top: 0 });
  };

  const startCheckIn = () => {
    if (!memory) return;
    const picks = memory.lastPicks.slice(0, 3);
    saveMemory({ checkInDismissedAt: Date.now() });
    setMessages([
      {
        id: `checkin-${Date.now()}`,
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: `Welcome back. A couple of days ago we picked out **${listJoin(picks)}**.\n\nDid you get to try any of them? I'd love to hear how you felt — what you liked, and anything you'd change. It helps me get even closer next time.`,
          },
        ],
      },
    ]);
  };

  const dismissCheckIn = () => {
    saveMemory({ checkInDismissedAt: Date.now() });
  };

  return (
    <div
      className="relative flex min-h-dvh flex-col"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) {
          e.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target || !e.relatedTarget) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) void attach(f);
      }}
    >
      {/* Header — the emblem always brings you home */}
      <header className="sticky top-0 z-20 border-b border-transparent bg-paper/85 backdrop-blur-md supports-[backdrop-filter]:bg-paper/70">
        <div className="mx-auto grid h-16 max-w-2xl grid-cols-[1fr_auto_1fr] items-center px-4">
          <span />
          <button
            onClick={reset}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition hover:bg-mist"
            aria-label="Mari home — start a new consultation"
          >
            <MariMark size={34} />
            <span className="font-display text-[1.35rem] tracking-wide text-ink">Mari</span>
          </button>
          <div className="flex justify-end">
            {started && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-mist hover:text-ink"
              >
                <RotateCcw className="size-3.5" />
                <span className="hidden sm:inline">New consult</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-48">
        {!started ? (
          <Welcome
            checkIn={checkInDue && memory ? memory.lastPicks : null}
            onCheckIn={startCheckIn}
            onDismissCheckIn={dismissCheckIn}
            onStarter={(s) => send(s, null)}
            returning={Boolean(memory?.notes.length)}
          />
        ) : (
          <div className="space-y-7 pt-6">
            {messages.map((m) =>
              m.role === 'user' ? <UserMessage key={m.id} message={m} /> : <MariMessage key={m.id} message={m} />,
            )}

            {waitingForFirstWords && <Thinking label={readingMenu ? 'Reading your menu' : 'Mari is thinking'} />}

            {error && !busy && (
              <div className="animate-rise ml-11 flex items-center justify-between gap-3 rounded-card border border-clay/20 bg-clay-wash px-4 py-3 text-sm text-clay">
                <span>{friendlyError(error)}</span>
                <button onClick={() => regenerate()} className="shrink-0 font-semibold underline-offset-2 hover:underline">
                  Try again
                </button>
              </div>
            )}
          </div>
        )}
        <div ref={endRef} />
      </main>

      {/* Composer — pinned to the bottom, above the safe area on phones */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-paper via-paper/95 to-paper/0 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-8">
        <div className="mx-auto max-w-2xl px-3 sm:px-4">
          {notice && (
            <p role="alert" className="animate-rise mb-2 rounded-control bg-clay-wash px-4 py-2.5 text-sm text-clay">
              {notice}
            </p>
          )}
          <Composer
            value={input}
            onChange={setInput}
            image={image}
            preparingImage={preparingImage}
            onFile={attach}
            onClearImage={() => setImage(null)}
            onSubmit={() => send(input)}
            onStop={stop}
            busy={busy}
            autoFocus
            placeholder={started ? 'Reply to Mari…' : 'How would you like to feel?'}
          />
          <p className="mt-2 text-center text-[0.7rem] text-ink-faint">
            Mari offers general guidance, not medical advice. For adults 21+.
          </p>
        </div>
      </div>

      {dragging && (
        <div className="pointer-events-none fixed inset-3 z-30 flex items-center justify-center rounded-[2rem] border-2 border-dashed border-fjord/50 bg-fjord-wash/80 backdrop-blur-sm">
          <p className="font-display text-2xl text-fjord-deep">Drop the menu here</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Welcome({
  checkIn,
  onCheckIn,
  onDismissCheckIn,
  onStarter,
  returning,
}: {
  checkIn: string[] | null;
  onCheckIn: () => void;
  onDismissCheckIn: () => void;
  onStarter: (s: string) => void;
  returning: boolean;
}) {
  return (
    <section className="animate-rise flex flex-col items-center pt-10 text-center sm:pt-16">
      <div className="rounded-full bg-surface p-1.5 shadow-lift">
        <MariMark size={84} />
      </div>
      <h1 className="mt-7 font-display text-[2.4rem] leading-[1.1] text-ink sm:text-5xl">
        {returning ? 'Welcome back.' : 'Hello, I’m Mari.'}
      </h1>
      <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-ink-soft">
        Tell me how you’d like to feel, then share a photo or screenshot of the dispensary menu. I’ll find your best
        matches and explain why, in plain language.
      </p>
      <p className="mt-3 max-w-md text-[1.02rem] leading-relaxed text-ink-soft">
        The more detail I can see, like terpene profiles, the better my picks. For the best recommendations, include the
        lab results.
      </p>

      {checkIn && (
        <div className="mt-8 w-full max-w-md rounded-card border border-sand/40 bg-sand-wash p-5 text-left">
          <p className="text-sm font-semibold text-sand-deep">A quick check-in</p>
          <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-soft">
            How did <span className="font-medium text-ink">{listJoin(checkIn.slice(0, 3))}</span> work out for you?
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={onCheckIn}
              className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/85"
            >
              Tell Mari how it went
            </button>
            <button
              onClick={onDismissCheckIn}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-sand/20"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      <div className="mt-9 flex w-full max-w-md flex-col gap-2.5">
        {STARTERS.map((s) => (
          <button
            key={s}
            onClick={() => onStarter(s)}
            className="rounded-card border border-line bg-surface px-5 py-3.5 text-left text-[0.95rem] text-ink shadow-soft transition hover:-translate-y-px hover:border-fjord/30 hover:shadow-lift"
          >
            {s}
          </button>
        ))}
      </div>

      <ol className="mt-12 grid w-full max-w-md grid-cols-3 gap-3 text-center">
        {[
          { icon: MessageCircle, label: 'Share how you want to feel' },
          { icon: Camera, label: 'Share a menu photo or screenshot' },
          { icon: Leaf, label: 'Get picks, explained' },
        ].map(({ icon: Icon, label }, i) => (
          <li key={label} className="flex flex-col items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-full bg-sage-wash text-sage-deep">
              <Icon className="size-[1.1rem]" strokeWidth={1.8} />
            </span>
            <span className="text-xs leading-snug text-ink-faint">
              <span className="font-semibold text-ink-soft">{i + 1}.</span> {label}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function UserMessage({ message }: { message: UIMessage }) {
  const text = textOf(message);
  const image = message.parts.find((p): p is FileUIPart => p.type === 'file');
  return (
    <div className="animate-rise flex flex-col items-end gap-2">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.url}
          alt="Menu you shared"
          className="max-h-56 max-w-[70%] rounded-card border border-line bg-surface object-cover shadow-soft"
        />
      )}
      {text && (
        <p className="max-w-[85%] whitespace-pre-wrap rounded-[1.25rem] rounded-br-md bg-fjord-wash px-4 py-2.5 text-[0.97rem] leading-relaxed text-ink">
          {text}
        </p>
      )}
    </div>
  );
}

function MariMessage({ message }: { message: UIMessage }) {
  const blocks = toBlocks(textOf(message));
  if (!blocks.length) return null;
  return (
    <div className="flex gap-3">
      <MariMark size={32} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1 space-y-4">
        {blocks.map((b, i) =>
          b.kind === 'pick' ? (
            <PickCard key={i} pick={b.pick} />
          ) : (
            <Markdown key={i} text={b.text} className="text-[0.98rem] text-ink-soft" />
          ),
        )}
      </div>
    </div>
  );
}

function Thinking({ label }: { label: string }) {
  return (
    <div className="animate-rise flex items-center gap-3" role="status" aria-live="polite">
      <MariMark size={32} className="shrink-0" />
      <div className="flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-2.5 shadow-soft">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 animate-breathe rounded-full bg-fjord"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </span>
        <span className="text-sm text-ink-soft">{label}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Scroll so the newest content sits just above the composer. */
function scrollToLatest() {
  window.scrollTo({ top: document.documentElement.scrollHeight });
}

function textOf(message?: UIMessage) {
  if (!message) return '';
  return message.parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

function listJoin(items: string[]) {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function friendlyError(error: Error) {
  try {
    const parsed = JSON.parse(error.message);
    if (parsed?.error) return parsed.error as string;
  } catch {
    /* not JSON */
  }
  return error.message && error.message.length < 160
    ? error.message
    : 'Something interrupted our conversation. Please try again.';
}
