import React, { useState, useEffect } from 'react';
import FinanceCharts from './FinanceCharts.jsx';

export default function AuthGate() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check if already authenticated in this session
    if (sessionStorage.getItem('finance_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    // In Astro, env variables with PUBLIC_ are available via import.meta.env
    // We use a fallback '1234' just in case the env isn't loaded correctly
    const secretPin = import.meta.env.PUBLIC_FINANCE_PIN || '1234';
    
    if (pin === secretPin) {
      sessionStorage.setItem('finance_auth', 'true');
      setIsAuthenticated(true);
    } else {
      setError(true);
      setPin('');
    }
  };

  if (isAuthenticated) {
    return <FinanceCharts />;
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
