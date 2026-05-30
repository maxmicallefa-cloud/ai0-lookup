import { useState } from 'react'
import { ResultCard, Field, Badge, useWorker, SearchBar, ToolWrap } from '../ui.jsx'

export default function IpLookup() {
  const [query, setQuery] = useState('')
  const { data, loading, error, run } = useWorker()

  async function search(q) {
    const val = q.trim() || 'check'   // empty = own IP
    await run(`/ip?q=${encodeURIComponent(val === 'check' ? '' : val)}`)
  }

  const d = data

  return (
    <ToolWrap
      icon="🌐" title="IP Lookup"
      desc="Locate any IP address — country, city, ISP, timezone, proxy/VPN detection."
    >
      <SearchBar
        placeholder="IP address or leave blank for your own..."
        value={query}
        onChange={setQuery}
        onSubmit={() => search(query)}
        loading={loading}
        buttonLabel="Look up"
      />

      {error && <div className="error">{error}</div>}

      {d && d.status === 'success' && (
        <ResultCard title={d.query} icon="🌐">
          <div className="badge-row">
            {d.proxy  && <Badge col="#ef4444">VPN / Proxy</Badge>}
            {d.hosting && <Badge col="#f97316">Hosting / DC</Badge>}
            {d.mobile  && <Badge col="#a855f7">Mobile</Badge>}
            {!d.proxy && !d.hosting && <Badge col="#00c878">Residential</Badge>}
          </div>
          <Field k="Location"   v={[d.city, d.regionName, d.country].filter(Boolean).join(', ')} />
          <Field k="Continent"  v={d.continent} />
          <Field k="Coordinates" v={d.lat && d.lon ? `${d.lat}, ${d.lon}` : null} />
          <Field k="Timezone"   v={d.timezone} />
          <Field k="ISP"        v={d.isp} />
          <Field k="Org"        v={d.org} />
          <Field k="AS"         v={d.as} />
          <Field k="AS Name"    v={d.asname} />
          <Field k="Currency"   v={d.currency} />
          <Field k="Reverse DNS" v={d.reverse} />
          <Field k="Country code" v={d.countryCode} />
          <Field k="ZIP"        v={d.zip} />
        </ResultCard>
      )}
      {d && d.status === 'fail' && <div className="error">{d.message || 'Lookup failed'}</div>}
    </ToolWrap>
  )
}
