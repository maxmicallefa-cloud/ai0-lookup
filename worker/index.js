/**
 * AI0 Lookup — Cloudflare Worker
 *
 * Routes:
 *   GET /ip?q={ip}            → ip-api.com lookup (no key needed)
 *   GET /phone?q={number}     → numverify lookup  (key in secret)
 *   GET /vat?q={vatnumber}    → vatcomply.com     (no key needed)
 *   GET /domain?q={domain}    → whoisjson.com     (no key needed)
 *   GET /dns?q={domain}       → dns.google MX check (no key needed)
 *
 * Secrets (set via wrangler secret put):
 *   NUMVERIFY_KEY
 *
 * Deploy: wrangler deploy
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })

const err = (msg, status = 400) => json({ error: msg }, status)

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

    const url = new URL(req.url)
    const path = url.pathname
    const q = url.searchParams.get('q')?.trim()

    if (!q) return err('Missing q parameter')

    // ── IP Lookup ─────────────────────────────────────────────────────────────
    if (path === '/ip') {
      const cache = caches.default
      const cacheKey = `https://ip-cache/${q}`
      const cached = await cache.match(cacheKey)
      if (cached) return cached

      const res = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(q)}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query`,
        { headers: { Accept: 'application/json' } }
      )
      const data = await res.json()
      const response = json(data)
      // Cache for 24 hours — IP data changes rarely
      const toCache = response.clone()
      toCache.headers.set('Cache-Control', 'public, max-age=86400')
      await cache.put(cacheKey, toCache)
      return response
    }

    // ── Phone Lookup ──────────────────────────────────────────────────────────
    if (path === '/phone') {
      const key = env.NUMVERIFY_KEY
      if (!key) return err('Phone lookup not configured', 503)

      const res = await fetch(
        `http://apilayer.net/api/validate?access_key=${key}&number=${encodeURIComponent(q)}&format=1`
      )
      const data = await res.json()
      return json(data)
    }

    // ── VAT Lookup ────────────────────────────────────────────────────────────
    if (path === '/vat') {
      // vatcomply.com — free, no key, returns name + address for valid numbers
      const res = await fetch(
        `https://api.vatcomply.com/vat?vat_number=${encodeURIComponent(q)}`,
        { headers: { Accept: 'application/json' } }
      )
      const data = await res.json()
      return json(data)
    }

    // ── Domain / WHOIS ────────────────────────────────────────────────────────
    if (path === '/domain') {
      // rdap.org — official IANA RDAP, no key, JSON
      const domain = q.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase()
      const res = await fetch(
        `https://rdap.org/domain/${encodeURIComponent(domain)}`,
        { headers: { Accept: 'application/rdap+json' } }
      )
      if (!res.ok) return json({ error: 'Domain not found or RDAP unavailable', domain })
      const data = await res.json()

      // Parse RDAP into a clean structure
      const events = data.events || []
      const getDate = (type) => events.find(e => e.eventAction === type)?.eventDate || null
      const nameservers = (data.nameservers || []).map(n => n.ldhName).filter(Boolean)
      const registrar = data.entities?.find(e => e.roles?.includes('registrar'))
      const registrarName = registrar?.vcardArray?.[1]?.find(v => v[0] === 'fn')?.[3] || null
      const status = (data.status || []).join(', ')

      return json({
        domain,
        registered: getDate('registration'),
        updated: getDate('last changed'),
        expires: getDate('expiration'),
        registrar: registrarName,
        nameservers,
        status,
        handle: data.handle,
      })
    }

    // ── DNS / MX Check ────────────────────────────────────────────────────────
    if (path === '/dns') {
      const domain = q.replace(/^@.*/, '') // strip local part if email passed
      const res = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
        { headers: { Accept: 'application/json' } }
      )
      const data = await res.json()
      return json({
        domain,
        hasMX: data.Status === 0 && (data.Answer?.length > 0),
        records: data.Answer || [],
        status: data.Status,
      })
    }

    return err('Unknown route', 404)
  },
}
