'use client';

// All sections use browser APIs (window, canvas, GSAP, Lenis, Three.js).
// Using next/dynamic with ssr:false for all prevents SSR window errors.
import { useEffect, useState, useRef, startTransition, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { SparklesCore } from '@/components/ui/sparkles';
import { LangProvider } from '@/context/LangContext';

// ── Core always-visible UI — ssr:false so GSAP/Lenis never run on server ──
const Nav              = dynamic(() => import('@/components/Nav'),              { ssr: false });
const ScrollStory      = dynamic(() => import('@/components/ScrollStory'),      { ssr: false });
const ScrollProgress   = dynamic(() => import('@/components/ScrollProgress'),   { ssr: false });
const GlobalInteractions = dynamic(() => import('@/components/GlobalInteractions'), { ssr: false });
const ScrollReveal     = dynamic(() => import('@/components/ScrollReveal'),     { ssr: false });

// ── Below-fold sections ──
const WhyBejoice    = dynamic(() => import('@/components/WhyBejoice'),    { ssr: false });
const Services      = dynamic(() => import('@/components/Services'),      { ssr: false });
const LogisticsTools = dynamic(() => import('@/components/LogisticsTools'), { ssr: false });
const Contact       = dynamic(() => import('@/components/Contact'),       { ssr: false });
const Certifications = dynamic(() => import('@/components/Certifications'), { ssr: false });
const Footer        = dynamic(() => import('@/components/Footer'),        { ssr: false });
const FloatingBookCTA = dynamic(() => import('@/components/FloatingBookCTA'), { ssr: false });
const QuickQuoteModal  = dynamic(() => import('@/components/QuickQuoteModal'),  { ssr: false });
const QuoteModal       = dynamic(() => import('@/components/QuoteModal'),       { ssr: false });

// Skeleton fallbacks (these are simple, no browser deps — keep as regular imports)
import {
  ContactSkeleton,
  LogisticsToolsSkeleton,
  ServicesSkeleton,
  CertificationsSkeleton,
  FooterSkeleton,
} from '@/components/SkeletonSection';

export default function Page() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [classicQuoteOpen, setClassicQuoteOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolsKey, setToolsKey] = useState(0);
  const [certificationsOpen, setCertificationsOpen] = useState(false);

  const chapterOffsets = useRef<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const whyModalRef      = useRef<HTMLDivElement>(null);
  const servicesModalRef = useRef<HTMLDivElement>(null);
  const toolsModalRef    = useRef<HTMLDivElement>(null);
  const certificationsModalRef = useRef<HTMLDivElement>(null);

  // Scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Lenis + GSAP ScrollTrigger — all inside useEffect (client-only)
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    Promise.all([
      import('lenis'),
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([{ default: Lenis }, { default: gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        lerp: 0.12,
        smoothWheel: true,
        wheelMultiplier: 1.05,
        touchMultiplier: 2,
        infinite: false,
      } as ConstructorParameters<typeof Lenis>[0]);

      (window as Window & { __lenis?: typeof lenis }).__lenis = lenis;
      lenis.scrollTo(0, { immediate: true });

      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time: number) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      const resizeObserver = new ResizeObserver(() => lenis.resize());
      const mainContent = document.getElementById('main-content');
      if (mainContent) resizeObserver.observe(mainContent);

      cleanup = () => {
        resizeObserver.disconnect();
        lenis.destroy();
        (window as Window & { __lenis?: typeof lenis }).__lenis = undefined;
      };
    });

    return () => cleanup?.();
  }, []);

  // Body scroll lock + Lenis pause + Escape key for section modals
  useEffect(() => {
    type LenisInstance = { stop: () => void; start: () => void };
    const lenis = (window as Window & { __lenis?: LenisInstance }).__lenis;
    if (quoteOpen || classicQuoteOpen || whyOpen || servicesOpen || toolsOpen || certificationsOpen) {
      document.body.style.overflow = 'hidden';
      lenis?.stop();
    } else {
      document.body.style.overflow = '';
      lenis?.start();
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (quoteOpen) startTransition(() => setQuoteOpen(false));
      if (classicQuoteOpen) startTransition(() => setClassicQuoteOpen(false));
      if (whyOpen) startTransition(() => setWhyOpen(false));
      if (servicesOpen) startTransition(() => setServicesOpen(false));
      if (toolsOpen) startTransition(() => setToolsOpen(false));
      if (certificationsOpen) startTransition(() => setCertificationsOpen(false));
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      lenis?.start();
      window.removeEventListener('keydown', onKey);
    };
  }, [quoteOpen, classicQuoteOpen, whyOpen, servicesOpen, toolsOpen, certificationsOpen]);

  // Cal.com booking notification
  useEffect(() => {
    function handleCalMessage(e: MessageEvent) {
      if (e.origin !== 'https://cal.com' && e.origin !== 'https://app.cal.com') return;
      const type = (e.data as { type?: string })?.type;
      if (type !== 'bookingSuccessful' && type !== 'CAL_BOOKING_SUCCESSFUL') return;

      const msgData  = (e.data as { data?: Record<string, unknown> })?.data ?? (e.data as Record<string, unknown>) ?? {};
      const attendees = (msgData as { attendees?: Array<{name?:string;email?:string}> })?.attendees;
      const attendee  = Array.isArray(attendees) ? attendees[0] : ((msgData as {attendee?:{name?:string;email?:string}})?.attendee ?? {});

      const payload = {
        name:      String((attendee as {name?:string}).name      || (msgData as {name?:string}).name      || '').slice(0, 200),
        email:     String((attendee as {email?:string}).email     || (msgData as {email?:string}).email     || '').slice(0, 320),
        startTime: String((msgData as {startTime?:string}).startTime  || (msgData as {start?:string}).start     || '').slice(0, 50),
        endTime:   String((msgData as {endTime?:string}).endTime    || (msgData as {end?:string}).end       || '').slice(0, 50),
        uid:       String((msgData as {uid?:string}).uid        || (msgData as {bookingId?:string}).bookingId || '').slice(0, 200),
      };

      fetch('/api/booking-notify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
        .then((r: Response) => { if (!r.ok) throw new Error(String(r.status)); })
        .catch(() => {
          import('@/utils/emailService').then(({ sendBookingNotification }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sendBookingNotification as any)(e.data).catch(() => {});
          });
        });
    }
    window.addEventListener('message', handleCalMessage);
    return () => window.removeEventListener('message', handleCalMessage);
  }, []);

  return (
    <LangProvider>
      <div className="grain">
        <ScrollProgress />
        <GlobalInteractions />
        <ScrollReveal />

        {/* Full-featured Nav from Bejoice_backup: language toggle, drawer, Cal.com CTA */}
        <Nav
          onQuoteClick={() => setQuoteOpen(true)}
          onWhyClick={() => setWhyOpen(true)}
          onServicesClick={() => setServicesOpen(true)}
          onToolsClick={() => { setToolsKey(k => k + 1); setToolsOpen(true); }}
        />
 
        <main id="main-content" role="main">
          <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
            Bejoice — Saudi Arabia&#39;s Leading AI-Powered Smart Freight Forwarding
          </h1>

          {/* Mobile-optimised 800-frame canvas scrollytelling hero */}
          <ScrollStory
            onProgress={() => {}}
            onLoaded={() => {}}
            chapterOffsets={chapterOffsets}
            onQuoteClick={() => setQuoteOpen(true)}
          onToolsClick={() => { setToolsKey(k => k + 1); setToolsOpen(true); }}
          />

        </main>

        <Suspense fallback={<FooterSkeleton />}><Footer onWhyClick={() => setWhyOpen(true)} onQuoteClick={() => setClassicQuoteOpen(true)} onCertificationsClick={() => setCertificationsOpen(true)} /></Suspense>
        <Suspense fallback={null}><FloatingBookCTA onQuoteClick={() => setQuoteOpen(true)} /></Suspense>

        {/* Quick Quote modal — identical to Bejoice_backup */}
        {quoteOpen && (
          <Suspense fallback={null}>
            <QuickQuoteModal onClose={() => startTransition(() => setQuoteOpen(false))} />
          </Suspense>
        )}

        {classicQuoteOpen && (
          <Suspense fallback={null}>
            <QuoteModal onClose={() => startTransition(() => setClassicQuoteOpen(false))} />
          </Suspense>
        )}

        {/* Why Bejoice modal overlay */}
        {whyOpen && (
          <div
            ref={whyModalRef}
            data-lenis-prevent
            onClick={e => { if (e.target === whyModalRef.current) startTransition(() => setWhyOpen(false)); }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99990,
              background: 'rgba(2,3,10,0.92)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              padding: 'max(16px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(40px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left))',
               overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
            } as React.CSSProperties}
          >
            <SparklesCore background="transparent" minSize={0.6} maxSize={2} particleDensity={60} particleColor="rgba(91,194,231,0.9)" speed={0.8} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />
            <div style={{ position:'absolute', top:'5%', right:'-10%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle,rgba(91,194,231,0.05) 0%,transparent 65%)', pointerEvents:'none', zIndex: 0 }} />
            <div style={{ position:'absolute', bottom:'5%', left:'-8%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(30,60,180,0.05) 0%,transparent 65%)', pointerEvents:'none', zIndex: 0 }} />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
              style={{ position: 'relative', width: '100%', zIndex: 1 }}
            >
            <div style={{ position: 'relative', width: '100%', minHeight: '100%' }}>
              <button
                onClick={() => startTransition(() => setWhyOpen(false))}
                style={{
                  position: 'absolute', top: 12, right: 12, zIndex: 30,
                  width: 44, height: 44,
                  background: 'rgba(7,16,28,0.97)', border: '2px solid rgba(91,194,231,0.85)',
                  borderRadius: '50%', color: '#fff', fontSize: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 2px 16px rgba(0,0,0,0.9)',
                }}
                aria-label="Close"
              >
                ×
              </button>
              <Suspense fallback={<ServicesSkeleton />}><WhyBejoice /></Suspense>
            </div>
            </motion.div>
          </div>
        )}

        {/* Services modal overlay */}
        {servicesOpen && (
          <div
            ref={servicesModalRef}
            data-lenis-prevent
            onClick={e => { if (e.target === servicesModalRef.current) startTransition(() => setServicesOpen(false)); }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99990,
              background: 'rgba(2,3,10,0.92)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              padding: 'max(16px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(40px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left))',
               overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
            } as React.CSSProperties}
          >
            <SparklesCore background="transparent" minSize={0.6} maxSize={2} particleDensity={60} particleColor="rgba(91,194,231,0.9)" speed={0.8} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />
            <div style={{ position:'absolute', top:'5%', right:'-10%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle,rgba(91,194,231,0.05) 0%,transparent 65%)', pointerEvents:'none', zIndex: 0 }} />
            <div style={{ position:'absolute', bottom:'5%', left:'-8%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(30,60,180,0.05) 0%,transparent 65%)', pointerEvents:'none', zIndex: 0 }} />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
              style={{ position: 'relative', width: '100%', zIndex: 1 }}
            >
            <div style={{ position: 'relative', width: '100%', minHeight: '100%' }}>
              <button
                onClick={() => startTransition(() => setServicesOpen(false))}
                style={{
                  position: 'absolute', top: 12, right: 12, zIndex: 30,
                  width: 44, height: 44,
                  background: 'rgba(7,16,28,0.97)', border: '2px solid rgba(91,194,231,0.85)',
                  borderRadius: '50%', color: '#fff', fontSize: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 2px 16px rgba(0,0,0,0.9)',
                }}
                aria-label="Close"
              >
                ×
              </button>
              <Suspense fallback={<ServicesSkeleton />}><Services /></Suspense>
            </div>
            </motion.div>
          </div>
        )}

        {/* Load Calculator / Logistics Tools modal overlay */}
        {toolsOpen && (
          <div
            ref={toolsModalRef}
            data-lenis-prevent
            onClick={e => { if (e.target === toolsModalRef.current) startTransition(() => setToolsOpen(false)); }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99990,
              background: 'rgba(2,3,10,0.92)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              padding: 'max(16px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(40px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left))',
               overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
            } as React.CSSProperties}
          >
            <SparklesCore background="transparent" minSize={0.6} maxSize={2} particleDensity={60} particleColor="rgba(91,194,231,0.9)" speed={0.8} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />
            <div style={{ position:'absolute', top:'5%', right:'-10%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle,rgba(91,194,231,0.05) 0%,transparent 65%)', pointerEvents:'none', zIndex: 0 }} />
            <div style={{ position:'absolute', bottom:'5%', left:'-8%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(30,60,180,0.05) 0%,transparent 65%)', pointerEvents:'none', zIndex: 0 }} />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
              style={{ position: 'relative', width: '100%', zIndex: 1 }}
            >
            <div style={{ position: 'relative', width: '100%', minHeight: '100%' }}>
              <button
                onClick={() => startTransition(() => setToolsOpen(false))}
                style={{
                  position: 'absolute', top: 12, right: 12, zIndex: 30,
                  width: 44, height: 44,
                  background: 'rgba(7,16,28,0.97)', border: '2px solid rgba(91,194,231,0.85)',
                  borderRadius: '50%', color: '#fff', fontSize: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 2px 16px rgba(0,0,0,0.9)',
                }}
                aria-label="Close"
              >
                ×
              </button>
              <Suspense fallback={<LogisticsToolsSkeleton />}><LogisticsTools key={toolsKey} /></Suspense>
            </div>
            </motion.div>
          </div>
        )}
        {/* Certifications modal overlay */}
        {certificationsOpen && (
          <div
            ref={certificationsModalRef}
            data-lenis-prevent
            onClick={e => { if (e.target === certificationsModalRef.current) startTransition(() => setCertificationsOpen(false)); }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99990,
              background: 'rgba(2,3,10,0.92)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              padding: 'max(16px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(40px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left))',
               overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
            } as React.CSSProperties}
          >
            <SparklesCore background="transparent" minSize={0.6} maxSize={2} particleDensity={60} particleColor="rgba(91,194,231,0.9)" speed={0.8} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />
            <div style={{ position:'absolute', top:'5%', right:'-10%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle,rgba(91,194,231,0.05) 0%,transparent 65%)', pointerEvents:'none', zIndex: 0 }} />
            <div style={{ position:'absolute', bottom:'5%', left:'-8%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(30,60,180,0.05) 0%,transparent 65%)', pointerEvents:'none', zIndex: 0 }} />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
              style={{ position: 'relative', width: '100%', zIndex: 1 }}
            >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: 'relative',
                width: '100%',
                minHeight: '100%',
              }}
            >
              <button
                onClick={() => startTransition(() => setCertificationsOpen(false))}
                style={{
                  position: 'absolute', top: 12, right: 12, zIndex: 30,
                  width: 44, height: 44,
                  background: 'rgba(7,16,28,0.97)', border: '2px solid rgba(91,194,231,0.85)',
                  borderRadius: '50%', color: '#fff', fontSize: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 2px 16px rgba(0,0,0,0.9)',
                }}
                aria-label="Close"
              >
                ×
              </button>
              <Suspense fallback={<CertificationsSkeleton />}><Certifications /></Suspense>
            </div>
            </motion.div>
          </div>
        )}
      </div>
    </LangProvider>
  );
}
