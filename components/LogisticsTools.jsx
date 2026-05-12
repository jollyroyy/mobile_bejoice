'use client';
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Container3DViewer, { WeightDistributionGuide } from './Container3DViewer'
import { SparklesCore } from './ui/sparkles'
import { useLang } from '@/context/LangContext'
import ar from '@/i18n/ar'

// ── helpers ────────────────────────────────────────────────────────────────
const CONTAINER_SPECS = {
  '20ft': { cbm: 25,  wt: 21700, label: '20ft Standard'   },
  '40ft': { cbm: 67,  wt: 26480, label: '40ft Standard'   },
  '40hc': { cbm: 76,  wt: 26450, label: '40ft High Cube'  },
}

const CONTAINER = (cbm, wt = 0) => {
  // Single container — include fill efficiency hint
  if (cbm <= 25  && wt <= 21700) {
    const pct = Math.round(cbm / 25 * 100)
    return pct < 60 ? `20ft Standard — ${pct}% fill (consider LCL if < 15 CBM)` : `20ft Standard — ${pct}% fill (good fit)`
  }
  if (cbm <= 67  && wt <= 26480) {
    const pct = Math.round(cbm / 67 * 100)
    return `40ft Standard — ${pct}% fill${pct < 50 ? ' (20ft may be cheaper)' : ' (optimal)'}`
  }
  if (cbm <= 76  && wt <= 26450) {
    const pct = Math.round(cbm / 76 * 100)
    return `40ft High Cube — ${pct}% fill (most cost-effective per CBM)`
  }
  // Multi-container — find best type (fewest containers, largest size wins ties)
  const opts = [
    { key:'20ft', ...CONTAINER_SPECS['20ft'] },
    { key:'40ft', ...CONTAINER_SPECS['40ft'] },
    { key:'40hc', ...CONTAINER_SPECS['40hc'] },
  ]
  let best = null
  for (const o of opts) {
    const nV = Math.ceil(cbm / o.cbm), nW = Math.ceil(wt / o.wt)
    const n = Math.max(nV, nW)
    if (!best || n < best.n || (n === best.n && o.cbm > best.cbm)) best = { n, label: o.label, key: o.key }
  }
  return `${best.n} × ${best.label} Containers Required`
}

const CONTAINER_COUNT = (cbm, wt = 0) => {
  if (cbm <= 76 && wt <= 26450) return 1
  const opts = [
    { cbm: 25,  wt: 21700 },
    { cbm: 67,  wt: 26480 },
    { cbm: 76,  wt: 26450 },
  ]
  let best = null
  for (const o of opts) {
    const n = Math.max(Math.ceil(cbm / o.cbm), Math.ceil(wt / o.wt))
    if (!best || n < best.n) best = { n }
  }
  return best ? best.n : 1
}

const TRUCK_CAP = {
  '3.5t': { vol: 18,  wt: 3500  },
  '10t':  { vol: 40,  wt: 10000 },
  '20t':  { vol: 80,  wt: 20000 },
  '40t':  { vol: 120, wt: 40000 },
}

const TO_CM = { cm: 1, m: 100, in: 2.54, ft: 30.48 }

const inp = {
  background:   'var(--obsidian-100)',
  border:       '1px solid rgba(255,255,255,0.08)',
  borderRadius: '4px',
  padding:      '0.75rem 1rem',
  color:        'var(--cream)',
  fontFamily:   "var(--font-dm-sans), sans-serif",
  fontSize:     '0.95rem',
  outline:      'none',
  width:        '100%',
  boxSizing:    'border-box',
  transition:   'all 0.3s ease',
}

const lbl = {
  fontFamily:    "var(--font-dm-sans), sans-serif",
  fontSize:      '0.72rem',
  fontWeight:    700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color:         'rgba(255,255,255,0.95)',
  display:       'block',
  marginBottom:  '0.35rem',
}

function Lbl({ children }) { return <span style={lbl}>{children}</span> }

const UNITS = ['cm','m','in','ft']

function UnitSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos]   = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width })
    setOpen(o => !o)
  }

  return (
    <div style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      <div
        ref={triggerRef}
        onClick={handleOpen}
        style={{
          ...inp,
          padding: '0.6rem 1.8rem 0.6rem 0.6rem',
          fontSize: '0.88rem',
          cursor: 'pointer',
          color: '#5BC2E7',
          border: `1px solid ${open ? 'rgba(91,194,231,0.8)' : 'rgba(91,194,231,0.35)'}`,
          borderRadius: '0.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#0c1c30',
          transition: 'border-color 0.2s',
          position: 'relative',
        }}
      >
        <span style={{ fontWeight: 700, letterSpacing: '0.1em' }}>{value}</span>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#5BC2E7" strokeWidth="2.5"
          style={{ position: 'absolute', right: '0.5rem', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>

      {open && createPortal(
        <div style={{
          position: 'absolute', top: pos.top, left: pos.left, width: pos.width, zIndex: 99999,
          background: '#0c1c30',
          border: '1px solid rgba(91,194,231,0.5)',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.95)',
        }}>
          {UNITS.map(u => (
            <div key={u}
              onMouseDown={(e) => { e.preventDefault(); onChange(u); setOpen(false) }}
              style={{
                padding: '0.5rem 0.7rem',
                color: u === value ? '#5BC2E7' : 'rgba(255,255,255,0.7)',
                background: u === value ? 'rgba(91,194,231,0.12)' : 'transparent',
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: '0.88rem', fontWeight: u === value ? 700 : 400,
                letterSpacing: '0.08em', cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,194,231,0.18)'; e.currentTarget.style.color = '#5BC2E7' }}
              onMouseLeave={e => { e.currentTarget.style.background = u === value ? 'rgba(91,194,231,0.12)' : 'transparent'; e.currentTarget.style.color = u === value ? '#5BC2E7' : 'rgba(255,255,255,0.7)' }}
            >{u}</div>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

const TRUCK_OPTS = [
  { value: '3.5t', label: '3.5t Pickup (18 CBM)' },
  { value: '10t',  label: '10t Truck (40 CBM)'   },
  { value: '20t',  label: '20t Truck (80 CBM)'   },
  { value: '40t',  label: '40t Semi (120 CBM)'   },
]

function TruckSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos]   = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef(null)
  const selected = TRUCK_OPTS.find(o => o.value === value) || TRUCK_OPTS[0]

  useEffect(() => {
    const handler = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width })
    setOpen(o => !o)
  }

  return (
    <div style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      <div
        ref={triggerRef}
        onClick={handleOpen}
        style={{
          ...inp,
          padding: '0.65rem 2rem 0.65rem 0.9rem',
          fontSize: '0.95rem',
          cursor: 'pointer',
          color: '#5BC2E7',
          border: `1px solid ${open ? 'rgba(91,194,231,0.8)' : 'rgba(91,194,231,0.35)'}`,
          borderRadius: '0.5rem',
          background: '#0c1c30',
          position: 'relative',
          transition: 'border-color 0.2s',
        }}
      >
        <span>{selected.label}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#5BC2E7" strokeWidth="2.5"
          style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>

      {open && createPortal(
        <div style={{
          position: 'absolute', top: pos.top, left: pos.left, width: pos.width, zIndex: 99999,
          background: '#0c1c30',
          border: '1px solid rgba(91,194,231,0.5)',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.95)',
        }}>
          {TRUCK_OPTS.map(o => (
            <div key={o.value}
              onClick={() => { onChange(o.value); setOpen(false) }}
              style={{
                padding: '0.6rem 0.9rem',
                color: o.value === value ? '#5BC2E7' : 'rgba(255,255,255,0.7)',
                background: o.value === value ? 'rgba(91,194,231,0.12)' : 'transparent',
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: '0.95rem', cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,194,231,0.18)'; e.currentTarget.style.color = '#5BC2E7' }}
              onMouseLeave={e => { e.currentTarget.style.background = o.value === value ? 'rgba(91,194,231,0.12)' : 'transparent'; e.currentTarget.style.color = o.value === value ? '#5BC2E7' : 'rgba(255,255,255,0.7)' }}
            >{o.label}</div>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

// ── tabs config ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'sea',       icon: '🚢', labelEn: 'Sea',       labelArKey: 'tabSea'       },
  { id: 'air',       icon: '✈️', labelEn: 'Air',       labelArKey: 'tabAir'       },
  { id: 'land',      icon: '🚛', labelEn: 'Land',      labelArKey: 'tabLand'      },
  { id: 'warehouse', icon: '🏭', labelEn: 'Warehouse', labelArKey: 'tabWarehouse' },
]

// ── main calculator ─────────────────────────────────────────────────────────
function LoadCalculator() {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const [tab,     setTab]     = useState('sea')
  const [results, setResults] = useState(null)

  // sea
  const [seaRows,   setSeaRows]   = useState([{ l:'', w:'', h:'', qty:'1', unit:'cm', stackable:true }])
  const [seaWeight, setSeaWeight] = useState('')

  // air
  const [airRows,    setAirRows]    = useState([{ l:'', w:'', h:'', qty:'1', unit:'cm', actual:'' }])

  // land
  const [landRows,  setLandRows]  = useState([{ l:'', w:'', h:'', qty:'1', weight:'', unit:'cm' }])
  const [truckType, setTruckType] = useState('20t')

  // warehouse
  const [whRows,  setWhRows]  = useState([{ l:'', w:'', h:'', qty:'1', unit:'cm' }])
  const [whDays,  setWhDays]  = useState('30')

  const hasCalculated = useRef(false)

  const calculate = () => {
    hasCalculated.current = true
    if (tab === 'sea') {
      let totalCBM = 0
      const totalKg = parseFloat(seaWeight) || 0
      for (const r of seaRows) {
        const f = TO_CM[r.unit] || 1
        const lcm = (parseFloat(r.l)||0)*f, wcm = (parseFloat(r.w)||0)*f, hcm = (parseFloat(r.h)||0)*f
        totalCBM += (lcm*wcm*hcm/1e6)*(parseInt(r.qty)||1)
      }
      const containerCount = CONTAINER_COUNT(totalCBM, totalKg)
      const actualLoadPct = (totalCBM / 76 * 100).toFixed(1)
      setResults({ tab:'sea', cbm:totalCBM.toFixed(3), weight:totalKg, container:CONTAINER(totalCBM, totalKg), loadPct:Math.min(100, actualLoadPct).toFixed(1), actualLoadPct, containerCount })
    } else if (tab === 'air') {
      let totalVol = 0, totalAct = 0
      for (const r of airRows) {
        const f = TO_CM[r.unit] || 1
        const lcm=(parseFloat(r.l)||0)*f, wcm=(parseFloat(r.w)||0)*f, hcm=(parseFloat(r.h)||0)*f
        const q = parseInt(r.qty)||1
        totalVol += (lcm*wcm*hcm/5000)*q
        totalAct += (parseFloat(r.actual)||0)*q
      }
      const chargeable = Math.max(totalVol, totalAct)
      setResults({ tab:'air', volWeight:totalVol.toFixed(2), actWeight:totalAct.toFixed(2), chargeable:chargeable.toFixed(2), basis:chargeable===totalVol?'Volumetric':'Actual' })
    } else if (tab === 'land') {
      let totalVol = 0, totalKg = 0
      for (const r of landRows) {
        const f = TO_CM[r.unit] || 1
        const q = parseInt(r.qty)||1
        totalVol += ((parseFloat(r.l)||0)*f*(parseFloat(r.w)||0)*f*(parseFloat(r.h)||0)*f/1e6)*q
        totalKg  += (parseFloat(r.weight)||0)*q
      }
      const cap = TRUCK_CAP[truckType]
      setResults({ tab:'land', vol:totalVol.toFixed(3), weight:totalKg.toFixed(0), truck:truckType, volPct:Math.min(100,(totalVol/cap.vol*100)).toFixed(1), wtPct:Math.min(100,(totalKg/cap.wt*100)).toFixed(1) })
    } else {
      let cbm = 0
      for (const r of whRows) {
        const f = TO_CM[r.unit] || 1
        cbm += ((parseFloat(r.l)||0)*f*(parseFloat(r.w)||0)*f*(parseFloat(r.h)||0)*f/1e6)*(parseInt(r.qty)||1)
      }
      const days = parseFloat(whDays)||1
      setResults({ tab:'warehouse', cbm:cbm.toFixed(3), days, cost:(cbm*days*0.35).toFixed(2) })
    }
  }

  // Auto-recalculate whenever any input changes (only after first manual calculate)
  useEffect(() => {
    if (!hasCalculated.current) return
    calculate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, seaRows, seaWeight, airRows, landRows, truckType, whRows, whDays])

  // Escape HTML special chars to prevent injection into document.write output
  const escHtml = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  // Escape CSV values: quote fields containing commas/quotes/newlines; prefix formula chars to neutralise spreadsheet injection
  const escCsv = v => {
    const s = String(v)
    const needsQuote = /[,"\n\r]/.test(s)
    // Prefix formula-triggering chars with a leading apostrophe so Excel/Sheets won't evaluate them
    const safe = /^[=+\-@\t]/.test(s) ? "'" + s : s
    return needsQuote ? '"' + safe.replace(/"/g,'""') + '"' : safe
  }

  const exportCSV = () => {
    if (!results) return
    const rows = [['Field','Value']]
    Object.entries(results).forEach(([k,v]) => k !== 'tab' && rows.push([k,v]))
    const a = document.createElement('a')
    a.href = 'data:text/csv,' + encodeURIComponent(rows.map(r=>r.map(escCsv).join(',')).join('\n'))
    a.download = `bejoice-${results.tab}-calc.csv`; a.click()
  }

  const exportPDF = () => {
    if (!results) return
    const w = window.open('','_blank','noopener,noreferrer')
    if (!w) return
    w.document.write(`<html><head><title>Bejoice Load Calc</title><style>body{font-family:sans-serif;padding:2rem;color:#111}h2{color:#5BC2E7}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px}th{background:#f5f5f5}</style></head><body><h2>Bejoice Group — Load Calculation</h2><p>${escHtml(new Date().toLocaleString())}</p><table><tr><th>Field</th><th>Value</th></tr>${Object.entries(results).filter(([k])=>k!=='tab').map(([k,v])=>`<tr><td>${escHtml(k)}</td><td>${escHtml(v)}</td></tr>`).join('')}</table></body></html>`)
    w.document.close(); w.print()
  }

  const addRowBtn = (onClick) => (
    <button onClick={onClick}
      style={{ background:'rgba(91,194,231,0.1)', border:'1px solid rgba(91,194,231,0.3)', borderRadius:'0.5rem', color:'#5BC2E7', cursor:'pointer', padding:'0.45rem 1rem', fontFamily:"var(--font-dm-sans), sans-serif", fontSize:'0.8rem', fontWeight:700, whiteSpace:'nowrap', transition:'all 0.2s' }}
      onMouseEnter={e=>e.currentTarget.style.background='rgba(91,194,231,0.18)'}
      onMouseLeave={e=>e.currentTarget.style.background='rgba(91,194,231,0.1)'}
    >{isAr ? ar.logisticsTools.addRow : '+ Add Row'}</button>
  )

  const removeBtn = (onClick) => (
    <button onClick={onClick}
      style={{ background:'rgba(255,50,50,0.12)', border:'1px solid rgba(255,80,80,0.2)', borderRadius:'0.4rem', color:'rgba(255,110,110,0.9)', cursor:'pointer', padding:'0.55rem 0.7rem', alignSelf:'flex-end', transition:'all 0.2s' }}
      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,50,50,0.22)'}
      onMouseLeave={e=>e.currentTarget.style.background='rgba(255,50,50,0.12)'}
    >✕</button>
  )

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* ── Tabs ── */}
      <div style={{ display:'flex', gap:'0.5rem', padding:'1.2rem 1.4rem 0', flexShrink:0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setResults(null) }}
            style={{
              flex:1, padding:'0.7rem 0.3rem',
              background:   tab===t.id ? 'linear-gradient(135deg,#a8e4f7,#5BC2E7)' : 'rgba(255,255,255,0.04)',
              border:       '1px solid',
              borderColor:  tab===t.id ? 'transparent' : 'rgba(255,255,255,0.12)',
              borderRadius: '0.65rem',
              color:        tab===t.id ? '#0a1826' : 'rgba(255,255,255,0.7)',
              fontFamily:   "var(--font-dm-sans), sans-serif",
              fontSize:     '0.75rem', fontWeight: 800,
              cursor:       'pointer', letterSpacing: '0.04em',
              display:      'flex', flexDirection:'column', alignItems:'center', gap:'0.25rem',
              transition:   'all 0.2s',
              boxShadow:    tab===t.id ? '0 4px 16px rgba(91,194,231,0.3)' : 'none',
            }}>
            <span style={{ fontSize:'1.1rem' }}>{t.icon}</span>
            <span>{isAr ? ar.logisticsTools[t.labelArKey] : t.labelEn}</span>
          </button>
        ))}
      </div>

      {/* ── Inputs ── */}
      <div style={{ flex:1, overflowY:'auto', padding:'1.1rem 1.4rem' }}>

        {/* SEA */}
        {tab==='sea' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
            {seaRows.map((r,i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'0.6rem', padding:'0.75rem', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                <div className="sea-row-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 0.6fr 0.7fr auto', gap:'0.4rem', alignItems:'end' }}>
                  {['l','w','h'].map(f => (
                    <div key={f}>
                      <Lbl>{f.toUpperCase()}</Lbl>
                      <input style={inp} type="number" value={r[f]} placeholder="0"
                        onChange={e=>setSeaRows(rows=>rows.map((row,idx)=>idx===i?{...row,[f]:e.target.value}:row))} />
                    </div>
                  ))}
                  <div>
                    <Lbl>{isAr ? ar.logisticsTools.qty : 'Qty'}</Lbl>
                    <input style={inp} type="number" value={r.qty}
                      onChange={e=>setSeaRows(rows=>rows.map((row,idx)=>idx===i?{...row,qty:e.target.value}:row))} />
                  </div>
                  <div>
                    <Lbl>{isAr ? ar.logisticsTools.unit : 'Unit'}</Lbl>
                    <UnitSelect value={r.unit} onChange={v=>setSeaRows(rows=>rows.map((row,idx)=>idx===i?{...row,unit:v}:row))} />
                  </div>
                  {seaRows.length>1 && removeBtn(()=>setSeaRows(r=>r.filter((_,idx)=>idx!==i)))}
                </div>

                {/* Stackable checkbox */}
                <label style={{ display:'flex', alignItems:'center', gap:'0.55rem', cursor:'pointer', userSelect:'none', width:'fit-content' }}>
                  <div
                    onClick={() => setSeaRows(rows => rows.map((row,idx) => idx===i ? {...row, stackable:!row.stackable} : row))}
                    style={{
                      width:18, height:18, borderRadius:4, flexShrink:0,
                      border: `1.5px solid ${r.stackable ? '#5BC2E7' : 'rgba(255,255,255,0.25)'}`,
                      background: r.stackable ? 'rgba(91,194,231,0.2)' : 'rgba(255,255,255,0.04)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      transition:'all 0.2s',
                    }}
                  >
                    {r.stackable && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#5BC2E7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontFamily:"var(--font-dm-sans), sans-serif", fontSize:'0.92rem', fontWeight:600, color: r.stackable ? 'rgba(91,194,231,0.9)' : 'rgba(255,255,255,0.4)', transition:'color 0.2s' }}>
                    {r.stackable ? (isAr ? ar.logisticsTools.stackable : 'Stackable') : (isAr ? ar.logisticsTools.nonStackable : 'Non-stackable')}
                  </span>
                </label>
              </div>
            ))}
            <div style={{ display:'flex', gap:'0.8rem', alignItems:'flex-end' }}>
              {addRowBtn(()=>setSeaRows(r=>[...r,{l:'',w:'',h:'',qty:'1',unit:'cm',stackable:true}]))}
              <div style={{ flex:1 }}>
                <Lbl>{isAr ? ar.logisticsTools.totalWeightKg : 'Total Weight (kg)'}</Lbl>
                <input style={inp} type="number" value={seaWeight} placeholder="0" onChange={e=>setSeaWeight(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* AIR */}
        {tab==='air' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
            {airRows.map((r,i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', gap:'0.5rem', padding:'0.8rem', background:'rgba(255,255,255,0.03)', borderRadius:'0.6rem', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="air-row-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 0.6fr 0.7fr', gap:'0.4rem' }}>
                  {['l','w','h'].map(f => (
                    <div key={f}>
                      <Lbl>{f.toUpperCase()}</Lbl>
                      <input style={inp} type="number" value={r[f]} placeholder="0"
                        onChange={e=>setAirRows(rows=>rows.map((row,idx)=>idx===i?{...row,[f]:e.target.value}:row))} />
                    </div>
                  ))}
                  <div>
                    <Lbl>{isAr ? ar.logisticsTools.qty : 'Qty'}</Lbl>
                    <input style={inp} type="number" value={r.qty}
                      onChange={e=>setAirRows(rows=>rows.map((row,idx)=>idx===i?{...row,qty:e.target.value}:row))} />
                  </div>
                  <div>
                    <Lbl>{isAr ? ar.logisticsTools.unit : 'Unit'}</Lbl>
                    <UnitSelect value={r.unit} onChange={v=>setAirRows(rows=>rows.map((row,idx)=>idx===i?{...row,unit:v}:row))} />
                  </div>
                </div>
                <div style={{ display:'flex', gap:'0.4rem', alignItems:'flex-end' }}>
                  <div style={{ flex:1 }}>
                    <Lbl>{isAr ? ar.logisticsTools.actualWeightKg : 'Actual Weight (kg/pc)'}</Lbl>
                    <input style={inp} type="number" value={r.actual} placeholder="0"
                      onChange={e=>setAirRows(rows=>rows.map((row,idx)=>idx===i?{...row,actual:e.target.value}:row))} />
                  </div>
                  {airRows.length>1 && removeBtn(()=>setAirRows(r=>r.filter((_,idx)=>idx!==i)))}
                </div>
              </div>
            ))}
            {addRowBtn(()=>setAirRows(r=>[...r,{l:'',w:'',h:'',qty:'1',unit:'cm',actual:''}]))}
            <p style={{ fontFamily:"var(--font-dm-sans), sans-serif", fontSize:'0.78rem', color:'rgba(255,255,255,0.75)', margin:0 }}>
              {isAr ? ar.logisticsTools.volWeightNote : 'Volumetric weight = L×W×H ÷ 5000 (in cm) per piece'}
            </p>
          </div>
        )}

        {/* LAND */}
        {tab==='land' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
            <div>
              <Lbl>{isAr ? ar.logisticsTools.truckType : 'Truck Type'}</Lbl>
              <TruckSelect value={truckType} onChange={setTruckType} />
            </div>
            {landRows.map((r,i)=>(
              <div key={i} className="land-row-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 0.6fr 0.7fr 0.8fr auto', gap:'0.4rem', alignItems:'end' }}>
                {['l','w','h'].map(f=>(
                  <div key={f}>
                    <Lbl>{f.toUpperCase()}</Lbl>
                    <input style={inp} type="number" value={r[f]} placeholder="0"
                      onChange={e=>setLandRows(rows=>rows.map((row,idx)=>idx===i?{...row,[f]:e.target.value}:row))} />
                  </div>
                ))}
                <div>
                  <Lbl>{isAr ? ar.logisticsTools.qty : 'Qty'}</Lbl>
                  <input style={inp} type="number" value={r.qty}
                    onChange={e=>setLandRows(rows=>rows.map((row,idx)=>idx===i?{...row,qty:e.target.value}:row))} />
                </div>
                <div>
                  <Lbl>{isAr ? ar.logisticsTools.unit : 'Unit'}</Lbl>
                  <UnitSelect value={r.unit} onChange={v=>setLandRows(rows=>rows.map((row,idx)=>idx===i?{...row,unit:v}:row))} />
                </div>
                <div>
                  <Lbl>{isAr ? ar.logisticsTools.kgPc : 'kg/pc'}</Lbl>
                  <input style={inp} type="number" value={r.weight}
                    onChange={e=>setLandRows(rows=>rows.map((row,idx)=>idx===i?{...row,weight:e.target.value}:row))} />
                </div>
                {landRows.length>1 && removeBtn(()=>setLandRows(r=>r.filter((_,idx)=>idx!==i)))}
              </div>
            ))}
            {addRowBtn(()=>setLandRows(r=>[...r,{l:'',w:'',h:'',qty:'1',weight:'',unit:'cm'}]))}
          </div>
        )}

        {/* WAREHOUSE */}
        {tab==='warehouse' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
            {whRows.map((r,i)=>(
              <div key={i} className="wh-row-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 0.6fr 0.7fr auto', gap:'0.4rem', alignItems:'end' }}>
                {['l','w','h'].map(f=>(
                  <div key={f}>
                    <Lbl>{f.toUpperCase()}</Lbl>
                    <input style={inp} type="number" value={r[f]} placeholder="0"
                      onChange={e=>setWhRows(rows=>rows.map((row,idx)=>idx===i?{...row,[f]:e.target.value}:row))} />
                  </div>
                ))}
                <div>
                  <Lbl>{isAr ? ar.logisticsTools.qty : 'Qty'}</Lbl>
                  <input style={inp} type="number" value={r.qty}
                    onChange={e=>setWhRows(rows=>rows.map((row,idx)=>idx===i?{...row,qty:e.target.value}:row))} />
                </div>
                <div>
                  <Lbl>{isAr ? ar.logisticsTools.unit : 'Unit'}</Lbl>
                  <UnitSelect value={r.unit} onChange={v=>setWhRows(rows=>rows.map((row,idx)=>idx===i?{...row,unit:v}:row))} />
                </div>
                {whRows.length>1 && removeBtn(()=>setWhRows(r=>r.filter((_,idx)=>idx!==i)))}
              </div>
            ))}
            <div style={{ display:'flex', gap:'0.8rem', alignItems:'flex-end' }}>
              {addRowBtn(()=>setWhRows(r=>[...r,{l:'',w:'',h:'',qty:'1',unit:'cm'}]))}
              <div style={{ flex:1 }}>
                <Lbl>{isAr ? ar.logisticsTools.storageDays : 'Storage Days'}</Lbl>
                <input style={inp} type="number" value={whDays} placeholder="30" onChange={e=>setWhDays(e.target.value)} />
              </div>
            </div>
            <p style={{ fontFamily:"var(--font-dm-sans), sans-serif", fontSize:'0.78rem', color:'rgba(255,255,255,0.75)', margin:0 }}>
              {isAr ? ar.logisticsTools.warehouseRateNote : 'Rate: $0.35 / CBM / day (indicative)'}
            </p>
          </div>
        )}

        {/* ── Results ── */}
        <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity:0, y:12 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:8 }}
            transition={{ duration:0.35, ease:[0.16,1,0.3,1] }}
            style={{ marginTop:'1.4rem', background:'rgba(8,8,18,0.9)', border:'1.5px solid rgba(91,194,231,0.4)', borderRadius:'1rem', padding:'1.5rem', boxShadow:'0 20px 50px rgba(0,0,0,0.5)', position:'relative', overflow:'hidden' }}
          >
            <div style={{ position:'absolute', top:'-50%', right:'-20%', width:'160px', height:'160px', background:'rgba(91,194,231,0.12)', filter:'blur(40px)', borderRadius:'50%', pointerEvents:'none' }} />
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.1rem' }}>
              <span style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "var(--font-bebas), sans-serif", fontSize:'1.4rem', letterSpacing: isAr ? 0 : '0.1em', color:'#5BC2E7' }}>{isAr ? ar.logisticsTools.aiLoadAnalysis : 'AI LOAD ANALYSIS'}</span>
              <div style={{ width:9, height:9, background:'#25c864', borderRadius:'50%', boxShadow:'0 0 12px #25c864' }} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(160px,100%), 1fr))', gap:'0.9rem', marginBottom:'1.2rem' }}>
              <div style={{ background:'rgba(255,255,255,0.04)', padding:'0.9rem', borderRadius:'0.7rem', border:'1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ display:'block', fontSize:'0.68rem', color:'rgba(255,255,255,0.88)', textTransform:'uppercase', fontWeight:700, marginBottom:'0.25rem', letterSpacing:'0.1em' }}>
                  {results.tab==='air' ? (isAr ? ar.logisticsTools.chargeableWt : 'Chargeable Wt') : (isAr ? ar.logisticsTools.totalVolume : 'Total Volume')}
                </span>
                <span style={{ fontSize:'1.7rem', fontFamily:"var(--font-bebas), sans-serif", color:'#fff', letterSpacing:'0.04em' }}>
                  {results.tab==='air' ? results.chargeable : results.cbm}
                  <span style={{ fontSize:'0.8rem', marginLeft:'0.3rem', color:'#5BC2E7' }}>{results.tab==='air' ? 'KG' : 'CBM'}</span>
                </span>
              </div>

              {results.loadPct && (
                <div style={{ background:'rgba(255,255,255,0.04)', padding:'0.9rem', borderRadius:'0.7rem', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ display:'block', fontSize:'0.68rem', color:'rgba(255,255,255,0.88)', textTransform:'uppercase', fontWeight:700, marginBottom:'0.25rem', letterSpacing:'0.1em' }}>{isAr ? ar.logisticsTools.usageEfficiency : 'Usage Efficiency'}</span>
                  <div style={{ display:'flex', alignItems:'baseline', gap:'0.2rem' }}>
                    <span style={{ fontSize:'1.7rem', fontFamily:"var(--font-bebas), sans-serif", color: results.loadPct>90 ? '#ff5050' : '#fff' }}>{results.loadPct}</span>
                    <span style={{ fontSize:'0.9rem', color:'rgba(255,255,255,0.85)', fontFamily:"var(--font-bebas), sans-serif" }}>%</span>
                  </div>
                </div>
              )}

              {results.tab==='air' && (
                <div style={{ background:'rgba(255,255,255,0.04)', padding:'0.9rem', borderRadius:'0.7rem', border:'1px solid rgba(255,255,255,0.07)', gridColumn:'span 2' }}>
                  <span style={{ display:'block', fontSize:'0.68rem', color:'rgba(255,255,255,0.88)', textTransform:'uppercase', fontWeight:700, marginBottom:'0.4rem', letterSpacing:'0.1em' }}>{isAr ? ar.logisticsTools.billingBasis : 'Billing Basis'}</span>
                  <span style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "var(--font-bebas), sans-serif", fontSize:'1.1rem', color:'#5BC2E7', letterSpacing: isAr ? 0 : '0.05em' }}>
                    {isAr ? (results.basis==='Volumetric' ? ar.logisticsTools.volumetric : ar.logisticsTools.actual) : results.basis} {isAr ? ar.logisticsTools.weightLabel : 'Weight'} — {results.basis==='Volumetric' ? results.volWeight : results.actWeight} kg
                  </span>
                </div>
              )}

              {results.tab==='land' && (<>
                <div style={{ background:'rgba(255,255,255,0.04)', padding:'0.9rem', borderRadius:'0.7rem', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ display:'block', fontSize:'0.68rem', color:'rgba(255,255,255,0.88)', textTransform:'uppercase', fontWeight:700, marginBottom:'0.25rem', letterSpacing:'0.1em' }}>{isAr ? ar.logisticsTools.volumeFill : 'Volume Fill'}</span>
                  <span style={{ fontSize:'1.7rem', fontFamily:"var(--font-bebas), sans-serif", color: results.volPct>90?'#ff5050':'#fff' }}>
                    {results.volPct}<span style={{ fontSize:'0.9rem', color:'rgba(255,255,255,0.85)', fontFamily:"var(--font-bebas), sans-serif" }}>%</span>
                  </span>
                </div>
                <div style={{ background:'rgba(255,255,255,0.04)', padding:'0.9rem', borderRadius:'0.7rem', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ display:'block', fontSize:'0.68rem', color:'rgba(255,255,255,0.88)', textTransform:'uppercase', fontWeight:700, marginBottom:'0.25rem', letterSpacing:'0.1em' }}>{isAr ? ar.logisticsTools.weightFill : 'Weight Fill'}</span>
                  <span style={{ fontSize:'1.7rem', fontFamily:"var(--font-bebas), sans-serif", color: results.wtPct>90?'#ff5050':'#fff' }}>
                    {results.wtPct}<span style={{ fontSize:'0.9rem', color:'rgba(255,255,255,0.85)', fontFamily:"var(--font-bebas), sans-serif" }}>%</span>
                  </span>
                </div>
              </>)}

              {results.tab==='warehouse' && (
                <div style={{ background:'rgba(255,255,255,0.04)', padding:'0.9rem', borderRadius:'0.7rem', border:'1px solid rgba(255,255,255,0.07)', gridColumn:'span 2' }}>
                  <span style={{ display:'block', fontSize:'0.68rem', color:'rgba(255,255,255,0.88)', textTransform:'uppercase', fontWeight:700, marginBottom:'0.25rem', letterSpacing:'0.1em' }}>{isAr ? ar.logisticsTools.indicativeCost : 'Indicative Cost'}</span>
                  <span style={{ fontSize:'1.7rem', fontFamily:"var(--font-bebas), sans-serif", color:'#fff' }}>
                    ${results.cost}<span style={{ fontSize:'0.8rem', marginLeft:'0.3rem', color:'#5BC2E7' }}>USD</span>
                  </span>
                </div>
              )}
            </div>

            {results.loadPct && (
              <div style={{ marginBottom:'1.2rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color:'rgba(255,255,255,0.85)', marginBottom:'0.5rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  <span>{isAr ? ar.logisticsTools.containerCapacity : 'Container Capacity'}</span>
                  <span style={{ color: results.actualLoadPct > 100 ? '#ff5050' : 'rgba(255,255,255,0.85)' }}>
                    {results.actualLoadPct}%{results.actualLoadPct > 100 ? (isAr ? ' ⚠ ' + ar.logisticsTools.overflow : ' ⚠ OVERFLOW') : ''}
                  </span>
                </div>
                <div style={{ height:'6px', background:'rgba(255,255,255,0.08)', borderRadius:'4px', overflow:'hidden' }}>
                  <motion.div
                    initial={{ width:0 }}
                    animate={{ width:`${Math.min(100, results.loadPct)}%` }}
                    transition={{ duration:0.9, ease:'easeOut' }}
                    style={{ height:'100%', background: results.actualLoadPct > 100 ? 'linear-gradient(90deg,#ff5050,#ff8080)' : results.loadPct > 90 ? 'linear-gradient(90deg,#5BC2E7,#ff5050)' : 'linear-gradient(90deg,#5BC2E7,#e8d48a)', borderRadius:'4px' }}
                  />
                </div>
                {results.actualLoadPct > 100 && (
                  <div style={{ marginTop:'0.4rem', fontSize:'0.65rem', color:'rgba(255,80,80,0.9)', fontWeight:600, letterSpacing:'0.08em' }}>
                    {isAr ? ar.logisticsTools.cargoExceedsContainer : 'Cargo exceeds single container capacity — see recommendation below'}
                  </div>
                )}
              </div>
            )}

            {/* ── Containers Required (shown prominently when > 1) ── */}
            {results.containerCount > 1 && (
              <div style={{ padding:'1rem', background:'rgba(255,80,80,0.08)', borderRadius:'0.7rem', border:'1px solid rgba(255,80,80,0.3)', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'1rem' }}>
                <div style={{ fontSize:'2.4rem', fontFamily:"var(--font-bebas), sans-serif", color:'#ff6060', letterSpacing:'0.04em', lineHeight:1, flexShrink:0 }}>
                  {results.containerCount}
                </div>
                <div>
                  <div style={{ fontSize:'0.65rem', color:'rgba(255,130,130,0.9)', textTransform:'uppercase', fontWeight:700, letterSpacing:'0.12em', marginBottom:'0.2rem' }}>{isAr ? ar.logisticsTools.containersRequired : 'Containers Required'}</div>
                  <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.75)', lineHeight:1.4 }}>
                    {isAr
                      ? <>{ar.logisticsTools.cargoExceedsMulti1}<strong style={{ color:'#fff' }}>{results.containerCount}</strong>{ar.logisticsTools.cargoExceedsMulti2}</>
                      : <>Your cargo exceeds one container. Split across <strong style={{ color:'#fff' }}>{results.containerCount}</strong> containers to ship the full volume.</>}
                  </div>
                </div>
              </div>
            )}

            {results.container && (
              <div style={{ padding:'0.9rem', background:'rgba(91,194,231,0.1)', borderRadius:'0.7rem', border:'1px dashed rgba(91,194,231,0.35)', marginBottom:'1.2rem' }}>
                <span style={{ display:'block', fontSize:'0.68rem', color:'#5BC2E7', textTransform:'uppercase', fontWeight:700, marginBottom:'0.5rem', letterSpacing:'0.1em' }}>{isAr ? ar.logisticsTools.aiRecommendation : 'AI Recommendation'}</span>
                <span style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "var(--font-bebas), sans-serif", fontSize:'1.15rem', color:'#fff', letterSpacing: isAr ? 0 : '0.05em', display:'block', marginBottom: results.containerCount > 1 ? '0.6rem' : 0 }}>{results.container}</span>
                {results.containerCount > 1 && (
                  <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.65)', lineHeight:1.55, borderTop:'1px solid rgba(91,194,231,0.2)', paddingTop:'0.5rem' }}>
                    <strong style={{ color:'#5BC2E7' }}>{isAr ? ar.logisticsTools.costTipLabel : 'Cost tip:'}</strong> {isAr ? ar.logisticsTools.costTipBody : '40ft High Cube is most cost-effective per CBM for large volumes. Consolidating into fewer, larger containers reduces handling fees and port charges. Ask Bejoice for a multi-container rate.'}
                  </div>
                )}
              </div>
            )}

            {/* ── 3D Container Visualisation (Sea tab only) ── */}
            {results.tab === 'sea' && (() => {
              const totalKg = parseFloat(results.weight) || 0
              const perRow = totalKg / Math.max(1, seaRows.length)
              const items3d = seaRows.map(r => {
                const f = TO_CM[r.unit] || 1
                return {
                  l: Math.max(1, (parseFloat(r.l)||50)*f),
                  w: Math.max(1, (parseFloat(r.w)||50)*f),
                  h: Math.max(1, (parseFloat(r.h)||50)*f),
                  weight: perRow,
                  qty: parseInt(r.qty)||1,
                  unit: 'cm',
                  stackable: r.stackable !== false,
                }
              })
              const ctbm = parseFloat(results.cbm) || 0
              const ctype = ctbm <= 25 ? '20ft' : ctbm <= 67 ? '40ft' : '40hc'
              return (
                <div style={{ marginTop:'1.4rem', borderTop:'1px solid rgba(91,194,231,0.15)', paddingTop:'1.2rem' }}>
                  <div style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "var(--font-bebas), sans-serif", fontSize:'2rem', color:'#5BC2E7', letterSpacing: isAr ? 0 : 3, marginBottom:'0.8rem', textAlign:'center' }}>
                    {isAr ? ar.logisticsTools.viz3dTitle : '3D CONTAINER LOAD VISUALISATION'}
                  </div>
                  <Container3DViewer items={items3d} containerType={ctype} compact={true} />
                  <WeightDistributionGuide items={items3d} containerType={ctype} />
                </div>
              )
            })()}

            <div style={{ display:'flex', gap:'0.7rem' }}>
              <button onClick={exportCSV}
                style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'0.6rem', color:'#fff', padding:'0.7rem', cursor:'pointer', fontFamily:"var(--font-dm-sans), sans-serif", fontSize:'0.82rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', transition:'all 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}>
                📥 CSV
              </button>
              <button onClick={exportPDF}
                style={{ flex:1, background:'linear-gradient(135deg,#a8e4f7,#5BC2E7)', border:'none', borderRadius:'0.6rem', color:'#0a1826', padding:'0.7rem', cursor:'pointer', fontFamily:"var(--font-dm-sans), sans-serif", fontSize:'0.82rem', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', transition:'all 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.opacity='0.88'}
                onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                📄 PDF Report
              </button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* ── Calculate button ── */}
      <div style={{ padding:'1rem 1.4rem', borderTop:'1px solid rgba(255,255,255,0.08)', flexShrink:0, display:'flex', justifyContent:'center' }}>
        <button onClick={calculate} className="btn-gold" style={{ width:'auto', fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : undefined }}>
          <div className="btn-shine-overlay" />
          {isAr ? ar.logisticsTools.generateAnalysis : 'GENERATE AI ANALYSIS'}
        </button>
      </div>
    </div>
  )
}

// ── Section wrapper ─────────────────────────────────────────────────────────
export default function LogisticsTools() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  return (
    <section id="tools" style={{
      background: '#183650',
      padding: 'clamp(80px,10vw,130px) clamp(1.5rem,8vw,8rem)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      <SparklesCore background="transparent" minSize={0.6} maxSize={2} particleDensity={60} particleColor="rgba(91,194,231,0.9)" speed={0.8} className="absolute inset-0 w-full h-full pointer-events-none" />
      {/* Ambient glows */}
      <div style={{ position:'absolute', top:'5%', right:'-10%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle,rgba(91,194,231,0.05) 0%,transparent 65%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'5%', left:'-8%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(30,60,180,0.05) 0%,transparent 65%)', pointerEvents:'none' }} />

      <div style={{ maxWidth:'1400px', margin:'0 auto', position:'relative', zIndex:1 }}>

        {/* Single unified card — heading + calculator */}
        <motion.div
          initial={{ opacity:0, y:24 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true, margin:'-8%' }}
          transition={{ duration:0.9, ease:[0.16,1,0.3,1] }}
          style={{ display:'flex', justifyContent:'center' }}
        >
          <div style={{
            width:'100%', maxWidth:'1080px',
            background:'linear-gradient(145deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 50%, rgba(91,194,231,0.018) 100%)',
            backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)',
            border:'1px solid rgba(91,194,231,0.35)',
            borderTop:'1px solid rgba(91,194,231,0.65)',
            borderRadius:28, overflow:'hidden', position:'relative',
            padding:'clamp(2rem,5vw,4rem) clamp(1.5rem,4vw,3.5rem) clamp(2rem,4vw,3rem)',
            boxShadow:[
              '0 60px 120px rgba(0,0,0,0.75)',
              '0 0 0 1px rgba(91,194,231,0.08) inset',
              'inset 0 1px 0 rgba(91,194,231,0.30)',
              '0 0 60px rgba(91,194,231,0.10)',
              '0 0 120px rgba(91,194,231,0.05)',
            ].join(', '),
          }}>

            {/* Corner accent — top-left */}
            <div style={{ position:'absolute', top:0, left:0, width:120, height:120, pointerEvents:'none',
              background:'radial-gradient(circle at 0% 0%, rgba(91,194,231,0.12) 0%, transparent 65%)' }}/>
            {/* Corner accent — bottom-right */}
            <div style={{ position:'absolute', bottom:0, right:0, width:200, height:200, pointerEvents:'none',
              background:'radial-gradient(circle at 100% 100%, rgba(91,194,231,0.07) 0%, transparent 60%)' }}/>
            {/* Top gold shimmer line */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1, pointerEvents:'none',
              background:'linear-gradient(90deg, transparent 0%, rgba(91,194,231,0.6) 40%, rgba(91,194,231,0.8) 50%, rgba(91,194,231,0.6) 60%, transparent 100%)' }}/>

            {/* ── Heading ── */}
            <div style={{ textAlign:'center', marginBottom:'clamp(2rem,4vw,3.5rem)', position:'relative', zIndex:1 }}>
              <h2 style={{
                fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "var(--font-bebas), sans-serif",
                fontSize:'clamp(2.4rem,5.5vw,4.8rem)',
                letterSpacing: isAr ? 0 : '0.07em', lineHeight:1,
                margin:'0 0 clamp(0.6rem,1.5vw,1rem)',
                color:'#ffffff',
              }}>
                {isAr
                  ? <>{ar.logisticsTools.mainHeadingWhite} <span style={{ color:'#5BC2E7' }}>{ar.logisticsTools.mainHeadingBlue}</span></>
                  : <>LOAD <span style={{ color:'#5BC2E7' }}>CALCULATION</span></>}
              </h2>
              <p style={{
                fontFamily:"var(--font-dm-sans), sans-serif", fontSize: isAr ? 'clamp(21px, 2.3vw, 25px)' : 'clamp(15px, 1.9vw, 19px)',
                color:'#ffffff', maxWidth:700, margin:'0 auto', lineHeight:1.8,
                fontWeight:500, textShadow:'0 0 24px rgba(255,255,255,0.25)', opacity:0.95,
              }}>
                {isAr ? ar.logisticsTools.subtitle : 'Instant CBM & chargeable weight — Sea, Air, Land or Warehouse.'}
              </p>
              <div style={{ width:48, height:1, margin:'clamp(1rem,2vw,1.6rem) auto 0', background:'linear-gradient(90deg,transparent,rgba(91,194,231,0.5),transparent)' }}/>
            </div>

            {/* ── Calculator widget ── */}
            <div style={{ position:'relative', zIndex:1 }}>
              <LoadCalculator />
            </div>

          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes headingSweep {
          0%   { background-position: -100% center; }
          100% { background-position: 200% center; }
        }
        @media (max-width: 912px) {
          .sea-row-grid  { grid-template-columns: 1fr 1fr 1fr !important; }
          .air-row-grid  { grid-template-columns: 1fr 1fr 1fr !important; }
          .land-row-grid { grid-template-columns: 1fr 1fr 1fr !important; }
          .wh-row-grid   { grid-template-columns: 1fr 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .sea-row-grid  { grid-template-columns: 1fr 1fr !important; }
          .air-row-grid  { grid-template-columns: 1fr 1fr !important; }
          .land-row-grid { grid-template-columns: 1fr 1fr !important; }
          .wh-row-grid   { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .sea-row-grid  { grid-template-columns: 1fr !important; }
          .air-row-grid  { grid-template-columns: 1fr !important; }
          .land-row-grid { grid-template-columns: 1fr !important; }
          .wh-row-grid   { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
