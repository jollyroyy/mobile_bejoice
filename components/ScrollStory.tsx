'use client';

import { useEffect, useRef } from 'react';

// ── Config (mirrors Bejoice_backup VideoHero architecture) ────────────────
const SCROLL_HEIGHT = 1600;  // vh — total scroll room
const FRAME_END_P   = 0.94;  // last 6 % dwells on final frame
const FRAME_FADE    = 18;    // frames to cross-fade chapter text in / out
const SEG_RAMP      = 15;    // frames to dip-to-black at footage cut points

function pad(n: number) { return String(n).padStart(4, '0'); }

// ── Frame sequence (mirrors backup exactly) ───────────────────────────────
// bic:          0–144   (145) BIC zoomout
// globe-bridge: 145–210 ( 66) last bic frame repeated — transition pause
// bejoice:      211–439 (229) 73 images stretched over 229 slots
// port:         440–533 ( 94) port/sea footage
// frames8:      534–654 (121) additional footage (air freight)
// tech_enng:    655–799 (145) tech/engineering footage
// TOTAL: 800
const BIC_COUNT     = 145;
const GLOBE_COUNT   = 66;
const BEJOICE_COUNT = 229; // 73 unique images stretched over 229 slots
const PORT_COUNT    = 94;
const FRAMES8_COUNT = 121;
const TECH_COUNT    = 145;
const TOTAL_FRAMES  = BIC_COUNT + GLOBE_COUNT + BEJOICE_COUNT + PORT_COUNT + FRAMES8_COUNT + TECH_COUNT; // 800

// Segment start indices (computed once)
const BEJOICE_START = BIC_COUNT + GLOBE_COUNT;              // 211
const PORT_START    = BEJOICE_START + BEJOICE_COUNT;        // 440
const FRAMES8_START = PORT_START    + PORT_COUNT;           // 534
const TECH_START    = FRAMES8_START + FRAMES8_COUNT;        // 655

const FRAME_URLS: string[] = [
  // bic zoomout (0–144)
  ...Array.from({ length: BIC_COUNT }, (_, i) => `/bic/${pad(i + 1)}.webp`),
  // globe bridge (145–210) — repeats last bic frame; serves as transition pause
  ...Array.from({ length: GLOBE_COUNT }, () => `/bic/0145.webp`),
  // bejoice (211–439) — 73 images spread over 229 slots
  ...Array.from({ length: BEJOICE_COUNT }, (_, i) => {
    const imgIdx = Math.min(Math.floor((i / BEJOICE_COUNT) * 73) + 1, 73);
    return `/bejoice/frame_${pad(imgIdx)}.webp`;
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

// ── Chapter overlay configs (5 chapters = 5 nav dots) ────────────────────
const CHAPTERS = [
  {
    frameRange: [0, BIC_COUNT - 1] as [number, number],          // 0–144
    tag: 'Chapter 01 — Origins',
    headline: ['SMART FREIGHT', 'POWERED BY AI'],
    body: 'Award-winning freight forwarder delivering seamless end-to-end logistics with reliability and global reach.',
    align: 'left' as const,
  },
  {
    frameRange: [BEJOICE_START, PORT_START - 1] as [number, number],  // 211–439
    tag: 'Chapter 02 — Heavy Lift',
    headline: ['FROM BLUEPRINT TO DELIVERY,', 'WE MOVE IT ALL'],
    body: 'Seamless cross-border land transport across the GCC — powered by a modern fleet connecting Saudi Arabia to every regional hub.',
    align: 'right' as const,
  },
  {
    frameRange: [PORT_START, FRAMES8_START - 1] as [number, number],  // 440–533
    tag: 'Chapter 03 — Port & Ocean',
    headline: ['NAVIGATING OCEANS.', 'DELIVERING CONFIDENCE'],
    body: 'Full-spectrum sea freight — containerized, breakbulk, consolidated, reefer, dangerous goods, and out-of-gauge cargo handled end to end.',
    align: 'left' as const,
  },
  {
    frameRange: [FRAMES8_START, TECH_START - 1] as [number, number],  // 534–654
    tag: 'Chapter 04 — Air Freight',
    headline: ['SPEED ABOVE ALL.', 'DELIVERED ON TIME'],
    body: 'Express air cargo solutions connecting Saudi Arabia to global hubs — critical shipments, time-sensitive freight, temperature-controlled cargo.',
    align: 'right' as const,
  },
  {
    frameRange: [TECH_START, TOTAL_FRAMES - 1] as [number, number],   // 655–799
    tag: 'Chapter 05 — Engineering',
    headline: ['PRECISION IN HANDLING.', 'EXCELLENCE IN DELIVERY'],
    body: 'End-to-end technical cargo solutions engineered for complexity — heavy machinery, industrial equipment, and high-value freight.',
    align: 'left' as const,
  },
] as const;

// ── Props ─────────────────────────────────────────────────────────────────
interface ScrollStoryProps {
  onProgress:    (pct: number) => void;
  onLoaded:      () => void;
  /** Filled so Nav knows where to scrollTo for each chapter dot */
  chapterOffsets: React.MutableRefObject<number[]>;
  /** Optional — forwarded from page to open the quick quote modal */
  onQuoteClick?: () => void;
}

export default function ScrollStory({ onProgress, onLoaded, chapterOffsets, onQuoteClick }: ScrollStoryProps) {
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const chapRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const pfRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const segRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const shRef       = useRef<HTMLDivElement>(null);

  const framesRef     = useRef<(HTMLImageElement | null)[]>([]);
  const lastIdxRef    = useRef(-1);
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

    const cw    = canvas.width;
    const ch    = canvas.height;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w     = Math.ceil(img.naturalWidth  * scale);
    const h     = Math.ceil(img.naturalHeight * scale);
    const x     = Math.floor((cw - w) / 2);
    const y     = Math.floor((ch - h) / 2);

    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, cw, ch);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      ctx.imageSmoothingQuality = 'high';
      if ('filter' in ctx) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ctx as any).filter = 'contrast(1.08) saturate(1.12) brightness(1.02)';
      }
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
      const dist = Math.min(
        Math.max(0, frameIdx - start),
        Math.max(0, end   - frameIdx)
      );

      let opacity: number;
      if (i === 0) {
        const exitDist = Math.max(0, end - frameIdx);
        opacity = Math.min(exitDist / FRAME_FADE, 1);
      } else {
        opacity = Math.min(dist / FRAME_FADE, 1);
      }
      opacity = Math.max(0, Math.min(1, opacity));

      el.style.opacity   = String(opacity);
      el.style.transform = `translateY(${Math.round(22 * (1 - opacity))}px)`;
      el.style.zIndex    = opacity > 0.05 ? '10' : '1';

      const pf = pfRefs.current[i];
      if (pf) {
        const progress = Math.max(0, Math.min(1,
          (frameIdx - start) / Math.max(1, end - start)
        ));
        pf.style.width = `${progress * 100}%`;
      }
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
        const img  = new Image();
        const idx  = i;
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
      canvas.width  = Math.round((p ? p.offsetWidth  : window.innerWidth)  * dprRef.current);
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
      const rect  = wrapper.getBoundingClientRect();
      const total = wrapper.offsetHeight - window.innerHeight;
      const newP  = Math.max(0, Math.min(1, -rect.top / total));

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

  return (
    <div
      ref={wrapperRef}
      id="scroll-story"
      style={{ height: `${SCROLL_HEIGHT}vh`, position: 'relative' }}
    >
      {/* ── Sticky viewport ─────────────────────────────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
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
          return (
            <div
              key={i}
              ref={el => { chapRefs.current[i] = el; }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: right ? 'flex-end' : 'flex-start',
                padding: 'clamp(1.2rem, 5vw, 6rem)',
                paddingTop: 'clamp(10rem, 20vh, 13rem)',
                paddingBottom: 'clamp(7rem, 14vh, 12rem)',
                pointerEvents: 'none',
                zIndex: i === 0 ? 10 : 1,
                opacity: i === 0 ? 1 : 0,
                transform: i === 0 ? 'none' : 'translateY(22px)',
              }}
            >
              {/* Glass card */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: right ? 'flex-end' : 'flex-start',
                  background: 'rgba(0,0,0,0.42)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  borderRadius: 10,
                  padding: 'clamp(14px, 2vw, 22px) clamp(16px, 2.5vw, 28px)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  maxWidth: 'min(calc(100% - 2rem), 580px)',
                }}
              >
                {/* Eyebrow pill */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontFamily: 'var(--font-dm-sans, system-ui), sans-serif',
                    fontSize: 'clamp(10px, 1.1vw, 13px)',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
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
                  {ch.tag}
                </div>

                {/* Headline */}
                <div style={{ userSelect: 'none' }}>
                  {ch.headline.map((line, li) => (
                    <div
                      key={li}
                      style={{
                        fontFamily: 'var(--font-bebas, "Impact"), sans-serif',
                        fontSize: 'clamp(2.4rem, 5.8vw, 5.8rem)',
                        fontWeight: 400,
                        lineHeight: 0.88,
                        letterSpacing: '0.05em',
                        color: li % 2 === 0 ? '#ffffff' : 'var(--gold)',
                        textShadow: li % 2 === 0
                          ? '0 1px 16px rgba(0,0,0,0.9)'
                          : '0 1px 16px rgba(0,0,0,0.9), 0 0 24px rgba(200,168,107,0.28)',
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>

                {/* Gold accent rule */}
                <div
                  style={{
                    width: 56,
                    height: 2,
                    marginTop: 20,
                    marginBottom: 14,
                    background: right
                      ? 'linear-gradient(270deg, rgba(200,168,107,0.85), rgba(200,168,107,0.06))'
                      : 'linear-gradient(90deg,  rgba(200,168,107,0.85), rgba(200,168,107,0.06))',
                    alignSelf: right ? 'flex-end' : 'flex-start',
                  }}
                />

                {/* Body */}
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans, system-ui), sans-serif',
                    fontSize: 'clamp(0.8rem, 1.6vw, 0.94rem)',
                    color: 'rgba(255,255,255,0.6)',
                    maxWidth: '40ch',
                    lineHeight: 1.66,
                    margin: 0,
                    textAlign: right ? 'right' : 'left',
                  }}
                >
                  {ch.body}
                </p>

                {/* Per-chapter progress bar */}
                <div
                  style={{
                    marginTop: 16,
                    width: 'min(150px, 34vw)',
                    height: 1,
                    background: 'rgba(255,255,255,0.09)',
                    alignSelf: right ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    ref={el => { pfRefs.current[i] = el; }}
                    style={{
                      height: '100%',
                      background: 'var(--gold)',
                      width: 0,
                      willChange: 'width',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}

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
              fontFamily: 'var(--font-dm-sans, system-ui), sans-serif',
              fontSize: '0.58rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.28)',
            }}
          >
            Scroll
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
    </div>
  );
}
