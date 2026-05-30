import { useState } from 'react'
import { ResultCard, Field, Badge, useWorker, SearchBar, ToolWrap } from '../ui.jsx'

const EU_COUNTRIES = {
  AT:'Austria',BE:'Belgium',BG:'Bulgaria',HR:'Croatia',CY:'Cyprus',CZ:'Czech Republic',
  DK:'Denmark',EE:'Estonia',FI:'Finland',FR:'France',DE:'Germany',GR:'Greece',
  HU:'Hungary',IE:'Ireland',IT:'Italy',LV:'Latvia',LT:'Lithuania',LU:'Luxembourg',
  MT:'Malta',NL:'Netherlands',PL:'Poland',PT:'Portugal',RO:'Romania',SK:'Slovakia',
  SI:'Slovenia',ES:'Spain',SE:'Sweden',
}

// Basic format check per country before hitting the API
function preValidate(vat) {
  const clean = vat.replace(/[\s.\-]/g, '').toUpperCase()
  if (clean.length < 4) return { ok: false, reason: 'Too short' }
  const cc = clean.substring(0, 2)
  if (!EU_COUNTRIES[cc]) return { ok: false, reason: `"${cc}" is not a valid EU country code` }
  return { ok: true, clean, cc }
}

export default function VatCheck() {
  const [query, setQuery] = useState('')
  const { data, loading, error, run } = useWorker()

  async function search(q) {
    const pre = preValidate(q)
    if (!pre.ok) return
    await run(`/vat?q=${encodeURIComponent(pre.clean)}`)
  }

  const d = data
  const pre = query ? preValidate(query) : null

  return (
    <ToolWrap
      icon="🏢" title="EU VAT Checker"
      desc="Validates any EU VAT number against the official VIES database. Returns company name and address where available."
    >
      <SearchBar
        placeholder="MT12345678 or DE123456789..."
        value={query}
        onChange={val => setQuery(val.toUpperCase())}
        onSubmit={() => search(query)}
        loading={loading}
        buttonLabel="Validate"
      />

      {pre && !pre.ok && query.length > 1 && (
        <div className="hint warn">{pre.reason}</div>
      )}
      {pre?.ok && (
        <div className="hint">
          Country: <strong>{EU_COUNTRIES[pre.cc]}</strong>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {d && (
        <ResultCard title={d.vat_number || query} icon="🏢">
          <div className="badge-row">
            {d.valid
              ? <Badge col="#00c878">Valid VAT number</Badge>
              : <Badge col="#ef4444">Invalid / Not found</Badge>
            }
            {d.country_code && <Badge col="#00aacc">{EU_COUNTRIES[d.country_code] || d.country_code}</Badge>}
          </div>
          <Field k="VAT number"    v={d.vat_number} />
          <Field k="Company name"  v={d.name !== '---' ? d.name : null} />
          <Field k="Address"       v={d.address !== '---' ? d.address : null} />
          <Field k="Country"       v={EU_COUNTRIES[d.country_code] || d.country_code} />
          {!d.valid && (
            <div className="warn-box">
              This VAT number was not found in the VIES database. It may be invalid, recently de-registered, or the relevant member state may be temporarily unavailable.
            </div>
          )}
        </ResultCard>
      )}
    </ToolWrap>
  )
}
