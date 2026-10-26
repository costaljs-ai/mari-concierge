import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This acts as our bouncer's clipboard, keeping track of IP addresses in memory
const ipTracker = new Map();

export function middleware(request: NextRequest) {
  // We only want the bouncer to check people trying to use the AI route
  if (request.nextUrl.pathname === '/api/analyze') {
    
    // Grab the user's IP address (Vercel provides this automatically)
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown-ip';
    
    const now = Date.now();
    const windowSize = 10 * 60 * 1000; // 10 minutes in milliseconds
    const maxRequests = 5; // The limit: 5 uploads per 10 minutes per IP

    // Look up the IP on the clipboard, or create a new record if they are new
    const record = ipTracker.get(ip) || { count: 0, firstRequestTime: now };

    // If their 10-minute timeout window has expired, wipe their slate clean
    if (now - record.firstRequestTime > windowSize) {
      record.count = 0;
      record.firstRequestTime = now;
    }

    // If they have hit the limit, slam the door (Return a 429 Too Many Requests error)
    if (record.count >= maxRequests) {
      console.warn(`Bouncer blocked IP ${ip} for spamming.`);
      return NextResponse.json(
        { error: 'You have reached the temporary upload limit. Please wait 10 minutes before uploading again.' }, 
        { status: 429 }
      );
    }

    // Otherwise, add 1 to their count, update the clipboard, and let them in
    record.count += 1;
    ipTracker.set(ip, record);
  }

  return NextResponse.next();
}

// This tells Next.js to only run the bouncer on API routes, keeping your front page loading instantly
export const config = {
  matcher: '/api/:path*',
};