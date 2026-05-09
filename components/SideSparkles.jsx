'use client';
// Pure CSS golden floating dots — no tsparticles, no event listeners, scroll-safe
const DOTS = [
  // left strip
  { left: '1%',  top: '6%',  size: 2.2, delay: 0,    dur: 4.8 },
  { left: '2%',  top: '15%', size: 1.4, delay: 1.2,  dur: 6.2 },
  { left: '1.5%',top: '25%', size: 3.0, delay: 0.5,  dur: 4.1 },
  { left: '0.8%',top: '36%', size: 1.7, delay: 2.4,  dur: 5.7 },
  { left: '2.2%',top: '47%', size: 2.5, delay: 0.9,  dur: 3.8 },
  { left: '1%',  top: '58%', size: 1.5, delay: 1.8,  dur: 6.5 },
  { left: '2%',  top: '68%', size: 2.8, delay: 0.3,  dur: 4.4 },
  { left: '1.3%',top: '78%', size: 1.9, delay: 2.7,  dur: 5.1 },
  { left: '0.7%',top: '88%', size: 2.3, delay: 1.1,  dur: 3.6 },
  { left: '2%',  top: '95%', size: 1.6, delay: 0.6,  dur: 6.0 },
  // right strip
  { right: '1%',  top: '3%',  size: 1.8, delay: 0.8,  dur: 5.3 },
  { right: '2%',  top: '12%', size: 2.6, delay: 2.0,  dur: 4.0 },
  { right: '1.2%',top: '22%', size: 1.4, delay: 0.4,  dur: 6.8 },
  { right: '0.9%',top: '33%', size: 3.1, delay: 2.6,  dur: 3.5 },
  { right: '2%',  top: '43%', size: 2.0, delay: 1.0,  dur: 5.9 },
  { right: '1.5%',top: '53%', size: 1.6, delay: 0.2,  dur: 4.6 },
  { right: '0.8%',top: '63%', size: 2.4, delay: 2.3,  dur: 3.9 },
  { right: '2%',  top: '73%', size: 1.9, delay: 1.5,  dur: 6.3 },
  { right: '1%',  top: '82%', size: 2.7, delay: 0.7,  dur: 4.9 },
  { right: '1.8%',top: '91%', size: 1.5, delay: 2.1,  dur: 5.5 },
  // top strip
  { left: '12%', top: '0.8%', size: 1.8, delay: 1.4,  dur: 5.2 },
  { left: '25%', top: '0.5%', size: 2.4, delay: 0.3,  dur: 4.3 },
  { left: '38%', top: '1%',   size: 1.5, delay: 2.2,  dur: 6.1 },
  { left: '52%', top: '0.6%', size: 2.9, delay: 0.7,  dur: 3.7 },
  { left: '65%', top: '0.9%', size: 1.7, delay: 1.9,  dur: 5.8 },
  { left: '78%', top: '0.4%', size: 2.2, delay: 0.5,  dur: 4.5 },
  { left: '90%', top: '0.8%', size: 1.4, delay: 2.8,  dur: 6.6 },
  // bottom strip
  { left: '8%',  top: '98%', size: 2.0, delay: 1.6,  dur: 4.7 },
  { left: '20%', top: '99%', size: 1.6, delay: 0.1,  dur: 5.4 },
  { left: '33%', top: '97%', size: 2.7, delay: 2.5,  dur: 3.8 },
  { left: '47%', top: '98.5%',size: 1.5, delay: 1.0,  dur: 6.2 },
  { left: '60%', top: '99%', size: 2.3, delay: 0.4,  dur: 4.2 },
  { left: '73%', top: '97.5%',size: 1.8, delay: 2.0,  dur: 5.6 },
  { left: '86%', top: '98%', size: 2.6, delay: 1.3,  dur: 3.9 },
]

export default function SideSparkles() {
  return (
    <>
      <style>{`
        @keyframes goldenFloat {
          0%   { opacity: 0;    transform: translate(-50%, -50%) scale(0.5); }
          20%  { opacity: 0.85; transform: translate(-50%, -62%) scale(1.1); }
          50%  { opacity: 0.2;  transform: translate(-50%, -50%) scale(0.75); }
          75%  { opacity: 0.95; transform: translate(-50%, -38%) scale(1.15); }
          100% { opacity: 0;    transform: translate(-50%, -50%) scale(0.5); }
        }
      `}</style>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {DOTS.map((d, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: d.top,
              left: d.left,
              right: d.right,
              transform: 'translate(-50%, -50%)',
              width: d.size,
              height: d.size,
              borderRadius: '50%',
              background: '#5BC2E7',
              boxShadow: `0 0 ${d.size * 3}px ${d.size * 1.5}px rgba(91,194,231,0.55)`,
              animation: `goldenFloat ${d.dur}s ${d.delay}s ease-in-out infinite`,
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>
    </>
  )
}
