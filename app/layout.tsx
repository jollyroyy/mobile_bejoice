import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, DM_Sans, Cormorant_Garamond, Cairo } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Bejoice — Saudi Arabia's Leading AI-Powered Smart Freight Forwarding",
  description: 'Award-winning freight forwarder delivering seamless end-to-end logistics with reliability and global reach.',
  keywords: 'freight forwarding, logistics, Saudi Arabia, KSA, air freight, sea freight, customs clearance',
  openGraph: {
    title: "Bejoice — Smart Freight Forwarding",
    description: 'Award-winning freight forwarder delivering seamless end-to-end logistics.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#183650',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${bebasNeue.variable} ${dmSans.variable} ${cormorant.variable} ${cairo.variable}`}
    >
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cal.com" />
        <link rel="preconnect" href="https://app.cal.com" />
        <link rel="preconnect" href="https://flagcdn.com" />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon-192.png" />
      </head>
      <body>
        {children}

        {/* Cal.com booking modal — identical to backup's index.html inline script */}
        <Script id="cal-modal" strategy="afterInteractive">{`
          (function(){
            var iframe = null;
            var visible = false;

            function createIframe(){
              if(iframe) return;
              iframe = document.createElement('iframe');
              iframe.src = 'https://cal.com/bejoice/freight-expert-consultation?embed=true';
              iframe.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation');
              iframe.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;border:none;z-index:99998;background:rgba(0,0,0,0.8);display:none;';
              document.body.appendChild(iframe);

              window.addEventListener('message', function(e){
                if(e.origin !== 'https://cal.com' && e.origin !== 'https://app.cal.com') return;
                if(e.data && (e.data.type === 'cal:close' || e.data.type === 'close')) hideModal();
              });
            }

            function showModal(){
              createIframe();
              iframe.style.display = 'block';
              document.body.style.overflow = 'hidden';
              visible = true;
            }

            function hideModal(){
              if(!iframe) return;
              iframe.style.display = 'none';
              document.body.style.overflow = '';
              visible = false;
            }

            window.__showCalModal = showModal;
            window.__hideCalModal = hideModal;

            document.addEventListener('keydown', function(e){
              if(e.key === 'Escape' && visible) hideModal();
            });
          })();
        `}</Script>
      </body>
    </html>
  );
}
