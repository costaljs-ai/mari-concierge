import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ipTracker = new Map();

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/analyze') {
    
    // FIX: Pull IP exclusively from headers to satisfy Next.js strict typing
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    
    const now = Date.now();
    const windowSize = 10 * 60 * 1000; // 10 minutes in milliseconds
    const maxRequests = 5; // The limit: 5 uploads per 10 minutes per IP

    const record = ipTracker.get(ip) || { count: 0, firstRequestTime: now };

    if (now - record.firstRequestTime > windowSize) {
      record.count = 0;
      record.firstRequestTime = now;
    }

    if (record.count >= maxRequests) {
      console.warn(`Bouncer blocked IP ${ip} for spamming.`);
      return NextResponse.json(
        { error: 'You have reached the temporary upload limit. Please wait 10 minutes before uploading again.' }, 
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