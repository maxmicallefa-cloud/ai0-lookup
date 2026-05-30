import { useState } from 'react'
import { ResultCard, Field, Badge, useWorker, SearchBar, ToolWrap } from '../ui.jsx'

// Disposable email domains (top offenders)
const DISPOSABLE = new Set([
  'mailinator.com','guerrillamail.com','temp-mail.org','throwaway.email',
  'yopmail.com','trashmail.com','sharklasers.com','guerrillamailblock.com',
  'grr.la','guerrillamail.info','guerrillamail.biz','guerrillamail.de',
  'spam4.me','tempmail.com','fakeinbox.com','maildrop.cc','dispostable.com',
  'tempinbox.com','spamgourmet.com','trashmail.at','discard.email',
])

// RFC 5321 / 5322 syntax check
function validateSyntax(email) {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
  if (!re.test(email)) return { ok: false, reason: 'Invalid format' }
  const [local, domain] = email.split('@')
  if (local.length > 64)  return { ok: false, reason: 'Local part too long (>64 chars)' }
  if (domain.length > 253) return { ok: false, reason: 'Domain too long (>253 chars)' }
  if (local.startsWith('.') || local.endsWith('.')) return { ok: false, reason: 'Local part cannot start or end with a dot' }
  if (local.includes('..')) return { ok: false, reason: 'Local part cannot have consecutive dots' }
  return { ok: true }
}

export default function EmailCheck() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const { loading, run } = useWorker()
  const [checking, setChecking] = useState(false)

  async function search(q) {
    const email = q.trim().toLowerCase()
    setResult(null)
    setChecking(true)

    const syntax = validateSyntax(email)
    const [, domain] = email.includes('@') ? email.split('@') : ['', '']
    const isDisposable = DISPOSABLE.has(domain)

    // Check MX via worker DNS route
    let hasMX = null
    let mxRecords = []
    if (syntax.ok && domain) {
      const res = await run(`/dns?q=${encodeURIComponent(domain)}`)
      if (res) {
        hasMX = res.hasMX
        mxRecords = (res.records || []).map(r => r.data).filter(Boolean)
      }
    }

    setResult({ email, domain, syntax, isDisposable, hasMX, mxRecords })
    setChecking(false)
  }

  const d = result

  return (
    <ToolWrap
      icon="✉️" title="Email Check"
      desc="Validates format, checks MX records (can the domain receive email?), flags disposable providers."
    >
      <SearchBar
        placeholder="name@example.com"
        value={query}
        onChange={setQuery}
        onSubmit={() => search(query)}
        loading={loading || checking}
        buttonLabel="Check"
      />

      {d && (
        <ResultCard title={d.email} icon="✉️">
          <div className="badge-row">
            {d.syntax.ok
              ? <Badge col="#00c878">Valid syntax</Badge>
              : <Badge col="#ef4444">Invalid syntax</Badge>
            }
            {d.hasMX === true  && <Badge col="#00c878">MX records found</Badge>}
            {d.hasMX === false && <Badge col="#ef4444">No MX records</Badge>}
            {d.isDisposable    && <Badge col="#f97316">Disposable provider</Badge>}
          </div>

          {!d.syntax.ok && <Field k="Issue" v={d.syntax.reason} />}
          <Field k="Domain"     v={d.domain} />
          <Field k="MX records" v={d.mxRecords.length > 0 ? d.mxRecords.slice(0, 3).join(' · ') : (d.hasMX === false ? 'None found' : null)} />
          <Field k="Deliverable" v={d.syntax.ok && d.hasMX ? 'Likely yes' : d.syntax.ok && d.hasMX === false ? 'No — domain has no mail server' : 'Unknown'} />

          {d.isDisposable && (
            <div className="warn-box">
              ⚠ This domain is a known disposable / temporary email provider. Treat with caution.
            </div>
          )}
        </ResultCard>
      )}
    </ToolWrap>
  )
}
