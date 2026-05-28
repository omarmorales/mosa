import React, { useState, useEffect } from 'react';

// Code-split FinanceCharts so the browser NEVER downloads its JS chunk (or API URLs)
// until the user is successfully authenticated!
const FinanceCharts = React.lazy(() => import('./FinanceCharts.jsx'));

// Helper function to hash string with SHA-256 using native Web Crypto API
async function hashPin(pinString) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pinString);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function AuthGate() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('finance_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Default fallback SHA-256 hash is for '1234':
    // "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"
    const targetHash = import.meta.env.PUBLIC_FINANCE_HASH || "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";
    
    const enteredHash = await hashPin(pin);
    
    if (enteredHash === targetHash) {
      sessionStorage.setItem('finance_auth', 'true');
      setIsAuthenticated(true);
    } else {
      setError(true);
      setPin('');
    }
  };

  if (isAuthenticated) {
    return (
      <React.Suspense fallback={
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Decrypting Data Modules...</p>
          <progress className="nes-progress is-primary" value="50" max="100"></progress>
        </div>
      }>
        <FinanceCharts />
      </React.Suspense>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', marginBottom: '100px' }}>
      <i className="nes-icon close is-large" style={{ marginBottom: '20px' }}></i>
      <h2 style={{ color: '#ff5c5c', marginBottom: '20px' }}>RESTRICTED ACCESS</h2>
      <p style={{ marginBottom: '30px', fontSize: '0.8rem' }}>Please enter the administrator PIN to view classified financial data.</p>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <div className={`nes-field ${error ? 'is-error' : ''}`} style={{ maxWidth: '300px', width: '100%' }}>
          <input 
            type="password" 
            id="pin_field" 
            className={`nes-input is-dark ${error ? 'is-error' : ''}`} 
            placeholder="****" 
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(false); }}
            autoFocus
          />
        </div>
        {error && <span style={{ color: '#ff5c5c', fontSize: '0.7rem' }}>ACCESS DENIED</span>}
        <button type="submit" className={`nes-btn ${error ? 'is-error' : 'is-primary'}`} style={{ marginTop: '10px' }}>
          {error ? 'RETRY' : 'UNLOCK'}
        </button>
      </form>
    </div>
  );
}

