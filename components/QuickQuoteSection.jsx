'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import Container3DViewer, { CONTAINER_SPECS, WEIGHT_TABLE, WeightDistributionGuide } from './Container3DViewer';
import { useLang } from '@/context/LangContext';
import arT from '@/i18n/ar';
import { sendQuoteEmail, isValidEmail, isValidPhone } from '@/utils/emailService';

// ─── Shared helpers ───────────────────────────────────────────────────────────
const INCOTERMS = ['EXW','FCA','FAS','FOB','CFR','CIF','CPT','CIP','DAP','DPU','DDP'];
const CURRENCIES = ['USD','SAR','EUR','GBP','AED'];

const PORTS_SEA = [
  'Jeddah Islamic Port','King Abdulaziz Port (Dammam)','Yanbu Commercial Port',
  'Jizan Port','Dubai (Jebel Ali)','Abu Dhabi (Khalifa)','Shanghai','Ningbo',
  'Shenzhen (Yantian)','Singapore','Port Klang','Hong Kong','Rotterdam',
  'Hamburg','Antwerp','Felixstowe','New York / New Jersey','Los Angeles',
];
const AIRPORTS = [
  'Jeddah (JED)','Riyadh (RUH)','Dammam (DMM)','Dubai (DXB)','Abu Dhabi (AUH)',
  'Doha (DOH)','Frankfurt (FRA)','London Heathrow (LHR)','Amsterdam (AMS)',
  'Shanghai (PVG)','Beijing (PEK)','Singapore (SIN)','Hong Kong (HKG)',
  'New York JFK','Los Angeles (LAX)','Chicago (ORD)',
];

const sharedInputCls = {
  background: 'rgba(255,255,255,0.09)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '0.5rem',
  padding: '0.9rem 1rem',
  color: '#ffffff',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '1.1rem',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.2s',
};
const labelCls = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '0.88rem',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.95)',
  marginBottom: '0.5rem',
  display: 'block',
};

// Date range helpers — no past dates, max 2 months ahead
function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}
function getMaxDateStr() {
  const d = new Date()
  d.setMonth(d.getMonth() + 2)
  return d.toISOString().split('T')[0]
}

function Field({ label, children, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelCls}>{label}</label>
      {children}
      {error && (
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.75rem',
          color: 'rgba(255,100,100,0.95)',
          marginTop: '0.3rem',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          ⚠ {error}
        </span>
      )}
    </div>
  )
}

function Input({ placeholder, type = 'text', value, onChange, min, max, step, error }) {
  const isDate = type === 'date'
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      style={{
        ...sharedInputCls,
        border: `1px solid ${error ? 'rgba(255,80,80,0.7)' : 'rgba(255,255,255,0.2)'}`,
        colorScheme: 'dark',
        ...(isDate ? { cursor: 'pointer' } : {}),
      }}
      onClick={e => { if (isDate && e.target.showPicker) { try { e.target.showPicker() } catch(_) {} } }}
      onFocus={e => (e.target.style.borderColor = error ? 'rgba(255,80,80,0.9)' : 'rgba(91,194,231,0.6)')}
      onBlur={e => (e.target.style.borderColor = error ? 'rgba(255,80,80,0.7)' : 'rgba(255,255,255,0.2)')}
    />
  )
}

function Select({ value, onChange, options, placeholder, error }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        ...sharedInputCls,
        border: `1px solid ${error ? 'rgba(255,80,80,0.7)' : 'rgba(255,255,255,0.2)'}`,
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        paddingRight: '2.2rem',
        cursor: 'pointer',
      }}
      onFocus={e => (e.target.style.borderColor = error ? 'rgba(255,80,80,0.9)' : 'rgba(91,194,231,0.45)')}
      onBlur={e => (e.target.style.borderColor = error ? 'rgba(255,80,80,0.7)' : 'rgba(255,255,255,0.2)')}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o} value={o} style={{ background: '#0a1826' }}>{o}</option>
      ))}
    </select>
  );
}

// Fully custom dropdown — bypasses OS native styling
function UnitDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: '150px', flexShrink: 0, userSelect: 'none' }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
          background: '#0d1020',
          border: `1px solid ${open ? 'rgba(91,194,231,0.8)' : 'rgba(91,194,231,0.35)'}`,
          borderRadius: open ? '0.4rem 0.4rem 0 0' : '0.4rem',
          padding: '0.32rem 0.65rem',
          color: '#5BC2E7',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
      >
        <span>{selected.label}</span>
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="#5BC2E7" strokeWidth="2.5"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
          background: '#0d1020',
          border: '1px solid rgba(91,194,231,0.5)',
          borderTop: 'none',
          borderRadius: '0 0 0.4rem 0.4rem',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
        }}>
          {options.map(o => (
            <div
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              style={{
                padding: '0.55rem 0.65rem',
                color: o.value === value ? '#5BC2E7' : 'rgba(255,255,255,0.75)',
                background: o.value === value ? 'rgba(91,194,231,0.1)' : 'transparent',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.82rem', fontWeight: o.value === value ? 700 : 500,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,194,231,0.15)'; e.currentTarget.style.color = '#5BC2E7'; }}
              onMouseLeave={e => { e.currentTarget.style.background = o.value === value ? 'rgba(91,194,231,0.1)' : 'transparent'; e.currentTarget.style.color = o.value === value ? '#5BC2E7' : 'rgba(255,255,255,0.75)'; }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Textarea({ placeholder, value, onChange, rows = 3 }) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      style={{
        ...sharedInputCls,
        resize: 'vertical',
        lineHeight: 1.6,
      }}
      onFocus={e => (e.target.style.borderColor = 'rgba(91,194,231,0.45)')}
      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
    />
  );
}

function CheckToggle({ label, checked, onChange }) {
  return (
    <label style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.65rem',
      cursor: 'pointer',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '0.88rem',
      color: 'rgba(255,255,255,0.72)',
      userSelect: 'none',
      minHeight: '44px',        // 44px tap target height
    }}>
      {/* Tap target wrapper — 44×44px minimum */}
      <div
        onClick={() => onChange(!checked)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 44, minHeight: 44, flexShrink: 0, cursor: 'pointer',
        }}
      >
        <div style={{
          width: '2.2rem',
          height: '1.15rem',
          borderRadius: '2rem',
          background: checked ? 'rgba(91,194,231,0.75)' : 'rgba(255,255,255,0.1)',
          border: `1px solid ${checked ? 'rgba(91,194,231,0.5)' : 'rgba(255,255,255,0.12)'}`,
          position: 'relative',
          transition: 'all 0.2s',
          flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: checked ? 'calc(100% - 0.9rem)' : '0.1rem',
            transform: 'translateY(-50%)',
            width: '0.8rem',
            height: '0.8rem',
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.2s',
          }} />
        </div>
      </div>
      {label}
    </label>
  );
}

function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '2.2rem' }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? '1' : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{
              width: '1.8rem',
              height: '1.8rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.68rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              background: i < current
                ? 'rgba(91,194,231,0.2)'
                : i === current
                  ? 'rgba(91,194,231,0.85)'
                  : 'rgba(255,255,255,0.05)',
              border: `1px solid ${i <= current ? 'rgba(91,194,231,0.5)' : 'rgba(255,255,255,0.1)'}`,
              color: i < current
                ? 'rgba(91,194,231,0.8)'
                : i === current
                  ? '#0a1826'
                  : 'rgba(255,255,255,0.25)',
              transition: 'all 0.3s',
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.62rem',
              fontWeight: i === current ? 600 : 400,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: i === current ? 'rgba(91,194,231,0.95)' : 'rgba(255,255,255,0.38)',
              whiteSpace: 'nowrap',
            }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1,
              height: '1px',
              background: i < current ? 'rgba(91,194,231,0.35)' : 'rgba(255,255,255,0.07)',
              margin: '0 0.5rem',
              marginBottom: '1.4rem',
              transition: 'background 0.3s',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function NavButtons({ step, totalSteps, onBack, onNext, onSubmit, loading, validate, isAr }) {
  const isLast = step === totalSteps - 1
  const handleContinue = () => {
    if (validate && !validate()) return
    onNext()
  }
  return (
    <div style={{ marginTop: '1.8rem', paddingTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {isLast ? (
        <button
          onClick={() => { if (validate && !validate()) return; onSubmit() }}
          disabled={loading}
          className="btn-gold"
          style={{
            width: '100%', justifyContent: 'center',
            padding: '1.1rem 2rem', minHeight: '54px',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'default' : 'pointer',
            animation: loading ? 'none' : 'qqm-continue-pulse 2s ease-in-out infinite',
          }}
        >
          <span>{loading ? (isAr ? arT.quickQuote.sending : 'Sending your request…') : (isAr ? arT.quickQuote.submitQuote : 'Submit Quote Request')}</span>
          {!loading && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'qqm-arrow-nudge 1.4s ease-in-out infinite' }}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          )}
        </button>
      ) : (
        <button
          onClick={handleContinue}
          className="btn-gold"
          style={{
            width: '100%', justifyContent: 'center',
            padding: '1.1rem 2rem', minHeight: '54px',
            animation: 'qqm-continue-pulse 2s ease-in-out infinite',
          }}
        >
          <span>{isAr ? arT.quickQuote.continue : 'Continue'}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'qqm-arrow-nudge 1.4s ease-in-out infinite' }}>
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      )}

      {/* Back link — small, secondary */}
      {step > 0 && (
        <button
          onClick={onBack}
          style={{
            display: 'block', margin: '0.9rem auto 0',
            background: 'none', border: 'none',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.82rem', fontWeight: 500,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.08em',
            cursor: 'pointer',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
        >
          {isAr ? `${arT.quickQuote.back} ${step}` : `← Back to step ${step}`}
        </button>
      )}
    </div>
  )
}

// ─── SEA FREIGHT FORM ────────────────────────────────────────────────────────
// Maps container type label → 3D viewer key
const CTYPE_MAP = {
  '20ft Dry Standard': '20ft', '40ft Dry Standard': '40ft', '40ft High Cube': '40hc',
  '20ft Reefer': '20ft', '40ft Reefer': '40ft', '20ft Open Top': '20ft',
  '40ft Open Top': '40ft', '20ft Flat Rack': '20ft', '40ft Flat Rack': '40ft',
}

// Inline cargo-dimensions + 3D viewer panel used in Sea form
function CargoLoad3D({ containerType, compact }) {
  const { lang: _cl3dLang } = useLang();
  const _cl3dIsAr = _cl3dLang === 'ar';
  const [items, setItems] = useState([
    { l: 120, w: 80, h: 80, weight: 200, qty: 5, unit: 'cm', stackable: true }
  ])
  const updCI   = (i, k, v) => setItems(p => p.map((c, idx) => idx === i ? { ...c, [k]: v } : c))
  const addCI   = () => setItems(p => [...p, { l: 100, w: 80, h: 80, weight: 150, qty: 3, unit: 'cm', stackable: true }])
  const removeCI = (i) => setItems(p => p.filter((_, idx) => idx !== i))

  const iS = { background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:'0.4rem', padding:'0.55rem 0.6rem', color:'#fff', fontFamily:"'DM Sans', sans-serif", fontSize:'16px', width:'100%', outline:'none', boxSizing:'border-box', minHeight:44 }
  const lS = { fontFamily:"'DM Sans', sans-serif", fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.55)', marginBottom:'0.3rem', display:'block' }

  return (
    <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(91,194,231,0.14)', paddingTop: '1.2rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1rem' }}>
        <span style={{ fontFamily: _cl3dIsAr ? "var(--font-cairo,'Cairo'),sans-serif" : "'Bebas Neue', sans-serif", fontSize:'1rem', color:'#5BC2E7', letterSpacing: _cl3dIsAr ? 0 : 2 }}>{_cl3dIsAr ? 'حاسبة التحميل ثلاثية الأبعاد' : '3D LOAD CALCULATOR'}</span>
        <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:9, color:'rgba(255,255,255,0.28)', letterSpacing:1 }}>{_cl3dIsAr ? 'اختياري — اسحب للتدوير' : 'OPTIONAL — DRAG TO ROTATE'}</span>
      </div>

      {/* Cargo items */}
      {items.map((item, idx) => (
        <div key={idx} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'0.6rem', padding:'0.8rem', marginBottom:'0.6rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.6rem' }}>
            <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:10, fontWeight:700, color:'#5BC2E7', letterSpacing:1.5 }}>
              BOX {idx + 1}
            </span>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <select value={item.unit} onChange={e => updCI(idx,'unit',e.target.value)} style={{ ...iS, width:'auto', padding:'0.3rem 0.5rem', fontSize:'0.75rem' }}>
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
              {items.length > 1 && (
                <button onClick={() => removeCI(idx)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.25)', cursor:'pointer', fontSize:'1.1rem', minWidth:44, minHeight:44, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
              )}
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.4rem', marginBottom:'0.5rem' }}>
            {[['L','l'],['W','w'],['H','h']].map(([lbl,key]) => (
              <div key={key}>
                <span style={lS}>{lbl} ({item.unit})</span>
                <input type="number" min="1" value={item[key]} onChange={e => updCI(idx, key, Math.max(1,+e.target.value||1))} style={iS} />
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.4rem', marginBottom:'0.6rem' }}>
            <div>
              <span style={lS}>Weight (kg)</span>
              <input type="number" min="0" value={item.weight} onChange={e => updCI(idx,'weight',Math.max(0,+e.target.value||0))} style={iS} />
            </div>
            <div>
              <span style={lS}>Qty</span>
              <div style={{ display:'flex', gap:3 }}>
                <button onClick={() => updCI(idx,'qty',Math.max(1,item.qty-1))} style={{ width:44, height:44, flexShrink:0, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:6, color:'#fff', cursor:'pointer', fontSize:16 }}>−</button>
                <input type="number" min="1" value={item.qty} onChange={e => updCI(idx,'qty',Math.max(1,+e.target.value||1))} style={{ ...iS, textAlign:'center', fontSize:16 }} />
                <button onClick={() => updCI(idx,'qty',item.qty+1)} style={{ width:44, height:44, flexShrink:0, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:6, color:'#fff', cursor:'pointer', fontSize:16 }}>+</button>
              </div>
            </div>
          </div>

          {/* Stackable toggle */}
          <button onClick={() => updCI(idx,'stackable',!item.stackable)} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', padding:0 }}>
            <span style={{ width:34, height:18, borderRadius:9, position:'relative', flexShrink:0, background: item.stackable?'rgba(91,194,231,0.65)':'rgba(255,255,255,0.1)', transition:'background .2s', display:'block' }}>
              <span style={{ position:'absolute', top:2, width:14, height:14, borderRadius:7, background:'#fff', left:item.stackable?18:2, transition:'left .2s' }} />
            </span>
            <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:11, color: item.stackable?'rgba(255,255,255,0.65)':'rgba(255,255,255,0.38)' }}>
              {item.stackable ? 'Stackable' : 'Non-stackable'}
            </span>
          </button>
        </div>
      ))}

      <button onClick={addCI} style={{ width:'100%', padding:'0.5rem', borderRadius:7, border:'1px dashed rgba(91,194,231,0.3)', background:'transparent', color:'rgba(91,194,231,0.6)', fontFamily:"'DM Sans', sans-serif", fontSize:12, fontWeight:600, cursor:'pointer', letterSpacing:1, marginBottom:'1rem' }}>
        + ADD BOX TYPE
      </button>

      {/* 3D Viewer */}
      <Container3DViewer items={items} containerType={containerType} compact={true} />

      {/* ── Weight Distribution Guide ── */}
      <WeightDistributionGuide items={items} containerType={containerType} />
    </div>
  )
}

function SeaForm({ onSuccess, isAr, extraServices = [] }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [d, setD] = useState({
    service: 'FCL', origin: '', destination: '', readyDate: '',
    containers: [{ type: '20ft Dry Standard', qty: '1' }],
    packages: '', cbm: '', weight: '', commodity: '', hazardous: false, reefer: false, reeferTemp: '',
    customs: false, insurance: false, pickup: false, delivery: false, incoterms: 'FOB',
    name: '', company: '', email: '', phone: '', notes: '',
  });

  const up = (k, v) => setD(p => ({ ...p, [k]: v }));
  const addContainer = () => setD(p => ({ ...p, containers: [...p.containers, { type: '20ft Dry Standard', qty: '1' }] }));
  const updContainer = (i, k, v) => setD(p => ({ ...p, containers: p.containers.map((c, idx) => idx === i ? { ...c, [k]: v } : c) }));
  const removeContainer = (i) => setD(p => ({ ...p, containers: p.containers.filter((_, idx) => idx !== i) }));

  const [errors, setErrors] = useState({})
  const validate = () => {
    const e = {}
    if (step === 0) {
      if (!d.origin) e.origin = isAr ? arT.quickQuote.errOrigin : 'Origin port is required'
      if (!d.destination) e.destination = isAr ? arT.quickQuote.errDestination : 'Destination port is required'
      if (!d.readyDate) e.readyDate = isAr ? arT.quickQuote.errReadyDate : 'Cargo ready date is required'
    }
    if (step === 1) {
      if (!d.commodity) e.commodity = isAr ? arT.quickQuote.errCommodity : 'Commodity description is required'
    }
    if (step === 3) {
      if (!d.name.trim()) e.name = isAr ? arT.quickQuote.errName : 'Full name is required'
      if (!d.email.trim()) e.email = isAr ? arT.quickQuote.errEmail : 'Email address is required'
      else if (!isValidEmail(d.email.trim())) e.email = 'Please enter a valid email address'
      if (!d.phone.trim()) e.phone = isAr ? arT.quickQuote.errPhone : 'Phone / WhatsApp is required'
      else if (!isValidPhone(d.phone.trim())) e.phone = 'Please enter a valid phone number'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const CONTAINER_TYPES = ['20ft Dry Standard','40ft Dry Standard','40ft High Cube','20ft Reefer','40ft Reefer','20ft Open Top','40ft Open Top','20ft Flat Rack','40ft Flat Rack'];

  const steps = isAr
    ? [arT.quickQuote.stepRoute, arT.quickQuote.stepCargo, arT.quickQuote.stepServices, arT.quickQuote.stepContact]
    : ['Route', 'Cargo', 'Services', 'Contact'];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await sendQuoteEmail('sea', d, extraServices);
      onSuccess('sea');
    } catch (err) {
      console.error('Email send failed:', err);
      onSuccess('sea'); // still show success to user
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <StepIndicator steps={steps} current={step} />

      {step === 0 && (
        <div className="qq-step">
          <div className="qq-grid-2">
            <Field label={isAr ? arT.quickQuote.serviceType : 'Service Type'}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['FCL','LCL'].map(s => (
                  <button key={s} onClick={() => up('service', s)}
                    className={`qq-type-btn${d.service === s ? ' active' : ''}`}>
                    {s === 'FCL' ? '🧊 FCL' : '📦 LCL'}<br />
                    <span>{s === 'FCL' ? (isAr ? arT.quickQuote.fclSub : 'Full Container') : (isAr ? arT.quickQuote.lclSub : 'Less Container')}</span>
                  </button>
                ))}
              </div>
            </Field>
            <Field label={isAr ? arT.quickQuote.cargoReadyDate : 'Cargo Ready Date *'} error={errors.readyDate}>
              <Input type="date" value={d.readyDate} onChange={e => { up('readyDate', e.target.value); setErrors(p => ({...p, readyDate: ''})) }} min={getTodayStr()} max={getMaxDateStr()} error={errors.readyDate} />
            </Field>
          </div>
          <div className="qq-grid-2" style={{ marginTop: '1rem' }}>
            <Field label={isAr ? arT.quickQuote.portOfLoading : 'Port of Loading (Origin) *'} error={errors.origin}>
              <Input value={d.origin} onChange={e => { up('origin', e.target.value); setErrors(p => ({...p, origin: ''})) }} placeholder={isAr ? arT.quickQuote.selectPort : 'e.g. Jeddah Islamic Port'} error={errors.origin} />
            </Field>
            <Field label={isAr ? arT.quickQuote.portOfDischarge : 'Port of Discharge (Destination) *'} error={errors.destination}>
              <Input value={d.destination} onChange={e => { up('destination', e.target.value); setErrors(p => ({...p, destination: ''})) }} placeholder={isAr ? arT.quickQuote.selectPort : 'e.g. King Abdulaziz Port'} error={errors.destination} />
            </Field>
          </div>
        </div>
      )}

      {step === 1 && d.service === 'FCL' && (
        <div className="qq-step">
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelCls}>{isAr ? arT.quickQuote.containerDetails : 'Container Details'}</label>
            {d.containers.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 0.4fr 1.6rem', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <Select value={c.type} onChange={e => updContainer(i, 'type', e.target.value)} options={CONTAINER_TYPES} />
                <Input type="number" min="1" placeholder={isAr ? arT.quickQuote.qty : 'Qty'} value={c.qty} onChange={e => updContainer(i, 'qty', e.target.value)} />
                <button onClick={() => removeContainer(i)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: '1rem', cursor: 'pointer', paddingBottom: '2px' }} disabled={d.containers.length === 1}>×</button>
              </div>
            ))}
            <button onClick={addContainer} className="qq-add-btn">{isAr ? arT.quickQuote.addContainer : '+ Add Container'}</button>
          </div>
          <div className="qq-grid-3">
            <Field label={isAr ? arT.quickQuote.commodity : 'Commodity *'} error={errors.commodity}>
              <Input placeholder={isAr ? arT.quickQuote.commodityPlaceholder : 'e.g. Electronics'} value={d.commodity} onChange={e => { up('commodity', e.target.value); setErrors(p => ({...p, commodity: ''})) }} error={errors.commodity} />
            </Field>
            <Field label={isAr ? arT.quickQuote.totalWeightTons : 'Total Weight (tons)'}>
              <Input type="number" min="0" step="0.1" placeholder="0.00" value={d.weight} onChange={e => up('weight', e.target.value)} />
            </Field>
            <Field label={isAr ? arT.quickQuote.estValueUSD : 'Est. Value (USD)'}>
              <Input type="number" min="0" placeholder="0" value={d.value} onChange={e => up('value', e.target.value)} />
            </Field>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <CheckToggle label={isAr ? arT.quickQuote.hazardousDG : 'Hazardous / DG Cargo'} checked={d.hazardous} onChange={v => up('hazardous', v)} />
            <CheckToggle label={isAr ? arT.quickQuote.refrigeratedReefer : 'Temperature-Controlled (Reefer)'} checked={d.reefer} onChange={v => up('reefer', v)} />
          </div>
          {d.reefer && (
            <div style={{ marginTop: '0.75rem', maxWidth: '12rem' }}>
              <Field label={isAr ? arT.quickQuote.reeferTempLabel : 'Required Temp (°C)'}>
                <Input placeholder={isAr ? arT.quickQuote.reeferPlaceholder : '-18'} value={d.reeferTemp} onChange={e => up('reeferTemp', e.target.value)} />
              </Field>
            </div>
          )}
          {/* 3D Load Calculator */}
          <CargoLoad3D containerType={CTYPE_MAP[d.containers[0]?.type] || '20ft'} compact isAr={isAr} />
        </div>
      )}

      {step === 1 && d.service === 'LCL' && (
        <div className="qq-step">
          <div className="qq-grid-3">
            <Field label={isAr ? arT.quickQuote.noOfPackages : 'No. of Packages'}>
              <Input type="number" min="1" placeholder="0" value={d.packages} onChange={e => up('packages', e.target.value)} />
            </Field>
            <Field label={isAr ? arT.quickQuote.totalVolumeCBM : 'Total Volume (CBM)'}>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={d.cbm} onChange={e => up('cbm', e.target.value)} />
            </Field>
            <Field label={isAr ? arT.quickQuote.grossWeightKg : 'Gross Weight (kg)'}>
              <Input type="number" min="0" placeholder="0" value={d.weight} onChange={e => up('weight', e.target.value)} />
            </Field>
          </div>
          <div className="qq-grid-2" style={{ marginTop: '1rem' }}>
            <Field label={isAr ? arT.quickQuote.commodity : 'Commodity'}>
              <Input placeholder={isAr ? arT.quickQuote.commodityPlaceholder : 'e.g. Furniture'} value={d.commodity} onChange={e => up('commodity', e.target.value)} />
            </Field>
            <Field label={isAr ? arT.quickQuote.estValueUSD : 'Est. Value (USD)'}>
              <Input type="number" min="0" placeholder="0" value={d.value} onChange={e => up('value', e.target.value)} />
            </Field>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <CheckToggle label={isAr ? arT.quickQuote.hazardousDG : 'Hazardous / DG Cargo'} checked={d.hazardous} onChange={v => up('hazardous', v)} />
          </div>
          {/* 3D Load Calculator */}
          <CargoLoad3D containerType="20ft" compact isAr={isAr} />
        </div>
      )}

      {step === 2 && (
        <div className="qq-step">
          <div className="qq-services-grid">
            {[
              ['customs',  '🏛️', isAr ? arT.quickQuote.customsClearance : 'Customs Clearance', isAr ? arT.quickQuote.customsClearanceDesc : 'Import & export clearance at origin/destination'],
              ['insurance','🛡️', isAr ? arT.quickQuote.cargoInsuranceSvc : 'Cargo Insurance',   isAr ? arT.quickQuote.cargoInsuranceDesc : 'All-risk marine cargo coverage'],
              ['pickup',   '🚛', isAr ? arT.quickQuote.originPickup : 'Origin Pickup',           isAr ? arT.quickQuote.originPickupDesc : "Door collection from shipper's premises"],
              ['delivery', '📍', isAr ? arT.quickQuote.destinationDelivery : 'Destination Delivery', isAr ? arT.quickQuote.destinationDeliveryDesc : 'Last-mile delivery to consignee'],
            ].map(([k, icon, title, desc]) => (
              <div key={k} onClick={() => up(k, !d[k])} className={`qq-service-card${d[k] ? ' active' : ''}`}>
                <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{icon}</div>
                <div className="qq-service-title">{title}</div>
                <div className="qq-service-desc">{desc}</div>
                <div className={`qq-service-check${d[k] ? ' active' : ''}`}>{d[k] ? '✓' : '+'}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem', maxWidth: '16rem' }}>
            <Field label={isAr ? arT.quickQuote.incoterms : 'Incoterms'}>
              <Select value={d.incoterms} onChange={e => up('incoterms', e.target.value)} options={INCOTERMS} />
            </Field>
          </div>
        </div>
      )}

      {step === 3 && (
        <ContactStep d={d} up={up} errors={errors} setErrors={setErrors} isAr={isAr} />
      )}

      <NavButtons step={step} totalSteps={4} onBack={() => { setStep(s => s - 1); setErrors({}) }} onNext={() => setStep(s => s + 1)} onSubmit={handleSubmit} loading={loading} validate={validate} isAr={isAr} />
    </div>
  );
}

// ─── AIR FREIGHT FORM ─────────────────────────────────────────────────────────
function AirForm({ onSuccess, isAr, extraServices = [] }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [d, setD] = useState({
    origin: '', destination: '', readyDate: '',
    cargoType: 'General',
    pieces: '', weight: '', length: '', width: '', height: '', dimUnit: 'cm',
    commodity: '', hazardous: false, lithiumBattery: false, perishable: false,
    service: 'Standard',
    customs: false, insurance: false, pickup: false, delivery: false,
    name: '', company: '', email: '', phone: '', notes: '',
  });
  const up = (k, v) => setD(p => ({ ...p, [k]: v }));
  const [airErrors, setAirErrors] = useState({});

  const validateAir = () => {
    const e = {};
    if (step === 0) {
      if (!d.origin)    e.origin      = 'Origin airport is required';
      if (!d.destination) e.destination = 'Destination airport is required';
      if (!d.readyDate) e.readyDate   = 'Cargo ready date is required';
    }
    if (step === 1) {
      if (!d.commodity) e.commodity   = 'Commodity description is required';
      if (!d.weight)    e.weight      = 'Weight is required';
    }
    if (step === 3) {
      if (!d.name.trim())  e.name  = 'Full name is required';
      if (!d.email.trim()) e.email = 'Email address is required';
      else if (!isValidEmail(d.email.trim())) e.email = 'Please enter a valid email address';
      if (!d.phone.trim()) e.phone = 'Phone / WhatsApp is required';
      else if (!isValidPhone(d.phone.trim())) e.phone = 'Please enter a valid phone number';
    }
    setAirErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAirSubmit = async () => {
    if (!validateAir()) return;
    setLoading(true);
    try {
      await sendQuoteEmail('air', d, extraServices);
      onSuccess('air');
    } catch (err) {
      console.error('Email send failed:', err);
      onSuccess('air');
    } finally {
      setLoading(false);
    }
  };

  const volWeight = () => {
    const l = parseFloat(d.length) || 0;
    const w = parseFloat(d.width) || 0;
    const h = parseFloat(d.height) || 0;
    const qty = parseInt(d.pieces) || 1;
    const divisor = d.dimUnit === 'mm' ? 5000000 : 5000;
    return ((l * w * h) / divisor * qty).toFixed(2);
  };
  const chargeable = () => {
    const vw = parseFloat(volWeight());
    const aw = (parseFloat(d.weight) || 0) * (parseInt(d.pieces) || 1);
    return Math.max(vw, aw).toFixed(2);
  };

  const CARGO_TYPES = ['General','Perishable','Dangerous Goods','Valuable / High-Security','Oversized / Out-of-Gauge','Live Animals','Human Remains'];
  const SERVICES = [
    { id: 'Express',  label: 'Express',  sub: '1–2 business days' },
    { id: 'Priority', label: 'Priority', sub: '2–3 business days' },
    { id: 'Standard', label: 'Standard', sub: '3–5 business days' },
    { id: 'Economy',  label: 'Economy',  sub: '5–7 business days' },
  ];
  const steps = isAr
    ? [arT.quickQuote.stepRoute, arT.quickQuote.stepCargo, arT.quickQuote.stepServices, arT.quickQuote.stepContact]
    : ['Route', 'Cargo', 'Services', 'Contact'];

  return (
    <div>
      <StepIndicator steps={steps} current={step} />

      {step === 0 && (
        <div className="qq-step">
          <div className="qq-grid-2">
            <Field label={isAr ? arT.quickQuote.originAirport : 'Origin Airport *'} error={airErrors.origin}>
              <Input value={d.origin} onChange={e => { up('origin', e.target.value); setAirErrors(p => ({...p, origin: ''})) }} placeholder={isAr ? arT.quickQuote.selectAirport : 'e.g. Jeddah (JED)'} error={airErrors.origin} />
            </Field>
            <Field label={isAr ? arT.quickQuote.destinationAirport : 'Destination Airport *'} error={airErrors.destination}>
              <Input value={d.destination} onChange={e => { up('destination', e.target.value); setAirErrors(p => ({...p, destination: ''})) }} placeholder={isAr ? arT.quickQuote.selectAirport : 'e.g. Frankfurt (FRA)'} error={airErrors.destination} />
            </Field>
          </div>
          <div className="qq-grid-2" style={{ marginTop: '1rem' }}>
            <Field label={isAr ? arT.quickQuote.cargoReadyDate : 'Cargo Ready Date *'} error={airErrors.readyDate}>
              <Input type="date" value={d.readyDate} onChange={e => { up('readyDate', e.target.value); setAirErrors(p => ({...p, readyDate: ''})) }} min={getTodayStr()} max={getMaxDateStr()} error={airErrors.readyDate} />
            </Field>
            <Field label={isAr ? arT.quickQuote.cargoType : 'Cargo Type'}>
              <Select value={d.cargoType} onChange={e => up('cargoType', e.target.value)} options={CARGO_TYPES} />
            </Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="qq-step">
          <div className="qq-grid-3">
            <Field label={isAr ? arT.quickQuote.noOfPieces : 'No. of Pieces'}>
              <Input type="number" min="1" placeholder="0" value={d.pieces} onChange={e => up('pieces', e.target.value)} />
            </Field>
            <Field label={isAr ? arT.quickQuote.weightPerPiece : 'Weight / Piece (kg) *'} error={airErrors.weight}>
              <Input type="number" min="0" step="0.1" placeholder="0.00" value={d.weight} onChange={e => { up('weight', e.target.value); setAirErrors(p => ({...p, weight: ''})) }} error={airErrors.weight} />
            </Field>
            <Field label={isAr ? arT.quickQuote.commodityAir : 'Commodity *'} error={airErrors.commodity}>
              <Input placeholder={isAr ? arT.quickQuote.commodityAirPlaceholder : 'e.g. Auto Parts'} value={d.commodity} onChange={e => { up('commodity', e.target.value); setAirErrors(p => ({...p, commodity: ''})) }} error={airErrors.commodity} />
            </Field>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', gap: '0.75rem', flexWrap: 'wrap' }}>
              <label style={{ ...labelCls, marginBottom: 0 }}>{isAr ? arT.quickQuote.dimensionsPerPiece : 'Dimensions per Piece'}</label>
              <UnitDropdown
                value={d.dimUnit}
                onChange={v => up('dimUnit', v)}
                options={[
                  { value: 'cm', label: 'Centimeters (cm)' },
                  { value: 'mm', label: 'Millimeters (mm)' },
                ]}
              />
            </div>
            <div className="qq-grid-3" style={{ gap: '0.5rem' }}>
              {(isAr
                ? [[arT.quickQuote.dimLength,'length'],[arT.quickQuote.dimWidth,'width'],[arT.quickQuote.dimHeight,'height']]
                : [['Length','length'],['Width','width'],['Height','height']]
              ).map(([lbl, key]) => (
                <div key={key}>
                  <label style={{ ...labelCls, fontSize: '0.55rem', opacity: 0.6 }}>{lbl}</label>
                  <Input type="number" min="0" placeholder="0" value={d[key]} onChange={e => up(key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
          {(d.weight || d.length) && (
            <div className="qq-calc-preview">
              <div className="qq-calc-row">
                <span>{isAr ? arT.quickQuote.actualWeight : 'Actual Weight'}</span>
                <span>{((parseFloat(d.weight)||0)*(parseInt(d.pieces)||1)).toFixed(2)} kg</span>
              </div>
              <div className="qq-calc-row">
                <span>{isAr ? arT.quickQuote.volumetricWeight : 'Volumetric Weight'}</span>
                <span>{volWeight()} kg</span>
              </div>
              <div className="qq-calc-row highlight">
                <span>{isAr ? arT.quickQuote.chargeableWeight : 'Chargeable Weight'}</span>
                <span>{chargeable()} kg</span>
              </div>
            </div>
          )}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <CheckToggle label={isAr ? arT.quickQuote.dangerousGoodsIATA : 'Dangerous Goods (IATA)'} checked={d.hazardous} onChange={v => up('hazardous', v)} />
            <CheckToggle label={isAr ? arT.quickQuote.lithiumBattery : 'Contains Lithium Batteries'} checked={d.lithiumBattery} onChange={v => up('lithiumBattery', v)} />
            <CheckToggle label={isAr ? arT.quickQuote.perishable : 'Perishable / Temperature-Sensitive'} checked={d.perishable} onChange={v => up('perishable', v)} />
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <label style={labelCls}>{isAr ? arT.quickQuote.serviceLevel : 'Service Level'}</label>
            <div className="qq-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.5rem' }}>
              {SERVICES.map(s => {
                const svcMap = {
                  Express:  { label: isAr ? arT.quickQuote.svcExpress  : s.label, sub: isAr ? arT.quickQuote.svcExpressSub  : s.sub },
                  Priority: { label: isAr ? arT.quickQuote.svcPriority : s.label, sub: isAr ? arT.quickQuote.svcPrioritySub : s.sub },
                  Standard: { label: isAr ? arT.quickQuote.svcStandard : s.label, sub: isAr ? arT.quickQuote.svcStandardSub : s.sub },
                  Economy:  { label: isAr ? arT.quickQuote.svcEconomy  : s.label, sub: isAr ? arT.quickQuote.svcEconomySub  : s.sub },
                }[s.id] || { label: s.label, sub: s.sub };
                return (
                  <div key={s.id} onClick={() => up('service', s.id)} className={`qq-service-card compact${d.service === s.id ? ' active' : ''}`}>
                    <div className="qq-service-title">{svcMap.label}</div>
                    <div className="qq-service-desc">{svcMap.sub}</div>
                    <div className={`qq-service-check${d.service === s.id ? ' active' : ''}`}>{d.service === s.id ? '✓' : ''}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="qq-step">
          <div className="qq-services-grid">
            {[
              ['customs',  '🏛️', isAr ? arT.quickQuote.customsClearance : 'Customs Clearance',     isAr ? arT.quickQuote.airCustomsDesc : 'Air cargo import/export documentation & clearance'],
              ['insurance','🛡️', isAr ? arT.quickQuote.cargoInsuranceSvc : 'Air Cargo Insurance',   isAr ? arT.quickQuote.airInsuranceDesc : 'All-risk air cargo insurance coverage'],
              ['pickup',   '🚛', isAr ? arT.quickQuote.airPickupLabel : 'Airport Pickup',            isAr ? arT.quickQuote.airPickupDesc : 'Collect from your premises to the airport'],
              ['delivery', '📍', isAr ? arT.quickQuote.airDeliveryLabel : 'Airport Delivery',        isAr ? arT.quickQuote.airDeliveryDesc : 'Door delivery from destination airport'],
            ].map(([k, icon, title, desc]) => (
              <div key={k} onClick={() => up(k, !d[k])} className={`qq-service-card${d[k] ? ' active' : ''}`}>
                <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{icon}</div>
                <div className="qq-service-title">{title}</div>
                <div className="qq-service-desc">{desc}</div>
                <div className={`qq-service-check${d[k] ? ' active' : ''}`}>{d[k] ? '✓' : '+'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && <ContactStep d={d} up={up} errors={airErrors} setErrors={setAirErrors} />}

      <NavButtons step={step} totalSteps={4} onBack={() => { setStep(s => s - 1); setAirErrors({}); }} onNext={() => setStep(s => s + 1)} onSubmit={handleAirSubmit} loading={loading} validate={validateAir} isAr={isAr} />
    </div>
  );
}

// ─── LAND / ROAD FREIGHT FORM ─────────────────────────────────────────────────
function LandForm({ onSuccess, isAr, extraServices = [] }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [d, setD] = useState({
    service: 'FTL', truckType: 'Curtainsider', origin: '', destination: '', readyDate: '',
    weight: '', cbm: '', pallets: '', commodity: '', hazardous: false, reefer: false, reeferTemp: '',
    customs: false, insurance: false,
    name: '', company: '', email: '', phone: '', notes: '',
  });
  const up = (k, v) => setD(p => ({ ...p, [k]: v }));
  const [landErrors, setLandErrors] = useState({});

  const validateLand = () => {
    const e = {};
    if (step === 0) {
      if (!d.origin)      e.origin      = 'Origin city is required';
      if (!d.destination) e.destination = 'Destination city is required';
      if (!d.readyDate)   e.readyDate   = 'Cargo ready date is required';
    }
    if (step === 1) {
      if (!d.commodity)   e.commodity   = 'Commodity description is required';
    }
    if (step === 2) {
      if (!d.name.trim())  e.name  = 'Full name is required';
      if (!d.email.trim()) e.email = 'Email address is required';
      else if (!isValidEmail(d.email.trim())) e.email = 'Please enter a valid email address';
      if (!d.phone.trim()) e.phone = 'Phone / WhatsApp is required';
      else if (!isValidPhone(d.phone.trim())) e.phone = 'Please enter a valid phone number';
    }
    setLandErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLandSubmit = async () => {
    if (!validateLand()) return;
    setLoading(true);
    try {
      await sendQuoteEmail('land', d, extraServices);
      onSuccess('land');
    } catch (err) {
      console.error('Email send failed:', err);
      onSuccess('land');
    } finally {
      setLoading(false);
    }
  };

  const TRUCK_TYPES = ['Curtainsider (13.6m)','Box Truck','Flatbed / Lowbed','Reefer Trailer','Tanker','Tipper','Mega Trailer'];
  const CITIES_SA = [
    'Riyadh','Jeddah','Dammam','Mecca','Medina','Khobar','Tabuk','Abha','Jubail','Yanbu',
    'Dubai (UAE)','Abu Dhabi (UAE)','Kuwait City','Amman (Jordan)','Aqaba (Jordan)','Bahrain',
  ];
  const steps = ['Route', 'Cargo', 'Contact'];

  return (
    <div>
      <StepIndicator steps={steps} current={step} />

      {step === 0 && (
        <div className="qq-step">
          <div className="qq-grid-2">
            <Field label="Service Type">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['FTL','LTL'].map(s => (
                  <button key={s} onClick={() => up('service', s)} className={`qq-type-btn${d.service === s ? ' active' : ''}`}>
                    {s === 'FTL' ? '🚛 FTL' : '📦 LTL'}<br />
                    <span>{s === 'FTL' ? 'Full Truck' : 'Part Truck'}</span>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Cargo Ready Date *" error={landErrors.readyDate}>
              <Input type="date" value={d.readyDate} onChange={e => { up('readyDate', e.target.value); setLandErrors(p => ({...p, readyDate: ''})) }} min={getTodayStr()} max={getMaxDateStr()} error={landErrors.readyDate} />
            </Field>
          </div>
          <div className="qq-grid-2" style={{ marginTop: '1rem' }}>
            <Field label="Origin City *" error={landErrors.origin}>
              <Input value={d.origin} onChange={e => { up('origin', e.target.value); setLandErrors(p => ({...p, origin: ''})) }} placeholder="e.g. Riyadh" error={landErrors.origin} />
            </Field>
            <Field label="Destination City *" error={landErrors.destination}>
              <Input value={d.destination} onChange={e => { up('destination', e.target.value); setLandErrors(p => ({...p, destination: ''})) }} placeholder="e.g. Dammam" error={landErrors.destination} />
            </Field>
          </div>
          {d.service === 'FTL' && (
            <div style={{ marginTop: '1rem' }}>
              <Field label="Truck / Equipment Type">
                <Select value={d.truckType} onChange={e => up('truckType', e.target.value)} options={TRUCK_TYPES} />
              </Field>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="qq-step">
          <div className="qq-grid-3">
            <Field label="Gross Weight (tons)">
              <Input type="number" min="0" step="0.1" placeholder="0.00" value={d.weight} onChange={e => up('weight', e.target.value)} />
            </Field>
            <Field label="Volume (CBM)">
              <Input type="number" min="0" step="0.1" placeholder="0.00" value={d.cbm} onChange={e => up('cbm', e.target.value)} />
            </Field>
            <Field label="No. of Pallets">
              <Input type="number" min="0" placeholder="0" value={d.pallets} onChange={e => up('pallets', e.target.value)} />
            </Field>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Field label="Commodity Description *" error={landErrors.commodity}>
              <Input placeholder="e.g. Construction Materials" value={d.commodity} onChange={e => { up('commodity', e.target.value); setLandErrors(p => ({...p, commodity: ''})) }} error={landErrors.commodity} />
            </Field>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <CheckToggle label="Hazardous / ADR Cargo" checked={d.hazardous} onChange={v => up('hazardous', v)} />
            <CheckToggle label="Refrigerated (Reefer)" checked={d.reefer} onChange={v => up('reefer', v)} />
            <CheckToggle label="Cargo Insurance" checked={d.insurance} onChange={v => up('insurance', v)} />
          </div>
          {d.reefer && (
            <div style={{ marginTop: '0.75rem', maxWidth: '12rem' }}>
              <Field label="Required Temp (°C)">
                <Input placeholder="-18" value={d.reeferTemp} onChange={e => up('reeferTemp', e.target.value)} />
              </Field>
            </div>
          )}
        </div>
      )}

      {step === 2 && <ContactStep d={d} up={up} errors={landErrors} setErrors={setLandErrors} />}

      <NavButtons step={step} totalSteps={3} onBack={() => { setStep(s => s - 1); setLandErrors({}); }} onNext={() => setStep(s => s + 1)} onSubmit={handleLandSubmit} loading={loading} validate={validateLand} />
    </div>
  );
}

// ─── CUSTOMS CLEARANCE FORM ───────────────────────────────────────────────────
function CustomsForm({ onSuccess, extraServices = [] }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [d, setD] = useState({
    direction: 'Import', port: '', freightMode: 'Sea',
    commodity: '', hsCode: '', shipmentValue: '', currency: 'USD',
    documents: '', packages: '',
    dutyPayment: false, inspection: false, storageRelease: false, survey: false,
    name: '', company: '', email: '', phone: '', notes: '',
  });
  const up = (k, v) => setD(p => ({ ...p, [k]: v }));
  const [custErrors, setCustErrors] = useState({});

  const validateCustoms = () => {
    const e = {};
    if (step === 0) {
      if (!d.port) e.port = 'Port / airport is required';
    }
    if (step === 1) {
      if (!d.commodity) e.commodity = 'Commodity description is required';
    }
    if (step === 3) {
      if (!d.name.trim())  e.name  = 'Full name is required';
      if (!d.email.trim()) e.email = 'Email address is required';
      else if (!isValidEmail(d.email.trim())) e.email = 'Please enter a valid email address';
      if (!d.phone.trim()) e.phone = 'Phone / WhatsApp is required';
      else if (!isValidPhone(d.phone.trim())) e.phone = 'Please enter a valid phone number';
    }
    setCustErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCustomsSubmit = async () => {
    if (!validateCustoms()) return;
    setLoading(true);
    try {
      await sendQuoteEmail('customs', d, extraServices);
      onSuccess('customs');
    } catch (err) {
      console.error('Email send failed:', err);
      onSuccess('customs');
    } finally {
      setLoading(false);
    }
  };

  const PORTS_ALL = [
    'Jeddah Islamic Port','King Abdulaziz Port (Dammam)','Yanbu Port','Jizan Port',
    'Jeddah Airport (JED)','Riyadh Airport (RUH)','Dammam Airport (DMM)',
    'Riyadh Dry Port','Jeddah Dry Port',
  ];
  const steps = ['Shipment', 'Cargo', 'Services', 'Contact'];

  return (
    <div>
      <StepIndicator steps={steps} current={step} />

      {step === 0 && (
        <div className="qq-step">
          <div className="qq-grid-2">
            <Field label="Direction">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['Import','Export'].map(s => (
                  <button key={s} onClick={() => up('direction', s)} className={`qq-type-btn${d.direction === s ? ' active' : ''}`}>
                    {s === 'Import' ? '📥 Import' : '📤 Export'}<br />
                    <span>{s === 'Import' ? 'Inbound to KSA' : 'Outbound from KSA'}</span>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Freight Mode">
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {['Sea','Air','Land'].map(m => (
                  <button key={m} onClick={() => up('freightMode', m)} className={`qq-type-btn compact${d.freightMode === m ? ' active' : ''}`}>
                    {m === 'Sea' ? '🚢' : m === 'Air' ? '✈️' : '🚛'} {m}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Field label="Port / Airport / Border Crossing *" error={custErrors.port}>
              <Input placeholder="e.g. Jeddah Islamic Port, King Khalid Airport…" value={d.port} onChange={e => { up('port', e.target.value); setCustErrors(p => ({...p, port: ''})) }} error={custErrors.port} />
            </Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="qq-step">
          <div className="qq-grid-2">
            <Field label="Commodity Description *" error={custErrors.commodity}>
              <Input placeholder="e.g. Industrial Machinery" value={d.commodity} onChange={e => { up('commodity', e.target.value); setCustErrors(p => ({...p, commodity: ''})) }} error={custErrors.commodity} />
            </Field>
            <Field label="HS Code (optional)">
              <Input placeholder="e.g. 8479.89" value={d.hsCode} onChange={e => up('hsCode', e.target.value)} />
            </Field>
          </div>
          <div className="qq-grid-3" style={{ marginTop: '1rem' }}>
            <Field label="Shipment Value">
              <Input type="number" min="0" placeholder="0" value={d.shipmentValue} onChange={e => up('shipmentValue', e.target.value)} />
            </Field>
            <Field label="Currency">
              <Select value={d.currency} onChange={e => up('currency', e.target.value)} options={CURRENCIES} />
            </Field>
            <Field label="No. of Documents / BLs">
              <Input type="number" min="1" placeholder="1" value={d.documents} onChange={e => up('documents', e.target.value)} />
            </Field>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Field label="No. of Packages / Units">
              <Input type="number" min="0" placeholder="0" value={d.packages} onChange={e => up('packages', e.target.value)} />
            </Field>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="qq-step">
          <div className="qq-services-grid">
            {[
              ['dutyPayment', '💳', 'Duty & Tax Payment',    'Customs duty + VAT disbursement on your behalf'],
              ['inspection',  '🔍', 'Physical Inspection',   'Coordination of customs & SASO inspection'],
              ['storageRelease','🏭','Port Storage & Release','Port follow-up, demurrage avoidance, container release'],
              ['survey',      '📋', 'Pre-Shipment Survey',   'SASO/SFDA compliance pre-loading survey'],
            ].map(([k, icon, title, desc]) => (
              <div key={k} onClick={() => up(k, !d[k])} className={`qq-service-card${d[k] ? ' active' : ''}`}>
                <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{icon}</div>
                <div className="qq-service-title">{title}</div>
                <div className="qq-service-desc">{desc}</div>
                <div className={`qq-service-check${d[k] ? ' active' : ''}`}>{d[k] ? '✓' : '+'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && <ContactStep d={d} up={up} errors={custErrors} setErrors={setCustErrors} />}

      <NavButtons step={step} totalSteps={4} onBack={() => { setStep(s => s - 1); setCustErrors({}); }} onNext={() => setStep(s => s + 1)} onSubmit={handleCustomsSubmit} loading={loading} validate={validateCustoms} />
    </div>
  );
}

// ─── PROJECT CARGO FORM ───────────────────────────────────────────────────────
function ProjectForm({ onSuccess, extraServices = [] }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [d, setD] = useState({
    projectType: 'Heavy Lift', origin: '', destination: '', readyDate: '',
    weight: '', length: '', width: '', height: '', pieces: '',
    commodity: '', craneRequired: false, escort: false, permits: false,
    name: '', company: '', email: '', phone: '', notes: '',
  });
  const up = (k, v) => setD(p => ({ ...p, [k]: v }));
  const [projErrors, setProjErrors] = useState({});

  const validateProject = () => {
    const e = {};
    if (step === 0) {
      if (!d.origin)      e.origin      = 'Origin is required';
      if (!d.destination) e.destination = 'Destination is required';
      if (!d.commodity)   e.commodity   = 'Project description is required';
    }
    if (step === 1) {
      if (!d.weight) e.weight = 'Weight is required';
    }
    if (step === 2) {
      if (!d.name.trim())  e.name  = 'Full name is required';
      if (!d.email.trim()) e.email = 'Email address is required';
      else if (!isValidEmail(d.email.trim())) e.email = 'Please enter a valid email address';
      if (!d.phone.trim()) e.phone = 'Phone / WhatsApp is required';
      else if (!isValidPhone(d.phone.trim())) e.phone = 'Please enter a valid phone number';
    }
    setProjErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProjectSubmit = async () => {
    if (!validateProject()) return;
    setLoading(true);
    try {
      await sendQuoteEmail('project', d, extraServices);
      onSuccess('project');
    } catch (err) {
      console.error('Email send failed:', err);
      onSuccess('project');
    } finally {
      setLoading(false);
    }
  };

  const PROJECT_TYPES = ['Heavy Lift','Out-of-Gauge (OOG)','Breakbulk','Project Machinery','Wind Energy Components','Oil & Gas Equipment','Mining Equipment'];
  const steps = ['Details', 'Dimensions', 'Contact'];

  return (
    <div>
      <StepIndicator steps={steps} current={step} />

      {step === 0 && (
        <div className="qq-step">
          <div className="qq-grid-2">
            <Field label="Project / Cargo Type">
              <Select value={d.projectType} onChange={e => up('projectType', e.target.value)} options={PROJECT_TYPES} />
            </Field>
            <Field label="Cargo Ready Date">
              <Input type="date" value={d.readyDate} onChange={e => up('readyDate', e.target.value)} min={getTodayStr()} max={getMaxDateStr()} />
            </Field>
          </div>
          <div className="qq-grid-2" style={{ marginTop: '1rem' }}>
            <Field label="Origin (Port / City) *" error={projErrors.origin}>
              <Input placeholder="e.g. Shanghai, China" value={d.origin} onChange={e => { up('origin', e.target.value); setProjErrors(p => ({...p, origin: ''})) }} error={projErrors.origin} />
            </Field>
            <Field label="Destination (Port / City) *" error={projErrors.destination}>
              <Input placeholder="e.g. Jubail Industrial City" value={d.destination} onChange={e => { up('destination', e.target.value); setProjErrors(p => ({...p, destination: ''})) }} error={projErrors.destination} />
            </Field>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Field label="Commodity / Project Description *" error={projErrors.commodity}>
              <Textarea placeholder="Describe the cargo, project name, and any special requirements…" value={d.commodity} onChange={e => { up('commodity', e.target.value); setProjErrors(p => ({...p, commodity: ''})) }} error={projErrors.commodity} />
            </Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="qq-step">
          <div className="qq-grid-2">
            <Field label="No. of Pieces">
              <Input type="number" min="1" placeholder="1" value={d.pieces} onChange={e => up('pieces', e.target.value)} />
            </Field>
            <Field label="Total Weight (MT) *" error={projErrors.weight}>
              <Input type="number" min="0" step="0.1" placeholder="0.00" value={d.weight} onChange={e => { up('weight', e.target.value); setProjErrors(p => ({...p, weight: ''})) }} error={projErrors.weight} />
            </Field>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ ...labelCls, marginBottom: '0.65rem' }}>Dimensions — Longest Single Piece (metres)</label>
            <div className="qq-grid-3" style={{ gap: '0.5rem' }}>
              {[['Length (m)','length'],['Width (m)','width'],['Height (m)','height']].map(([lbl, key]) => (
                <div key={key}>
                  <label style={{ ...labelCls, fontSize: '0.55rem', opacity: 0.6 }}>{lbl}</label>
                  <Input type="number" min="0" step="0.01" placeholder="0.00" value={d[key]} onChange={e => up(key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '1.2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <CheckToggle label="Crane / Heavy Lift Equipment Required" checked={d.craneRequired} onChange={v => up('craneRequired', v)} />
            <CheckToggle label="Police Escort Required" checked={d.escort} onChange={v => up('escort', v)} />
            <CheckToggle label="Special Permits & Route Survey" checked={d.permits} onChange={v => up('permits', v)} />
          </div>
        </div>
      )}

      {step === 2 && <ContactStep d={d} up={up} errors={projErrors} setErrors={setProjErrors} />}

      <NavButtons step={step} totalSteps={3} onBack={() => { setStep(s => s - 1); setProjErrors({}); }} onNext={() => setStep(s => s + 1)} onSubmit={handleProjectSubmit} loading={loading} validate={validateProject} />
    </div>
  );
}

// ─── SHARED CONTACT STEP ─────────────────────────────────────────────────────
function ContactStep({ d, up, errors = {}, setErrors = () => {} }) {
  return (
    <div className="qq-step">
      <div className="qq-grid-2">
        <Field label="Full Name *" error={errors.name}>
          <Input placeholder="Your name" value={d.name} onChange={e => { up('name', e.target.value); setErrors(p => ({...p, name: ''})) }} error={errors.name} />
        </Field>
        <Field label="Company Name">
          <Input placeholder="Your company" value={d.company} onChange={e => up('company', e.target.value)} />
        </Field>
      </div>
      <div className="qq-grid-2" style={{ marginTop: '1rem' }}>
        <Field label="Email Address *" error={errors.email}>
          <Input type="email" placeholder="you@company.com" value={d.email} onChange={e => { up('email', e.target.value); setErrors(p => ({...p, email: ''})) }} error={errors.email} />
        </Field>
        <Field label="Phone / WhatsApp *" error={errors.phone}>
          <Input type="tel" placeholder="+966 5X XXX XXXX" value={d.phone} onChange={e => { up('phone', e.target.value); setErrors(p => ({...p, phone: ''})) }} error={errors.phone} />
        </Field>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <Field label="Additional Notes">
          <Textarea placeholder="Special instructions, preferred carriers, delivery timeline…" value={d.notes} onChange={e => up('notes', e.target.value)} />
        </Field>
      </div>
      <p style={{ marginTop: '1rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.76rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.7 }}>
        Your details are used solely to prepare your quote. We respond within 4 business hours.
      </p>
    </div>
  );
}

// ─── SUCCESS STATE ────────────────────────────────────────────────────────────
const SUCCESS_LABELS = {
  sea: 'Sea Freight',
  air: 'Air Freight',
  land: 'Land Freight',
  customs: 'Customs Clearance',
  project: 'Project Cargo',
};
function SuccessState({ type, onReset }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', textAlign: 'center', gap: '1.25rem' }}>
      <div style={{
        width: '4rem', height: '4rem', borderRadius: '50%',
        background: 'rgba(91,194,231,0.1)',
        border: '1px solid rgba(91,194,231,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.6rem',
      }}>✓</div>
      <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', letterSpacing: '0.06em', color: '#fff' }}>
        Quote Requested
      </h3>
      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, maxWidth: '22rem' }}>
        Your <strong style={{ color: 'rgba(91,194,231,0.85)' }}>{SUCCESS_LABELS[type]}</strong> quote request has been received.
        Our team will respond within <strong style={{ color: 'rgba(91,194,231,0.85)' }}>4 business hours</strong>.
      </p>
      <button onClick={onReset} className="qq-submit-btn" style={{ marginTop: '0.5rem' }}>
        Submit Another Quote
      </button>
    </div>
  );
}

// ─── MAIN QUICK QUOTE SECTION ─────────────────────────────────────────────────
const TABS = [
  { id: 'sea',     icon: '🚢', label: 'Sea Freight',       sub: 'FCL · LCL' },
  { id: 'air',     icon: '✈️', label: 'Air Freight',        sub: 'Express · Standard' },
  { id: 'land',    icon: '🚛', label: 'Land Freight',       sub: 'FTL · LTL' },
  { id: 'customs', icon: '🏛️', label: 'Customs Clearance', sub: 'Import · Export' },
  { id: 'project', icon: '⚙️', label: 'Project Cargo',     sub: 'OOG · Heavy Lift' },
];

export default function QuickQuoteSection({ sectionRef, lang: langProp, inModal = false }) {
  const { lang: ctxLang } = useLang();
  const lang = langProp || ctxLang || 'en';
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState('sea');
  const [successType, setSuccessType] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [extraServices, setExtraServices] = useState([]);

  const handleSuccess = (type) => {
    setSuccessType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };
  const handleReset = () => { setSuccessType(null); setExtraServices([]); };

  const toggleExtra = (id) =>
    setExtraServices(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  return (
    <div ref={sectionRef} id="quick-quote-section" className="qq-section">
      {/* Divider line */}
      <div className="tools-bg-line" />

      <div className="qq-inner">
        {/* Header — hidden when rendered inside modal (modal has its own heading) */}
        {!inModal && (
          <div className="tools-header">
            <div className="chapter-label" style={{ justifyContent: 'center' }}>
              {isAr ? arT.quickQuote.sectionEyebrow : 'Instant Pricing'}
            </div>
            <h2 className="tools-title">
              {isAr ? arT.quickQuote.sectionTitle : 'Quick Quote'}
            </h2>
            <p className="tools-subtitle">
              {isAr ? arT.quickQuote.sectionSubtitle : 'Sea, air, land, customs or project cargo — get a tailored quote in minutes. No calls. No waiting. Just results.'}
            </p>
          </div>
        )}

        {/* Tab selector */}
        <div className="qq-tabs">
          {TABS.map(t => {
            const tabLabels = {
              sea:     { label: isAr ? arT.quickQuote.tabSea     : t.label, sub: isAr ? arT.quickQuote.tabSeaSub     : t.sub },
              air:     { label: isAr ? arT.quickQuote.tabAir     : t.label, sub: isAr ? arT.quickQuote.tabAirSub     : t.sub },
              land:    { label: isAr ? arT.quickQuote.tabLand    : t.label, sub: isAr ? arT.quickQuote.tabLandSub    : t.sub },
              customs: { label: isAr ? arT.quickQuote.tabCustoms : t.label, sub: isAr ? arT.quickQuote.tabCustomsSub : t.sub },
              project: { label: isAr ? arT.quickQuote.tabProject : t.label, sub: isAr ? arT.quickQuote.tabProjectSub : t.sub },
            }[t.id] || { label: t.label, sub: t.sub };
            return (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); setSuccessType(null); }}
                className={`qq-tab${activeTab === t.id ? ' active' : ''}`}
              >
                <span className="qq-tab-icon">{t.icon}</span>
                <span className="qq-tab-label">{tabLabels.label}</span>
                <span className="qq-tab-sub">{tabLabels.sub}</span>
              </button>
            );
          })}
        </div>

        {/* Success toast — fixed overlay, always visible */}
        {showToast && (
          <div style={{
            position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
            zIndex: 99999, display: 'flex', alignItems: 'center', gap: 12,
            background: 'linear-gradient(135deg,rgba(10,30,50,0.97),rgba(15,40,65,0.97))',
            border: '1px solid rgba(91,194,231,0.45)', borderRadius: 12,
            padding: '14px 22px', boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            fontFamily: "'DM Sans', sans-serif", color: '#fff', maxWidth: 'calc(100% - 32px)',
            animation: 'qqToastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <span style={{ fontSize: 22 }}>✅</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Quote Request Submitted!</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                We'll respond within 4 business hours.
              </div>
            </div>
            <button onClick={() => setShowToast(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18, padding: '0 0 0 8px' }}>✕</button>
          </div>
        )}

        {/* Multi-service selector */}
        {!successType && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(91,194,231,0.06)', borderRadius: 10, border: '1px solid rgba(91,194,231,0.15)' }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(91,194,231,0.8)', fontWeight: 700, marginBottom: 8 }}>
              Also need assistance with:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {TABS.filter(t => t.id !== activeTab).map(t => {
                const sel = extraServices.includes(t.id);
                return (
                  <button key={t.id} onClick={() => toggleExtra(t.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                    borderRadius: 20, border: `1px solid ${sel ? 'rgba(91,194,231,0.7)' : 'rgba(255,255,255,0.15)'}`,
                    background: sel ? 'rgba(91,194,231,0.15)' : 'rgba(255,255,255,0.04)',
                    color: sel ? '#5BC2E7' : 'rgba(255,255,255,0.6)',
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <span style={{ fontSize: 14 }}>{sel ? '✓' : t.icon}</span>
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Form panel */}
        <div className="qq-panel">
          {successType ? (
            <SuccessState type={successType} onReset={handleReset} isAr={isAr} />
          ) : (
            <>
              {activeTab === 'sea'     && <SeaForm     onSuccess={handleSuccess} isAr={isAr} extraServices={extraServices} />}
              {activeTab === 'air'     && <AirForm     onSuccess={handleSuccess} isAr={isAr} extraServices={extraServices} />}
              {activeTab === 'land'    && <LandForm    onSuccess={handleSuccess} extraServices={extraServices} />}
              {activeTab === 'customs' && <CustomsForm onSuccess={handleSuccess} extraServices={extraServices} />}
              {activeTab === 'project' && <ProjectForm onSuccess={handleSuccess} extraServices={extraServices} />}
            </>
          )}
        </div>

        <p className="tools-footnote" style={{ marginTop: '1.5rem' }}>
          {isAr ? arT.quickQuote.footnote : 'All quote requests are handled by Bejoice specialists. Response guaranteed within 4 business hours (Sun–Thu, KSA time).'}
        </p>
      </div>
    </div>
  );
}
