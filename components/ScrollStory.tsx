'use client';

import { useEffect, useRef } from 'react';

// ── Config (mirrors Bejoice_backup VideoHero architecture) ────────────────
const SCROLL_HEIGHT = 900;   // vh — total scroll room for the sticky section
const FRAME_END_P   = 0.94;  // last 6 % of scroll dwells on the final frame
const FRAME_FADE    = 18;    // frames to cross-fade chapter text in / out
const SEG_RAMP      = 15;    // frames to dip-to-black at footage cut points

function pad(n: number) { return String(n).padStart(4, '0'); }

// ── Frame sequence: bic (0-144) + bejoice (145-217) + port (218-386) ──────
const BIC_COUNT     = 145;
const BEJOICE_COUNT = 73;
const PORT_COUNT    = 169;
const TOTAL_FRAMES  = BIC_COUNT + BEJOICE_COUNT + PORT_COUNT; // 387

const FRAME_URLS: string[] = [
  ...Array.from({ length: BIC_COUNT     }, (_, i) => `/bic/${pad(i + 1)}.webp`),
  ...Array.from({ length: BEJOICE_COUNT }, (_, i) => `/bejoice/frame_${pad(i + 1)}.webp`),
  ...Array.from({ length: PORT_COUNT    }, (_, i) => `/port/${pad(i + 1)}.webp`),
];

// Frame indices where footage source changes → triggers dip-to-black
const SEG_CUTS = [BIC_COUNT, BIC_COUNT + BEJOICE_COUNT]; // [145, 218]

// ── Chapter overlay configs ───────────────────────────────────────────────
const CHAPTERS = [
  {
    frameRange: [0, BIC_COUNT - 1] as [number, number],
    tag: 'Chapter 01 — Origins',
    headline: ['WHERE IT', 'BEGINS.'],
    body: 'Every great story starts with a single frame. Watch as the world takes shape — motion by motion, moment by moment.',
    align: 'left' as const,
  },
  {
    frameRange: [BIC_COUNT, BIC_COUNT + BEJOICE_COUNT - 1] as [number, number],
    tag: 'Chapter 02 — Motion',
    headline: ['SHAPE IN', 'MOTION.'],
    body: 'Flow. Transform. Evolve. Each frame carries the story forward in ways that words alone cannot capture.',
    align: 'right' as const,
  },
  {
    frameRange: [BIC_COUNT + BEJOICE_COUNT, TOTAL_FRAMES - 1] as [number, number],
    tag: 'Chapter 03 — Arrival',
    headline: ['THE COMPLETE', 'PICTURE.'],
    body: 'A story told through motion, light, and time — arriving at its inevitable, beautiful conclusion. The journey is complete.',
    align: 'left' as const,
  },
] as const;

// ── Props ─────────────────────────────────────────────────────────────────
interface ScrollStoryProps {
  onProgress: (pct: number) => void;
  onLoaded:   () => void;
  /** Filled so Nav knows where to scrollTo for each chapter dot */
  chapterOffsets: React.MutableRefObject<number[]>;
}

export default function ScrollStory({ onProgress, onLoaded, chapterOffsets }: ScrollStoryProps) {
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const chapRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const pfRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const segRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const shRef       = useRef<HTMLDivElement>(null);

  const framesRef     = useRef<(HTMLImageElement | null)[]>([]);
  const lastIdxRef    = useRef(-1);
  const kickRenderRef = useRef<(() => void) | null>(null);

  // Read DPR once on mount (client only)
  const dprRef = useRef(1);

  // ── paintFrame — exact copy of backup's approach ──────────────────────
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
    if (lastIdxRef.current === idx) return; // no-op if same frame
    lastIdxRef.current = idx;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw    = canvas.width;
    const ch    = canvas.height;
    // object-fit: cover
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w     = Math.ceil(img.naturalWidth  * scale);
    const h     = Math.ceil(img.naturalHeight * scale);
    const x     = Math.floor((cw - w) / 2);
    const y     = Math.floor((ch - h) / 2);

    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, cw, ch);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    // Expensive quality + filter: desktop only (mirrors backup's guard)
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

  // ── applyProgress — exact copy of backup's chapter opacity formula ─────
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
        // First chapter: visible from the start, only fades out at the end
        const exitDist = Math.max(0, end - frameIdx);
        opacity = Math.min(exitDist / FRAME_FADE, 1);
      } else {
        opacity = Math.min(dist / FRAME_FADE, 1);
      }
      opacity = Math.max(0, Math.min(1, opacity));

      el.style.opacity   = String(opacity);
      el.style.transform = `translateY(${Math.round(22 * (1 - opacity))}px)`;
      el.style.zIndex    = opacity > 0.05 ? '10' : '1';

      // Per-chapter progress bar inside the glass card
      const pf = pfRefs.current[i];
      if (pf) {
        const progress = Math.max(0, Math.min(1,
          (frameIdx - start) / Math.max(1, end - start)
        ));
        pf.style.width = `${progress * 100}%`;
      }
    }

    // Dip-to-black at footage cut points (mirrors backup's segDimRef logic)
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

  // ── Image loading ─────────────────────────────────────────────────────
  useEffect(() => {
    framesRef.current = new Array(TOTAL_FRAMES);

    // Phase 1: load frame 0 urgently, then all bic frames
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
            applyProgress(FRAME_FADE); // show ch1 text immediately
          }

          // Kick the render loop if a late-loading frame arrived
          if (kickRenderRef.current) kickRenderRef.current();

          // Signal loader done after ALL bic frames are loaded
          if (idx === BIC_COUNT - 1) onLoaded();
        };
        img.onerror = () => {
          // On error still check for done
          if (idx === BIC_COUNT - 1) onLoaded();
        };
        img.src = FRAME_URLS[idx];
        framesRef.current[idx] = img;
      }
    };

    // Eager: all bic frames immediately
    loadRange(0, BIC_COUNT - 1);

    // Background: bejoice + port after short delay (give bic priority)
    const t = setTimeout(() => loadRange(BIC_COUNT, TOTAL_FRAMES - 1), 200);
    return () => clearTimeout(t);
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
      // Repaint at current position after resize
      const prev = lastIdxRef.current;
      lastIdxRef.current = -1;
      if (prev >= 0) paintFrame(prev);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Lerp scroll loop — exact copy of backup's render loop ────────────
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let targetP = 0;
    let smoothP = 0;
    let rafId: number | null = null;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const render = () => {
      // Lerp smoothP toward targetP (same factor as backup: 0.15)
      smoothP = lerp(smoothP, targetP, 0.15);

      // Progress → frame index (same formula as backup)
      const frameIdx = Math.min(
        Math.round(Math.min(smoothP / FRAME_END_P, 1) * (TOTAL_FRAMES - 1)),
        TOTAL_FRAMES - 1
      );

      paintFrame(frameIdx);
      applyProgress(frameIdx);

      // Scroll hint: hide once user scrolls
      if (shRef.current && window.scrollY > 60) {
        shRef.current.style.opacity = '0';
      }

      // Self-terminate when settled; re-kicked by scroll or late frame load
      if (Math.abs(smoothP - targetP) > 0.0001) {
        rafId = requestAnimationFrame(render);
      } else {
        rafId = null;
      }
    };

    // Expose kick fn so late-loading images can restart the loop
    kickRenderRef.current = () => {
      if (!rafId) {
        lastIdxRef.current = -1; // force repaint on next tick
        rafId = requestAnimationFrame(render);
      }
    };

    const onScroll = () => {
      const rect  = wrapper.getBoundingClientRect();
      const total = wrapper.offsetHeight - window.innerHeight;
      const newP  = Math.max(0, Math.min(1, -rect.top / total));

      // Snap smoothP on large jumps (nav-dot clicks) — prevents ghosting
      if (Math.abs(newP - targetP) > 0.04) smoothP = newP;

      targetP = newP;
      if (!rafId) rafId = requestAnimationFrame(render);
    };

    // Compute absolute scroll positions for each chapter start → Nav uses them
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

        {/* Cinematic two-layer vignette */}
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

        {/* Chapter text overlays — opacity driven by applyProgress() */}
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
                // Initial state — applyProgress() owns opacity from here
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

                {/* Headline — Bebas Neue, white / gold alternating lines */}
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
