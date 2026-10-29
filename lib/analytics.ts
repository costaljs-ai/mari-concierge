import posthog from 'posthog-js';

/**
 * Privacy-safe product analytics (PostHog).
 *
 * We count *what happens* (a menu was uploaded, picks were shown),
 * never *what people write*: no message text, no photos, no session
 * recordings, no automatic click capture. Guests stay anonymous.
 *
 * Turned off until NEXT_PUBLIC_POSTHOG_KEY is set, so local testing
 * and forks send nothing.
 */
export type AnalyticsEvent =
  | 'age_gate_passed'
  | 'age_gate_declined'
  | 'chat_started'
  | 'message_sent'
  | 'menu_uploaded'
  | 'picks_shown'
  | 'terpene_opened'
  | 'answer_failed'
  | 'checkin_shown'
  | 'checkin_started'
  | 'checkin_dismissed'
  | 'consult_reset';

type Props = Record<string, string | number | boolean | undefined>;

let ready = false;

export function initAnalytics() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || ready || typeof window === 'undefined') return;
  try {
    posthog.init(key, {
      api_host: '/ingest', // routed through our own domain (next.config.ts) so ad blockers don't skew numbers
      ui_host: 'https://us.posthog.com',
      person_profiles: 'identified_only', // anonymous guests: no person profiles
      persistence: 'localStorage', // no cookies
      autocapture: false,
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: true,
      disable_surveys: true,
      advanced_disable_feature_flags: true,
    });
    ready = true;
  } catch {
    /* analytics must never break the app */
  }
}

export function track(event: AnalyticsEvent, props?: Props) {
  if (!ready) return;
  try {
    posthog.capture(event, props);
  } catch {
    /* ignore */
  }
}
