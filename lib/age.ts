/**
 * 21+ confirmation. "Yes" is remembered on this device for 30 days;
 * "no" lasts only for this browser tab, so a mis-tap never locks anyone out.
 */
const KEY = 'mari.age.v1';
const REMEMBER_MS = 30 * 24 * 60 * 60 * 1000;

export type AgeStatus = 'unknown' | 'ask' | 'verified' | 'underage';

let status: AgeStatus | null = null;
const listeners = new Set<() => void>();

function read(): AgeStatus {
  try {
    if (sessionStorage.getItem(KEY) === 'no') return 'underage';
    const at = Number(localStorage.getItem(KEY));
    if (at && Date.now() - at < REMEMBER_MS) return 'verified';
  } catch {
    /* storage blocked: ask each visit */
  }
  return 'ask';
}

function set(next: AgeStatus) {
  status = next;
  listeners.forEach((l) => l());
}

export const ageStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  get: (): AgeStatus => (status ??= read()),
  server: (): AgeStatus => 'unknown',
};

export function confirmAdult() {
  try {
    sessionStorage.removeItem(KEY);
    localStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* fine: verified for this visit only */
  }
  set('verified');
}

export function declineAdult() {
  try {
    sessionStorage.setItem(KEY, 'no');
  } catch {
    /* ignore */
  }
  set('underage');
}

export function resetAge() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  set('ask');
}
