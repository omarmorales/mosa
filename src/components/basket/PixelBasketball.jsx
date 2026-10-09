import React from 'react';

export default function PixelBasketball({ size = 32, style = {}, className = '' }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 16 16" 
      width={size} 
      height={size} 
      className={`pixel-basketball-svg ${className}`}
      style={{
        imageRendering: 'pixelated',
        shapeRendering: 'crispEdges',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
    >
      {/* Outer Outline */}
      <rect x="5" y="0" width="6" height="1" fill="#111111" />
      <rect x="3" y="1" width="2" height="1" fill="#111111" />
      <rect x="11" y="1" width="2" height="1" fill="#111111" />
      <rect x="2" y="2" width="1" height="1" fill="#111111" />
      <rect x="13" y="2" width="1" height="1" fill="#111111" />
      <rect x="1" y="3" width="1" height="2" fill="#111111" />
      <rect x="14" y="3" width="1" height="2" fill="#111111" />
      <rect x="0" y="5" width="1" height="6" fill="#111111" />
      <rect x="15" y="5" width="1" height="6" fill="#111111" />
      <rect x="1" y="11" width="1" height="2" fill="#111111" />
      <rect x="14" y="11" width="1" height="2" fill="#111111" />
      <rect x="2" y="13" width="1" height="1" fill="#111111" />
      <rect x="13" y="13" width="1" height="1" fill="#111111" />
      <rect x="3" y="14" width="2" height="1" fill="#111111" />
      <rect x="11" y="14" width="2" height="1" fill="#111111" />
      <rect x="5" y="15" width="6" height="1" fill="#111111" />

      {/* Base Orange Fill */}
      <rect x="5" y="1" width="6" height="1" fill="#e65c00" />
      <rect x="3" y="2" width="10" height="1" fill="#e65c00" />
      <rect x="2" y="3" width="12" height="2" fill="#e65c00" />
      <rect x="1" y="5" width="14" height="6" fill="#e65c00" />
      <rect x="2" y="11" width="12" height="2" fill="#e65c00" />
      <rect x="3" y="13" width="10" height="1" fill="#e65c00" />
      <rect x="5" y="14" width="6" height="1" fill="#e65c00" />

      {/* Highlights (Top-Left 8-bit Shine) */}
      <rect x="5" y="1" width="4" height="1" fill="#ffa726" />
      <rect x="4" y="2" width="3" height="1" fill="#ffa726" />
      <rect x="3" y="3" width="3" height="1" fill="#ffa726" />
      <rect x="4" y="3" width="2" height="1" fill="#fff9c4" />
      <rect x="2" y="4" width="2" height="1" fill="#ffa726" />
      <rect x="1" y="5" width="2" height="2" fill="#ffa726" />
      <rect x="8" y="2" width="2" height="1" fill="#ffa726" />

      {/* Dark Bottom Shading */}
      <rect x="4" y="13" width="8" height="1" fill="#bf360c" />
      <rect x="5" y="14" width="6" height="1" fill="#bf360c" />
      <rect x="11" y="11" width="3" height="2" fill="#bf360c" />
      <rect x="12" y="9" width="2" height="2" fill="#bf360c" />

      {/* Basketball Seams / Rib Lines */}
      <rect x="1" y="7" width="14" height="1" fill="#1a1a1a" />
      <rect x="1" y="8" width="14" height="1" fill="#111111" />
      <rect x="7" y="1" width="1" height="14" fill="#1a1a1a" />
      <rect x="8" y="1" width="1" height="14" fill="#111111" />
      <rect x="4" y="2" width="1" height="1" fill="#111111" />
      <rect x="3" y="3" width="1" height="2" fill="#111111" />
      <rect x="3" y="11" width="1" height="2" fill="#111111" />
      <rect x="4" y="13" width="1" height="1" fill="#111111" />
      <rect x="11" y="2" width="1" height="1" fill="#111111" />
      <rect x="12" y="3" width="1" height="2" fill="#111111" />
      <rect x="12" y="11" width="1" height="2" fill="#111111" />
      <rect x="11" y="13" width="1" height="1" fill="#111111" />
    </svg>
  );
}
