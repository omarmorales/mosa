import React, { useEffect, useRef } from 'react';

export default function RetroLoadMore({ 
  onLoadMore, 
  hasMore, 
  loading = false, 
  currentCount = 0, 
  totalCount = 0,
  enableAutoScroll = true 
}) {
  const buttonRef = useRef(null);

  // IntersectionObserver for auto load on scroll down if enabled
  useEffect(() => {
    if (!enableAutoScroll || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (buttonRef.current) {
      observer.observe(buttonRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, enableAutoScroll, onLoadMore]);

  if (!hasMore && totalCount > 0) {
    return (
      <div 
        style={{ 
          textAlign: 'center', 
          padding: '15px 10px', 
          marginTop: '15px',
          borderTop: '1px dashed #333',
          color: '#92cc41',
          fontSize: '0.75rem',
          letterSpacing: '1px'
        }}
      >
        <p style={{ margin: 0 }}>
          <i className="nes-icon star is-small" style={{ marginRight: '8px' }}></i>
          ★ ALL DATA UNLOCKED ({totalCount}/{totalCount} RECS) ★
          <i className="nes-icon star is-small" style={{ marginLeft: '8px' }}></i>
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={buttonRef}
      style={{ 
        textAlign: 'center', 
        padding: '20px 10px 10px', 
        marginTop: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      {loading ? (
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <p style={{ fontSize: '0.65rem', color: '#fbed64', marginBottom: '6px' }}>
            LOADING NEXT DATA DISK... [{currentCount}/{totalCount}]
          </p>
          <progress className="nes-progress is-warning" value="70" max="100" style={{ height: '16px' }}></progress>
        </div>
      ) : (
        <button
          type="button"
          className="nes-btn is-primary"
          onClick={onLoadMore}
          style={{ 
            fontSize: '0.75rem', 
            padding: '8px 20px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '10px',
            cursor: 'pointer'
          }}
        >
          <i className="nes-icon coin is-small"></i>
          <span>▶ PRESS START / LOAD MORE ({currentCount} of {totalCount})</span>
        </button>
      )}
    </div>
  );
}
