import { useState } from 'react'
import { ResultCard, Field, Badge, ToolWrap } from '../ui.jsx'

// Full IBAN country registry with expected lengths
const IBAN_FORMATS = {
  AD:24,AE:23,AL:28,AT:20,AZ:28,BA:20,BE:16,BG:22,BH:22,BR:29,BY:28,
  CH:21,CR:22,CY:28,CZ:24,DE:22,DK:18,DO:28,EE:20,EG:29,ES:24,FI:18,
  FO:18,FR:27,GB:22,GE:22,GI:23,GL:18,GR:27,GT:28,HR:21,HU:28,IE:22,
  IL:23,IQ:23,IS:26,IT:27,JO:30,KW:30,KZ:20,LB:28,LC:32,LI:21,LT:20,
  LU:20,LV:21,LY:25,MC:27,MD:24,ME:22,MK:19,MR:27,MT:31,MU:30,NL:18,
  NO:15,PK:24,PL:28,PS:29,PT:25,QA:29,RO:24,RS:22,SA:24,SC:31,SE:24,
  SI:19,SK:24,SM:27,ST:25,SV:28,TL:23,TN:24,TR:26,UA:29,VA:22,VG:24,
  XK:20,
}

const BANK_HINTS = {
  MT: 'Malta — MALT (4) + Bank (5) + Branch (1) + Account (18)',
  GB: 'UK — Sort code (6) + Account (8)',
  DE: 'Germany — Bankleitzahl (8) + Account (10)',
  FR: 'France — Bank (5) + Branch (5) + Account (11) + Key (2)',
  ES: 'Spain — Bank (4) + Branch (4) + Check (2) + Account (10)',
  IT: 'Italy — Check (1) + Bank (5) + Branch (5) + Account (12)',
  NL: 'Netherlands — Bank (4) + Account (10)',
  IE: 'Ireland — Bank (4) + Sort code (6) + Account (8)',
  BE: 'Belgium — Bank (3) + Account (7) + Check (2)',
}

function mod97(str) {
  let remainder = 0
  for (const ch of str) {
    remainder = (remainder * 10 + parseInt(ch, 10)) % 97
  }
  return remainder
}

function validateIBAN(raw) {
  const iban = raw.replace(/[\s\-]/g, '').toUpperCase()
  if (iban.length < 5) return { valid: false, reason: 'Too short' }

  const cc = iban.substring(0, 2)
  const expected = IBAN_FORMATS[cc]
  if (!expected) return { valid: false, reason: `Country code "${cc}" not recognised` }
  if (iban.length !== expected) return { valid: false, reason: `Expected ${expected} characters for ${cc}, got ${iban.length}` }

  // Rearrange: move first 4 chars to end, replace letters with numbers
  const rearranged = iban.slice(4) + iban.slice(0, 4)
  const numeric = rearranged.split('').map(c => {
    const n = c.charCodeAt(0)
    return n >= 65 && n <= 90 ? (n - 55).toString() : c
  }).join('')

  const checksum = mod97(numeric)
  if (checksum !== 1) return { valid: false, reason: 'Invalid checksum — possible typo' }

  // Parse structure
  const checkDigits = iban.substring(2, 4)
  const bban = iban.substring(4)

  return { valid: true, iban, cc, checkDigits, bban, expected }
}

// Pretty print IBAN in groups of 4
function prettyIBAN(iban) {
  return iban.replace(/(.{4})/g, '$1 ').trim()
}

export default function IbanCheck() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)

  function check(val) {
    const r = validateIBAN(val)
    setResult({ ...r, raw: val })
  }

  const d = result

  return (
    <ToolWrap
      icon="🏦" title="IBAN Validator"
      desc="Validates any IBAN using the ISO 13616 checksum algorithm. Fully offline — no API needed."
    >
      <div className="search-row">
        <input
          className="search-input"
          placeholder="MT84MALT011000012345MTLCAST001S"
          value={query}
          onChange={e => { setQuery(e.target.value.toUpperCase()); if (e.target.value.length > 4) check(e.target.value) }}
          onKeyDown={e => e.key === 'Enter' && check(query)}
          spellCheck={false}
          autoCapitalize="characters"
        />
        <button className="search-btn" onClick={() => check(query)}>Validate</button>
      </div>

      {query.length > 1 && (() => {
        const cc = query.replace(/\s/g,'').substring(0,2).toUpperCase()
        return BANK_HINTS[cc] ? <div className="hint">{BANK_HINTS[cc]}</div> : null
      })()}

      {d && (
        <ResultCard title={prettyIBAN(d.iban || d.raw)} icon="🏦">
          <div className="badge-row">
            {d.valid
              ? <Badge col="#00c878">Valid IBAN</Badge>
              : <Badge col="#ef4444">Invalid</Badge>
            }
            {d.cc && IBAN_FORMATS[d.cc] && (
              <Badge col="#00aacc">{d.cc}</Badge>
            )}
          </div>

          {!d.valid && <Field k="Issue" v={d.reason} />}
          {d.valid && <>
            <Field k="Country"       v={d.cc} />
            <Field k="Check digits"  v={d.checkDigits} />
            <Field k="BBAN"          v={d.bban} />
            <Field k="Format length" v={`${d.expected} characters`} />
            <Field k="Formatted"     v={prettyIBAN(d.iban)} />
          </>}

          <div className="info-box">
            ℹ Validation checks country code, length, and ISO 13616 mod-97 checksum. It does not confirm the account exists.
          </div>
        </ResultCard>
      )}
    </ToolWrap>
  )
}
