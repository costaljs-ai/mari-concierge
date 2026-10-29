/**
 * Mari's memory, kept on the guest's own device (localStorage).
 * It powers two things:
 *   1. Returning guests don't start from zero — Mari sees what they told her before.
 *   2. The 48-hour check-in: after a menu analysis, Mari asks how the picks went.
 */
const KEY = "mari.memory.v1";
export const CHECK_IN_AFTER_MS = 48 * 60 * 60 * 1000;

export type MariMemory = {
  notes: string[]; // things the guest said, newest last
  lastPicks: string[]; // product names from the latest menu analysis
  lastPicksAt: number | null;
  checkInDismissedAt: number | null;
};

const EMPTY: MariMemory = { notes: [], lastPicks: [], lastPicksAt: null, checkInDismissedAt: null };

export function loadMemory(): MariMemory {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function saveMemory(update: Partial<MariMemory>): MariMemory {
  const next = { ...loadMemory(), ...update };
  next.notes = next.notes.slice(-12);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode — memory just won't persist */
  }
  snapshot = next;
  listeners.forEach((l) => l());
  return next;
}

/* A tiny store so React screens update when memory changes (useSyncExternalStore). */
let snapshot: MariMemory | null = null;
const listeners = new Set<() => void>();

export function subscribeMemory(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getMemorySnapshot(): MariMemory {
  return (snapshot ??= loadMemory());
}

export function rememberNote(text: string) {
  const clean = text.trim().slice(0, 280);
  if (clean.length < 4) return;
  saveMemory({ notes: [...loadMemory().notes, clean] });
}

/** `force` lets you preview the check-in by adding ?checkin to the URL. */
export function isCheckInDue(memory: MariMemory, { now = Date.now(), force = false } = {}) {
  if (!memory.lastPicksAt || memory.lastPicks.length === 0) return false;
  if (memory.checkInDismissedAt && memory.checkInDismissedAt > memory.lastPicksAt) return false;
  return force || now - memory.lastPicksAt >= CHECK_IN_AFTER_MS;
}

/** Compact summary sent to the server so Mari can personalize. */
export function memoryForPrompt(memory: MariMemory): string {
  const parts: string[] = [];
  if (memory.notes.length) parts.push(`Things this guest told you in earlier visits:\n- ${memory.notes.join("\n- ")}`);
  if (memory.lastPicks.length && memory.lastPicksAt) {
    const days = Math.max(1, Math.round((Date.now() - memory.lastPicksAt) / 86_400_000));
    parts.push(`About ${days} day(s) ago you recommended: ${memory.lastPicks.join(", ")}.`);
  }
  return parts.join("\n\n");
}
