import type { Metadata } from 'next';
import { ArrowUp, Camera } from 'lucide-react';
import { MariLogo, MariMark } from '@/components/mari-mark';
import { PickCard, TerpeneChip } from '@/components/pick-card';
import { Markdown } from '@/components/markdown';

export const metadata: Metadata = { title: 'Mari — Style guide', robots: { index: false } };

/**
 * The visual rulebook. Every color, font and component used in the app
 * is shown here. Tokens are defined once in app/globals.css (@theme).
 * Visit http://localhost:3000/styleguide while the app is running.
 */
const COLORS = [
  { group: 'Surfaces', items: ['paper', 'mist', 'surface', 'line', 'line-strong'] },
  { group: 'Ink', items: ['ink', 'ink-soft', 'ink-faint'] },
  { group: 'Fjord (brand)', items: ['fjord', 'fjord-deep', 'fjord-wash'] },
  { group: 'Sage', items: ['sage', 'sage-deep', 'sage-wash'] },
  { group: 'Sand', items: ['sand', 'sand-deep', 'sand-wash'] },
  { group: 'Clay (errors)', items: ['clay', 'clay-wash'] },
];

export default function StyleGuide() {
  return (
    <main className="mx-auto max-w-3xl space-y-16 px-5 py-14">
      <header className="flex items-center gap-5">
        <MariMark size={64} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint">Design system</p>
          <h1 className="font-display text-4xl text-ink">Mari style guide</h1>
        </div>
      </header>

      <Section
        title="Logo"
        note="Full logo for large, centered moments (welcome screen, link previews). Below ~80px use the face mark — the full illustration loses its detail. Files live in public/brand/."
      >
        <div className="flex flex-wrap items-end gap-10 rounded-card border border-line bg-surface p-8">
          <MariLogo />
          <div className="flex items-end gap-4">
            <MariMark size={96} />
            <MariMark size={48} />
            <MariMark size={32} />
          </div>
        </div>
      </Section>

      <Section title="Principles">
        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            ['Calm', 'Lots of space, soft edges, low contrast surfaces. Nothing shouts.'],
            ['Clear', 'One action per moment. Plain words. Big tap targets (44px+).'],
            ['Caring', 'Mari speaks first and warmly. Errors are gentle, never red alarms.'],
          ].map(([t, d]) => (
            <li key={t} className="rounded-card border border-line bg-surface p-5 shadow-soft">
              <p className="font-display text-xl text-ink">{t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{d}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Color" note="Use the token name in classes, e.g. bg-fjord, text-ink-soft, border-line. Never hard-code hex values.">
        <div className="space-y-6">
          {COLORS.map(({ group, items }) => (
            <div key={group}>
              <p className="mb-2 text-sm font-semibold text-ink">{group}</p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {items.map((c) => (
                  <div key={c} className="overflow-hidden rounded-control border border-line bg-surface">
                    <div className="h-14" style={{ background: `var(--color-${c})` }} />
                    <p className="px-2.5 py-2 font-mono text-[0.7rem] text-ink-soft">{c}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type" note="Newsreader (font-display) for Mari's voice and headings. Manrope (font-sans) for everything else.">
        <div className="space-y-4 rounded-card border border-line bg-surface p-6">
          <p className="font-display text-5xl text-ink">Hello, I’m Mari.</p>
          <p className="font-display text-2xl text-ink">Product name in a pick card</p>
          <p className="text-[1rem] leading-relaxed text-ink-soft">
            Body text is 16px Manrope in ink-soft with relaxed line height. It should read like a calm conversation.
          </p>
          <p className="text-xs text-ink-faint">Small print and captions use ink-faint at 12px.</p>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-full bg-fjord px-5 py-2.5 text-sm font-medium text-white hover:bg-fjord-deep">Primary</button>
          <button className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink/85">Strong</button>
          <button className="rounded-full px-5 py-2.5 text-sm font-medium text-ink-soft hover:bg-mist">Quiet</button>
          <button className="flex size-11 items-center justify-center rounded-full text-fjord hover:bg-fjord-wash" aria-label="Camera">
            <Camera className="size-5" strokeWidth={1.8} />
          </button>
          <button className="flex size-11 items-center justify-center rounded-full bg-fjord text-white" aria-label="Send">
            <ArrowUp className="size-5" />
          </button>
        </div>
      </Section>

      <Section title="Terpene chips" note="Tone comes from lib/terpenes.ts. Tapping a chip in the app opens its explanation.">
        <div className="flex flex-wrap gap-2">
          {['Myrcene', 'Limonene', 'Caryophyllene', 'Linalool', 'Pinene', 'Terpinolene', 'Humulene', 'Unknownene'].map((t) => (
            <TerpeneChip key={t} label={t} />
          ))}
        </div>
      </Section>

      <Section title="Pick card">
        <PickCard
          pick={{
            rank: 1,
            name: 'Lavender Haze',
            meta: 'Indica · 16% THC · Flower',
            terpenes: ['Linalool', 'Myrcene', 'Caryophyllene'],
            body: '**Why it fits:** Gentle THC and a lavender-forward profile for unwinding without racing thoughts.\n\n**Good to know:** Start with one or two small puffs and wait 15 minutes.',
          }}
        />
      </Section>

      <Section title="Mari's text">
        <div className="flex gap-3">
          <MariMark size={32} className="shrink-0" />
          <Markdown
            className="text-[0.98rem] text-ink-soft"
            text={'That sounds lovely. A few things to look for:\n\n- **Linalool** for calm\n- **Myrcene** for that heavy, sleepy feeling\n\nHave you tried edibles before?'}
          />
        </div>
      </Section>

      <Section title="Surfaces">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-card border border-line bg-surface p-5 text-sm text-ink-soft shadow-soft">Card · shadow-soft</div>
          <div className="rounded-card border border-sand/40 bg-sand-wash p-5 text-sm text-ink-soft">Check-in · sand-wash</div>
          <div className="rounded-card border border-clay/20 bg-clay-wash p-5 text-sm text-clay">Error · clay-wash</div>
        </div>
      </Section>
    </main>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      {note && <p className="mt-1 max-w-xl text-sm text-ink-faint">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
