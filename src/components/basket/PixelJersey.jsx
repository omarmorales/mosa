import React from 'react';

/**
 * Pixel Art Basketball Jersey (NES / 8-Bit style)
 * Black jersey with crisp trim and white number
 */
export default function PixelJersey({ 
  number = '?', 
  size = 38,
  jerseyColor = '#121418',
  trimColor = '#3a3f4d',
  numberColor = '#ffffff'
}) {
  const displayNum = number !== null && number !== undefined ? String(number) : '?';
  // Adjust font size based on number length (1 digit vs 2 digits)
  const fontSize = displayNum.length >= 2 ? '5.5px' : '7px';

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 20 22" 
      width={size} 
      height={Math.round(size * 1.1)} 
      className="pixel-jersey-svg"
      style={{
        imageRendering: 'pixelated',
        shapeRendering: 'crispEdges',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.6))'
      }}
    >
      {/* --- BLACK JERSEY PIXEL SILHOUETTE --- */}
      
      {/* Outer Outline (Black/Dark pixel borders) */}
      {/* Shoulder Straps Top */}
      <rect x="3" y="1" width="4" height="1" fill="#000000" />
      <rect x="13" y="1" width="4" height="1" fill="#000000" />
      
      {/* Outer Armhole cuts */}
      <rect x="2" y="2" width="1" height="4" fill="#000000" />
      <rect x="17" y="2" width="1" height="4" fill="#000000" />
      <rect x="1" y="6" width="1" height="3" fill="#000000" />
      <rect x="18" y="6" width="1" height="3" fill="#000000" />
      <rect x="2" y="9" width="1" height="2" fill="#000000" />
      <rect x="17" y="9" width="1" height="2" fill="#000000" />

      {/* Outer Torso sides */}
      <rect x="3" y="11" width="1" height="9" fill="#000000" />
      <rect x="16" y="11" width="1" height="9" fill="#000000" />

      {/* Bottom Hem */}
      <rect x="4" y="20" width="12" height="1" fill="#000000" />

      {/* Neck Cutout Outline */}
      <rect x="7" y="2" width="1" height="2" fill="#000000" />
      <rect x="12" y="2" width="1" height="2" fill="#000000" />
      <rect x="8" y="4" width="4" height="1" fill="#000000" />

      {/* --- JERSEY MAIN BODY (BLACK FILL) --- */}
      {/* Left Strap */}
      <rect x="3" y="2" width="4" height="4" fill={jerseyColor} />
      {/* Right Strap */}
      <rect x="13" y="2" width="4" height="4" fill={jerseyColor} />
      
      {/* Upper Chest */}
      <rect x="2" y="6" width="16" height="3" fill={jerseyColor} />
      {/* Mid Chest & Torso */}
      <rect x="3" y="9" width="14" height="2" fill={jerseyColor} />
      <rect x="4" y="11" width="12" height="9" fill={jerseyColor} />

      {/* --- RETRO PIXEL TRIM & PIPING --- */}
      {/* Neck Trim */}
      <rect x="7" y="3" width="1" height="1" fill={trimColor} />
      <rect x="12" y="3" width="1" height="1" fill={trimColor} />
      <rect x="8" y="3" width="4" height="1" fill={trimColor} />

      {/* Armhole Trim Left */}
      <rect x="3" y="4" width="1" height="3" fill={trimColor} />
      <rect x="2" y="7" width="1" height="2" fill={trimColor} />
      
      {/* Armhole Trim Right */}
      <rect x="16" y="4" width="1" height="3" fill={trimColor} />
      <rect x="17" y="7" width="1" height="2" fill={trimColor} />

      {/* Bottom Hem Trim Accent */}
      <rect x="4" y="19" width="12" height="1" fill="#1f232b" />

      {/* Subtle Chest Shadow / Jersey Texture */}
      <rect x="4" y="11" width="1" height="8" fill="#1c1f26" />

      {/* --- PLAYER NUMBER (WHITE RETRO TEXT) --- */}
      <text 
        x="10" 
        y="13" 
        fill={displayNum === '?' ? '#fbed64' : numberColor}
        fontSize={fontSize} 
        fontFamily="'Press Start 2P', monospace" 
        fontWeight="bold"
        textAnchor="middle" 
        dominantBaseline="central"
        style={{ userSelect: 'none' }}
      >
        {displayNum}
      </text>
    </svg>
  );
}
