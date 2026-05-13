'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useLang } from '@/context/LangContext';
import ar from '@/i18n/ar';

const BejoiceGlobeInner = dynamic(() => import('@/components/BejoiceGlobe'), { ssr: false, loading: () => null });

// ── Config (mirrors Bejoice_backup VideoHero architecture) ────────────────
const SCROLL_HEIGHT = 1600;  // vh — total scroll room
const FRAME_END_P = 0.94;  // last 6 % dwells on final frame
const FRAME_FADE = 18;    // frames to cross-fade chapter text in / out
const SEG_RAMP = 15;    // frames to dip-to-black at footage cut points

function pad(n: number) { return String(n).padStart(4, '0'); }

// ── Frame sequence (mirrors backup exactly) ───────────────────────────────
// bic:          0–144   (145) BIC zoomout
// globe-bridge: 145–210 ( 66) last bic frame repeated — transition pause
// bejoice:      211–439 (229) 73 images stretched over 229 slots
// port:         440–533 ( 94) port/sea footage
// frames8:      534–654 (121) additional footage (air freight)
// tech_enng:    655–799 (145) tech/engineering footage
// TOTAL: 800
const BIC_COUNT = 145;
const GLOBE_COUNT = 66;
const BEJOICE_COUNT = 229; // 73 unique images stretched over 229 slots
const PORT_COUNT = 94;
const FRAMES8_COUNT = 121;
const TECH_COUNT = 145;
const TOTAL_FRAMES = BIC_COUNT + GLOBE_COUNT + BEJOICE_COUNT + PORT_COUNT + FRAMES8_COUNT + TECH_COUNT; // 800

// Segment start indices (computed once)
const BEJOICE_START = BIC_COUNT + GLOBE_COUNT;              // 211
const PORT_START = BEJOICE_START + BEJOICE_COUNT;        // 440
const FRAMES8_START = PORT_START + PORT_COUNT;           // 534
const TECH_START = FRAMES8_START + FRAMES8_COUNT;        // 655

const FRAME_URLS: string[] = [
  // bic zoomout (0–144)
  ...Array.from({ length: BIC_COUNT }, (_, i) => `/bic/${pad(i + 1)}.webp`),
  // globe bridge (145–210) — repeats last bic frame; no intermediate image should flash
  ...Array.from({ length: GLOBE_COUNT }, () => `/bic/0145.webp`),
  // bejoice (211–439) — 73 images spread over 229 slots
  ...Array.from({ length: BEJOICE_COUNT }, (_, i) => {
    const imgIdx = Math.min(Math.floor((i / BEJOICE_COUNT) * 73) + 1, 73);
    return `/bejoice1/frame_${pad(imgIdx)}.png`;
    // return `/bejoice/frame_${pad(imgIdx)}.webp`;
  }),
  // port (440–533)
  ...Array.from({ length: PORT_COUNT }, (_, i) => `/port/${pad(i + 1)}.webp`),
  // frames8 / air freight (534–654)
  ...Array.from({ length: FRAMES8_COUNT }, (_, i) => `/frames8/${pad(i + 1)}.webp`),
  // tech engineering (655–799)
  ...Array.from({ length: TECH_COUNT }, (_, i) => `/tech_enng/${pad(i + 1)}.webp`),
];

// Footage cut points → trigger dip-to-black overlay
const SEG_CUTS = [BEJOICE_START, PORT_START, FRAMES8_START, TECH_START]; // [211, 440, 534, 655]

// ── Chapter overlay configs (8 chapters = 8 nav dots) ────────────────────
const CHAPTERS = [
  // bic: 0–144
  {
    frameRange: [0, 144] as [number, number],
    tag: 'CONNECTING KSA TO THE WORLD',
    headline: ['SMART FREIGHT', 'POWERED BY AI'],
    align: 'left' as const,
  },
  // bejoice heavy lift: 211–285
  {
    frameRange: [211, 320] as [number, number],
    tag: 'PROJECTS & HEAVY LIFT',
    headline: ['FROM BLUE PRINT TO DELIVERY,', 'WE MOVE IT ALL'],
    align: 'left' as const,
  },
  // navigating oceans: 385–400 (Ocean Freight segment)
  {
    frameRange: [355, 440] as [number, number],
    tag: 'FCL · LCL · BREAKBULK · REEFER · HAZARDOUS · OOG',
    headline: ['NAVIGATING OCEANS.', 'DELIVERING TRUST'],
    align: 'right' as const,
    // noExitFade: true,
  },
  // driven by transparency: 440–493 (port footage, just before port to port)
  {
    frameRange: [440, 493] as [number, number],
    tag: 'PORT OPERATIONS',
    headline: ['DRIVEN BY TRANSPARENCY.', 'DELIVERED WITH TRUST'],
    align: 'right' as const,
  },
  // port to port: 496–550
  {
    frameRange: [496, 534] as [number, number],
    tag: 'POWERING SAUDI PROJECTS THROUGH EVERY STORM',
    headline: ['FROM PORT TO PORT.', 'WORLD-CLASS LOGISTICS'],
    align: 'left' as const,
  },
  // air freight: 534–599
  {
    frameRange: [534, 599] as [number, number],
    tag: 'AIR FREIGHT',
    headline: ['SPEED ABOVE ALL.', 'DELIVERED ON TIME'],
    align: 'left' as const,
  },
  // world class air: 604–654
  {
    frameRange: [604, 654] as [number, number],
    tag: '',
    headline: ['WORLD CLASS', 'AIR FREIGHT'],
    align: 'right' as const,
  },
  // precision/tech: 655–729
  {
    frameRange: [655, 729] as [number, number],
    tag: '',
    headline: ['PRECISION IN HANDLING.', 'EXCELLENCE IN DELIVERY'],
    align: 'right' as const,
  },
  // technical engineering: 764–799
  {
    frameRange: [752, 799] as [number, number],
    tag: '',
    headline: ['TECHNICAL', 'ENGINEERING'],
    align: 'center' as const,
    exitFade: false,
  },
] as const;

// Maps current CHAPTERS index → ar.hero.chapters index
// ar.js has 10 entries; current ScrollStory skips globe [1]
const AR_CHAPTER_IDX = [0, 2, 3, 4, 5, 6, 7, 8, 9] as const;

// ── Stat definitions (English + Arabic values) ────────────────────────────
const STATS = [
  { v: '120+', arV: '١٢٠+', l: 'Countries', ar: 'دولة' },
  { v: '25+', arV: '٢٥+', l: 'Years', ar: 'عامًا' },
  { v: '24/7', arV: '٢٤/٧', l: 'Operations', ar: 'عمليات' },
  { v: 'KSA', arV: 'م.ع.س', l: 'Specialist', ar: 'متخصص' },
] as const;

// ── Track Shipment card ───────────────────────────────────────────────────
function TrackCard({ isAr, onToolsClick }: { isAr: boolean; onToolsClick?: () => void }) {
  const cairoFont = "var(--font-cairo,'Cairo'),sans-serif";
  return (
    <div style={{
      width: '100%', height: '100%', flex: '1 1 auto', position: 'relative',
      padding: '1rem 1.25rem',
      display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 'clamp(4px,2vw,10px)',
      direction: isAr ? 'rtl' : 'ltr',
    }}>
      <button
        onClick={() => window.open('https://www.track-trace.com/', '_blank', 'noopener,noreferrer')}
        className="btn-gold hero-card-btn"
        style={{
          padding: '12px 25px', fontSize: '0.675rem', borderRadius: 10,
          whiteSpace: 'nowrap', fontWeight: 700, cursor: 'pointer',
          fontFamily: isAr ? cairoFont : undefined,
          flex: '1 1 0',
        }}
      >
        {isAr ? ar.hero.trackBtn : 'Track Shipment'}
      </button>
      <button
        onClick={() => onToolsClick?.()}
        className="btn-gold hero-card-btn"
        style={{
          padding: '12px 25px', fontSize: '0.675rem', borderRadius: 10,
          whiteSpace: 'nowrap', fontWeight: 700, cursor: 'pointer',
          fontFamily: isAr ? cairoFont : undefined,
          flex: '1 1 0',
        }}
      >
        {isAr ? ar.hero.calcBtn : 'Load Calculator'}
      </button>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────
interface ScrollStoryProps {
  onProgress: (pct: number) => void;
  onLoaded: () => void;
  /** Filled so Nav knows where to scrollTo for each chapter dot */
  chapterOffsets: React.MutableRefObject<number[]>;
  /** Optional — forwarded from page to open the quick quote modal */
  onQuoteClick?: () => void;
  /** Optional — forwarded from page to open the load calculator modal */
  onToolsClick?: () => void;
}

export default function ScrollStory({ onProgress, onLoaded, chapterOffsets, onQuoteClick, onToolsClick }: ScrollStoryProps) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const cairoFont = "var(--font-cairo,'Cairo'),sans-serif";

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pfRefs = useRef<(HTMLDivElement | null)[]>([]);
  const segRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const lastIdxRef = useRef(-1);
  const kickRenderRef = useRef<(() => void) | null>(null);

  const dprRef = useRef(1);

  // ── paintFrame ────────────────────────────────────────────────────────
  const paintFrame = (idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return;

    // Nearest-loaded-frame fallback: walk backwards so canvas is never black
    let img: HTMLImageElement | null = null;
    for (let i = Math.min(idx, framesRef.current.length - 1); i >= 0; i--) {
      const f = framesRef.current[i];
      if (f && f.complete && f.naturalWidth > 0) { img = f; break; }
    }
    if (!img) return;
    if (lastIdxRef.current === idx) return;
    lastIdxRef.current = idx;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;

    // Portrait (mobile): fit-to-width — scale so the full image width fills the
    // canvas width. This shows the entire frame (no cropping) with cinematic
    // dark bars above and below.  Pure "contain" would use Math.min which gives
    // the same result for landscape source → portrait canvas.
    // Landscape (desktop/tablet): cover — fill edge-to-edge, no bars.
    const isPortrait = ch > cw;
    const widthScale = cw / img.naturalWidth;
    const heightScale = ch / img.naturalHeight;
    const scale = isPortrait
      ? widthScale                                   // fit full width; bars top/bottom
      : Math.max(widthScale, heightScale);           // cover

    const w = Math.ceil(img.naturalWidth * scale);
    const h = Math.ceil(img.naturalHeight * scale);
    const x = Math.floor((cw - w) / 2);
    // Portrait: place image in the upper-third area so it feels immersive, not lost
    const y = isPortrait
      ? Math.floor((ch - h) * 0.33)                 // upper-third positioning
      : Math.floor((ch - h) / 2);

    // Fill background (covers letterbox bars in portrait, harmless in landscape)
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, cw, ch);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if ('filter' in ctx) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ctx as any).filter = 'contrast(1.08) saturate(1.12) brightness(1.02)';
    }
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  };

  // ── applyProgress ────────────────────────────────────────────────────
  const applyProgress = (frameIdx: number) => {
    for (let i = 0; i < CHAPTERS.length; i++) {
      const el = chapRefs.current[i];
      if (!el) continue;

      const [start, end] = CHAPTERS[i].frameRange;
      const noExitFade = (CHAPTERS[i] as { noExitFade?: boolean }).noExitFade;

      const dist = Math.min(
        Math.max(0, frameIdx - start),
        noExitFade ? 999999 : Math.max(0, end - frameIdx)
      );

      let opacity: number;
      if (i === 0) {
        const exitDist = Math.max(0, end - frameIdx);
        opacity = Math.min(exitDist / FRAME_FADE, 1);
      } else {
        opacity = Math.min(dist / FRAME_FADE, 1);
      }
      opacity = Math.max(0, Math.min(1, opacity));

      el.style.opacity = String(opacity);
      el.style.transform = `translateY(${Math.round(22 * (1 - opacity))}px)`;
      el.style.zIndex = opacity > 0.05 ? '10' : '1';

      const pf = pfRefs.current[i];
      if (pf) {
        const progress = Math.max(0, Math.min(1,
          (frameIdx - start) / Math.max(1, end - start)
        ));
        pf.style.width = `${progress * 100}%`;
      }
    }

    // Bottom bar (Track card + Stats): visible only during Chapter 0, fades with it
    const bbEl = bottomBarRef.current;
    if (bbEl) {
      const [, end0] = CHAPTERS[0].frameRange; // 144
      const bbOp = Math.min(Math.max(0, end0 - frameIdx) / FRAME_FADE, 1);
      bbEl.style.opacity = String(bbOp);
      bbEl.style.pointerEvents = bbOp > 0.1 ? 'all' : 'none';
    }

    // Globe overlay — fades in during globe-bridge (145+), stays visible into Bejoice frames, then fades out
    const gEl = globeRef.current;
    if (gEl) {
      const GLOBE_FADE_F = 10;
      const GLOBE_HOLD = 20; // frames into Bejoice to keep globe at full opacity
      let gOp = 0;
      if (frameIdx >= BIC_COUNT) {
        const enterDist = frameIdx - BIC_COUNT;
        const exitStart = BEJOICE_START + GLOBE_HOLD;
        const exitDist = exitStart - frameIdx;
        gOp = Math.min(enterDist / GLOBE_FADE_F, exitDist / GLOBE_FADE_F, 1);
      }
      gOp = Math.max(0, Math.min(1, gOp));
      gEl.style.opacity = String(gOp);
      gEl.style.pointerEvents = gOp > 0.1 ? 'auto' : 'none';
      gEl.style.visibility = gOp === 0 ? 'hidden' : 'visible';
    }

    // Dip-to-black at footage cut points
    for (let i = 0; i < SEG_CUTS.length; i++) {
      const dimEl = segRefs.current[i];
      if (!dimEl) continue;
      const cut = SEG_CUTS[i];
      let op = 0;
      if (frameIdx >= cut - SEG_RAMP && frameIdx < cut) {
        op = (frameIdx - (cut - SEG_RAMP)) / SEG_RAMP;
      } else if (frameIdx >= cut && frameIdx <= cut + SEG_RAMP) {
        op = 1 - (frameIdx - cut) / SEG_RAMP;
      }
      dimEl.style.opacity = String(Math.max(0, Math.min(1, op)));
    }
  };

  // ── Image loading — phased for mobile performance ─────────────────────
  useEffect(() => {
    framesRef.current = new Array(TOTAL_FRAMES);

    const loadRange = (from: number, to: number) => {
      for (let i = from; i <= to; i++) {
        if (framesRef.current[i]) continue;
        const img = new Image();
        const idx = i;
        img.onload = () => {
          framesRef.current[idx] = img;

          // Drive loader bar from bic progress only
          if (idx < BIC_COUNT) {
            const loaded = framesRef.current
              .slice(0, BIC_COUNT)
              .filter(f => f && f.complete && f.naturalWidth > 0).length;
            onProgress(Math.round(loaded / BIC_COUNT * 100));
          }

          // Paint frame 0 the instant it lands — canvas never stays black
          if (idx === 0) {
            lastIdxRef.current = -1;
            paintFrame(0);
            applyProgress(FRAME_FADE);
          }

          if (kickRenderRef.current) kickRenderRef.current();

          if (idx === BIC_COUNT - 1) onLoaded();
        };
        img.onerror = () => {
          if (idx === BIC_COUNT - 1) onLoaded();
        };
        img.src = FRAME_URLS[idx];
        framesRef.current[idx] = img;
      }
    };

    // Phase 1 (immediate): bic — drives loader bar
    loadRange(0, BIC_COUNT - 1);
    // Phase 2 (200ms): globe bridge + bejoice
    const t1 = setTimeout(() => loadRange(BIC_COUNT, BEJOICE_START + BEJOICE_COUNT - 1), 200);
    // Phase 3 (600ms): port
    const t2 = setTimeout(() => loadRange(PORT_START, FRAMES8_START - 1), 600);
    // Phase 4 (1000ms): frames8 / air freight
    const t3 = setTimeout(() => loadRange(FRAMES8_START, TECH_START - 1), 1000);
    // Phase 5 (1400ms): tech engineering
    const t4 = setTimeout(() => loadRange(TECH_START, TOTAL_FRAMES - 1), 1400);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Canvas resize ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    dprRef.current = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const p = canvas.parentElement;
      canvas.width = Math.round((p ? p.offsetWidth : window.innerWidth) * dprRef.current);
      canvas.height = Math.round((p ? p.offsetHeight : window.innerHeight) * dprRef.current);
      const prev = lastIdxRef.current;
      lastIdxRef.current = -1;
      if (prev >= 0) paintFrame(prev);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Lerp scroll loop ──────────────────────────────────────────────────
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let targetP = 0;
    let smoothP = 0;
    let rafId: number | null = null;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const render = () => {
      smoothP = lerp(smoothP, targetP, 0.15);

      const frameIdx = Math.min(
        Math.round(Math.min(smoothP / FRAME_END_P, 1) * (TOTAL_FRAMES - 1)),
        TOTAL_FRAMES - 1
      );

      paintFrame(frameIdx);
      applyProgress(frameIdx);

      if (shRef.current && window.scrollY > 60) {
        shRef.current.style.opacity = '0';
      }

      if (Math.abs(smoothP - targetP) > 0.0001) {
        rafId = requestAnimationFrame(render);
      } else {
        rafId = null;
      }
    };

    kickRenderRef.current = () => {
      if (!rafId) {
        lastIdxRef.current = -1;
        rafId = requestAnimationFrame(render);
      }
    };

    const onScroll = () => {
      const rect = wrapper.getBoundingClientRect();
      const total = wrapper.offsetHeight - window.innerHeight;
      const newP = Math.max(0, Math.min(1, -rect.top / total));

      if (Math.abs(newP - targetP) > 0.04) smoothP = newP;

      targetP = newP;
      if (!rafId) rafId = requestAnimationFrame(render);
    };

    const measureChapters = () => {
      const total = wrapper.offsetHeight - window.innerHeight;
      CHAPTERS.forEach((ch, i) => {
        const p = (ch.frameRange[0] / (TOTAL_FRAMES - 1)) * FRAME_END_P;
        chapterOffsets.current[i] = wrapper.offsetTop + p * total;
      });
    };

    measureChapters();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measureChapters);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measureChapters);
      if (rafId) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // stats derived from module-level STATS constant

  return (
    <div
      ref={wrapperRef}
      id="scroll-story"
      style={{ height: `${SCROLL_HEIGHT}vh`, position: 'relative' }}
    >
      {/* Anchor for Bejoice Wings nav link — sits at frame 178 (globe segment centre) */}
      {/* p = (178/799)*0.94 = 0.2093 → top = 0.2093*(1600-1)*vh ≈ 335vh               */}
      <div id="globe-mid" style={{ position: 'absolute', top: '335vh', left: 0, width: 1, height: 1, pointerEvents: 'none' }} />
      {/* ── Sticky viewport ─────────────────────────────────────────── */}
      <div
        className="hero-sticky-viewport"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',         /* fallback */
          overflow: 'hidden',
          background: '#080808',
        }}
      >
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            background: '#080808',
            willChange: 'transform',
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            touchAction: 'pan-y',
          }}
        />

        {/* Cinematic vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
            background: [
              'radial-gradient(ellipse 75% 55% at 50% 80%, rgba(8,8,8,0) 0%, rgba(8,8,8,0.52) 100%)',
              'linear-gradient(to bottom, rgba(8,8,8,0) 0%, rgba(8,8,8,0) 18%, rgba(8,8,8,0) 72%, rgba(8,8,8,0.78) 100%)',
            ].join(', '),
          }}
        />

        {/* Nav legibility shield */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '18%',
            zIndex: 3,
            pointerEvents: 'none',
            background: 'linear-gradient(to bottom, rgba(8,8,8,0.78) 0%, rgba(8,8,8,0.35) 45%, rgba(8,8,8,0) 100%)',
          }}
        />

        {/* Globe overlay — shown during globe-bridge segment (frames 145–210) */}
        <div
          ref={globeRef}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 6,
            opacity: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
            background: '#030b15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            touchAction: 'pan-y',
          }}
        >
          <BejoiceGlobeInner embedded={true} />
        </div>

        {/* Dip-to-black overlays at footage cut points */}
        {SEG_CUTS.map((_, i) => (
          <div
            key={i}
            ref={el => { segRefs.current[i] = el; }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              background: '#080808',
              opacity: 0,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Chapter text overlays */}
        {CHAPTERS.map((ch, i) => {
          const right = ch.align === 'right';
          const center = ch.align === 'center';

          // Arabic chapter text lookup
          const arCh = ar.hero.chapters[AR_CHAPTER_IDX[i]];
          const displayTag = isAr && arCh && 'eyebrow' in arCh && arCh.eyebrow != null
            ? arCh.eyebrow
            : ch.tag;
          const displayHeadline = isAr && arCh && arCh.headline != null
            ? arCh.headline
            : ch.headline;

          return (
            <div
              key={i}
              ref={el => { chapRefs.current[i] = el; }}
              className="hero-chapter-overlay"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: center ? 'center' : right ? 'flex-end' : 'flex-start',
                padding: 'clamp(1.2rem, 5vw, 6rem)',
                paddingTop: i === 1 ? 'clamp(8.8rem, 17vh, 11rem)' : 'clamp(10rem, 20vh, 13rem)',
                paddingBottom: 'clamp(7rem, 14vh, 12rem)',
                pointerEvents: 'none',
                zIndex: i === 0 ? 10 : 1,
                opacity: i === 0 ? 1 : 0,
                transform: i === 0 ? 'none' : 'translateY(22px)',
              }}
            >
              {/* Glass card */}
              <div
                className="hero-glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: center ? 'center' : right ? 'flex-end' : 'flex-start',
                  background: 'rgba(0,0,0,0.52)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  borderRadius: 10,
                  padding: 'clamp(14px, 2vw, 22px) clamp(16px, 2.5vw, 28px)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  maxWidth: 'min(calc(100% - 2rem), 580px)',
                  marginLeft: i === 1 ? '-30px' : 0,
                  marginTop: i === 0 ? 'clamp(10px, 2.6vw, 20px)' : (
                    i === 1 ? '-135px' : i === 2 ? '-350px' : i === 4 ? '450px' : i === 6 ? '-350px' : i === 8 ? '650px' : 0),
                  transform: i === 0 ? 'translateY(-60px)' : 'translateY(clamp(-20px, 4vw - 40px, 0px))',
                  direction: isAr ? 'rtl' : 'ltr',
                  textAlign: isAr ? (center ? 'center' : right ? 'right' : 'right') : undefined,
                }}
              >
                {/* Eyebrow pill — only rendered when tag is non-empty */}
                {displayTag && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontFamily: isAr ? cairoFont : 'var(--font-dm-sans, system-ui), sans-serif',
                      fontSize: isAr ? 'clamp(16px, 1.4vw, 20px)' : 'clamp(10px, 1.1vw, 13px)',
                      letterSpacing: isAr ? '0' : '0.2em',
                      textTransform: isAr ? 'none' : 'uppercase',
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.92)',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1.5px solid rgba(255,255,255,0.44)',
                      borderRadius: 3,
                      padding: '5px 13px',
                      marginBottom: 14,
                      userSelect: 'none',
                    }}
                  >
                    {displayTag}
                  </div>
                )}

                {/* Headline */}
                <div style={{ userSelect: 'none' }}>
                  {(displayHeadline as readonly string[]).map((line, li) => (
                    <div
                      key={li}
                      style={{
                        fontFamily: isAr ? cairoFont : 'var(--font-bebas, "Impact"), sans-serif',
                        fontSize: isAr ? 'clamp(1.545rem, 2.98vw, 3.185rem)' : 'clamp(1.345rem, 2.8vw, 3.345rem)',
                        fontWeight: isAr ? 700 : 400,
                        lineHeight: isAr ? 1.2 : 0.87,
                        letterSpacing: isAr ? '0' : '0.06em',
                        color: li % 2 === 0 ? '#ffffff' : 'var(--gold)',
                        textShadow: li % 2 === 0
                          ? '0 1px 12px rgba(0,0,0,0.9)'
                          : '0 1px 12px rgba(0,0,0,0.9), 0 0 20px rgba(91,194,231,0.3)',
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>

                {/* Accent rule */}
                <div
                  className="hero-accent-rule"
                  style={{
                    width: 60,
                    height: 2,
                    marginTop: 26,
                    background: center
                      ? 'linear-gradient(90deg, rgba(91,194,231,0.08), rgba(91,194,231,0.85), rgba(91,194,231,0.08))'
                      : right
                        ? 'linear-gradient(270deg, rgba(91,194,231,0.85), rgba(91,194,231,0.08))'
                        : 'linear-gradient(90deg, rgba(91,194,231,0.85), rgba(91,194,231,0.08))',
                    alignSelf: center ? 'center' : right ? 'flex-end' : 'flex-start',
                  }}
                />

                {/* START SHIPMENT CTA — first chapter only */}
                {i === 0 && (
                  <button
                    className="hero-intro-cta btn-gold"
                    onClick={() => onQuoteClick?.()}
                    style={{
                      marginTop: 28,
                      alignSelf: right ? 'flex-end' : 'flex-start',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontFamily: isAr ? cairoFont : "'Bebas Neue', sans-serif",
                      fontSize: isAr ? 'clamp(0.375rem, 1.8vw, 0.875rem)' : 'clamp(0.375rem, 1.6vw, 0.75rem)',
                      fontWeight: 700,
                      letterSpacing: isAr ? '0' : '0.18em',
                      padding: 'clamp(4px, 1vw, 12px) clamp(6px, 1.5vw, 32px)',
                      borderRadius: 10,
                      cursor: 'pointer',
                      pointerEvents: 'all',
                      position: 'relative',
                      zIndex: 1000,
                      userSelect: 'none',
                    }}
                  >
                    <span style={{ pointerEvents: 'none', userSelect: 'none' }}>
                      {isAr ? ar.hero.ctaQuote : 'START SHIPMENT'}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, pointerEvents: 'none', transform: isAr ? 'scaleX(-1)' : undefined }}>
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="btn-shine-overlay" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* ── Bottom bar: Track card + Stats — visible only during Chapter 0 ── */}
        <div
          ref={bottomBarRef}
          className="hero-bottom-bar"
          style={{
            position: 'absolute',
            bottom: 'clamp(24px, 5vh, 60px)',
            left: 0,
            right: 0,
            zIndex: 8,
            display: 'flex',
            flexWrap: 'nowrap',
            gap: 'clamp(4px, 0.6vw, 10px)',
            alignItems: 'stretch',
            justifyContent: 'center',
            padding: '0 clamp(0.5rem, 2vw, 2rem)',
            pointerEvents: 'all',
          }}
        >
          {/* Track shipment card */}
          <div className="hero-track-wrap" style={{ flex: '0 1 auto', minWidth: 0, display: 'flex', alignItems: 'stretch' }}>
            <TrackCard isAr={isAr} onToolsClick={onToolsClick} />
          </div>

          {/* Stats bar */}
          <div style={{
            flex: '0 0 auto', position: 'relative',
            display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'stretch',
            background: 'rgba(10,10,14,0.55)',
            border: '1px solid rgba(91,194,231,0.12)', borderRadius: 14,
            backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 20px rgba(91,194,231,0.04)',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: 'linear-gradient(90deg,transparent,rgba(91,194,231,0.35),transparent)', pointerEvents: 'none', zIndex: 1 }} />
            {STATS.map((s, idx, arr) => (
              <div key={s.l} className="hero-stat-cell" style={{
                display: 'flex', alignItems: 'center',
                padding: '12px clamp(4px,0.8vw,10px)',
                borderRight: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                flexShrink: 0,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="hero-stat-number" style={{
                    fontFamily: isAr ? cairoFont : "'Bebas Neue', sans-serif",
                    fontSize: '0.8rem',
                    letterSpacing: isAr ? '0.08em' : '0.08em',
                    lineHeight: 0.9,
                    color: '#ffffff',
                    textShadow: '0 0 20px rgba(255,255,255,0.3)',
                  }}>
                    {isAr ? s.arV : s.v}
                  </div>
                  <div className="hero-stat-label" style={{
                    fontFamily: isAr ? cairoFont : "'Inter', sans-serif",
                    fontSize: isAr ? '13px' : '11px',
                    letterSpacing: isAr ? '0' : '0.14em',
                    textTransform: isAr ? 'none' : 'uppercase',
                    color: 'rgba(91,194,231,0.85)',
                    fontWeight: 600,
                    marginTop: 3,
                    whiteSpace: 'nowrap',
                  }}>
                    {isAr ? s.ar : s.l}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div
          ref={shRef}
          style={{
            position: 'absolute',
            bottom: 'clamp(1.5rem, 4vh, 2.5rem)',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 7,
            zIndex: 15,
            opacity: 1,
            transition: 'opacity 0.5s ease',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: isAr ? cairoFont : 'var(--font-dm-sans, system-ui), sans-serif',
              fontSize: '0.58rem',
              letterSpacing: isAr ? '0' : '0.2em',
              textTransform: isAr ? 'none' : 'uppercase',
              color: 'rgba(255,255,255,0.28)',
            }}
          >
            {isAr ? 'مرر' : 'Scroll'}
          </span>
          <div
            style={{
              width: 17,
              height: 27,
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 9,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 4,
                transform: 'translateX(-50%)',
                width: 2,
                height: 5,
                background: 'rgba(255,255,255,0.35)',
                borderRadius: 1,
                animation: 'pill 1.6s ease infinite',
              }}
            />
          </div>
        </div>
      </div>
    </div >
  );
}
