'use client';

import { useState, useRef, useCallback } from 'react';
import Loader from '@/components/Loader';
import Nav from '@/components/Nav';
import ChapterCanvas from '@/components/ChapterCanvas';
import Interstitial from '@/components/Interstitial';
import Finale from '@/components/Finale';

function pad(n: number) {
  return String(n).padStart(4, '0');
}

const CHAPTERS = [
  {
    chapterNum: 1,
    count: 145,
    src: (i: number) => `/bic/${pad(i)}.webp`,
    tag: 'Chapter 01 — Origins',
    headline: ['WHERE IT', 'BEGINS.'],
    body: 'Every great story starts with a single frame. Watch as the world takes shape — motion by motion, moment by moment.',
    align: 'left' as const,
  },
  {
    chapterNum: 2,
    count: 73,
    src: (i: number) => `/bejoice/frame_${pad(i)}.webp`,
    tag: 'Chapter 02 — Motion',
    headline: ['SHAPE IN', 'MOTION.'],
    body: 'Flow. Transform. Evolve. Each frame carries the story forward in ways that words alone cannot capture.',
    align: 'right' as const,
  },
  {
    chapterNum: 3,
    count: 169,
    src: (i: number) => `/port/${pad(i)}.webp`,
    tag: 'Chapter 03 — Arrival',
    headline: ['THE COMPLETE', 'PICTURE.'],
    body: 'A story told through motion, light, and time — arriving at its inevitable, beautiful conclusion. The journey is complete.',
    align: 'left' as const,
  },
];

export default function Page() {
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [loaderVisible, setLoaderVisible]   = useState(true);

  const chapterOffsets     = useRef<number[]>([0, 0, 0]);
  const chapterScrollables = useRef<number[]>([0, 0, 0]);

  const handleProgress = useCallback((pct: number) => {
    setLoaderProgress(pct);
  }, []);

  const handleLoaded = useCallback(() => {
    setLoaderProgress(100);
    setTimeout(() => setLoaderVisible(false), 350);
  }, []);

  const makeMeasureHandler = (idx: number) =>
    (offsetTop: number, scrollable: number) => {
      chapterOffsets.current[idx]     = offsetTop;
      chapterScrollables.current[idx] = scrollable;
    };

  return (
    <>
      <Loader progress={loaderProgress} visible={loaderVisible} />
      <Nav chapterOffsets={chapterOffsets} chapterScrollables={chapterScrollables} />

      {/* Chapter 1 — hero */}
      <ChapterCanvas
        {...CHAPTERS[0]}
        onProgress={handleProgress}
        onLoaded={handleLoaded}
        onMeasure={makeMeasureHandler(0)}
      />

      {/* Interstitial 1 → 2 */}
      <Interstitial
        number="02"
        heading={<>The journey<br />continues.</>}
        body="A transformation is underway. Step into the second movement — where form finds its purpose and motion becomes meaning."
      />

      {/* Chapter 2 — 150ms delayed load to give Ch1 priority */}
      <ChapterCanvas
        {...CHAPTERS[1]}
        loadDelay={150}
        onMeasure={makeMeasureHandler(1)}
      />

      {/* Interstitial 2 → 3 */}
      <Interstitial
        number="03"
        heading={<>The final<br />chapter.</>}
        body="Culmination. Everything has been building to this — a destination that makes the entire journey worthwhile."
      />

      {/* Chapter 3 — 150ms delayed load to give Ch1 priority */}
      <ChapterCanvas
        {...CHAPTERS[2]}
        loadDelay={150}
        onMeasure={makeMeasureHandler(2)}
      />

      <Finale />
    </>
  );
}
