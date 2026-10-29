'use client';

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { ageStore, confirmAdult, declineAdult, resetAge } from '@/lib/age';
import { track } from '@/lib/analytics';
import { MariMark } from './mari-mark';

/** Shows its children only after the guest confirms they're 21 or older. */
export function AgeGate({ children }: { children: ReactNode }) {
  const status = useSyncExternalStore(ageStore.subscribe, ageStore.get, ageStore.server);

  if (status === 'verified') return children;
  // Before the browser has checked (first paint), show a quiet blank screen instead of flashing content.
  if (status === 'unknown') return <div className="min-h-dvh bg-paper" aria-hidden />;
  return <Screen underage={status === 'underage'} />;
}

function Screen({ underage }: { underage: boolean }) {
  const primary = useRef<HTMLButtonElement>(null);
  useEffect(() => primary.current?.focus(), [underage]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-10">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-title"
        className="animate-rise w-full max-w-sm rounded-[1.75rem] border border-line bg-surface px-7 pb-7 pt-9 text-center shadow-lift"
      >
        <div className="mx-auto w-fit rounded-full bg-surface p-1 shadow-soft">
          <MariMark size={64} />
        </div>

        {underage ? (
          <>
            <h1 id="age-title" className="mt-6 font-display text-[1.9rem] leading-tight text-ink">
              Thanks for being honest.
            </h1>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">
              Mari is only for adults 21 and older. She’ll be here when the time comes.
            </p>
            <button
              ref={primary}
              onClick={resetAge}
              className="mt-7 text-sm font-medium text-fjord underline-offset-4 hover:underline"
            >
              I tapped the wrong button
            </button>
          </>
        ) : (
          <>
            <h1 id="age-title" className="mt-6 font-display text-[1.9rem] leading-tight text-ink">
              Before we begin
            </h1>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">
              Mari is for adults 21 and older. Are you 21 or older?
            </p>
            <div className="mt-7 flex flex-col gap-2.5">
              <button
                ref={primary}
                onClick={() => {
                  confirmAdult();
                  track('age_gate_passed');
                }}
                className="rounded-full bg-fjord px-5 py-3 text-[0.98rem] font-medium text-white transition hover:bg-fjord-deep"
              >
                Yes, I’m 21 or older
              </button>
              <button
                onClick={() => {
                  declineAdult();
                  track('age_gate_declined');
                }}
                className="rounded-full px-5 py-3 text-[0.98rem] font-medium text-ink-soft transition hover:bg-mist"
              >
                No, I’m under 21
              </button>
            </div>
            <p className="mt-6 text-[0.75rem] leading-relaxed text-ink-faint">
              Mari offers general information, not medical advice. We count anonymous usage, like how many menus are
              scanned, to improve Mari — never what you write or the photos you share.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
