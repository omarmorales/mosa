import React, { useState, useEffect } from 'react';

export default function JarvisDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = import.meta.env.PUBLIC_API_TOKEN || '';
    fetch('https://jarvis-life-tracker-production.up.railway.app/api/summary', {
      headers: {
        'X-API-Token': token
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('API down or unauthorized');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Parse the actual schema from jarvis-life-tracker
  const expensesMXN = data?.last_7_days?.total_spending?.MXN || 0;
  const workouts = data?.last_7_days?.workout_count || 0;

  // Format the MXN expenses cleanly
  const formattedExpenses = `$${expensesMXN.toLocaleString()}`;

  return (
    <section className="nes-container with-title is-dark" style={{ marginBottom: '30px' }}>
      <p className="title">Player Stats (7-Day Log)</p>
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Loading save data...</p>
          <progress className="nes-progress is-primary" value="50" max="100"></progress>
        </div>
      )}

      {error && !loading && (
        <div className="nes-container is-rounded is-error" style={{ backgroundColor: '#212529', color: '#e76e55' }}>
          <p>Failed to load data: {error}</p>
          <p style={{ fontSize: '0.7rem', marginTop: '10px' }}>Could not connect to JARVIS backend.</p>
        </div>
      )}

      {data && !loading && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          
          <a href="/finances" className="nes-container is-dark is-rounded clickable-card" style={{ flex: 1, minWidth: '200px', display: 'block', textDecoration: 'none', color: 'inherit', transition: 'transform 0.1s' }}>
             <p style={{ color: '#fbed64', fontSize: '0.8rem', marginBottom: '15px' }}>MXN Spent <span style={{ fontSize: '0.5rem', color: '#fff' }}>(Details)</span></p>
             <p style={{ fontSize: '1.2rem' }}>{formattedExpenses} <i className="nes-icon coin is-small"></i></p>
          </a>

          <a href="/workouts" className="nes-container is-dark is-rounded clickable-card" style={{ flex: 1, minWidth: '200px', display: 'block', textDecoration: 'none', color: 'inherit', transition: 'transform 0.1s' }}>
             <p style={{ color: '#209cee', fontSize: '0.8rem', marginBottom: '15px' }}>Workouts <span style={{ fontSize: '0.5rem', color: '#fff' }}>(Details)</span></p>
             <p style={{ fontSize: '1.2rem' }}>{workouts} <i className="nes-icon trophy is-small"></i></p>
          </a>

          <div className="nes-container is-dark is-rounded" style={{ flex: 1, minWidth: '200px' }}>
             <p style={{ color: '#92cc41', fontSize: '0.8rem', marginBottom: '15px' }}>System Status</p>
             <p style={{ fontSize: '0.8rem', marginTop: '10px' }}><span style={{ color: '#92cc41' }}>ONLINE</span></p>
          </div>

        </div>
      )}
    </section>
  );
}
