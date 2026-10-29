# Mari — your cannabis concierge

Mari is a chat-first web app. A guest tells Mari how they'd like to feel, snaps a photo
of a dispensary menu, and gets 3 matched products with the terpenes explained at their level.

---

## Part 1 — Run it on your laptop

You'll type commands into a **terminal**. In VS Code: top menu **Terminal → New Terminal**.
A panel opens at the bottom. Type each command below and press **Enter**.

1. **Go to the project folder** (skip if the terminal already shows `weed-sommelier`):
   ```bash
   cd C:\Users\theco\weed-sommelier
   ```
2. **Install the building blocks** (only needed once, or after pulling new code):
   ```bash
   npm install
   ```
3. **Check your API key.** Open the file `.env.local` in VS Code (left sidebar). It should contain one line:
   ```
   GEMINI_API_KEY=your-key-here
   ```
   Get a key at https://aistudio.google.com/apikey if you need one. Never share this file or commit it.
4. **Start Mari:**
   ```bash
   npm run dev
   ```
   When you see `Ready`, open **http://localhost:3000** in your browser.
5. **Stop Mari:** click in the terminal and press **Ctrl + C**.

> **Testing speed?** `npm run dev` is "edit mode": it rebuilds pages the first time you open
> them, so it always feels slower than the real site. To feel true speed, run
> `npm run build` then `npm start` instead, and open http://localhost:3000.

### Handy pages
| Address | What it is |
|---|---|
| `http://localhost:3000` | The app |
| `http://localhost:3000/styleguide` | The design rulebook: every color, font and component |
| `http://localhost:3000/?checkin` | Preview the 48-hour check-in (after you've had at least one menu analysis) |

---

## Part 2 — Put it live on mariconcierge.app (Vercel)

Vercel rebuilds your site automatically whenever you push code to GitHub.

1. In VS Code, click the **Source Control** icon on the left (it looks like a branching line).
2. Type a short message like `Polished Mari redesign` in the box, click **Commit**, then **Sync / Push**.
3. On https://vercel.com → your project → **Settings → Environment Variables**, make sure
   `GEMINI_API_KEY` is set (same value as in `.env.local`). Add it for **Production** and **Preview**.
4. Vercel builds and deploys in about a minute. Watch it under **Deployments**.

---

## Part 3 — Where things live (what to edit)

| You want to… | Edit this file |
|---|---|
| Change how Mari talks, her rules or safety notes | `app/api/chat/prompt.ts` |
| Change colors, fonts, roundness | `app/globals.css` (the `@theme` block at the top) |
| Change the welcome text or starter questions | `app/page.tsx` (look for `STARTERS` and `Hello, I’m Mari`) |
| Add or reword terpene explanations | `lib/terpenes.ts` |
| Change the logo | `components/mari-mark.tsx` and `app/icon.svg` |
| Change which AI models are used | `.env.local` → add `MARI_MODELS=model-a,model-b` (tried in order) |

### How the speed works
- **Photos are shrunk on the phone before upload** (`lib/image.ts`): a multi-MB screenshot becomes ~200–400 KB.
- **Only the latest menu photo is re-sent** with follow-up questions (`lib/messages.ts`).
- **Automatic model fallback** (`app/api/chat/route.ts`): if Google's model is busy, Mari switches to
  the next one within seconds instead of hanging. Timing is printed in the terminal as `[mari] … first words in …ms`.
- **Thinking mode is set to minimal**, because Mari's job is matching and explaining, not deep reasoning.

### How the 48-hour check-in works
After a menu analysis, Mari remembers the picks **on the guest's own device** (browser storage).
When they come back 48+ hours later, the home screen asks how those picks went, and their answer
shapes future recommendations. No account or email needed.

---

## Part 4 — What's next before a public launch

1. **Real notifications** (email or text at 48 hours) need accounts + a scheduled job. Suggested stack:
   Vercel Cron + a database (Vercel Postgres or Supabase) + Resend (email) or Twilio (SMS).
2. **Shared rate limiting**: `proxy.ts` limits each visitor to 40 messages / 10 min, but on Vercel each
   server counts separately. Swap in Upstash Redis before marketing pushes.
3. **Age gate + terms**: a simple 21+ confirmation screen and a privacy note.
4. **Analytics**: Vercel Analytics (one click) to see how many guests upload a menu.
5. **Dispensary edition**: the same chat can be embedded on a dispensary site with their live menu
   fed in as text instead of a photo, which makes it even faster.
