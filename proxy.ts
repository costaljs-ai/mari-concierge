import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Light abuse protection for the chat endpoint: 40 messages per 10 minutes per IP.
 * Note: this lives in memory, so on Vercel each server instance counts separately.
 * Before a big public launch, swap in a shared store (e.g. Upstash Redis).
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 40;
const ipTracker = new Map<string, { count: number; firstRequestTime: number }>();

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/chat' && request.method === 'POST') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';
    const now = Date.now();
    const record = ipTracker.get(ip) ?? { count: 0, firstRequestTime: now };

    if (now - record.firstRequestTime > WINDOW_MS) {
      record.count = 0;
      record.firstRequestTime = now;
    }

    if (record.count >= MAX_REQUESTS) {
      return NextResponse.json(
        { error: "You've sent a lot of messages in a short time. Please take a breather and try again in a few minutes." },
        { status: 429 }
      );
    }

    record.count += 1;
    ipTracker.set(ip, record);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
