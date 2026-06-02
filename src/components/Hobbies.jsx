import React, { useState, useEffect } from 'react';

export default function Hobbies() {
  const [hobbies, setHobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = import.meta.env.PUBLIC_API_TOKEN || '';
    const headers = { 'X-API-Token': token };

    fetch('https://jarvis-life-tracker-production.up.railway.app/api/hobbies', { headers })
      .then(res => {
        if (!res.ok) throw new Error('API down or unauthorized');
        return res.json();
      })
      .then(json => {
        setHobbies(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching hobbies:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const renderIcon = (icon) => {
    if (icon && icon.trim().toLowerCase().startsWith('<svg')) {
      return (
        <div
          style={{ 
            width: '32px', 
            height: '32px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fill: 'currentColor',
            color: '#fff'
          }}
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      );
    }

    const validIcon = icon && icon.trim() !== '' ? icon.trim() : 'star';
    return <i className={`nes-icon ${validIcon} is-medium`}></i>;
  };

  if (loading) {
    return (
      <section className="nes-container with-title is-dark" style={{ marginBottom: '30px' }}>
        <p className="title">Collectibles (Hobbies)</p>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Scanning achievements inventory...</p>
          <progress className="nes-progress is-primary" value="50" max="100"></progress>
        </div>
      </section>
    );
  }

  // If there's an error or no hobbies are found, degrade gracefully
  if (error || hobbies.length === 0) {
    return null; // Don't show the section if there's no data or it fails
  }

  return (
    <section className="nes-container with-title is-dark" style={{ marginBottom: '30px' }}>
      <p className="title">Collectibles (Hobbies)</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px', 
        marginTop: '10px' 
      }}>
        {hobbies.map(hobby => (
          <div 
            key={hobby.id} 
            className="nes-container is-dark is-rounded" 
            style={{ 
              display: 'flex', 
              gap: '15px', 
              alignItems: 'center', 
              padding: '15px',
              backgroundColor: '#1b1d1f' 
            }}
          >
            {/* Left: Dynamic Icon */}
            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', width: '40px' }}>
              {renderIcon(hobby.icon)}
            </div>

            {/* Right: Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '5px' }}>
                <h4 style={{ fontSize: '0.75rem', margin: 0, color: '#fbed64', wordBreak: 'break-word' }}>{hobby.name}</h4>
                {hobby.category && (
                  <span style={{ 
                    fontSize: '0.5rem', 
                    padding: '2px 6px', 
                    backgroundColor: '#209cee', 
                    borderRadius: '2px', 
                    color: '#fff',
                    textTransform: 'uppercase'
                  }}>
                    {hobby.category}
                  </span>
                )}
              </div>
              {hobby.description && (
                <p style={{ fontSize: '0.6rem', color: '#ccc', margin: '8px 0 0 0', lineHeight: '1.4', wordBreak: 'break-word' }}>
                  {hobby.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
