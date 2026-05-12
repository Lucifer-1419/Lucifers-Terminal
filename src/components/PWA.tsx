'use client';

import { useEffect } from 'react';

export default function PWA() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => console.log('SW registration failed:', err));
      });
    }
  }, []);

  return null;
}
