import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, DM_Sans, Cormorant_Garamond, Cairo, Plus_Jakarta_Sans, Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const dmSans = DM_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-inter',
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
      className={`${bebasNeue.variable} ${dmSans.variable} ${cormorant.variable} ${cairo.variable} ${plusJakarta.variable} ${inter.variable}`}
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

        {/* Cal.com booking modal — styled overlay matching Bejoice_backup */}
        <Script id="cal-modal" strategy="afterInteractive">{`
          (function(){
            var overlay=null,box=null,iframeEn=null,iframeAr=null,closeBtn=null;
            var visible=false,initialized=false,built=false,needsReset=false;
            var CAL_BASE='https://cal.com/bejoice/freight-expert-consultation?embed=true&theme=dark&layout=month_view&brandColor=%235BC2E7&hideEventTypeDetails=false';

            function buildModal(){
              if(initialized) return;
              initialized=true;

              overlay=document.createElement('div');
              overlay.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(3,3,6,0.88);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);display:none;align-items:center;justify-content:center;padding:1rem;';
              overlay.addEventListener('click',function(e){if(e.target===overlay)hideModal();});

              box=document.createElement('div');
              box.style.cssText='position:relative;width:100%;max-width:900px;height:min(90vh,720px);background:#0c1c30;border:1px solid rgba(91,194,231,0.25);border-radius:16px;overflow:visible;box-shadow:0 32px 80px rgba(0,0,0,0.9);';

              iframeEn=document.createElement('iframe');
              iframeEn.src=CAL_BASE+'&locale=en';
              iframeEn.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation');
              iframeEn.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:none;border-radius:16px;';

              iframeAr=document.createElement('iframe');
              iframeAr.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation');
              iframeAr.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:none;border-radius:16px;display:none;';

              closeBtn=document.createElement('button');
              closeBtn.innerHTML='&times;';
              closeBtn.title='Close';
              closeBtn.style.cssText='position:absolute;top:12px;right:12px;z-index:2147483647;background:rgba(7,16,28,0.97);border:2px solid rgba(91,194,231,0.85);border-radius:50%;width:44px;height:44px;color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 16px rgba(0,0,0,0.9),0 0 14px rgba(91,194,231,0.35);transition:all 0.2s ease;pointer-events:all;isolation:isolate;line-height:1;';
              closeBtn.onmouseenter=function(){closeBtn.style.background='rgba(91,194,231,0.25)';closeBtn.style.borderColor='#5BC2E7';closeBtn.style.boxShadow='0 2px 20px rgba(91,194,231,0.5)';};
              closeBtn.onmouseleave=function(){closeBtn.style.background='rgba(7,16,28,0.97)';closeBtn.style.borderColor='rgba(91,194,231,0.85)';closeBtn.style.boxShadow='0 2px 16px rgba(0,0,0,0.9),0 0 14px rgba(91,194,231,0.35)';};
              closeBtn.onclick=hideModal;

              box.appendChild(iframeEn);
              box.appendChild(iframeAr);
              box.appendChild(closeBtn);
              overlay.appendChild(box);
              document.body.appendChild(overlay);

              window.addEventListener('message',function(e){
                if(e.origin!=='https://cal.com'&&e.origin!=='https://app.cal.com') return;
                var t=e.data&&e.data.type;
                if(t==='cal:close'||t==='close') hideModal();
                if(t==='bookingSuccessful'||t==='CAL_BOOKING_SUCCESSFUL'||t==='cal:booking:confirmed') needsReset=true;
              });
            }

            function getLang(){try{return document.documentElement.lang||'en';}catch(_){return 'en';}}

            function showModal(){
              buildModal();
              if(needsReset){
                needsReset=false;
                iframeEn.src=CAL_BASE+'&locale=en';
                iframeAr.src='';
              }
              var isAr=getLang()==='ar';
              if(isAr){
                if(!iframeAr.src) iframeAr.src=CAL_BASE+'&locale=ar';
                iframeEn.style.display='none';
                iframeAr.style.display='block';
              } else {
                iframeEn.style.display='block';
                iframeAr.style.display='none';
              }
              overlay.style.display='flex';
              document.body.style.overflow='hidden';
              visible=true;
            }

            function hideModal(){
              if(!overlay) return;
              overlay.style.display='none';
              document.body.style.overflow='';
              visible=false;
            }

            window.__showCalModal=showModal;
            window.__hideCalModal=hideModal;

            document.addEventListener('keydown',function(e){if(e.key==='Escape'&&visible)hideModal();});

            // Deferred build: after 3s or first interaction — keeps page load snappy
            function deferBuild(){if(built)return;built=true;buildModal();}
            setTimeout(deferBuild,3000);
            ['scroll','click','touchstart','keydown'].forEach(function(ev){
              window.addEventListener(ev,deferBuild,{once:true,passive:true});
            });
          })();
        `}</Script>
      </body>
    </html>
  );
}
