'use client';
/**
 * Container3DViewer — canvas-based isometric 3D container with cargo packing.
 * Uses HTML5 Canvas for pixel-perfect rendering — cargo never protrudes.
 */
import { useRef, useEffect, useMemo, useCallback } from 'react'

// ── Container specs (internal cm) ────────────────────────────────────────────
export const CONTAINER_SPECS = {
  '20ft': { label: "20′ Std",  length: 590,  width: 235, height: 239, maxWeight: 28200, cbm: 33.2  },
  '40ft': { label: "40′ Std",  length: 1203, width: 235, height: 239, maxWeight: 26700, cbm: 67.7  },
  '40hc': { label: "40′ HC",   length: 1203, width: 235, height: 269, maxWeight: 26450, cbm: 76.4  },
}

// ── Cargo colours ─────────────────────────────────────────────────────────────
const COLORS = ['#5BC2E7','#3b82f6','#10b981','#e05252','#8b5cf6','#f59e0b','#06b6d4']

// ── Container weight limits table ─────────────────────────────────────────
export const WEIGHT_TABLE = [
  { label:'20ft Standard', payload:'28,200', tare:'2,300', gross:'30,480', floor:'1,450' },
  { label:'40ft Standard', payload:'26,680', tare:'3,800', gross:'30,480', floor:'1,450' },
  { label:'40ft High Cube', payload:'26,460', tare:'4,020', gross:'30,480', floor:'1,450' },
]

// ── 3D projection with rotation ──────────────────────────────────────────────
function project(x, y, z, rotX, rotY) {
  // Rotate around Y axis
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
  let x1 = x * cosY + z * sinY
  let z1 = -x * sinY + z * cosY
  // Rotate around X axis
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX)
  let y1 = y * cosX - z1 * sinX
  let z2 = y * sinX + z1 * cosX
  // Simple orthographic projection (no perspective distortion = no protrusion)
  return [x1, -y1, z2]
}

function isoProject(x, y, z, rotX, rotY) {
  const [px, py] = project(x, y, z, rotX, rotY)
  return [px, py]
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

function rgbStr(r, g, b, a = 1) {
  return a < 1 ? `rgba(${r},${g},${b},${a})` : `rgb(${r},${g},${b})`
}

function tintColor(hex, amount) {
  const [r, g, b] = hexToRgb(hex)
  return rgbStr(Math.min(255, r + amount), Math.min(255, g + amount), Math.min(255, b + amount))
}

function shadeColor(hex, amount) {
  const [r, g, b] = hexToRgb(hex)
  return rgbStr(Math.max(0, r - amount), Math.max(0, g - amount), Math.max(0, b - amount))
}

// ── Intelligent 3D bin packer (extreme-point algorithm) ───────────────────────
// Tries all 6 orientations per box, scores positions by gravity + compactness,
// produces realistic cargo layouts with heaviest items on the floor.
function packItems(items, spec, scale) {
  const TO_CM = { cm: 1, mm: 0.1, m: 100, in: 2.54, ft: 30.48 }
  const CL = spec.length, CW = spec.width, CH = spec.height

  // Expand items × qty into individual box descriptors
  const allBoxes = []
  items.forEach((item, idx) => {
    const f = TO_CM[item.unit] ?? 1
    const cl = Math.min(Math.max(1, item.l * f), CL)
    const cw = Math.min(Math.max(1, item.w * f), CW)
    const ch = Math.min(Math.max(1, item.h * f), CH)
    const cap = Math.min(item.qty, 60)
    for (let q = 0; q < cap; q++)
      allBoxes.push({ l: cl, w: cw, h: ch, color: COLORS[idx % COLORS.length], weight: item.weight || 1, stackable: item.stackable })
  })

  // Sort: heaviest first (sits on the floor), then largest volume
  allBoxes.sort((a, b) => (b.weight - a.weight) || (b.l * b.w * b.h - a.l * a.w * a.h))

  // Unique orientations for a box (l=length along X, w=depth along Z, h=height along Y)
  const orientations = (l, w, h) => {
    const seen = new Set()
    return [[l,w,h],[l,h,w],[w,l,h],[w,h,l],[h,l,w],[h,w,l]].filter(([a,b,c]) => {
      const k = `${a.toFixed(1)},${b.toFixed(1)},${c.toFixed(1)}`
      return seen.has(k) ? false : (seen.add(k), true)
    })
  }

  // Placed boxes in cm-space: { x,y,z,l,w,h }
  const placed = []

  const overlaps = (x, y, z, l, w, h) => {
    for (const p of placed) {
      if (x < p.x + p.l - 0.01 && x + l > p.x + 0.01 &&
          y < p.y + p.h - 0.01 && y + h > p.y + 0.01 &&
          z < p.z + p.w - 0.01 && z + w > p.z + 0.01) return true
    }
    return false
  }
  const fits = (x, y, z, l, w, h) => x + l <= CL + 0.01 && y + h <= CH + 0.01 && z + w <= CW + 0.01

  // Extreme points: candidate bottom-left-front corners to try
  let pts = [{ x: 0, y: 0, z: 0 }]

  const out = []

  for (const box of allBoxes) {
    let best = null, bestScore = Infinity

    for (const pt of pts) {
      for (const [bl, bw, bh] of orientations(box.l, box.w, box.h)) {
        const { x, y, z } = pt
        if (!fits(x, y, z, bl, bw, bh)) continue
        if (overlaps(x, y, z, bl, bw, bh)) continue
        // Score: minimise height first (gravity), then depth, then length
        const score = y * 1e8 + z * 1e4 + x
        if (score < bestScore) { bestScore = score; best = { x, y, z, l: bl, w: bw, h: bh } }
      }
    }

    if (!best) continue

    placed.push(best)
    out.push({
      x: best.x * scale, y: best.y * scale, z: best.z * scale,
      w: best.l * scale, h: best.h * scale, d: best.w * scale,
      color: box.color, stackable: box.stackable,
    })

    // Generate new extreme points from the three exposed faces
    pts.push(
      { x: best.x + best.l, y: best.y,       z: best.z       },  // right of box
      { x: best.x,          y: best.y + best.h, z: best.z     },  // on top of box
      { x: best.x,          y: best.y,       z: best.z + best.w }, // behind box
    )

    // Remove points that now lie inside any placed box
    pts = pts.filter(pt => {
      for (const p of placed) {
        if (pt.x >= p.x - 0.01 && pt.x < p.x + p.l - 0.01 &&
            pt.y >= p.y - 0.01 && pt.y < p.y + p.h - 0.01 &&
            pt.z >= p.z - 0.01 && pt.z < p.z + p.w - 0.01) return false
      }
      return true
    })
  }

  return out
}

// ── Draw an isometric face (polygon) ──────────────────────────────────────────
function drawFace(ctx, pts, fill, stroke) {
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = 1.2
    ctx.stroke()
  }
}

// ── Draw a 3D box with rotation — all 6 faces, painter's algorithm ────────────
function drawBox(ctx, ox, oy, x, y, z, w, h, d, topCol, frontCol, rightCol, stroke, rX, rY) {
  const p = (bx, by, bz) => {
    const [ix, iy] = isoProject(bx, by, bz, rX, rY)
    return [ox + ix, oy + iy]
  }
  const pDepth = (bx, by, bz) => project(bx, by, bz, rX, rY)[2]

  // 8 corners
  const corners = [
    [x,   y,   z  ], [x+w, y,   z  ], [x+w, y,   z+d], [x,   y,   z+d],
    [x,   y+h, z  ], [x+w, y+h, z  ], [x+w, y+h, z+d], [x,   y+h, z+d],
  ]
  const pc = corners.map(c => p(...c))

  // All 6 faces with their center-point depth for sorting
  const faces = [
    { pts: [pc[4],pc[5],pc[6],pc[7]], cx: x+w/2, cy: y+h,   cz: z+d/2, col: topCol                   }, // top
    { pts: [pc[3],pc[2],pc[6],pc[7]], cx: x+w/2, cy: y+h/2, cz: z+d,   col: frontCol                  }, // front
    { pts: [pc[1],pc[2],pc[6],pc[5]], cx: x+w,   cy: y+h/2, cz: z+d/2, col: rightCol                  }, // right
    { pts: [pc[0],pc[1],pc[5],pc[4]], cx: x+w/2, cy: y+h/2, cz: z,     col: shadeColor(frontCol, 50)  }, // back
    { pts: [pc[0],pc[3],pc[7],pc[4]], cx: x,     cy: y+h/2, cz: z+d/2, col: shadeColor(rightCol, 20)  }, // left
    { pts: [pc[0],pc[1],pc[2],pc[3]], cx: x+w/2, cy: y,     cz: z+d/2, col: shadeColor(topCol, 40)    }, // bottom
  ]

  // Sort back-to-front by projected depth so closer faces paint on top
  faces.sort((a, b) => pDepth(a.cx, a.cy, a.cz) - pDepth(b.cx, b.cy, b.cz))
  faces.forEach(f => drawFace(ctx, f.pts, f.col, stroke))
}

// ── Draw container shell (back faces first) ──────────────────────────────────
function drawContainerShell(ctx, ox, oy, cw, ch, cd, rX, rY, mode) {
  const p = (x, y, z) => {
    const [ix, iy] = isoProject(x, y, z, rX, rY)
    return [ox + ix, oy + iy]
  }

  // 8 corners
  const c = [
    p(0,0,0), p(cw,0,0), p(cw,0,cd), p(0,0,cd),
    p(0,ch,0), p(cw,ch,0), p(cw,ch,cd), p(0,ch,cd),
  ]

  // Face definitions: [corner indices, fill, stroke, normal]
  const faces = [
    { pts: [c[0],c[3],c[7],c[4]], norm: [-1,0,0], fill: 'rgba(91,194,231,0.06)', stroke: 'rgba(91,194,231,0.25)' }, // left (x=0)
    { pts: [c[1],c[2],c[6],c[5]], norm: [1,0,0],  fill: 'rgba(91,194,231,0.05)', stroke: 'rgba(91,194,231,0.22)' }, // right (x=cw)
    { pts: [c[0],c[1],c[2],c[3]], norm: [0,-1,0], fill: 'rgba(91,194,231,0.08)', stroke: 'rgba(91,194,231,0.3)' },  // floor (y=0)
    { pts: [c[4],c[5],c[6],c[7]], norm: [0,1,0],  fill: 'rgba(91,194,231,0.04)', stroke: 'rgba(91,194,231,0.18)' }, // ceiling (y=ch)
    { pts: [c[0],c[1],c[5],c[4]], norm: [0,0,-1], fill: 'rgba(91,194,231,0.04)', stroke: 'rgba(91,194,231,0.2)' },  // back (z=0)
    { pts: [c[3],c[2],c[6],c[7]], norm: [0,0,1],  fill: 'rgba(91,194,231,0.02)', stroke: 'rgba(91,194,231,0.15)' }, // front (z=cd)
  ]

  faces.forEach(f => {
    const [nx, ny, nz] = project(f.norm[0], f.norm[1], f.norm[2], rX, rY)
    // "back" mode: draw faces pointing away from viewer (nz <= 0 in screen space)
    // "front" mode: draw faces pointing toward viewer (nz > 0) — as wireframe only
    if (mode === 'back' && nz <= 0) {
      drawFace(ctx, f.pts, f.fill, f.stroke)
    } else if (mode === 'front' && nz > 0) {
      // Draw as wireframe (transparent fill) so cargo is visible through it
      drawFace(ctx, f.pts, 'rgba(91,194,231,0.015)', f.stroke)
    }
  })
}

// ── Weight distribution guide ─────────────────────────────────────────────
export function WeightDistributionGuide({ items, containerType, isAr }) {
  const totalWeight = (items||[]).reduce((s,i) => s + i.weight*i.qty, 0)
  const frontPct = 58
  const actualFront = totalWeight > 0 ? Math.round(totalWeight * (frontPct / 100)) : 0
  const actualRear  = totalWeight - actualFront

  const W = isAr ? {
    title:          'دليل توزيع الوزن في الحاوية',
    desc:           'توزيع الوزن بشكل صحيح أمر بالغ الأهمية للنقل الآمن والامتثال التنظيمي ومنع تلف البضائع أثناء الشحن.',
    topView:        'منظر علوي — ٥,٨٩٨ × ٢,٣٥٢ مم',
    frontZone:      'المنطقة الأمامية',
    rearZone:       'المنطقة الخلفية',
    cog:            'مركز الثقل',
    door:           'باب',
    front:          '→ أمام',
    length:         'الطول: ٥,٨٩٨ مم (١٩′٤″)',
    rear:           'خلف →',
    sideView:       'منظر جانبي — ٥,٨٩٨ × ٢,٣٩٣ مم',
    heavy:          '● ثقيل — حمل منخفض للأمام',
    light:          '○ خفيف — رص فوق',
    height:         '٢,٣٩٣ مم',
    rule:           '— قاعدة توزيع الوزن ٦٠/٤٠',
    ruleDesc:       'لتحقيق الاستقرار الأمثل، يجب وضع حوالي ٦٠٪ من وزن البضاعة في الاتجاه الأمامي (باتجاه الباب) و٤٠٪ في الاتجاه الخلفي.',
    optimal:        'أمثل',
    warning:        'تحذير',
    danger:         'خطر',
    safeAll:        'آمن لجميع وسائل النقل',
    monitor:        'راقب بعناية',
    tipRisk:        'خطر الانقلاب',
    rHeavyBottom:   'الأوزان الثقيلة في الأسفل',
    rHeavyBottomD:  'ضع أثقل البضائع على أرضية الحاوية أولاً. هذا يخفض مركز الثقل ويمنع عدم الاستقرار.',
    rEvenSides:     'توازن جانبي',
    rEvenSidesD:    'وزع الوزن بالتساوي بين الجانبين الأيسر والأيمن. الوزن الجانبي غير المتوازن قد يسبب الميلان وضغط الهيكل.',
    rSpreadLoads:   'توزيع الأحمال النقطية',
    rSpreadLoadsD:  'الأحمال النقطية الثقيلة قد تتلف أرضيات الحاوية. استخدم حشوات أو ألواح توزيع لتوزيع الوزن المركز.',
    rFrontRule:     'قاعدة ٦٠/٤٠ الأمامية',
    rFrontRuleD:    '٦٠٪ من الوزن الإجمالي أمام المركز. يحافظ على استقرار مركز الثقل أثناء رفع الرافعة والنقل البري.',
    wLimits:        'حدود وزن الحاوية',
    tContainer:     'الحاوية',
    tPayload:       'الحمولة القصوى',
    tTare:          'الوزن الفارغ',
    tGross:         'الوزن الإجمالي',
    tFloor:         'حمل الأرضية',
    tableRow20ft:   '20ft قياسي',
    tableRow40ft:   '40ft قياسي',
    tableRow40hc:   '40ft High Cube',
    note:           'ملاحظة: تختلف حدود الوزن البري حسب البلد والطريق. العديد من المناطق تحد الوزن الإجمالي للشاحنة بـ ٢٠–٢٥ طناً.',
    analysis:       'تحليل البضاعة الخاصة بك',
    totalWt:        'الوزن الإجمالي للبضاعة',
    utilisation:    'استخدام الحاوية',
    maxPayload:     'من الحمولة القصوى',
    frontLoad:      'الحمل الأمامي الموصى به',
    rearLoad:       'الحمل الخلفي الموصى به',
  } : null
  const t = (key) => W ? W[key] : undefined
  const tableLabel = (enLabel) => {
    if (!isAr) return enLabel
    const map = { '20ft Standard': W.tableRow20ft, '40ft Standard': W.tableRow40ft, '40ft High Cube': W.tableRow40hc }
    return map[enLabel] || enLabel
  }

  const getStatus = (pct) => {
    if (pct >= 55 && pct <= 60) return { label: isAr ? W.optimal : 'OPTIMAL', color:'#10b981', bg:'rgba(16,185,129,0.08)', border:'rgba(16,185,129,0.2)' }
    if ((pct >= 50 && pct < 55) || (pct > 60 && pct <= 65)) return { label: isAr ? W.warning : 'WARNING', color:'#f59e0b', bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.2)' }
    return { label: isAr ? W.danger : 'DANGER', color:'#ef4444', bg:'rgba(239,68,68,0.08)', border:'rgba(239,68,68,0.2)' }
  }
  const status = getStatus(frontPct)

  const S = {
    hd: { fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'Bebas Neue',sans-serif", letterSpacing: isAr ? 0 : 2, color:'#5BC2E7' },
    sm: { fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:14, color:'rgba(255,255,255,0.42)', lineHeight:1.55 },
    label: { fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:13, fontWeight:700, letterSpacing: isAr ? 0 : 1.2, textTransform:'uppercase', color:'rgba(255,255,255,0.3)' },
  }

  return (
    <div style={{ marginTop:'1.4rem', borderTop:'1px solid rgba(91,194,231,0.12)', paddingTop:'1.2rem' }}>
      <div style={{ ...S.hd, fontSize:'1.3rem', marginBottom:'0.4rem' }}>{isAr ? W.title : 'CONTAINER WEIGHT DISTRIBUTION GUIDE'}</div>
      <p style={{ ...S.sm, marginBottom:'1rem' }}>
        {isAr ? W.desc : 'Proper weight distribution is critical for safe transport, regulatory compliance, and preventing cargo damage during shipping.'}
      </p>

      {/* Top View */}
      <div style={{ marginBottom:'1rem' }}>
        <div style={{ ...S.label, marginBottom:'0.35rem' }}>{isAr ? W.topView : 'Top View — 5,898 × 2,352 mm'}</div>
        <div style={{ position:'relative', width:'100%', height:68, borderRadius:6, overflow:'hidden', border:'1px solid rgba(91,194,231,0.2)' }}>
          <div style={{ position:'absolute', left:0, top:0, width:'60%', height:'100%', background:'rgba(91,194,231,0.11)', borderRight:'1.5px dashed rgba(91,194,231,0.4)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1 }}>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, color:'#5BC2E7', letterSpacing:1, lineHeight:1 }}>60%</span>
            <span style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:13, color:'rgba(255,255,255,0.4)' }}>{isAr ? W.frontZone : 'Front Zone'}</span>
            {totalWeight > 0 && <span style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:12, color:'rgba(91,194,231,0.55)' }}>{actualFront.toLocaleString()} kg</span>}
          </div>
          <div style={{ position:'absolute', right:18, top:0, width:'calc(40% - 18px)', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1 }}>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, color:'rgba(255,255,255,0.45)', letterSpacing:1, lineHeight:1 }}>40%</span>
            <span style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:13, color:'rgba(255,255,255,0.28)' }}>{isAr ? W.rearZone : 'Rear Zone'}</span>
            {totalWeight > 0 && <span style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:12, color:'rgba(255,255,255,0.35)' }}>{actualRear.toLocaleString()} kg</span>}
          </div>
          <div style={{ position:'absolute', left:'57%', top:'50%', transform:'translate(-50%,-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:2, zIndex:2 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#8DD8F0', boxShadow:'0 0 10px rgba(91,194,231,0.9)', border:'1.5px solid rgba(91,194,231,0.7)' }} />
            <span style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:11, color:'#8DD8F0', letterSpacing: isAr ? 0 : 0.5, whiteSpace:'nowrap' }}>{isAr ? W.cog : 'CoG'}</span>
          </div>
          <div style={{ position:'absolute', right:0, top:0, bottom:0, width:18, background:'rgba(91,194,231,0.07)', display:'flex', alignItems:'center', justifyContent:'center', borderLeft:'1px solid rgba(91,194,231,0.18)' }}>
            <span style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:11, color:'rgba(91,194,231,0.45)', letterSpacing: isAr ? 0 : 1, writingMode: isAr ? undefined : 'vertical-rl', transform: isAr ? undefined : 'rotate(180deg)' }}>{isAr ? W.door : 'DOOR'}</span>
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:3 }}>
          <span style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:13, color:'rgba(255,255,255,0.22)' }}>{isAr ? W.front : '← Front'}</span>
          <span style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:13, color:'rgba(255,255,255,0.18)' }}>{isAr ? W.length : 'Length: 5,898 mm (19′4″)'}</span>
          <span style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:13, color:'rgba(255,255,255,0.22)' }}>{isAr ? W.rear : 'Rear →'}</span>
        </div>
      </div>

      {/* Side View */}
      <div style={{ marginBottom:'1rem' }}>
        <div style={{ ...S.label, marginBottom:'0.35rem' }}>{isAr ? W.sideView : 'Side View — 5,898 × 2,393 mm'}</div>
        <div style={{ position:'relative', width:'100%', height:56, border:'1px solid rgba(91,194,231,0.18)', borderRadius:6, overflow:'hidden', background:'rgba(255,255,255,0.015)' }}>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'52%', background:'rgba(91,194,231,0.09)', borderTop:'1.5px dashed rgba(91,194,231,0.32)', display:'flex', alignItems:'center', paddingLeft:8 }}>
            <span style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:12, color:'rgba(91,194,231,0.6)' }}>{isAr ? W.heavy : '● HEAVY — load low &amp; forward'}</span>
          </div>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'48%', display:'flex', alignItems:'center', paddingLeft:8 }}>
            <span style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:12, color:'rgba(255,255,255,0.28)' }}>{isAr ? W.light : '○ LIGHT — stack on top'}</span>
          </div>
          <div style={{ position:'absolute', right:6, top:'50%', transform:'translateY(-50%)', fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:12, color:'rgba(255,255,255,0.18)' }}>{isAr ? W.height : '2,393 mm'}</div>
        </div>
      </div>

      {/* 60/40 Rule status */}
      <div style={{ background:status.bg, border:`1px solid ${status.border}`, borderRadius:8, padding:'0.8rem', marginBottom:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'0.4rem' }}>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:17, color:status.color, letterSpacing:1.5 }}>{status.label}</span>
          <span style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:13, color:status.color, opacity:.7 }}>{isAr ? W.rule : '— 60/40 WEIGHT DISTRIBUTION RULE'}</span>
        </div>
        <p style={{ ...S.sm, margin:0, marginBottom:'0.5rem' }}>
          {isAr ? (
            <>لتحقيق الاستقرار الأمثل، يجب وضع حوالي <strong style={{ color:'rgba(255,255,255,0.7)' }}>٦٠٪ من وزن البضاعة</strong> في الاتجاه الأمامي (باتجاه الباب) و٤٠٪ في الاتجاه الخلفي.</>
          ) : (
            <>For optimal stability, approximately <strong style={{ color:'rgba(255,255,255,0.7)' }}>60% of cargo weight</strong> should be positioned toward the front (door end) and 40% toward the rear.</>
          )}
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.35rem' }}>
          {(isAr ? [
            ['٥٥–٦٠٪ أمام',W.optimal,W.safeAll,'#10b981'],
            ['٥٠–٥٥٪ أو ٦٠–٦٥٪',W.warning,W.monitor,'#f59e0b'],
            ['<٥٠٪ أو >٦٥٪',W.danger,W.tipRisk,'#ef4444'],
          ] : [
            ['55–60% front','Optimal','Safe for all modes','#10b981'],
            ['50–55% or 60–65%','Warning','Monitor closely','#f59e0b'],
            ['<50% or >65%','Danger','Risk of tipping','#ef4444'],
          ]).map(([range, lvl, note, c]) => (
            <div key={lvl} style={{ background:'rgba(0,0,0,0.2)', borderRadius:5, padding:'0.45rem 0.5rem', borderLeft:`2px solid ${c}` }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:15, color:c, letterSpacing:0.8 }}>{lvl}</div>
              <div style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.4 }}>{range}</div>
              <div style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:13, color:'rgba(255,255,255,0.3)', lineHeight:1.4 }}>{note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 rules */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.4rem', marginBottom:'1rem' }}>
        {(isAr ? [
          [W.rHeavyBottom,W.rHeavyBottomD,'⬇'],
          [W.rEvenSides,W.rEvenSidesD,'↔'],
          [W.rSpreadLoads,W.rSpreadLoadsD,'▦'],
          [W.rFrontRule,W.rFrontRuleD,'◎'],
        ] : [
          ['Heavy Items at Bottom','Place heaviest cargo on the container floor first. This lowers the centre of gravity and prevents top-heavy instability.','⬇'],
          ['Even Side-to-Side','Distribute weight evenly between left and right sides. Uneven lateral weight can cause tilting and chassis stress.','↔'],
          ['Spread Point Loads','Heavy point loads can damage container floors. Use dunnage or spreader boards to distribute concentrated weight.','▦'],
          ['60/40 Front Rule','60% of total weight forward of centre. Keeps CoG stable during crane lifts and road transport.','◎'],
        ]).map(([title, desc, icon]) => (
          <div key={title} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:7, padding:'0.6rem 0.7rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:'0.3rem' }}>
              <span style={{ fontSize:17 }}>{icon}</span>
              <span style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'Bebas Neue',sans-serif", fontSize:16, color:'#5BC2E7', letterSpacing: isAr ? 0 : 1 }}>{title}</span>
            </div>
            <p style={{ ...S.sm, margin:0, fontSize:14 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Weight Limits Table */}
      <div>
        <div style={{ ...S.hd, fontSize:'1.2rem', marginBottom:'0.5rem' }}>{isAr ? W.wLimits : 'CONTAINER WEIGHT LIMITS'}</div>
        <div style={{ overflowX:'auto', borderRadius:8, border:'1px solid rgba(91,194,231,0.15)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:14, minWidth:360 }}>
            <thead>
              <tr style={{ background:'rgba(91,194,231,0.08)' }}>
                {(isAr ? [W.tContainer,W.tPayload,W.tTare,W.tGross,W.tFloor] : ['Container','Max Payload','Tare Weight','Max Gross','Floor Load']).map(h => (
                  <th key={h} style={{ padding:'0.5rem 0.6rem', textAlign:'left', color:'rgba(255,255,255,0.5)', fontWeight:700, letterSpacing: isAr ? 0 : 0.5, borderBottom:'1px solid rgba(91,194,231,0.15)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WEIGHT_TABLE.map((row, i) => (
                <tr key={row.label} style={{ background: i%2===0 ? 'rgba(255,255,255,0.018)' : 'transparent' }}>
                  <td style={{ padding:'0.45rem 0.6rem', color:'rgba(255,255,255,0.7)', fontWeight:600 }}>{tableLabel(row.label)}</td>
                  <td style={{ padding:'0.45rem 0.6rem', color:'#5BC2E7' }}>{row.payload} kg</td>
                  <td style={{ padding:'0.45rem 0.6rem', color:'rgba(255,255,255,0.45)' }}>{row.tare} kg</td>
                  <td style={{ padding:'0.45rem 0.6rem', color:'rgba(255,255,255,0.45)' }}>{row.gross} kg</td>
                  <td style={{ padding:'0.45rem 0.6rem', color:'rgba(255,255,255,0.45)' }}>{row.floor} kg/m²</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...S.sm, marginTop:'0.5rem', fontSize:13, color:'rgba(255,255,255,0.28)' }}>
          {isAr ? W.note : 'Note: Road weight limits vary by country and route. Many regions limit truck gross weight to 20–25 tonnes.'}
        </p>

        {/* Dynamic cargo analysis */}
        {(items||[]).length > 0 && (items||[]).reduce((s,i) => s+i.weight*i.qty, 0) > 0 && (() => {
          const tw = (items||[]).reduce((s,i) => s+i.weight*i.qty, 0)
          const specKey = containerType || '20ft'
          const spec = CONTAINER_SPECS[specKey] || CONTAINER_SPECS['20ft']
          const usePct = Math.min(100,(tw/spec.maxWeight)*100)
          const fW = Math.round(tw*0.58), rW = tw - fW
          return (
            <div style={{ marginTop:'0.8rem', background:'rgba(91,194,231,0.06)', border:'1px solid rgba(91,194,231,0.18)', borderRadius:8, padding:'0.8rem' }}>
              <div style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'Bebas Neue',sans-serif", fontSize:16, color:'#5BC2E7', letterSpacing: isAr ? 0 : 1.5, marginBottom:'0.5rem' }}>{isAr ? W.analysis : 'YOUR CARGO ANALYSIS'}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.4rem' }}>
                {(isAr ? [
                  [W.totalWt, `${tw.toLocaleString()} kg`],
                  [W.utilisation, `${usePct.toFixed(1)}% ${W.maxPayload}`],
                  [W.frontLoad, `${fW.toLocaleString()} kg (58%)`],
                  [W.rearLoad, `${rW.toLocaleString()} kg (42%)`],
                ] : [
                  ['Total Cargo Weight', `${tw.toLocaleString()} kg`],
                  ['Container Utilisation', `${usePct.toFixed(1)}% of max payload`],
                  ['Recommended Front Load', `${fW.toLocaleString()} kg (58%)`],
                  ['Recommended Rear Load', `${rW.toLocaleString()} kg (42%)`],
                ]).map(([k,v]) => (
                  <div key={k} style={{ background:'rgba(0,0,0,0.15)', borderRadius:5, padding:'0.4rem 0.5rem' }}>
                    <div style={{ fontFamily: isAr ? "var(--font-cairo), 'Noto Sans Arabic', sans-serif" : "'DM Sans',sans-serif", fontSize:13, color:'rgba(255,255,255,0.35)', marginBottom:2 }}>{k}</div>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:19, color:'#8DD8F0', letterSpacing:0.5 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

// ── Draw container shell with model-space offset (for centered rotation) ─────
function drawContainerShellWithOffset(ctx, cw, ch, cd, rX, rY, offX, offY, offZ, mode) {
  const p = (x, y, z) => {
    const [ix, iy] = isoProject(x + offX, y + offY, z + offZ, rX, rY)
    return [ix, iy]
  }

  const c = [
    p(0,0,0), p(cw,0,0), p(cw,0,cd), p(0,0,cd),
    p(0,ch,0), p(cw,ch,0), p(cw,ch,cd), p(0,ch,cd),
  ]

  const faces = [
    { pts: [c[0],c[3],c[7],c[4]], norm: [-1,0,0], fill: 'rgba(91,194,231,0.06)', stroke: 'rgba(91,194,231,0.25)' },
    { pts: [c[1],c[2],c[6],c[5]], norm: [1,0,0],  fill: 'rgba(91,194,231,0.05)', stroke: 'rgba(91,194,231,0.22)' },
    { pts: [c[0],c[1],c[2],c[3]], norm: [0,-1,0], fill: 'rgba(91,194,231,0.08)', stroke: 'rgba(91,194,231,0.3)' },
    { pts: [c[4],c[5],c[6],c[7]], norm: [0,1,0],  fill: 'rgba(91,194,231,0.04)', stroke: 'rgba(91,194,231,0.18)' },
    { pts: [c[0],c[1],c[5],c[4]], norm: [0,0,-1], fill: 'rgba(91,194,231,0.04)', stroke: 'rgba(91,194,231,0.2)' },
    { pts: [c[3],c[2],c[6],c[7]], norm: [0,0,1],  fill: 'rgba(91,194,231,0.02)', stroke: 'rgba(91,194,231,0.15)' },
  ]

  faces.forEach(f => {
    const [, , nz] = project(f.norm[0], f.norm[1], f.norm[2], rX, rY)
    if (mode === 'back' && nz <= 0) {
      drawFace(ctx, f.pts, f.fill, f.stroke)
    } else if (mode === 'front' && nz > 0) {
      drawFace(ctx, f.pts, 'rgba(91,194,231,0.015)', f.stroke)
    }
  })
}

// ── Main viewer ───────────────────────────────────────────────────────────────
export default function Container3DViewer({ items, containerType = '20ft', compact = false }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const rotRef = useRef({ x: 0.45, y: -0.65, dragging: false, lx: 0, ly: 0, pinchD: 0 })
  const zoomRef = useRef(1)
  const needsDrawRef = useRef(true)

  const spec = CONTAINER_SPECS[containerType] || CONTAINER_SPECS['20ft']

  const DISPLAY_SIZE = compact ? 200 : 380
  const scale = DISPLAY_SIZE / Math.max(spec.length, spec.width, spec.height)

  const packed = useMemo(() => packItems(items || [], spec, scale), [items, spec, scale])

  const totalCBM = useMemo(() => (items || []).reduce((s, i) => {
    const TO_CM = { cm: 1, mm: 0.1, m: 100, in: 2.54, ft: 30.48 }
    const f = TO_CM[i.unit] ?? 1
    return s + i.l*f * i.w*f * i.h*f / 1e6 * i.qty
  }, 0), [items])
  const totalWeight = useMemo(() => (items || []).reduce((s, i) => s + i.weight * i.qty, 0), [items])
  const utilization = Math.min(100, (totalCBM / spec.cbm) * 100)

  const cwRef = useRef(spec.length * scale)
  const chRef = useRef(spec.height * scale)
  const cdRef = useRef(spec.width * scale)
  const packedRef = useRef(packed)
  cwRef.current = spec.length * scale
  chRef.current = spec.height * scale
  cdRef.current = spec.width * scale
  packedRef.current = packed

  // Mark redraw needed when data changes
  useEffect(() => { needsDrawRef.current = true }, [packed, spec])

  // ── Render loop ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let running = true

    const render = () => {
      if (!running) return
      // Auto-rotate when not dragging
      if (!rotRef.current.dragging) {
        rotRef.current.y += 0.003
        needsDrawRef.current = true
      }

      if (needsDrawRef.current) {
        needsDrawRef.current = false
        const ctx = canvas.getContext('2d')
        const dpr = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()
        const W = rect.width, H = rect.height
        if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
          canvas.width = W * dpr
          canvas.height = H * dpr
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, W, H)

        const ox = W / 2
        const oy = H * 0.52
        const z = zoomRef.current
        const rX = rotRef.current.x
        const rY = rotRef.current.y
        const cw = cwRef.current, ch = chRef.current, cd = cdRef.current

        // Center the container model at origin for rotation
        const offX = -cw / 2, offY = -ch / 2, offZ = -cd / 2

        ctx.save()
        ctx.translate(ox, oy)
        ctx.scale(z, z)

        // Draw back container faces
        drawContainerShellWithOffset(ctx, cw, ch, cd, rX, rY, offX, offY, offZ, 'back')

        // Sort cargo back-to-front based on current rotation
        const sorted = [...packedRef.current].sort((a, b) => {
          // Compute center depth (z in screen space) for sorting
          const [,,az] = project(a.x + a.w/2 + offX, a.y + a.h/2 + offY, a.z + a.d/2 + offZ, rX, rY)
          const [,,bz] = project(b.x + b.w/2 + offX, b.y + b.h/2 + offY, b.z + b.d/2 + offZ, rX, rY)
          return az - bz  // farther first
        })

        sorted.forEach(box => {
          const topCol = tintColor(box.color, 35)
          const frontCol = box.color
          const rightCol = shadeColor(box.color, 35)
          drawBox(ctx, 0, 0, box.x + offX, box.y + offY, box.z + offZ, box.w, box.h, box.d,
            topCol, frontCol, rightCol, 'rgba(0,0,0,0.72)', rX, rY)
        })

        // Draw front container faces on top
        drawContainerShellWithOffset(ctx, cw, ch, cd, rX, rY, offX, offY, offZ, 'front')

        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)
    return () => { running = false; cancelAnimationFrame(rafRef.current) }
  }, [])

  // ── Mouse drag ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onDown = (e) => {
      rotRef.current.dragging = true
      rotRef.current.lx = e.clientX
      rotRef.current.ly = e.clientY
      canvas.style.cursor = 'grabbing'
    }
    const onMove = (e) => {
      if (!rotRef.current.dragging) return
      rotRef.current.y += (e.clientX - rotRef.current.lx) * 0.008
      rotRef.current.x = Math.max(-1.2, Math.min(1.2, rotRef.current.x - (e.clientY - rotRef.current.ly) * 0.006))
      rotRef.current.lx = e.clientX
      rotRef.current.ly = e.clientY
      needsDrawRef.current = true
    }
    const onUp = () => { rotRef.current.dragging = false; canvas.style.cursor = 'grab' }
    const onWheel = (e) => {
      e.preventDefault()
      e.stopPropagation()
      zoomRef.current = Math.max(0.5, Math.min(3, zoomRef.current - e.deltaY * 0.002))
      needsDrawRef.current = true
    }
    // Touch
    const onTouchStart = (e) => {
      e.preventDefault()
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        rotRef.current.pinchD = Math.hypot(dx, dy)
      } else {
        rotRef.current.dragging = true
        rotRef.current.lx = e.touches[0].clientX
        rotRef.current.ly = e.touches[0].clientY
      }
    }
    const onTouchMove = (e) => {
      e.preventDefault()
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const d = Math.hypot(dx, dy)
        if (rotRef.current.pinchD > 0) {
          zoomRef.current = Math.max(0.5, Math.min(3, zoomRef.current * (d / rotRef.current.pinchD)))
          needsDrawRef.current = true
        }
        rotRef.current.pinchD = d
      } else if (rotRef.current.dragging) {
        rotRef.current.y += (e.touches[0].clientX - rotRef.current.lx) * 0.008
        rotRef.current.x = Math.max(-1.2, Math.min(1.2, rotRef.current.x - (e.touches[0].clientY - rotRef.current.ly) * 0.006))
        rotRef.current.lx = e.touches[0].clientX
        rotRef.current.ly = e.touches[0].clientY
        needsDrawRef.current = true
      }
    }
    const onTouchEnd = () => { rotRef.current.dragging = false; rotRef.current.pinchD = 0 }

    canvas.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)
    return () => {
      canvas.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const viewH = compact ? 340 : 560

  return (
    <div style={{ width: '100%' }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
        {[
          ['CBM', totalCBM.toFixed(2) + 'm³'],
          ['WEIGHT', totalWeight >= 1000 ? (totalWeight / 1000).toFixed(1) + 't' : totalWeight + 'kg'],
          ['LOAD', utilization.toFixed(0) + '%'],
        ].map(([k, v]) => (
          <div key={k} style={{ background: 'rgba(91,194,231,0.05)', border: '1px solid rgba(91,194,231,0.13)', borderRadius: 7, padding: '8px 6px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 20, color: '#8DD8F0', letterSpacing: 1 }}>{v}</div>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: .6, marginTop: 1 }}>{k}</div>
          </div>
        ))}
      </div>

      {/* Utilization bar */}
      <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${utilization}%`, background: utilization > 90 ? '#ef4444' : utilization > 75 ? '#f59e0b' : 'linear-gradient(90deg,#5BC2E7,#8DD8F0)', borderRadius: 2, transition: 'width .4s' }} />
      </div>

      {/* Canvas 3D scene — data-lenis-prevent stops Lenis from scrolling on wheel inside */}
      <div data-lenis-prevent style={{ width: '100%', height: viewH, position: 'relative', borderRadius: 10, overflow: 'hidden', background: 'rgba(0,0,0,0.15)' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}
        />
      </div>

      <div style={{ textAlign: 'center', fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
        DRAG TO ROTATE · SCROLL / PINCH TO ZOOM · {packed.length} units packed · {spec.label}
      </div>

      {/* Item colour legend */}
      {(items || []).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.025)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
          {(items || []).map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[idx % COLORS.length], flexShrink: 0, boxShadow: `0 0 6px ${COLORS[idx % COLORS.length]}88` }} />
              <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                Item {idx + 1} · {item.qty}pc{item.qty !== 1 ? 's' : ''} · <span style={{ color: COLORS[idx % COLORS.length] }}>{item.stackable ? 'Stackable' : 'Non-stackable'}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {totalWeight > spec.maxWeight && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#f87171' }}>
          ⚠ Weight ({totalWeight.toLocaleString()} kg) exceeds {spec.label} limit ({spec.maxWeight.toLocaleString()} kg)
        </div>
      )}
    </div>
  )
}
