# 🌙 Serenity – Audio Relaxation SaaS

A complete, production-ready relaxation app: an ambient sound mixer with a sleep
timer and breathing guide, wrapped in a commercial SaaS (landing page, accounts,
and Stripe subscriptions).

All sounds are **generated in the browser** with the Web Audio API — there are no
audio files to host, and nothing is sent to a server.

---

## ✨ Features

- **12 ambient sounds** — rain, ocean, forest, thunder, campfire, wind, white &
  brown noise, night insects, binaural focus/relax beats, singing bowl
- **Multi-track mixer** with per-sound and master volume
- **Sleep timer** with smooth auto fade-out
- **Breathing guide** (4-4-6-2 box breathing) with animation
- **Accounts** (email/password) via Supabase
- **Subscriptions** via Stripe — Free (3 sounds) vs Pro (everything)
- **Billing portal** so users can cancel/update payment themselves
- Privacy Policy & Terms pages, SEO metadata, sitemap, custom 404

---

## 🧱 Tech stack

| Layer    | Technology            |
| -------- | --------------------- |
| Framework| Next.js 14 (App Router) |
| Language | TypeScript            |
| Styling  | Tailwind CSS          |
| Auth + DB| Supabase              |
| Payments | Stripe                |
| Hosting  | Vercel (recommended)  |

---

## 🚀 Deploy it (no coding required)

You'll create three free accounts, copy a few keys, and paste them into Vercel.
Budget ~30 minutes.

### 1. Supabase (accounts + database)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
3. Go to **Project Settings → API** and copy these three values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` *(keep this secret!)*
4. Go to **Authentication → URL Configuration** and set your **Site URL** to your
   final domain (e.g. `https://yourdomain.com`). Add `https://yourdomain.com/auth/callback`
   to the **Redirect URLs** list.

### 2. Stripe (payments)

1. Create an account at [stripe.com](https://stripe.com).
2. Under **Products**, create one product "Serenity Pro" with **two prices**:
   - Recurring **monthly** $7.99 → copy the price ID (`price_…`) → `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID`
   - Recurring **yearly** $59.99 → copy the price ID → `NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID`
3. Under **Developers → API keys**, copy:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`
4. You'll set up the webhook **after** deploying (step 4 below).

### 3. Vercel (hosting)

1. Push this repo to GitHub (already done) and import it at
   [vercel.com/new](https://vercel.com/new).
2. Under **Environment Variables**, add every key from
   [`.env.example`](.env.example). Set `NEXT_PUBLIC_APP_URL` to your Vercel
   domain (e.g. `https://serenity.vercel.app`).
3. Click **Deploy**.

### 4. Connect the Stripe webhook (so subscriptions activate)

1. In Stripe, go to **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://YOUR-DOMAIN/api/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** (`whsec_…`) → add it in Vercel as
   `STRIPE_WEBHOOK_SECRET`, then **redeploy**.

That's it. 🎉 Visitors can now sign up, subscribe, and manage their billing.

> 💡 Use Stripe **test mode** keys first. Test card: `4242 4242 4242 4242`,
> any future expiry, any CVC. Switch to **live mode** keys when you're ready to
> charge real money (Stripe will ask you to verify your business first).

---

## 💻 Run locally

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev                  # http://localhost:3000
```

For local Stripe webhooks, install the
[Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

---

## 🧪 Scripts

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the dev server                  |
| `npm run build`   | Production build                      |
| `npm start`       | Run the production build              |
| `npm test`        | Run unit tests (Vitest)               |
| `npm run lint`    | Lint the codebase                     |

---

## 📁 Project structure

```
app/                 Next.js routes (landing, auth, app, account, api, legal)
  api/checkout       Creates a Stripe Checkout session
  api/portal         Opens the Stripe billing portal
  api/webhook        Receives Stripe events and updates the DB
components/          UI — landing sections + the in-app player
  app/               SoundCard, mixer, timer, breathing guide, upgrade modal
  landing/           Hero, features, pricing, testimonials, footer
lib/                 Supabase clients, Stripe, audio engine, sound catalog
tests/               Vitest unit tests
supabase/schema.sql  Database setup (run once in Supabase)
```

---

## 🔒 Pricing model

| Plan | Price            | Includes                                       |
| ---- | ---------------- | ---------------------------------------------- |
| Free | $0               | 3 sounds, basic mixing                         |
| Pro  | $7.99/mo · $59.99/yr | All 12 sounds, sleep timer, breathing guide |

Edit the free tier in [`lib/sounds.ts`](lib/sounds.ts) (`FREE_SOUND_IDS`) and the
prices in your Stripe dashboard.

---

## ⚠️ Notes

- Binaural beats (Focus/Relax) need **headphones** to work — they use separate
  left/right channels.
- This app is a wellness tool, not a medical device.
