import React, { useState, useEffect } from 'react';
import { analyzeExpenses } from '../lib/analytics.js';

export default function FinanceCharts() {
  const [summaryData, setSummaryData] = useState(null);
  const [expensesData, setExpensesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState({ type: null, value: null });

  useEffect(() => {
    // Parse URL params for drill-down on direct load
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('category')) setFilterQuery({ type: 'category', value: params.get('category') });
      else if (params.get('merchant')) setFilterQuery({ type: 'merchant', value: params.get('merchant') });
    }

    const token = import.meta.env.PUBLIC_API_TOKEN || '';
    const headers = { 'X-API-Token': token };

    Promise.all([
      fetch('https://jarvis-life-tracker-production.up.railway.app/api/summary', { headers }).then(r => r.json()),
      fetch('https://jarvis-life-tracker-production.up.railway.app/api/expenses', { headers }).then(r => r.json())
    ])
      .then(([summary, expenses]) => {
        setSummaryData(summary);
        setExpensesData(expenses);
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
        <p>Loading Financial Data & Running AI Models...</p>
        <progress className="nes-progress is-primary" value="50" max="100"></progress>
      </div>
    );
  }

  if (!summaryData || !expensesData) return <p>Error loading data.</p>;

  const analytics = analyzeExpenses(expensesData);
  const colors = ['is-primary', 'is-success', 'is-warning', 'is-error', 'is-pattern'];

  // --- DETAIL VIEW ---
  if (filterQuery.type) {
    let filteredExpenses = [];
    if (filterQuery.type === 'category') {
      filteredExpenses = expensesData.filter(e => e.category === filterQuery.value);
    } else if (filterQuery.type === 'merchant') {
      filteredExpenses = expensesData.filter(e => e.description?.toLowerCase().includes(filterQuery.value.toLowerCase()));
    }
    
    const filteredTotal = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);

    return (
      <div>
        <button className="nes-btn" onClick={() => {
          setFilterQuery({ type: null, value: null });
          window.history.pushState({}, '', '/finances');
        }} style={{ marginBottom: '20px' }}>&lt; Back to Dashboard</button>
        
        <section className="nes-container with-title is-dark" style={{ marginBottom: '30px' }}>
          <p className="title">Drill-down: {filterQuery.value}</p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div className="nes-container is-dark is-rounded" style={{ flex: 1 }}>
              <p style={{ color: '#fbed64', fontSize: '0.8rem' }}>Total Spent</p>
              <p style={{ fontSize: '1.2rem' }}>${filteredTotal.toLocaleString()} MXN</p>
            </div>
            <div className="nes-container is-dark is-rounded" style={{ flex: 1 }}>
              <p style={{ color: '#209cee', fontSize: '0.8rem' }}>Transactions</p>
              <p style={{ fontSize: '1.2rem' }}>{filteredExpenses.length}</p>
            </div>
            {filteredExpenses.length > 0 && (
              <div className="nes-container is-dark is-rounded" style={{ flex: 1 }}>
                <p style={{ color: '#92cc41', fontSize: '0.8rem' }}>Average / tx</p>
                <p style={{ fontSize: '1.2rem' }}>${Math.round(filteredTotal / filteredExpenses.length).toLocaleString()} MXN</p>
              </div>
            )}
          </div>

          <p style={{ marginTop: '20px', color: '#ff5c5c', fontSize: '0.8rem' }}>Filtered Ledger:</p>
          <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '5px', fontFamily: 'monospace', color: '#0f0', fontSize: '0.7rem', overflowX: 'auto' }}>
            {filteredExpenses.map(exp => (
              <div key={exp.id} style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px', borderBottom: '1px dashed #333', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
                  <span>[{exp.date?.split(' ')[0]}] {exp.category}</span>
                  <span style={{ color: '#ff5c5c' }}>- ${exp.amount} {exp.currency}</span>
                </div>
                <span style={{ opacity: 0.7, marginTop: '4px' }}>Desc: {exp.description}</span>
              </div>
            ))}
            {filteredExpenses.length === 0 && <p>&gt; NO TRANSACTIONS FOUND.</p>}
          </div>
        </section>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  const breakdown = analytics.monthlyBreakdown || {};
  const total = analytics.monthlyTotal || 1;
  const recent = summaryData.recent_expenses || [];

  return (
    <div>
      {/* 1. Finance Guru Storytelling */}
      <section style={{ marginBottom: '40px', marginTop: '20px' }}>
        <p style={{ color: '#209cee', marginBottom: '10px' }}>Financial Advisor Insight</p>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'nowrap' }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <img 
              src="/advisor.png" 
              alt="Advisor" 
              width="130" 
              height="130" 
              fetchpriority="high"
              style={{ width: '130px', height: '130px', imageRendering: 'pixelated' }} 
            />
          </div>
          <div className="nes-balloon from-left is-dark" style={{ flex: 1, padding: '1rem', minWidth: 0 }}>
            <p style={{ fontSize: '0.8rem', lineHeight: '1.6' }}>{analytics.story}</p>
          </div>
        </div>
      </section>

      {/* 2. Merchant Leaderboard & Tiny Purchases */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
        <section className="nes-container with-title is-dark" style={{ flex: 1, minWidth: '250px' }}>
          <p className="title">Merchant Leaderboard</p>
          <ul className="nes-list is-disc" style={{ fontSize: '0.8rem' }}>
            {analytics.merchants.map((m, i) => (
              <li key={m.name} style={{ marginBottom: '10px' }}>
                <a href={`?merchant=${m.name}`} style={{ color: '#fff', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); setFilterQuery({ type: 'merchant', value: m.name }); window.history.pushState({}, '', `?merchant=${m.name}`); }}>
                  <span style={{ color: '#fbed64', cursor: 'pointer', textDecoration: 'underline' }}>#{i+1} {m.name}</span>: ${m.amount.toLocaleString()}
                </a>
              </li>
            ))}
            {analytics.merchants.length === 0 && <li>No top merchants found.</li>}
          </ul>
        </section>

        <section className="nes-container with-title is-dark" style={{ flex: 1, minWidth: '250px' }}>
          <p className="title">Tiny Purchases (&lt;$100)</p>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', color: '#ff5c5c' }}>{analytics.tinyPurchases.count} items</p>
            <p style={{ fontSize: '0.8rem' }}>Totaling: ${analytics.tinyPurchases.total.toLocaleString()} MXN</p>
            <progress className="nes-progress is-error" value={analytics.tinyPurchases.percentage} max="100" style={{ marginTop: '15px', height: '20px' }}></progress>
            <p style={{ fontSize: '0.6rem', marginTop: '5px' }}>{analytics.tinyPurchases.percentage}% of all expenses</p>
          </div>
        </section>
      </div>

      {/* 3. Category Breakdown (Monthly) */}
      <section className="nes-container with-title is-dark" style={{ marginBottom: '30px' }}>
        <p className="title">Category Breakdown (Last 30 Days)</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(breakdown).map(([category, amount], index) => {
            const percentage = Math.round((amount / total) * 100);
            const colorClass = colors[index % colors.length];
            return (
              <div key={category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.8rem' }}>
                  <a href={`?category=${category}`} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); setFilterQuery({ type: 'category', value: category }); window.history.pushState({}, '', `?category=${category}`); }}>
                    <span style={{ textDecoration: 'underline' }}>{category}</span>
                  </a>
                  <span>${amount.toLocaleString()} ({percentage}%)</span>
                </div>
                <progress className={`nes-progress ${colorClass}`} value={percentage} max="100"></progress>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Terminal Ledger */}
      <section className="nes-container with-title is-dark" style={{ marginBottom: '30px' }}>
        <p className="title">Terminal Ledger (Recent)</p>
        <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '5px', fontFamily: 'monospace', color: '#0f0', fontSize: '0.7rem', overflowX: 'auto', lineHeight: '1.8' }}>
          {recent.map(exp => (
            <div key={exp.id} style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px', borderBottom: '1px dashed #333', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
                <span>[{exp.date?.split(' ')[0]}] {exp.category}</span>
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
