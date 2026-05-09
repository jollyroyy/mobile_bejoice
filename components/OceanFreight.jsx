'use client';
import { useLang } from '@/context/LangContext'
import ar from '@/i18n/ar'

export default function OceanFreight() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  return (
    <section style={{
      background: 'linear-gradient(135deg, #091524 0%, #080c14 50%, #091524 100%)',
      padding: 'clamp(80px, 12vw, 140px) clamp(1.5rem, 8vw, 8rem)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background glow accents */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91,194,231,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,80,180,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Body */}
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(16px, 1.8vw, 19px)',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.92)',
          lineHeight: 1.8,
          maxWidth: '640px',
        }}>
          {isAr ? ar.oceanFreight.body : 'From KSA exports to worldwide imports, our 180-country partner network moves every cargo type — FCL, LCL, hazardous, reefer & oversized.'}
        </p>


      </div>
    </section>
  )
}
