import React, { useState, useEffect } from 'react';

export default function JarvisDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://jarvis-life-tracker-production.up.railway.app/api/summary')
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

  // Safe extractors based on common JSON structures
  const expenses = data?.expenses_total || data?.total_expenses || data?.expenses || '???';
  const workouts = data?.workouts_count || data?.total_workouts || data?.workouts || '???';

  return (
    <section className="nes-container with-title is-dark" style={{ marginBottom: '30px' }}>
      <p className="title">Player Stats (Live API)</p>
      
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
          
          <div className="nes-container is-dark is-rounded" style={{ flex: 1, minWidth: '200px' }}>
             <p style={{ color: '#fbed64', fontSize: '0.8rem', marginBottom: '15px' }}>Expenses</p>
             <p style={{ fontSize: '1.2rem' }}>{String(expenses)} <i className="nes-icon coin is-small"></i></p>
          </div>

          <div className="nes-container is-dark is-rounded" style={{ flex: 1, minWidth: '200px' }}>
             <p style={{ color: '#209cee', fontSize: '0.8rem', marginBottom: '15px' }}>Workouts</p>
             <p style={{ fontSize: '1.2rem' }}>{String(workouts)} <i className="nes-icon trophy is-small"></i></p>
          </div>

          <div className="nes-container is-dark is-rounded" style={{ flex: 1, minWidth: '200px' }}>
             <p style={{ color: '#92cc41', fontSize: '0.8rem', marginBottom: '15px' }}>System Status</p>
             <p style={{ fontSize: '0.8rem', marginTop: '10px' }}><span style={{ color: '#92cc41' }}>ONLINE</span></p>
          </div>

        </div>
      )}
    </section>
  );
}
