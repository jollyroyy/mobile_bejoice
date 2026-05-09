'use client';
/**
 * SkeletonSection — shimmer placeholders for lazy-loaded sections.
 *
 * Design rules:
 *  • Matches the APPROXIMATE HEIGHT of each real section so there's
 *    no layout jump when the real component swaps in.
 *  • Dark Bejoice palette (--obsidian base, sky-blue shimmer).
 *  • Used as <Suspense fallback> — visible only on very slow
 *    connections once the prefetch hook has warmed the chunks.
 */

const SHIMMER_KEYFRAMES = `
  @keyframes bjSkeleton {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
`

// ── Primitive building blocks ─────────────────────────────────────────────────

function SkBar({ w = '100%', h = 14, r = 4, mb = 0, mt = 0, opacity = 1 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      marginBottom: mb, marginTop: mt, opacity,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.035) 25%, rgba(91,194,231,0.07) 50%, rgba(255,255,255,0.035) 75%)',
      backgroundSize: '200% 100%',
      animation: 'bjSkeleton 1.8s ease-in-out infinite',
      flexShrink: 0,
    }} />
  )
}

function SkCard({ height = 120, children, style = {} }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(91,194,231,0.08)',
      borderRadius: 12,
      padding: '20px 24px',
      height,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Wrapper shared by all skeleton sections ───────────────────────────────────

function SkSection({ minHeight = 400, py = '5rem', children, id }) {
  return (
    <>
      <style>{SHIMMER_KEYFRAMES}</style>
      <section
        id={id}
        aria-hidden="true"
        style={{
          background: 'linear-gradient(160deg, #060810 0%, #080b14 45%, #091524 100%)',
          padding: `${py} clamp(1rem,5vw,4rem)`,
          minHeight,
          borderTop: '1px solid rgba(91,194,231,0.05)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>{children}</div>
      </section>
    </>
  )
}

// ── Section-specific skeletons ────────────────────────────────────────────────

/** Contact form card */
export function ContactSkeleton() {
  return (
    <SkSection minHeight={680} id="contact">
      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <SkBar w="clamp(200px,30vw,320px)" h={38} r={6} mb={12} style={{ margin: '0 auto 12px' }} />
        <SkBar w="clamp(140px,20vw,220px)" h={16} r={4} style={{ margin: '0 auto' }} />
      </div>
      {/* Glass card */}
      <div style={{ maxWidth: 780, margin: '0 auto', background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(91,194,231,0.12)', borderRadius: 20, padding: 'clamp(1.6rem,4vw,2.8rem)' }}>
        {/* 2-col rows */}
        {[0, 1, 2].map(i => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div><SkBar w="60%" h={11} mb={8} /><SkBar h={44} r={8} /></div>
            <div><SkBar w="50%" h={11} mb={8} /><SkBar h={44} r={8} /></div>
          </div>
        ))}
        {/* Service pills */}
        <SkBar w="40%" h={11} mb={10} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {[90, 110, 130, 100, 120, 115].map((w, i) => (
            <SkBar key={i} w={w} h={34} r={6} />
          ))}
        </div>
        {/* Textarea */}
        <SkBar w="50%" h={11} mb={8} />
        <SkBar h={80} r={8} mb={20} />
        {/* Submit button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <SkBar w={160} h={46} r={8} />
        </div>
      </div>
    </SkSection>
  )
}

/** Logistics Tools — calc cards */
export function LogisticsToolsSkeleton() {
  return (
    <SkSection minHeight={520} py="4rem" id="tools">
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <SkBar w={180} h={32} r={6} mb={10} style={{ margin: '0 auto 10px' }} />
        <SkBar w={300} h={14} r={4} style={{ margin: '0 auto' }} />
      </div>
      {/* Tab row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
        {[80, 70, 80, 110].map((w, i) => <SkBar key={i} w={w} h={36} r={8} />)}
      </div>
      {/* Calculator card */}
      <SkCard height={280} style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i}><SkBar w="60%" h={11} mb={8} /><SkBar h={44} r={8} /></div>
          ))}
        </div>
        <SkBar w={160} h={44} r={8} style={{ margin: '0 auto' }} />
      </SkCard>
    </SkSection>
  )
}

/** Services — card grid */
export function ServicesSkeleton() {
  return (
    <SkSection minHeight={560} py="4rem" id="services">
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <SkBar w={200} h={34} r={6} mb={10} style={{ margin: '0 auto 10px' }} />
        <SkBar w={280} h={14} r={4} style={{ margin: '0 auto' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {[180, 200, 180, 200, 180, 200].map((h, i) => (
          <SkCard key={i} height={h}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <SkBar w={44} h={44} r={10} />
              <SkBar w="60%" h={18} r={4} />
            </div>
            <SkBar w="90%" h={12} mb={6} />
            <SkBar w="75%" h={12} mb={6} />
            <SkBar w="55%" h={12} />
          </SkCard>
        ))}
      </div>
    </SkSection>
  )
}

/** Certifications — badge grid */
export function CertificationsSkeleton() {
  return (
    <SkSection minHeight={360} py="4rem" id="certifications">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <SkBar w={220} h={30} r={6} style={{ margin: '0 auto' }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
        {[100, 90, 110, 95, 100, 90].map((w, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <SkBar w={80} h={80} r={12} />
            <SkBar w={w} h={12} r={4} />
          </div>
        ))}
      </div>
    </SkSection>
  )
}

/** Footer — multi-column */
export function FooterSkeleton() {
  return (
    <SkSection minHeight={320} py="3rem">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32 }}>
        {/* Logo column */}
        <div>
          <SkBar w={120} h={40} r={6} mb={16} />
          <SkBar w="80%" h={11} mb={8} />
          <SkBar w="65%" h={11} mb={8} />
          <SkBar w="50%" h={11} />
        </div>
        {/* Link columns */}
        {[0, 1, 2].map(col => (
          <div key={col}>
            <SkBar w="60%" h={14} r={4} mb={14} />
            {[0, 1, 2, 3, 4].map(r => <SkBar key={r} w="75%" h={11} mb={10} />)}
          </div>
        ))}
      </div>
      {/* Bottom bar */}
      <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
        <SkBar w={200} h={11} r={4} />
        <SkBar w={120} h={11} r={4} />
      </div>
    </SkSection>
  )
}
