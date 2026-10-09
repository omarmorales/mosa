import React from 'react';
import { formatMXN } from '../../lib/basketApi.js';

export default function TournamentFinancials({ tournamentData }) {
  if (!tournamentData) return null;

  const { tournament, financials } = tournamentData;
  const percent = Math.min(100, Math.max(0, financials?.percentage_collected ?? 0));

  // Determine progress bar color theme
  let progressClass = "is-error";
  if (percent >= 100) progressClass = "is-success";
  else if (percent >= 50) progressClass = "is-warning";

  return (
    <section className="nes-container with-title is-dark" style={{ marginBottom: '35px' }}>
      <p className="title" style={{ color: '#fbed64', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <i className="nes-icon coin is-small"></i>
        Tournament Coin Vault & Budget
      </p>

      {/* Main HP/Coin Progress Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.65rem' }}>
          <span>COLLECTION PROGRESS</span>
          <span style={{ color: percent >= 100 ? '#92cc41' : '#fbed64' }}>
            {formatMXN(financials?.total_collected)} / {formatMXN(financials?.total_cost)} ({percent.toFixed(1)}%)
          </span>
        </div>

        <progress 
          className={`nes-progress ${progressClass}`} 
          value={percent} 
          max="100" 
          style={{ height: '24px', width: '100%' }}
        />
      </div>

      {/* Detailed Budget Breakdown Cards */}
      <div className="vault-grid">
        
        {/* Registration Fee */}
        <div className="vault-card">
          <div className="vault-card-header">
            <span className="vault-icon">📋</span>
            <span className="vault-label">REGISTRATION</span>
          </div>
          <div className="vault-amount" style={{ color: '#209cee' }}>
            {formatMXN(tournament?.registration_fee)}
          </div>
          <div className="vault-desc">Inscripción del equipo</div>
        </div>

        {/* Referee Fees */}
        <div className="vault-card">
          <div className="vault-card-header">
            <span className="vault-icon">🏁</span>
            <span className="vault-label">REFEREE POOL</span>
          </div>
          <div className="vault-amount" style={{ color: '#e76e55' }}>
            {formatMXN(tournament?.referee_fee_total)}
          </div>
          <div className="vault-desc">Bolsa de arbitrajes</div>
        </div>

        {/* Collected */}
        <div className="vault-card">
          <div className="vault-card-header">
            <span className="vault-icon">💰</span>
            <span className="vault-label">COLLECTED</span>
          </div>
          <div className="vault-amount" style={{ color: '#92cc41' }}>
            {formatMXN(financials?.total_collected)}
          </div>
          <div className="vault-desc">Total pagado por jugadores</div>
        </div>

        {/* Pending */}
        <div className="vault-card">
          <div className="vault-card-header">
            <span className="vault-icon">⏳</span>
            <span className="vault-label">PENDING</span>
          </div>
          <div className="vault-amount" style={{ color: '#fbed64' }}>
            {formatMXN(financials?.total_pending)}
          </div>
          <div className="vault-desc">Saldo restante por cobrar</div>
        </div>

      </div>

      <style>{`
        .vault-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }

        .vault-card {
          background-color: #1a1c23;
          border: 2px solid #2e3440;
          border-radius: 4px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: transform 0.1s steps(2);
        }

        .vault-card:hover {
          transform: translateY(-2px);
          border-color: #4c566a;
        }

        .vault-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .vault-icon {
          font-size: 1rem;
        }

        .vault-label {
          font-size: 0.55rem;
          color: #8892b0;
          letter-spacing: 1px;
        }

        .vault-amount {
          font-size: 1rem;
          font-weight: bold;
        }

        .vault-desc {
          font-size: 0.45rem;
          color: #64748b;
          line-height: 1.3;
        }
      `}</style>
    </section>
  );
}
