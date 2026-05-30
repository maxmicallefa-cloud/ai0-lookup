import { useState, useCallback } from 'react'

const WORKER = import.meta.env.VITE_WORKER_URL || ''

// ── API hook ──────────────────────────────────────────────────────────────────
export function useWorker() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const run = useCallback(async (path) => {
    setLoading(true); setError(null); setData(null)
    try {
      const url = WORKER ? WORKER + path : path
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      return json
    } catch (e) {
      setError(e.message || 'Request failed')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, run }
}

// ── SearchBar ─────────────────────────────────────────────────────────────────
export function SearchBar({ placeholder, value, onChange, onSubmit, loading, buttonLabel = 'Search' }) {
  return (
    <div className="search-row">
      <input
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSubmit()}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
      />
      <button className="search-btn" onClick={onSubmit} disabled={loading}>
        {loading ? <span className="spin" /> : buttonLabel}
      </button>
    </div>
  )
}

// ── Result card ───────────────────────────────────────────────────────────────
export function ResultCard({ title, icon, children }) {
  return (
    <div className="result-card">
      <div className="result-title">
        <span className="result-icon">{icon}</span>
        <span className="result-label">{title}</span>
      </div>
      <div className="result-body">{children}</div>
    </div>
  )
}

// ── Field row ─────────────────────────────────────────────────────────────────
export function Field({ k, v }) {
  if (!v && v !== 0 && v !== false) return null
  return (
    <div className="field-row">
      <span className="field-key">{k}</span>
      <span className="field-val">{String(v)}</span>
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ col = '#888', children }) {
  return (
    <span className="badge" style={{ background: col + '20', color: col, border: `1px solid ${col}50` }}>
      {children}
    </span>
  )
}

// ── Tool wrapper ──────────────────────────────────────────────────────────────
export function ToolWrap({ icon, title, desc, children }) {
  return (
    <div className="tool-wrap">
      <div className="tool-header">
        <span className="tool-icon">{icon}</span>
        <div>
          <div className="tool-title">{title}</div>
          <div className="tool-desc">{desc}</div>
        </div>
      </div>
      {children}
    </div>
  )
}
