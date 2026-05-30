import { useState } from 'react'
import IpLookup    from './tools/IpLookup.jsx'
import PhoneCheck  from './tools/PhoneCheck.jsx'
import DomainCheck from './tools/DomainCheck.jsx'
import EmailCheck  from './tools/EmailCheck.jsx'
import VatCheck    from './tools/VatCheck.jsx'
import IbanCheck   from './tools/IbanCheck.jsx'

const TOOLS = [
  { id:'ip',     icon:'🌐', label:'IP',     component: IpLookup    },
  { id:'phone',  icon:'📞', label:'Phone',  component: PhoneCheck  },
  { id:'domain', icon:'🌍', label:'Domain', component: DomainCheck },
  { id:'email',  icon:'✉️', label:'Email',  component: EmailCheck  },
  { id:'vat',    icon:'🏢', label:'VAT',    component: VatCheck    },
  { id:'iban',   icon:'🏦', label:'IBAN',   component: IbanCheck   },
]

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:     #0a0a0a;
  --surface:#111111;
  --border: #1e1e1e;
  --border2:#2a2a2a;
  --accent: #b8ff57;
  --text:   #e0e0d8;
  --muted:  #666;
  --danger: #ff5040;
  --warn:   #f97316;
  --info:   #57b8ff;
  --tab-h:  56px;
  --nav-h:  52px;
}

html, body, #root {
  height: 100%;
  overflow: hidden;
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}
@supports (height:100dvh) { html, body, #root { height: 100dvh; } }
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
button { cursor: pointer; font-family: inherit; }
input  { font-family: inherit; }

/* ── Nav ── */
.nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 18px; height: var(--nav-h);
  background: #0e0e0e; border-bottom: 1px solid var(--border);
  flex-shrink: 0; position: relative; z-index: 200;
}
.nav-logo {
  font-family: 'Space Mono', monospace;
  font-weight: 700; font-size: 1.1rem; color: var(--accent);
  letter-spacing: 0.04em;
}
.nav-sub { font-size: 11px; color: var(--muted); margin-top: 1px; }
.nav-back {
  background: transparent; border: 1px solid var(--border2);
  color: var(--muted); padding: 4px 12px; border-radius: 5px;
  font-size: 11px; text-decoration: none; display: inline-block;
  letter-spacing: 0.04em;
}
.nav-back:hover { border-color: var(--accent); color: var(--accent); }

/* ── Layout ── */
.layout { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

/* ── Scrollable content ── */
.content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 20px 16px 24px;
  padding-bottom: calc(var(--tab-h) + 16px);
}

/* ── Tab bar ── */
.tab-bar {
  display: flex;
  height: var(--tab-h);
  background: #0e0e0e;
  border-top: 1px solid var(--border);
  position: fixed; bottom: 0; left: 0; right: 0;
  z-index: 300;
}
.tab {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 3px;
  border: none; background: transparent; color: var(--muted);
  cursor: pointer; transition: color 0.15s; padding: 4px 2px 2px;
  position: relative; -webkit-tap-highlight-color: transparent;
  font-size: 10px; font-family: 'Space Mono', monospace; letter-spacing: 0.04em;
}
.tab.active { color: var(--accent); }
.tab.active::before {
  content: '';
  position: absolute; top: 0; left: 20%; right: 20%;
  height: 2px; background: var(--accent);
  border-radius: 0 0 2px 2px;
}
.tab-icon { font-size: 19px; line-height: 1; }

/* ── Tool wrapper ── */
.tool-wrap { max-width: 640px; }
.tool-header {
  display: flex; align-items: flex-start; gap: 12px;
  margin-bottom: 18px;
}
.tool-icon { font-size: 28px; flex-shrink: 0; margin-top: 2px; }
.tool-title { font-size: 18px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
.tool-desc { font-size: 12px; color: var(--muted); line-height: 1.6; }

/* ── Search row ── */
.search-row {
  display: flex; gap: 8px; margin-bottom: 8px;
}
.search-input {
  flex: 1; background: var(--surface); border: 1px solid var(--border2);
  color: var(--text); padding: 10px 14px; border-radius: 7px;
  font-size: 13px; outline: none; min-width: 0;
  transition: border-color 0.15s;
}
.search-input:focus { border-color: var(--accent); }
.search-input::placeholder { color: var(--muted); }
.search-btn {
  background: var(--accent); color: #0a0a0a; padding: 10px 18px;
  border: none; border-radius: 7px; font-weight: 600; font-size: 13px;
  flex-shrink: 0; min-width: 76px; display: flex; align-items: center;
  justify-content: center; transition: opacity 0.15s;
}
.search-btn:hover { opacity: 0.88; }
.search-btn:disabled { opacity: 0.5; cursor: default; }

/* ── Result card ── */
.result-card {
  background: var(--surface); border: 1px solid var(--border2);
  border-radius: 10px; margin-top: 16px; overflow: hidden;
}
.result-title {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; border-bottom: 1px solid var(--border);
  background: #141414;
}
.result-icon { font-size: 18px; flex-shrink: 0; }
.result-label {
  font-family: 'Space Mono', monospace; font-size: 13px;
  color: var(--text); font-weight: 700; word-break: break-all;
}
.result-body { padding: 4px 0; }

/* ── Field rows ── */
.field-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 8px 14px; border-bottom: 1px solid var(--border);
  gap: 12px; font-size: 13px;
}
.field-row:last-child { border-bottom: none; }
.field-key { color: var(--muted); flex-shrink: 0; }
.field-val { color: var(--accent); font-family: 'Space Mono', monospace; text-align: right; font-size: 12px; word-break: break-all; }

/* ── Badges ── */
.badge-row { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 14px; border-bottom: 1px solid var(--border); }
.badge { padding: 3px 9px; border-radius: 4px; font-size: 11px; font-weight: 600; font-family: 'Space Mono', monospace; letter-spacing: 0.04em; }

/* ── Hints & warnings ── */
.hint { font-size: 12px; color: var(--muted); margin-bottom: 8px; }
.hint.warn { color: var(--warn); }
.error { color: var(--danger); font-size: 13px; margin-top: 10px; padding: 10px 14px; background: #ff504010; border: 1px solid #ff504030; border-radius: 7px; }
.warn-box { padding: 10px 14px; font-size: 12px; color: var(--warn); background: #f9731610; border-top: 1px solid #f9731630; }
.info-box { padding: 10px 14px; font-size: 12px; color: var(--muted); background: #57b8ff08; border-top: 1px solid var(--border); }

/* ── Spinner ── */
.spin {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid #0a0a0a40; border-top-color: #0a0a0a;
  animation: spin 0.7s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
`

export default function App() {
  const [active, setActive] = useState('ip')
  const Tool = TOOLS.find(t => t.id === active)?.component || TOOLS[0].component

  return (
    <div className="layout">
      <style>{CSS}</style>

      {/* Nav */}
      <nav className="nav">
        <div>
          <div className="nav-logo">AI0 Lookup</div>
          <div className="nav-sub">Public data tools</div>
        </div>
        <a href="https://ai0-landing.pages.dev" className="nav-back">← AI0</a>
      </nav>

      {/* Scrollable tool area */}
      <div className="content">
        <Tool />
      </div>

      {/* Fixed tab bar */}
      <div className="tab-bar">
        {TOOLS.map(t => (
          <button
            key={t.id}
            className={`tab${active === t.id ? ' active' : ''}`}
            onClick={() => setActive(t.id)}
          >
            <div className="tab-icon">{t.icon}</div>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
