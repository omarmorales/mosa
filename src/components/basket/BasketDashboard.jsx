import React, { useState, useEffect } from 'react';
import { fetchTournaments } from '../../lib/basketApi.js';
import GymScoreboard from './GymScoreboard.jsx';
import TournamentFinancials from './TournamentFinancials.jsx';
import PlayerRoster from './PlayerRoster.jsx';
import MatchHistory from './MatchHistory.jsx';

export default function BasketDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

  const loadData = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setLoading(true);

    try {
      const result = await fetchTournaments();
      setTournaments(result.data || []);
      setApiError(result.error || null);
    } catch (err) {
      console.error(err);
      setApiError(err.message);
      setTournaments([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeTournament = tournaments[selectedIndex] || null;

  return (
    <div className="basket-dashboard-root">
      {/* Top Controls & Status Bar */}
      <div className="dashboard-control-bar">
        <div className="status-badge-container">
          <span className="status-pill is-live">
            ● LIVE LEAGUE SYNC
          </span>
          {activeTournament?.tournament?.playoff_seed && (
            <span className="seed-badge">
              SEED #{activeTournament.tournament.playoff_seed}
            </span>
          )}
        </div>

        <button 
          type="button" 
          className={`nes-btn is-small ${isRefreshing ? 'is-disabled' : 'is-primary'}`}
          onClick={() => loadData(true)}
          disabled={isRefreshing}
          style={{ fontSize: '0.6rem' }}
        >
          {isRefreshing ? 'SYNCING...' : '🔄 REFRESH'}
        </button>
      </div>

      {/* Multiple Tournaments Selector (World Selection) */}
      {tournaments.length > 1 && (
        <div className="tournament-selector-bar">
          <span className="selector-title">WORLD SELECT:</span>
          <div className="selector-buttons">
            {tournaments.map((t, idx) => (
              <button
                key={t.tournament?.id || idx}
                type="button"
                className={`nes-btn is-small ${selectedIndex === idx ? 'is-warning' : 'is-dark'}`}
                onClick={() => setSelectedIndex(idx)}
              >
                WORLD {idx + 1}: {t.tournament?.name || 'Tournament'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="nes-container is-dark" style={{ textAlign: 'center', padding: '40px 20px', margin: '30px 0' }}>
          <i className="nes-icon is-large star is-spinning" style={{ marginBottom: '15px' }}></i>
          <p style={{ color: '#fbed64', fontSize: '0.8rem', letterSpacing: '1px' }}>
            LOADING BASKETBALL LEAGUE DATA...
          </p>
          <progress className="nes-progress is-warning" value="65" max="100" style={{ maxWidth: '300px', margin: '15px auto 0 auto' }}></progress>
        </div>
      )}

      {/* Main Content */}
      {!loading && activeTournament && (
        <>
          {/* Gym LED Scoreboard */}
          <GymScoreboard tournamentData={activeTournament} />

          {/* Coin Vault & Budget */}
          <TournamentFinancials tournamentData={activeTournament} />

          {/* Player Roster & HP Payment Meters */}
          <PlayerRoster 
            activePlayers={activeTournament.active_players || []} 
            inactivePlayers={activeTournament.inactive_players || []} 
          />

          {/* Arcade VS Match History */}
          <MatchHistory 
            matches={activeTournament.matches || []} 
            teamName={activeTournament.tournament?.team_name || 'Toros'} 
          />
        </>
      )}

      {/* Empty State when no data is returned from API */}
      {!loading && (!activeTournament || tournaments.length === 0) && (
        <div className="nes-container is-dark with-title" style={{ textAlign: 'center', padding: '40px 20px', margin: '30px 0' }}>
          <p className="title" style={{ color: '#e76e55' }}>NO TOURNAMENTS FOUND</p>
          <div style={{ marginBottom: '20px' }}>
            <i className="nes-icon is-large close"></i>
          </div>
          <p style={{ color: '#fbed64', fontSize: '0.8rem', marginBottom: '15px' }}>
            No hay torneos activos ni registros disponibles en este momento.
          </p>
          {apiError && (
            <p style={{ color: '#888', fontSize: '0.6rem', marginBottom: '20px' }}>
              Estado del servidor: {apiError}
            </p>
          )}
          <button type="button" className="nes-btn is-primary" onClick={() => loadData(true)}>
            🔄 REINTENTAR CONEXIÓN
          </button>
        </div>
      )}

      <style>{`
        .basket-dashboard-root {
          width: 100%;
          max-width: 920px;
          margin: 0 auto;
        }

        .dashboard-control-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .status-badge-container {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .status-pill {
          font-size: 0.55rem;
          padding: 4px 8px;
          border-radius: 4px;
          letter-spacing: 1px;
        }

        .status-pill.is-live {
          background-color: #224b1d;
          color: #92cc41;
          border: 1px solid #92cc41;
        }

        .status-pill.is-demo {
          background-color: #4b361d;
          color: #fbed64;
          border: 1px solid #fbed64;
        }

        .seed-badge {
          font-size: 0.55rem;
          background-color: #1e3a8a;
          color: #60a5fa;
          border: 1px solid #3b82f6;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .tournament-selector-bar {
          background-color: #1a1c23;
          border: 2px dashed #444;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 25px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .selector-title {
          font-size: 0.65rem;
          color: #fbed64;
        }

        .selector-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}
