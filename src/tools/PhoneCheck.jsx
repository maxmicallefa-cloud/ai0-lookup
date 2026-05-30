import { useState } from 'react'
import { ResultCard, Field, Badge, useWorker, SearchBar, ToolWrap } from '../ui.jsx'

const LINE_COLORS = {
  mobile:   '#00c878',
  landline: '#00aacc',
  voip:     '#f97316',
  unknown:  '#888',
}

export default function PhoneCheck() {
  const [query, setQuery] = useState('')
  const { data, loading, error, run } = useWorker()

  async function search(q) {
    // Strip spaces and dashes for cleaner lookup
    const clean = q.replace(/[\s\-().]/g, '')
    await run(`/phone?q=${encodeURIComponent(clean)}`)
  }

  const d = data

  return (
    <ToolWrap
      icon="📞" title="Phone Lookup"
      desc="Carrier, country, line type (mobile / landline / VoIP) for any number in 232 countries."
    >
      <SearchBar
        placeholder="+356 9999 0000 or +1 415 000 0000..."
        value={query}
        onChange={setQuery}
        onSubmit={() => search(query)}
        loading={loading}
        buttonLabel="Check"
      />

      <div className="hint">Requires a Numverify API key — 100 free lookups/month.</div>

      {error && <div className="error">{error}</div>}

      {d && (
        <ResultCard title={d.international_format || d.number} icon="📞">
          <div className="badge-row">
            {d.valid
              ? <Badge col="#00c878">Valid</Badge>
              : <Badge col="#ef4444">Invalid</Badge>
            }
            {d.line_type && (
              <Badge col={LINE_COLORS[d.line_type] || '#888'}>
                {d.line_type.charAt(0).toUpperCase() + d.line_type.slice(1)}
              </Badge>
            )}
          </div>
          <Field k="National format"      v={d.local_format} />
          <Field k="International format" v={d.international_format} />
          <Field k="Country"              v={d.country_name} />
          <Field k="Country code"         v={d.country_code} />
          <Field k="Country prefix"       v={d.country_prefix ? '+' + d.country_prefix : null} />
          <Field k="Carrier"              v={d.carrier} />
          <Field k="Line type"            v={d.line_type} />
          <Field k="Location"             v={d.location} />
        </ResultCard>
      )}
    </ToolWrap>
  )
}
