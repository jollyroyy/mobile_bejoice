'use client';
import { useState, useMemo } from 'react'
import Container3DViewer, { CONTAINER_SPECS, WeightDistributionGuide } from './Container3DViewer'
import { useLang } from '@/context/LangContext'
import ar from '@/i18n/ar'

const BOX_COLORS = ['#5BC2E7','#3b82f6','#10b981','#e05252','#8b5cf6','#f59e0b','#06b6d4']

export default function ContainerCalculator() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const t = ar.containerCalc
  const [containerType, setContainerType] = useState('20ft')
  const [items, setItems] = useState([{
    id: 1, l: 120, w: 80, h: 80, weight: 200, qty: 5, unit: 'cm', stackable: true
  }])
  const container = CONTAINER_SPECS[containerType]

  const totalCBM = useMemo(() =>
    items.reduce((s, i) => {
      const f = i.unit === 'in' ? 2.54 : i.unit === 'ft' ? 30.48 : 1
      return s + (i.l * f) * (i.w * f) * (i.h * f) / 1e6 * i.qty
    }, 0)
  , [items])
  const totalWeight = useMemo(() => items.reduce((s, i) => s + i.weight * i.qty, 0), [items])
  const containerCBM = (container.length * container.width * container.height) / 1e6
  const containersVol = Math.ceil(totalCBM / containerCBM)
  const containersWeight = Math.ceil(totalWeight / container.maxWeight)
  const totalContainersNeeded = Math.max(1, containersVol, containersWeight)
  const utilization = Math.min(100, (totalCBM / containerCBM) * 100)

  const updateItem = (id, field, val) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i))
  const addItem = () => setItems(prev => [...prev, { id: Date.now(), l: 100, w: 80, h: 80, weight: 150, qty: 3, unit: 'cm', stackable: true }])
  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id))

  const utilizationColor = (totalContainersNeeded > 1 || utilization > 95) ? '#ef4444' : utilization > 75 ? '#f59e0b' : '#5BC2E7'

  return (
    <section id="container-calculator" style={{
      background: 'linear-gradient(180deg,#040408 0%,#06080f 60%,#040408 100%)',
      padding: 'clamp(60px,8vw,100px) 0',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid bg */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(91,194,231,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(91,194,231,0.022) 1px,transparent 1px)',
        backgroundSize: '56px 56px',
      }} />
      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300, borderRadius: '50%',
        background: 'radial-gradient(ellipse,rgba(91,194,231,0.07) 0%,transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 clamp(12px,3vw,32px)' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(36px,5vw,56px)' }}>
          <div style={{ fontSize: 11, letterSpacing: isAr ? 0 : 4, color: '#5BC2E7', fontFamily: 'DM Sans,sans-serif', fontWeight: 600, marginBottom: 14, textTransform: isAr ? 'none' : 'uppercase' }}>
            {isAr ? t.eyebrow : 'LOAD OPTIMISER'}
          </div>
          <h2 style={{
            fontFamily: isAr ? "'Cairo','Noto Sans Arabic',sans-serif" : 'Bebas Neue,sans-serif',
            fontSize: 'clamp(2.4rem,6vw,4.2rem)',
            color: '#fff', letterSpacing: isAr ? 0 : 4, lineHeight: 1, margin: 0,
          }}>
            {isAr ? t.title : 'CONTAINER CALCULATOR'}
          </h2>
          <p style={{
            fontFamily: 'DM Sans,sans-serif', color: 'rgba(255,255,255,0.42)',
            fontSize: 'clamp(13px,1.5vw,15px)',
            maxWidth: 440, margin: '14px auto 0',
          }}>
            {isAr ? t.subtitle : 'Enter cargo dimensions and see how it packs into the container.'}
          </p>
        </div>

        {/* ── Unified instrument panel ── */}
        <div className="cc-panel" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,360px) 1fr',
          minHeight: 600,
          border: '1px solid rgba(91,194,231,0.18)',
          borderRadius: 20,
          overflow: 'hidden',
          background: 'rgba(4,4,10,0.7)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 0 1px rgba(91,194,231,0.06), 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(91,194,231,0.12)',
          position: 'relative',
        }}>

          {/* ── LEFT: Form panel ── */}
          <div className="cc-form-panel" style={{
            borderRight: '1px solid rgba(91,194,231,0.14)',
            display: 'flex', flexDirection: 'column',
            background: 'rgba(255,255,255,0.012)',
            position: 'relative',
          }}>
            {/* Panel header bar */}
            <div style={{
              padding: '18px 24px 16px',
              borderBottom: '1px solid rgba(91,194,231,0.1)',
              background: 'rgba(91,194,231,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#5BC2E7', boxShadow: '0 0 8px rgba(91,194,231,0.8)' }} />
                <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: isAr ? 0 : 2.5, color: 'rgba(255,255,255,0.55)', textTransform: isAr ? 'none' : 'uppercase' }}>
                  {isAr ? t.cargoInput : 'Cargo Input'}
                </span>
              </div>
              <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, color: 'rgba(91,194,231,0.5)', letterSpacing: 1 }}>
                {isAr ? `${items.length} ${t.item}` : `${items.length} item${items.length !== 1 ? 's' : ''}`}
              </span>
            </div>

            {/* Scrollable content */}
            <div className="cc-form-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>

              {/* Container selector */}
              <div style={{ marginBottom: 22 }}>
                <span style={lbl}>{isAr ? t.containerType : 'Container Type'}</span>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {Object.entries(CONTAINER_SPECS).map(([key, c]) => (
                    <button key={key} onClick={() => setContainerType(key)} style={{
                      flex: 1, padding: '8px 4px', borderRadius: 8,
                      border: `1px solid ${containerType === key ? '#5BC2E7' : 'rgba(255,255,255,0.08)'}`,
                      background: containerType === key ? 'rgba(91,194,231,0.13)' : 'rgba(255,255,255,0.025)',
                      color: containerType === key ? '#5BC2E7' : 'rgba(255,255,255,0.4)',
                      fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 0.5,
                      boxShadow: containerType === key ? '0 0 12px rgba(91,194,231,0.15)' : 'none',
                    }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cargo items */}
              {items.map((item, idx) => (
                <div key={item.id} style={{
                  background: 'rgba(255,255,255,0.022)',
                  border: `1px solid rgba(255,255,255,0.07)`,
                  borderLeft: `2px solid ${BOX_COLORS[idx % BOX_COLORS.length]}44`,
                  borderRadius: 10, padding: '14px 14px', marginBottom: 12,
                  transition: 'border-color 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: BOX_COLORS[idx % BOX_COLORS.length], fontWeight: 700, letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 2, background: BOX_COLORS[idx % BOX_COLORS.length], boxShadow: `0 0 6px ${BOX_COLORS[idx % BOX_COLORS.length]}` }} />
                      {isAr ? `${t.item} ${idx + 1}` : `ITEM ${idx + 1}`}
                    </span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <select value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} style={sel}>
                        <option value="cm">cm</option>
                        <option value="in">in</option>
                        <option value="ft">ft</option>
                      </select>
                      {items.length > 1 && (
                        <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px', minWidth: 26, minHeight: 26 }}>×</button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7, marginBottom: 9 }}>
                    {[['L', 'l'], ['W', 'w'], ['H', 'h']].map(([label, f]) => (
                      <div key={f}>
                        <span style={micro}>{label} ({item.unit})</span>
                        <input type="number" min="1" value={item[f]}
                          onChange={e => updateItem(item.id, f, Math.max(1, +e.target.value || 1))}
                          style={inp} />
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 11 }}>
                    <div>
                      <span style={micro}>{isAr ? t.weight : 'Weight (kg)'}</span>
                      <input type="number" min="0" value={item.weight}
                        onChange={e => updateItem(item.id, 'weight', Math.max(0, +e.target.value || 0))}
                        style={inp} />
                    </div>
                    <div>
                      <span style={micro}>{isAr ? t.quantity : 'Quantity'}</span>
                      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                        <button onClick={() => updateItem(item.id, 'qty', Math.max(1, item.qty - 1))} style={stepB}>−</button>
                        <input type="number" min="1" value={item.qty}
                          onChange={e => updateItem(item.id, 'qty', Math.max(1, +e.target.value || 1))}
                          style={{ ...inp, textAlign: 'center', flex: 1, marginTop: 0 }} />
                        <button onClick={() => updateItem(item.id, 'qty', item.qty + 1)} style={stepB}>+</button>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => updateItem(item.id, 'stackable', !item.stackable)} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  }}>
                    <span style={{
                      width: 34, height: 17, borderRadius: 9, position: 'relative', flexShrink: 0,
                      background: item.stackable ? 'rgba(91,194,231,0.6)' : 'rgba(255,255,255,0.08)',
                      transition: 'background 0.2s', display: 'block',
                      boxShadow: item.stackable ? '0 0 8px rgba(91,194,231,0.3)' : 'none',
                    }}>
                      <span style={{
                        position: 'absolute', top: 1.5, width: 14, height: 14, borderRadius: 7, background: '#fff',
                        left: item.stackable ? 18 : 1.5, transition: 'left 0.2s',
                      }} />
                    </span>
                    <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>{isAr ? t.stackable : 'Stackable'}</span>
                  </button>
                </div>
              ))}

              <button onClick={addItem} style={{
                width: '100%', padding: '10px 0', borderRadius: 8,
                border: '1px dashed rgba(91,194,231,0.25)',
                background: 'transparent', color: 'rgba(91,194,231,0.55)',
                fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', letterSpacing: isAr ? 0 : 1.5, transition: 'all 0.2s',
              }}>
                {isAr ? t.addItem : '+ ADD ITEM'}
              </button>
            </div>

            {/* Stats footer inside form panel */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid rgba(91,194,231,0.1)',
              background: 'rgba(91,194,231,0.03)',
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}>
              {[
                [isAr ? t.totalVolume : 'TOTAL VOLUME', `${totalCBM.toFixed(2)} m³`],
                [isAr ? t.totalWeight : 'TOTAL WEIGHT', `${totalWeight.toLocaleString()} kg`],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, marginBottom: 3 }}>{k}</div>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, color: '#8DD8F0', letterSpacing: 1 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: 3D viewer ── */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            background: 'rgba(2,2,8,0.5)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Subtle radial glow behind the 3D scene */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse at 50% 45%, rgba(91,194,231,0.05) 0%, transparent 65%)',
            }} />

            {/* Viewer header bar */}
            <div style={{
              padding: '18px 28px 16px',
              borderBottom: '1px solid rgba(91,194,231,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'relative', zIndex: 1,
            }}>
              <div>
                <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: isAr ? 0 : 2.5, textTransform: isAr ? 'none' : 'uppercase', marginBottom: 2 }}>
                  {container.label} · {isAr ? t.livePreview : 'Live Preview'}
                </div>
                <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                  {container.length}×{container.width}×{container.height} cm · max {container.maxWeight.toLocaleString()} kg · {containerCBM.toFixed(0)} m³
                </div>
              </div>
              {/* Utilization badge */}
              <div style={{
                padding: '5px 12px', borderRadius: 20,
                border: `1px solid ${utilizationColor}44`,
                background: `${utilizationColor}11`,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: utilizationColor, boxShadow: `0 0 6px ${utilizationColor}` }} />
                <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 15, color: utilizationColor, letterSpacing: 1 }}>
                  {utilization.toFixed(0)}%
                </span>
                <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 }}>{isAr ? t.loaded : 'LOADED'}</span>
              </div>
            </div>

            {/* 3D canvas — fills remaining height */}
            <div style={{ flex: 1, padding: '12px 20px 8px', position: 'relative', zIndex: 1, minHeight: 0 }}>
              <Container3DViewer items={items} containerType={containerType} compact={false} />
            </div>

            {/* Bottom bar: utilization bar + status + CTA */}
            <div style={{
              padding: '14px 28px 20px',
              borderTop: '1px solid rgba(91,194,231,0.1)',
              position: 'relative', zIndex: 1,
            }}>
              {/* Utilization bar */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1 }}>
                    {totalContainersNeeded > 1
                      ? `⚠ ${totalContainersNeeded} x ${container.label} ${isAr ? t.recommended : 'recommended'}`
                      : (utilization > 95 ? (isAr ? t.almostFull : '⚠ Almost full') : `${(containerCBM - totalCBM).toFixed(1)} ${isAr ? t.remaining : 'm³ remaining'}`)
                    }
                  </span>
                  <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, color: utilizationColor }}>
                    {totalContainersNeeded > 1
                      ? `${totalCBM.toFixed(2)} ${isAr ? t.totalCbm : 'm³ TOTAL'}`
                      : `${totalCBM.toFixed(2)} / ${containerCBM.toFixed(0)} m³`
                    }
                  </span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${Math.min(100, utilization)}%`,
                    background: utilization > 95
                      ? 'linear-gradient(90deg,#ef4444,#ff6b6b)'
                      : utilization > 75
                        ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                        : 'linear-gradient(90deg,#5BC2E7,#8DD8F0)',
                    borderRadius: 2, transition: 'width 0.5s ease',
                    boxShadow: `0 0 8px ${utilizationColor}88`,
                  }} />
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => typeof window.__showCalModal === 'function' && window.__showCalModal()}
                style={{
                  width: '100%', padding: '13px 0', borderRadius: 10,
                  background: 'linear-gradient(135deg,#5BC2E7 0%,#8DD8F0 50%,#5BC2E7 100%)',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 700,
                  color: '#0a0a12', letterSpacing: 1.5,
                  boxShadow: '0 4px 24px rgba(91,194,231,0.25)',
                  transition: 'box-shadow 0.2s, transform 0.1s',
                }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 36px rgba(91,194,231,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(91,194,231,0.25)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {isAr ? t.getQuote : 'GET A FREIGHT QUOTE →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cc-form-scroll::-webkit-scrollbar { width: 3px; }
        .cc-form-scroll::-webkit-scrollbar-track { background: transparent; }
        .cc-form-scroll::-webkit-scrollbar-thumb { background: rgba(91,194,231,0.2); border-radius: 2px; }

        .cc-panel > * { min-width: 0; }
        @media (max-width: 640px) {
          .cc-panel { grid-template-columns: 1fr !important; }
          .cc-form-panel { border-right: none !important; border-bottom: 1px solid rgba(91,194,231,0.14) !important; }
          .cc-form-scroll { max-height: min(380px, 60svh); }
        }
      `}</style>
    </section>
  )
}

// ─── Style shorthands ─────────────────────────────────────────────────────────
const lbl = {
  fontFamily: 'DM Sans,sans-serif', fontSize: 11,
  color: 'rgba(255,255,255,0.45)', fontWeight: 500, letterSpacing: 0.5,
}
const micro = {
  display: 'block', fontFamily: 'DM Sans,sans-serif', fontSize: 10,
  color: 'rgba(255,255,255,0.32)', marginBottom: 5, letterSpacing: 0.2,
}
const inp = {
  width: '100%', padding: '7px 10px', marginTop: 0,
  background: 'rgba(255,255,255,0.045)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7,
  color: '#fff', fontFamily: 'DM Sans,sans-serif', fontSize: 14,
  boxSizing: 'border-box', outline: 'none',
}
const sel = {
  padding: '4px 7px', background: 'rgba(255,255,255,0.045)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
  color: 'rgba(255,255,255,0.55)', fontFamily: 'DM Sans,sans-serif',
  fontSize: 11, cursor: 'pointer', outline: 'none',
}
const stepB = {
  width: 28, flexShrink: 0, background: 'rgba(255,255,255,0.045)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7,
  color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: 15,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
