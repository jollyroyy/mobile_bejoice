'use client';

import { useState, useRef, useCallback } from 'react';
import Loader      from '@/components/Loader';
import Nav         from '@/components/Nav';
import ScrollStory from '@/components/ScrollStory';
import Finale      from '@/components/Finale';

export default function Page() {
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [loaderVisible, setLoaderVisible]   = useState(true);

  // Absolute scroll positions for each chapter start — shared with Nav
  const chapterOffsets = useRef<number[]>([0, 0, 0, 0, 0]);

  const handleProgress = useCallback((pct: number) => {
    setLoaderProgress(pct);
  }, []);

  const handleLoaded = useCallback(() => {
    setLoaderProgress(100);
    setTimeout(() => setLoaderVisible(false), 350);
  }, []);

  return (
    <>
      <Loader progress={loaderProgress} visible={loaderVisible} />
      <Nav chapterOffsets={chapterOffsets} />

      {/* Single continuous scroll — all 387 frames on one canvas */}
      <ScrollStory
        onProgress={handleProgress}
        onLoaded={handleLoaded}
        chapterOffsets={chapterOffsets}
      />

      <Finale />
    </>
  );
}
