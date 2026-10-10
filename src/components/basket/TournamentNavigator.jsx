import React from 'react';

/**
 * Option 4: Hybrid Stepper + Retro Dropdown Selector
 * Compact 1-line responsive navigation for switching tournaments
 */
export default function TournamentNavigator({ tournaments = [], selectedIndex = 0, onSelectIndex }) {
  if (!tournaments || tournaments.length <= 1) return null;

  const total = tournaments.length;
  const currentTournament = tournaments[selectedIndex];

  const handlePrev = () => {
    const nextIdx = (selectedIndex - 1 + total) % total;
    onSelectIndex(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (selectedIndex + 1) % total;
    onSelectIndex(nextIdx);
  };

  const handleChange = (e) => {
    const newIdx = parseInt(e.target.value, 10);
    if (!isNaN(newIdx)) {
      onSelectIndex(newIdx);
    }
  };

  return (
    <div className="tournament-hybrid-navigator">
      
      {/* Top Header Label */}
      <div className="navigator-header">
        <span className="navigator-title">
          🎮 WORLD SELECT ({selectedIndex + 1} / {total})
        </span>
        {currentTournament?.record?.formatted && (
          <span className="navigator-record">
            RECORD: {currentTournament.record.formatted}
          </span>
        )}
      </div>

      {/* Stepper + Select Bar */}
      <div className="navigator-controls">
        
        {/* Previous Button */}
        <button
          type="button"
          className="nes-btn is-primary nav-stepper-btn"
          onClick={handlePrev}
          title="Previous Tournament"
          aria-label="Previous Tournament"
        >
          <span className="btn-arrow">◀</span>
          <span className="btn-text"> PREV</span>
        </button>

        {/* Center Retro Select Box */}
        <div className="nes-select is-dark nav-select-wrapper">
          <select 
            id="tournament_select"
            value={selectedIndex} 
            onChange={handleChange}
            aria-label="Select Tournament"
          >
            {tournaments.map((t, idx) => {
              const statusTag = t.tournament?.status === 'active' ? '● ACTIVE' : '🏁 ENDED';
              const name = t.tournament?.name || `Tournament #${t.tournament?.id || idx + 1}`;
              const record = t.record?.formatted ? `[${t.record.formatted}]` : '';
              return (
                <option key={t.tournament?.id || idx} value={idx}>
                  W{idx + 1}: {name} {record} ({statusTag})
                </option>
              );
            })}
          </select>
        </div>

        {/* Next Button */}
        <button
          type="button"
          className="nes-btn is-primary nav-stepper-btn"
          onClick={handleNext}
          title="Next Tournament"
          aria-label="Next Tournament"
        >
          <span className="btn-text">NEXT </span>
          <span className="btn-arrow">▶</span>
        </button>

      </div>

      <style>{`
        .tournament-hybrid-navigator {
          background-color: #15171d;
          border: 2px solid #2e3440;
          border-radius: 6px;
          padding: 12px 14px;
          margin-bottom: 25px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }

        .navigator-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.55rem;
          margin-bottom: 10px;
          flex-wrap: wrap;
          gap: 6px;
        }

        .navigator-title {
          color: #fbed64;
          letter-spacing: 1px;
        }

        .navigator-record {
          color: #92cc41;
        }

        .navigator-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .nav-stepper-btn {
          padding: 0 10px !important;
          height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          flex-shrink: 0;
        }

        .nav-select-wrapper {
          flex: 1;
          margin: 0;
        }

        .nav-select-wrapper select {
          height: 48px;
          font-size: 0.65rem !important;
          font-family: 'Press Start 2P', monospace !important;
          padding-left: 10px !important;
          padding-right: 30px !important;
          background-color: #0c0d10 !important;
          color: #ffffff !important;
          border: 2px solid #3b4252 !important;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }

        .btn-text {
          display: none;
        }

        @media (min-width: 600px) {
          .btn-text {
            display: inline;
          }
          .nav-stepper-btn {
            padding: 0 14px !important;
          }
        }
      `}</style>
    </div>
  );
}
