'use client';
// hooks/useCalBooking.js
// Opens the preloaded Cal iframe modal (zero delay).
export function useCalBooking() {
  const openCalPopup = () => {
    if (window.__showCalModal) window.__showCalModal();
  };
  return { openCalPopup };
}
