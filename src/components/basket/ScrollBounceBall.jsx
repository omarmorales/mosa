import React, { useState, useEffect } from 'react';
import PixelBasketball from './PixelBasketball.jsx';

export default function ScrollBounceBall() {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let timeoutId = null;

    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsScrolling(true);

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolling(false);
      }, 250);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // Compute bounce height and squash linked to scroll position
  // Uses stepped sine wave for authentic 8-bit / NES feel
  const bounceWave = Math.abs(Math.sin(scrollY * 0.04));
  const bounceY = -bounceWave * 26; // Height of bounce up to 26px
  const rotation = Math.round((scrollY * 0.7) % 360);
  
  // Squash effect near the floor
  const isNearFloor = bounceWave < 0.15;
  const scaleX = isNearFloor ? 1.15 : 1;
  const scaleY = isNearFloor ? 0.85 : 1;

  return (
    <div 
      className="scroll-ball-wrapper"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '90px',
        position: 'relative'
      }}
    >
      {/* Dynamic Bouncing Ball */}
      <div 
        style={{
          transform: isScrolling
            ? `translateY(${bounceY}px) rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`
            : undefined,
          transition: isScrolling ? 'transform 0.05s linear' : 'none',
          filter: 'drop-shadow(0 6px 14px rgba(255, 102, 0, 0.5))',
          willChange: 'transform'
        }}
        className={!isScrolling ? 'idle-retro-bounce' : ''}
      >
        <PixelBasketball size={64} />
      </div>

      {/* Retro Shadow on Floor */}
      <div 
        style={{
          width: isNearFloor || !isScrolling ? '48px' : '32px',
          height: '6px',
          backgroundColor: '#000',
          borderRadius: '50%',
          opacity: isNearFloor || !isScrolling ? 0.6 : 0.25,
          marginTop: '6px',
          transition: 'width 0.1s, opacity 0.1s'
        }}
      />

      <style>{`
        @keyframes idleBounce {
          0%, 100% {
            transform: translateY(0) scale(1.1, 0.9);
          }
          50% {
            transform: translateY(-16px) scale(0.95, 1.05);
          }
        }

        .idle-retro-bounce {
          animation: idleBounce 1.2s steps(6) infinite;
        }
      `}</style>
    </div>
  );
}
