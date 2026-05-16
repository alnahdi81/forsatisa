import React from 'react';

export const TikTokIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.589 6.686a4.793 4.793 0 01-3.273-1.241 4.793 4.793 0 01-1.316-3.445h-3.408v16.582a2.84 2.84 0 01-2.841 2.841 2.84 2.84 0 01-2.841-2.841 2.84 2.84 0 012.841-2.841c.366 0 .707.07 1.026.195l.013-3.412a6.2 6.2 0 00-1.039-.088c-3.454 0-6.255 2.801-6.255 6.255 0 3.454 2.801 6.255 6.255 6.255s6.255-2.801 6.255-6.255V9.117a8.158 8.158 0 005.158 1.832V7.541a4.743 4.743 0 01-1.127-.855z" />
  </svg>
);
