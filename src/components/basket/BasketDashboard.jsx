import React, { useState, useEffect } from 'react';
import { fetchTournaments } from '../../lib/basketApi.js';
import TournamentNavigator from './TournamentNavigator.jsx';
import GymScoreboard from './GymScoreboard.jsx';
import TournamentFinancials from './TournamentFinancials.jsx';
import PlayerRoster from './PlayerRoster.jsx';
import MatchHistory from './MatchHistory.jsx';

export default function BasketDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const loadData = async () => {
    setLoading(true);

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
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeTournament = tournaments[selectedIndex] || null;

  return (
    <div className="basket-dashboard-root">
      {/* Hybrid World Navigator (Stepper + Dropdown) */}
      <TournamentNavigator 
        tournaments={tournaments}
        selectedIndex={selectedIndex}
        onSelectIndex={setSelectedIndex}
      />

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
      `}</style>
    </div>
  );
}
