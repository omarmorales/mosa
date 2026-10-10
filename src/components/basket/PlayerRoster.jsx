import React, { useState } from 'react';
import { formatMXN } from '../../lib/basketApi.js';
import PixelJersey from './PixelJersey.jsx';

export default function PlayerRoster({ activePlayers = [], inactivePlayers = [] }) {
  const [filter, setFilter] = useState('all'); // 'all', 'paid', 'pending', 'inactive'
  const [expandedPlayer, setExpandedPlayer] = useState(null);

  const paidCount = activePlayers.filter(p => p.is_paid_off).length;
  const pendingCount = activePlayers.filter(p => !p.is_paid_off).length;
  const inactiveCount = inactivePlayers.length;

  const filteredActive = activePlayers.filter(p => {
    if (filter === 'paid') return p.is_paid_off;
    if (filter === 'pending') return !p.is_paid_off;
    return true;
  });

  const togglePlayerAccordion = (playerId) => {
    setExpandedPlayer(expandedPlayer === playerId ? null : playerId);
  };

  return (
    <section className="nes-container with-title is-dark" style={{ marginBottom: '35px' }}>
      <p className="title" style={{ color: '#209cee', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <i className="nes-icon trophy is-small"></i>
        Player Roster & Payment Meters
      </p>

      {/* Filter Tabs */}
      <div className="roster-filter-bar">
        <button 
          type="button" 
          className={`nes-btn is-small ${filter === 'all' ? 'is-primary' : ''}`}
          onClick={() => setFilter('all')}
        >
          ALL ({activePlayers.length})
        </button>

        <button 
          type="button" 
          className={`nes-btn is-small ${filter === 'paid' ? 'is-success' : ''}`}
          onClick={() => setFilter('paid')}
        >
          ★ PAID ({paidCount})
        </button>

        <button 
          type="button" 
          className={`nes-btn is-small ${filter === 'pending' ? 'is-warning' : ''}`}
          onClick={() => setFilter('pending')}
        >
          DUE ({pendingCount})
        </button>

        {inactiveCount > 0 && (
          <button 
            type="button" 
            className={`nes-btn is-small ${filter === 'inactive' ? 'is-error' : ''}`}
            onClick={() => setFilter('inactive')}
          >
            BENCH ({inactiveCount})
          </button>
        )}
      </div>

      {/* Active Players Grid */}
      {filter !== 'inactive' && (
        <div className="player-grid">
          {filteredActive.map((player) => {
            const quota = player.assigned_quota || 3000;
            const paid = player.total_paid || 0;
            const percent = Math.min(100, Math.round((paid / quota) * 100));
            const isExpanded = expandedPlayer === player.player_id;
            const payments = player.payments || [];
            
            // Strictly check jersey_number (supporting number 0, null, or string)
            const hasJersey = player.jersey_number !== null && player.jersey_number !== undefined && String(player.jersey_number).trim() !== '';

            return (
              <div 
                key={player.player_id || player.name} 
                className={`player-card ${player.is_paid_off ? 'is-paid-card' : 'is-pending-card'}`}
              >
                {/* Header with Avatar & Status */}
                <div className="player-card-header">
                  <div className="player-identity">
                    <PixelJersey 
                      number={hasJersey ? player.jersey_number : '?'} 
                      size={38} 
                      jerseyColor="#121418"
                      numberColor="#ffffff"
                    />
                    <div>
                      <h4 className="player-name">{player.name}</h4>
                      <span className="player-subinfo">
                        QUOTA: {formatMXN(quota)}
                      </span>
                    </div>
                  </div>

                  <div className="player-status-badge">
                    {player.is_paid_off ? (
                      <span className="badge-paid">★ 1-UP PAID</span>
                    ) : (
                      <span className="badge-due">DUE: {formatMXN(player.balance_due)}</span>
                    )}
                  </div>
                </div>

                {/* HP / Payment Progress Bar */}
                <div className="player-meter-section">
                  <div className="meter-labels">
                    <span>PAID: {formatMXN(paid)}</span>
                    <span style={{ color: player.is_paid_off ? '#92cc41' : '#fbed64' }}>{percent}%</span>
                  </div>

                  <div className="retro-custom-progress">
                    <div 
                      className={`progress-fill ${player.is_paid_off ? 'fill-success' : 'fill-warning'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Payments Accordion Toggle */}
                {payments.length > 0 && (
                  <div className="payment-history-toggle">
                    <button 
                      type="button" 
                      className="accordion-btn"
                      onClick={() => togglePlayerAccordion(player.player_id)}
                    >
                      <span>📜 {payments.length} PAYMENT{payments.length > 1 ? 'S' : ''} LOG</span>
                      <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▼</span>
                    </button>

                    {isExpanded && (
                      <div className="payments-log-container">
                        {payments.map((p, pIdx) => (
                          <div key={pIdx} className="payment-log-item">
                            <div className="payment-log-meta">
                              <span className="payment-date">📅 {p.date}</span>
                              <span className="payment-method">
                                {p.payment_method === 'transferencia' ? '💳 Transferencia' : '💵 Efectivo'}
                              </span>
                            </div>
                            <span className="payment-amount">+{formatMXN(p.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Inactive Players Section */}
      {(filter === 'inactive' || (filter === 'all' && inactivePlayers.length > 0)) && (
        <div style={{ marginTop: filter === 'all' ? '28px' : '0' }}>
          <h4 style={{ color: '#888', fontSize: '0.75rem', marginBottom: '14px', letterSpacing: '1px' }}>
            💀 BENCH / INACTIVE PLAYERS ({inactivePlayers.length})
          </h4>

          <div className="inactive-grid">
            {inactivePlayers.map((inact, idx) => (
              <div key={idx} className="inactive-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#aaa', fontSize: '0.75rem' }}>{inact.name}</span>
                  <span className="badge-inactive">{inact.status || 'DROPPED'}</span>
                </div>
                <div style={{ fontSize: '0.55rem', color: '#666', marginTop: '6px' }}>
                  Paid: {formatMXN(inact.total_paid)} | Due: {formatMXN(inact.balance_due)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .roster-filter-bar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .player-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 640px) {
          .player-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .player-card {
          background-color: #1a1c23;
          border: 2px solid #2e3440;
          border-radius: 6px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.1s steps(2);
        }

        .player-card:hover {
          transform: translateY(-3px);
          border-color: #434c5e;
        }

        .is-paid-card {
          border-left: 4px solid #92cc41;
        }

        .is-pending-card {
          border-left: 4px solid #fbed64;
        }

        .player-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .player-identity {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .player-jersey {
          width: 34px;
          height: 34px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: bold;
          border: 2px solid #000;
          box-shadow: 2px 2px 0px rgba(0,0,0,0.5);
          flex-shrink: 0;
          user-select: none;
        }

        .player-jersey.has-jersey {
          background-color: #209cee;
          color: #fff;
        }

        .player-jersey.no-jersey {
          background-color: #212529;
          color: #fbed64;
          border: 2px dashed #4e5566;
          box-shadow: 1px 1px 0px rgba(0,0,0,0.4);
          font-size: 0.85rem;
        }

        .player-name {
          margin: 0 0 4px 0;
          font-size: 0.85rem;
          color: #fff;
        }

        .player-subinfo {
          font-size: 0.5rem;
          color: #8892b0;
        }

        .player-status-badge {
          font-size: 0.55rem;
        }

        .badge-paid {
          background-color: #224b1d;
          color: #92cc41;
          border: 1px solid #92cc41;
          padding: 3px 6px;
          border-radius: 3px;
          display: inline-block;
        }

        .badge-due {
          background-color: #4b361d;
          color: #fbed64;
          border: 1px solid #fbed64;
          padding: 3px 6px;
          border-radius: 3px;
          display: inline-block;
        }

        .badge-inactive {
          background-color: #333;
          color: #888;
          border: 1px solid #555;
          padding: 2px 6px;
          font-size: 0.5rem;
          border-radius: 3px;
        }

        /* Retro Progress Bar */
        .player-meter-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .meter-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.55rem;
          color: #8a909d;
        }

        .retro-custom-progress {
          width: 100%;
          height: 14px;
          background-color: #0b0c0e;
          border: 1px solid #333;
          border-radius: 2px;
          overflow: hidden;
          padding: 1px;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s steps(10);
        }

        .fill-success {
          background: linear-gradient(90deg, #4ade80, #92cc41);
        }

        .fill-warning {
          background: linear-gradient(90deg, #fbbf24, #f59e0b);
        }

        /* Payment logs */
        .payment-history-toggle {
          border-top: 1px dashed #2e3440;
          padding-top: 10px;
        }

        .accordion-btn {
          width: 100%;
          background: none;
          border: none;
          color: #8892b0;
          font-family: inherit;
          font-size: 0.55rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          cursor: pointer;
        }

        .accordion-btn:hover {
          color: #fbed64;
        }

        .payments-log-container {
          margin-top: 8px;
          background-color: #0d0f12;
          border: 1px solid #222;
          border-radius: 4px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .payment-log-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.5rem;
          border-bottom: 1px solid #1a1a1a;
          padding-bottom: 4px;
        }

        .payment-log-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .payment-log-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .payment-date {
          color: #aaa;
        }

        .payment-method {
          color: #717682;
        }

        .payment-amount {
          color: #92cc41;
          font-weight: bold;
        }

        .inactive-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .inactive-card {
          background-color: #121316;
          border: 1px dashed #333;
          border-radius: 4px;
          padding: 10px;
        }
      `}</style>
    </section>
  );
}
