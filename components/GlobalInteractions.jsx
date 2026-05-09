'use client';
import React, { useEffect } from 'react';
import gsap from 'gsap';

export default function GlobalInteractions() {
  useEffect(() => {
    // Media query to disable complex interactions on mobile
    if (window.innerWidth <= 768) return;

    // ── MAGNETIC BUTTONS ──
    const magneticEls = document.querySelectorAll('.btn-gold, .btn-ghost, .magnetic');
    magneticEls.forEach((el) => {
      const xTo = gsap.quickTo(el, "x", {duration: 1, ease: "elastic.out(1, 0.3)"});
      const yTo = gsap.quickTo(el, "y", {duration: 1, ease: "elastic.out(1, 0.3)"});

      const handleMouseMove = (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;
        
        // pull distance
        xTo(distanceX * 0.3);
        yTo(distanceY * 0.3);
      };

      const handleMouseLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseleave', handleMouseLeave);
      el.addEventListener('mousedown', handleMouseLeave); // Reset on click
      
      // We attach these directly to DOM, will leak if DOM changes heavily,
      // but fine for top level simple app. Clean up handled below.
      el._magneticRemove = () => {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.removeEventListener('mousedown', handleMouseLeave);
      };
    });

    // ── 3D TILT ON GLASS CARDS ──
    const glassCards = document.querySelectorAll('.glass-card, .tilt-effect');
    glassCards.forEach((card) => {
      const handleMouseMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          scale: 1.02,
          transformPerspective: 1000,
          ease: "power2.out",
          duration: 0.3
        });
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          ease: "power2.out",
          duration: 0.5
        });
      };

      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);

      card._tiltRemove = () => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      };
    });

    return () => {
      const magneticElsClean = document.querySelectorAll('.btn-gold, .btn-ghost, .magnetic');
      magneticElsClean.forEach(el => el._magneticRemove && el._magneticRemove());
      
      const glassCardsClean = document.querySelectorAll('.glass-card, .tilt-effect');
      glassCardsClean.forEach(card => card._tiltRemove && card._tiltRemove());
    };
  }, []);

  return null;
}
