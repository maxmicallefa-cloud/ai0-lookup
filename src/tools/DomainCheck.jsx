import { useState } from 'react'
import { ResultCard, Field, Badge, useWorker, SearchBar, ToolWrap } from '../ui.jsx'

function domainAge(registered) {
  if (!registered) return null
  const ms  = Date.now() - new Date(registered).getTime()
  const yrs = ms / (1000 * 60 * 60 * 24 * 365.25)
  if (yrs < 1) return `${Math.round(yrs * 12)} months`
  return `${yrs.toFixed(1)} years`
}

function isExpiringSoon(expires) {
  if (!expires) return false
  return new Date(expires) - Date.now() < 1000 * 60 * 60 * 24 * 60 // 60 days
}

function fmtDate(d) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
}

export default function DomainCheck() {
  const [query, setQuery] = useState('')
  const { data, loading, error, run } = useWorker()

  async function search(q) {
    let domain = q.trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
    await run(`/domain?q=${encodeURIComponent(domain)}`)
  }

  const d = data

  return (
    <ToolWrap
      icon="🌍" title="Domain / WHOIS"
      desc="Registration date, expiry, registrar and nameservers for any domain via RDAP."
    >
      <SearchBar
        placeholder="example.com or https://example.com/page..."
        value={query}
        onChange={setQuery}
        onSubmit={() => search(query)}
        loading={loading}
        buttonLabel="Check"
      />

      {error && <div className="error">{error}</div>}

      {d && !d.error && (
        <ResultCard title={d.domain} icon="🌍">
          <div className="badge-row">
            {d.registered && <Badge col="#00c878">{domainAge(d.registered)} old</Badge>}
            {isExpiringSoon(d.expires) && <Badge col="#f97316">Expiring soon</Badge>}
            {d.status?.includes('clientDeleteProhibited') && <Badge col="#00aacc">Locked</Badge>}
          </div>
          <Field k="Registered"   v={fmtDate(d.registered)} />
          <Field k="Last updated" v={fmtDate(d.updated)} />
          <Field k="Expires"      v={fmtDate(d.expires)} />
          <Field k="Registrar"    v={d.registrar} />
          <Field k="Handle"       v={d.handle} />
          <Field k="Status"       v={d.status} />
          {d.nameservers?.length > 0 && (
            <Field k="Nameservers" v={d.nameservers.join(', ')} />
          )}
        </ResultCard>
      )}
      {d?.error && <div className="error">{d.error}</div>}
    </ToolWrap>
  )
}
