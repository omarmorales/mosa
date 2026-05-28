import React, { useState, useEffect } from 'react';

export default function FinanceCharts() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://jarvis-life-tracker-production.up.railway.app/api/summary')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading Financial Data...</p>
        <progress className="nes-progress is-primary" value="50" max="100"></progress>
      </div>
    );
  }

  if (!data) return <p>Error loading data.</p>;

  const breakdown = data.last_7_days?.spending_breakdown || {};
  const total = data.last_7_days?.total_spending?.MXN || 1;
  const recent = data.recent_expenses || [];

  // Colors for retro bars
  const colors = ['is-primary', 'is-success', 'is-warning', 'is-error', 'is-pattern'];

  return (
    <div>
      <section className="nes-container with-title is-dark" style={{ marginBottom: '30px' }}>
        <p className="title">Category Breakdown (7 Days)</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(breakdown).map(([category, amount], index) => {
            const percentage = Math.round((amount / total) * 100);
            const colorClass = colors[index % colors.length];
            return (
              <div key={category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.8rem' }}>
                  <span>{category}</span>
                  <span>${amount.toLocaleString()} ({percentage}%)</span>
                </div>
                <progress className={`nes-progress ${colorClass}`} value={percentage} max="100"></progress>
              </div>
            );
          })}
        </div>
      </section>

      <section className="nes-container with-title is-dark" style={{ marginBottom: '30px' }}>
        <p className="title">Terminal Ledger</p>
        <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '5px', fontFamily: 'monospace', color: '#0f0', fontSize: '0.7rem', overflowX: 'auto', lineHeight: '1.8' }}>
          {recent.map(exp => (
            <div key={exp.id} style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px', borderBottom: '1px dashed #333', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
                <span>[{exp.date}] {exp.category}</span>
                <span style={{ color: '#ff5c5c' }}>- ${exp.amount} {exp.currency}</span>
              </div>
              <span style={{ opacity: 0.7, marginTop: '4px' }}>Desc: {exp.description}</span>
            </div>
          ))}
          {recent.length === 0 && <p>&gt; NO RECENT TRANSACTIONS FOUND.</p>}
          <p style={{ marginTop: '10px' }}>&gt; END OF LOG</p>
        </div>
      </section>
    </div>
  );
}
