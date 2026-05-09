'use client';

// All sections use browser APIs (window, canvas, GSAP, Lenis, Three.js).
// Using next/dynamic with ssr:false for all prevents SSR window errors.
import { useEffect, useState, useRef, useCallback, startTransition, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LangProvider } from '@/context/LangContext';

// ── Core always-visible UI — ssr:false so GSAP/Lenis never run on server ──
const Loader           = dynamic(() => import('@/components/Loader'),           { ssr: false });
const Nav              = dynamic(() => import('@/components/Nav'),              { ssr: false });
const ScrollStory      = dynamic(() => import('@/components/ScrollStory'),      { ssr: false });
const ScrollProgress   = dynamic(() => import('@/components/ScrollProgress'),   { ssr: false });
const GlobalInteractions = dynamic(() => import('@/components/GlobalInteractions'), { ssr: false });
const ScrollReveal     = dynamic(() => import('@/components/ScrollReveal'),     { ssr: false });

// ── Below-fold sections ──
const WhyBejoice    = dynamic(() => import('@/components/WhyBejoice'),    { ssr: false });
const BejoiceGlobe  = dynamic(() => import('@/components/BejoiceGlobe'),  { ssr: false });
const Services      = dynamic(() => import('@/components/Services'),      { ssr: false });
const LogisticsTools = dynamic(() => import('@/components/LogisticsTools'), { ssr: false });
const Contact       = dynamic(() => import('@/components/Contact'),       { ssr: false });
const Certifications = dynamic(() => import('@/components/Certifications'), { ssr: false });
const Footer        = dynamic(() => import('@/components/Footer'),        { ssr: false });
const FloatingBookCTA = dynamic(() => import('@/components/FloatingBookCTA'), { ssr: false });
const QuickQuoteModal = dynamic(() => import('@/components/QuickQuoteModal'), { ssr: false });
const Finale        = dynamic(() => import('@/components/Finale'),        { ssr: false });

// Skeleton fallbacks (these are simple, no browser deps — keep as regular imports)
import {
  ContactSkeleton,
  LogisticsToolsSkeleton,
  ServicesSkeleton,
  CertificationsSkeleton,
  FooterSkeleton,
} from '@/components/SkeletonSection';

export default function Page() {
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [loaderVisible, setLoaderVisible]   = useState(true);
  const [quoteOpen, setQuoteOpen]           = useState(false);

  const chapterOffsets = useRef<number[]>([0, 0, 0, 0, 0]);

  const handleProgress = useCallback((pct: number) => {
    setLoaderProgress(pct);
  }, []);

  const handleLoaded = useCallback(() => {
    setLoaderProgress(100);
    setTimeout(() => setLoaderVisible(false), 350);
  }, []);

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
        {/* Loader — shown until hero frames load */}
        <Loader progress={loaderProgress} visible={loaderVisible} />

        <ScrollProgress />
        <GlobalInteractions />
        <ScrollReveal />

        {/* Full-featured Nav from Bejoice_backup: language toggle, drawer, Cal.com CTA */}
        <Nav onQuoteClick={() => setQuoteOpen(true)} />

        <main id="main-content" role="main">
          <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
            Bejoice — Saudi Arabia&#39;s Leading AI-Powered Smart Freight Forwarding
          </h1>

          {/* Mobile-optimised 800-frame canvas scrollytelling hero */}
          <ScrollStory
            onProgress={handleProgress}
            onLoaded={handleLoaded}
            chapterOffsets={chapterOffsets}
            onQuoteClick={() => setQuoteOpen(true)}
          />

          <Suspense fallback={null}><BejoiceGlobe /></Suspense>
          <Suspense fallback={<ServicesSkeleton />}><WhyBejoice /></Suspense>
          <Suspense fallback={<ServicesSkeleton />}><Services /></Suspense>
          <Suspense fallback={<LogisticsToolsSkeleton />}><LogisticsTools /></Suspense>
          <Suspense fallback={<ContactSkeleton />}><Contact /></Suspense>
          <Suspense fallback={<CertificationsSkeleton />}><Certifications /></Suspense>
        </main>

        <Suspense fallback={<FooterSkeleton />}><Footer /></Suspense>
        <Suspense fallback={null}><FloatingBookCTA /></Suspense>
        <Suspense fallback={null}><Finale /></Suspense>

        {quoteOpen && (
          <QuickQuoteModal onClose={() => {
            startTransition(() => setQuoteOpen(false));
          }} />
        )}
      </div>
    </LangProvider>
  );
}
