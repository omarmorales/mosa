import React, { useState, useEffect } from 'react';
import { getCurrentMonthStats } from '../lib/analytics.js';

export default function JarvisDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = import.meta.env.PUBLIC_API_TOKEN || '';
    const headers = { 'X-API-Token': token };

    Promise.all([
      fetch('https://jarvis-life-tracker-production.up.railway.app/api/summary', { headers }).then(r => r.ok ? r.json() : null),
      fetch('https://jarvis-life-tracker-production.up.railway.app/api/expenses', { headers }).then(r => r.ok ? r.json() : null),
      fetch('https://jarvis-life-tracker-production.up.railway.app/api/workouts', { headers }).then(r => r.ok ? r.json() : null)
    ])
      .then(([summary, expenses, workouts]) => {
        setData({ summary, expenses, workouts });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const expensesList = data?.expenses || data?.summary?.recent_expenses || [];
  const workoutsList = data?.workouts || data?.summary?.recent_workouts || [];

  const monthStats = getCurrentMonthStats(expensesList, workoutsList);
  const formattedExpenses = `$${monthStats.expensesTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <section className="nes-container with-title is-dark" style={{ marginBottom: '30px' }}>
      <p className="title">Player Stats ({monthStats.monthName})</p>
      
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
             <p style={{ color: '#fbed64', fontSize: '0.8rem', marginBottom: '15px' }}>MXN Spent ({monthStats.monthName}) <span style={{ fontSize: '0.5rem', color: '#fff' }}>(Details)</span></p>
             <p style={{ fontSize: '1.2rem' }}>{formattedExpenses} <i className="nes-icon coin is-small"></i></p>
             <p style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '8px' }}>{monthStats.expensesCount} transactions</p>
          </a>

          <a href="/workouts" className="nes-container is-dark is-rounded clickable-card" style={{ flex: 1, minWidth: '200px', display: 'block', textDecoration: 'none', color: 'inherit', transition: 'transform 0.1s' }}>
             <p style={{ color: '#209cee', fontSize: '0.8rem', marginBottom: '15px' }}>Workouts ({monthStats.monthName}) <span style={{ fontSize: '0.5rem', color: '#fff' }}>(Details)</span></p>
             <p style={{ fontSize: '1.2rem' }}>{monthStats.workoutCount} <i className="nes-icon trophy is-small"></i></p>
             <p style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '8px' }}>{monthStats.workoutMinutes} active mins</p>
          </a>

          <div className="nes-container is-dark is-rounded" style={{ flex: 1, minWidth: '200px' }}>
             <p style={{ color: '#92cc41', fontSize: '0.8rem', marginBottom: '15px' }}>System Status</p>
             <p style={{ fontSize: '0.8rem', marginTop: '10px' }}><span style={{ color: '#92cc41' }}>ONLINE</span></p>
             <p style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '8px' }}>{monthStats.currentYM} synced</p>
          </div>

        </div>
      )}
    </section>
  );
}

