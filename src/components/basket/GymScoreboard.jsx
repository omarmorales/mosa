import React from 'react';
import { formatMXN } from '../../lib/basketApi.js';

export default function GymScoreboard({ tournamentData }) {
  if (!tournamentData) return null;

  const { tournament, financials, record, matches } = tournamentData;
  const lastMatch = matches && matches.length > 0 ? matches[0] : null;

  const winsStr = String(record?.wins ?? 0).padStart(2, '0');
  const lossesStr = String(record?.losses ?? 0).padStart(2, '0');
  const matchesPlayed = record?.total_matches ?? 0;

  return (
    <div className="gym-scoreboard-container">
      {/* Scoreboard Bezel */}
      <div className="scoreboard-bezel">
        
        {/* Top Header Bar */}
        <div className="scoreboard-header">
          <div className="status-indicator">
            <span className="blinking-led"></span>
            <span className="status-text">{tournament?.status?.toUpperCase() || 'ACTIVE'} LEAGUE</span>
          </div>

          <h2 className="scoreboard-title">
            ★ {tournament?.name || 'BASKETBALL TOURNAMENT'} ★
          </h2>

          <div className="team-badge">
            TEAM: <span className="team-highlight">{tournament?.team_name?.toUpperCase() || 'TOROS'}</span>
          </div>
        </div>

        {/* Main LED Digits Display Grid */}
        <div className="scoreboard-main-grid">
          
          {/* HOME / WINS PANEL */}
          <div className="score-panel home-panel">
            <div className="panel-label">WINS</div>
            <div className="led-digit led-win">{winsStr}</div>
            <div className="panel-sublabel">GAMES WON</div>
          </div>

          {/* CENTER PERIOD & SHOT CLOCK PANEL */}
          <div className="score-panel center-panel">
            <div className="period-box">
              <div className="panel-label">GAMES PLAYED</div>
              <div className="led-digit led-period">{String(matchesPlayed).padStart(2, '0')}</div>
            </div>

            <div className="shot-clock-box">
              <div className="shot-clock-label">TEAM QUOTA %</div>
              <div className="led-digit led-shotclock">
                {financials?.percentage_collected?.toFixed(1) || '0.0'}%
              </div>
            </div>
          </div>

          {/* GUEST / LOSSES PANEL */}
          <div className="score-panel guest-panel">
            <div className="panel-label">LOSSES</div>
            <div className="led-digit led-loss">{lossesStr}</div>
            <div className="panel-sublabel">GAMES LOST</div>
          </div>

        </div>

        {/* Sub-Panel: Financial Summary LED Grid */}
        <div className="scoreboard-financial-subpanel">
          <div className="subpanel-stat">
            <span className="sub-label">TOTAL BUDGET</span>
            <span className="sub-digit led-amber">{formatMXN(financials?.total_cost)}</span>
          </div>

          <div className="subpanel-stat">
            <span className="sub-label">COLLECTED COINS</span>
            <span className="sub-digit led-green">{formatMXN(financials?.total_collected)}</span>
          </div>

          <div className="subpanel-stat">
            <span className="sub-label">PENDING BALANCE</span>
            <span className="sub-digit led-red">{formatMXN(financials?.total_pending)}</span>
          </div>
        </div>

        {/* Bottom Ticker: Last Match Result */}
        {lastMatch && (
          <div className="scoreboard-ticker">
            <div className="ticker-label">LATEST GAME:</div>
            <div className="ticker-content">
              <span>{tournament?.team_name || 'TOROS'} <strong>{lastMatch.team_score}</strong></span>
              <span style={{ color: '#888' }}>-</span>
              <span><strong>{lastMatch.opponent_score}</strong> {lastMatch.opponent}</span>
              <span className={`match-badge ${lastMatch.is_win ? 'is-win' : 'is-loss'}`}>
                {lastMatch.is_win ? 'VICTORY 🏆' : 'DEFEAT 💀'}
              </span>
            </div>
          </div>
        )}

      </div>

      <style>{`
        .gym-scoreboard-container {
          margin-bottom: 35px;
          filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.7));
        }

        .scoreboard-bezel {
          background-color: #0c0d10;
          border: 4px solid #333842;
          border-radius: 8px;
          padding: 16px;
          position: relative;
          box-shadow: inset 0 0 15px rgba(0,0,0,0.9), 0 0 0 2px #111;
          font-family: 'Press Start 2P', monospace;
        }

        /* LED Texture Overlay */
        .scoreboard-bezel::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(rgba(255, 255, 255, 0.03) 15%, transparent 15%);
          background-size: 4px 4px;
          pointer-events: none;
          opacity: 0.6;
        }

        .scoreboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          border-bottom: 2px dashed #2a2e39;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }

        .scoreboard-title {
          color: #fbed64;
          font-size: 0.95rem;
          margin: 0;
          text-align: center;
          text-shadow: 0 0 8px rgba(251, 237, 100, 0.5);
          flex: 1 1 100%;
          order: 1;
        }

        @media (min-width: 680px) {
          .scoreboard-title {
            flex: 1;
            order: 0;
          }
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.6rem;
          color: #92cc41;
        }

        .blinking-led {
          width: 10px;
          height: 10px;
          background-color: #92cc41;
          border-radius: 50%;
          box-shadow: 0 0 8px #92cc41;
          animation: ledBlink 1.2s step-end infinite;
        }

        @keyframes ledBlink {
          50% { opacity: 0.2; }
        }

        .team-badge {
          font-size: 0.65rem;
          color: #888;
        }

        .team-highlight {
          color: #209cee;
          text-shadow: 0 0 6px #209cee;
        }

        /* Main Digit Grid */
        .scoreboard-main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        @media (min-width: 600px) {
          .scoreboard-main-grid {
            grid-template-columns: 1.2fr 1.6fr 1.2fr;
          }
        }

        .score-panel {
          background-color: #050608;
          border: 2px solid #20242c;
          border-radius: 6px;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .center-panel {
          grid-column: span 2;
          display: flex;
          flex-direction: row;
          justify-content: space-around;
          align-items: center;
          gap: 10px;
        }

        @media (min-width: 600px) {
          .center-panel {
            grid-column: span 1;
          }
        }

        .panel-label {
          font-size: 0.55rem;
          color: #8a909d;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }

        .panel-sublabel {
          font-size: 0.45rem;
          color: #555c68;
          margin-top: 6px;
        }

        .led-digit {
          font-size: 2.2rem;
          line-height: 1;
          letter-spacing: 2px;
          padding: 4px 8px;
          border-radius: 4px;
          background-color: #000;
          display: inline-block;
          border: 1px solid #1a1a1a;
        }

        .led-win {
          color: #4ade80;
          text-shadow: 0 0 12px rgba(74, 222, 128, 0.7);
        }

        .led-loss {
          color: #f87171;
          text-shadow: 0 0 12px rgba(248, 113, 113, 0.7);
        }

        .led-period {
          color: #38bdf8;
          text-shadow: 0 0 12px rgba(56, 189, 248, 0.7);
          font-size: 1.5rem;
        }

        .shot-clock-label {
          font-size: 0.5rem;
          color: #fbbf24;
          margin-bottom: 4px;
        }

        .led-shotclock {
          color: #fbbf24;
          text-shadow: 0 0 12px rgba(251, 191, 36, 0.7);
          font-size: 1.1rem;
        }

        /* Financial subpanel */
        .scoreboard-financial-subpanel {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 8px;
          background-color: #050608;
          border: 1px solid #20242c;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .subpanel-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          text-align: center;
        }

        .sub-label {
          font-size: 0.48rem;
          color: #717682;
        }

        .sub-digit {
          font-size: 0.8rem;
          font-weight: bold;
        }

        .led-amber { color: #fbed64; text-shadow: 0 0 6px rgba(251, 237, 100, 0.4); }
        .led-green { color: #92cc41; text-shadow: 0 0 6px rgba(146, 204, 65, 0.4); }
        .led-red { color: #e76e55; text-shadow: 0 0 6px rgba(231, 110, 85, 0.4); }

        /* Ticker */
        .scoreboard-ticker {
          background-color: #000;
          border: 1px solid #222;
          padding: 8px 12px;
          border-radius: 4px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 0.55rem;
        }

        .ticker-label {
          color: #fbed64;
          letter-spacing: 1px;
        }

        .ticker-content {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .match-badge {
          font-size: 0.5rem;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .match-badge.is-win {
          background-color: #224b1d;
          color: #92cc41;
          border: 1px solid #92cc41;
        }

        .match-badge.is-loss {
          background-color: #4b1d1d;
          color: #e76e55;
          border: 1px solid #e76e55;
        }
      `}</style>
    </div>
  );
}
