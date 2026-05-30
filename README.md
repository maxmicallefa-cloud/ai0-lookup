# ai0-lookup

> Public data lookup tools · Part of AI0 (AllInOne) · React + Vite + Cloudflare Worker

## Tools

| Tab | What it does | API used |
|---|---|---|
| 🌐 IP | Locate any IP — country, city, ISP, proxy/VPN flag | ip-api.com (free, no key) |
| 📞 Phone | Carrier, country, line type for 232 countries | numverify.com (100 free/month) |
| 🌍 Domain | Registration, expiry, registrar via RDAP | rdap.org (free, no key) |
| ✉️ Email | Syntax + MX check + disposable detection | dns.google (free, no key) |
| 🏢 VAT | EU VAT validation via VIES | vatcomply.com (free, no key) |
| 🏦 IBAN | ISO 13616 checksum validation | Client-side only — no API |

## Stack

React 18 + Vite 5 · Cloudflare Pages + Workers · AI0 Supabase for lookup logs

## Setup

```bash
git clone https://github.com/maxmicallefa-cloud/ai0-lookup
cd ai0-lookup
npm install
cp .env.example .env.local
# Fill in VITE_SUPABASE_ANON_KEY, VITE_NUMVERIFY_KEY, VITE_WORKER_URL
npm run dev
```

## Cloudflare Worker

The worker proxies all external API calls (solves CORS, keeps keys off frontend).

```bash
# Deploy worker first
wrangler secret put NUMVERIFY_KEY   # paste your numverify key
wrangler deploy

# Note the worker URL, add as VITE_WORKER_URL env var in Cloudflare Pages
```

## Cloudflare Pages

| Setting | Value |
|---|---|
| Framework | Vite |
| Build command | `npm run build` |
| Output dir | `dist` |

Environment variables:
- `VITE_SUPABASE_ANON_KEY` — from rnneagijosmsvbakzhpc.supabase.co
- `VITE_NUMVERIFY_KEY` — from numverify.com (free signup)
- `VITE_WORKER_URL` — your deployed worker URL

## Supabase — lookup_logs table

```sql
create table lookup_logs (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users,
  tool       text,
  query      text,
  created_at timestamptz default now()
);
alter table lookup_logs enable row level security;
create policy "users see own" on lookup_logs for all using (auth.uid() = user_id);
```

## Adding to AI0 landing page

```js
{
  id: 'lookup',
  name: 'Lookup',
  emoji: '🔍',
  desc: 'IP, phone, domain, email, VAT & IBAN public data tools.',
  color: '#b8ff57',
  bg: '#0a1400',
  border: '#b8ff5725',
  href: import.meta.env.VITE_LOOKUP_URL || 'https://ai0-lookup.pages.dev',
  live: true,
}
```
