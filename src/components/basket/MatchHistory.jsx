import React from 'react';

export default function MatchHistory({ matches = [], teamName = 'Toros' }) {
  if (!matches || matches.length === 0) {
    return (
      <section className="nes-container with-title is-dark" style={{ marginBottom: '35px' }}>
        <p className="title">Match Log & Recaps</p>
        <p style={{ fontSize: '0.7rem', color: '#888', textAlign: 'center', padding: '20px' }}>
          No match data recorded yet for this tournament.
        </p>
      </section>
    );
  }

  return (
    <section className="nes-container with-title is-dark" style={{ marginBottom: '35px' }}>
      <p className="title" style={{ color: '#fbed64', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <i className="nes-icon star is-small"></i>
        Tournament Match Log
      </p>

      <div className="matches-grid">
        {matches.map((match, idx) => {
          const isWin = match.is_win;
          return (
            <div 
              key={match.id || idx} 
              className={`match-card ${isWin ? 'is-win-card' : 'is-loss-card'}`}
            >
              {/* Match Header: Type & Date */}
              <div className="match-card-top">
                <span className="match-type">
                  {match.match_type ? match.match_type.toUpperCase() : 'GAME'} #{matches.length - idx}
                </span>
                <span className="match-date">{match.date}</span>
              </div>

              {/* VS Scoreboard Board */}
              <div className="match-duel">
                <div className="team-side home-side">
                  <span className="team-duel-name">{teamName}</span>
                  <span className={`team-duel-score ${isWin ? 'score-win' : 'score-neutral'}`}>
                    {match.team_score}
                  </span>
                </div>

                <div className="vs-divider">
                  <span className="vs-text">VS</span>
                  <span className={`result-tag ${isWin ? 'tag-win' : 'tag-loss'}`}>
                    {isWin ? 'WIN' : 'LOSS'}
                  </span>
                </div>

                <div className="team-side away-side">
                  <span className={`team-duel-score ${!isWin ? 'score-win' : 'score-neutral'}`}>
                    {match.opponent_score}
                  </span>
                  <span className="team-duel-name opponent-name">{match.opponent}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .matches-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }

        @media (min-width: 600px) {
          .matches-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .match-card {
          background-color: #15171c;
          border: 2px solid #282c37;
          border-radius: 6px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: transform 0.1s steps(2);
        }

        .match-card:hover {
          transform: translateY(-2px);
          border-color: #3b4252;
        }

        .is-win-card {
          border-left: 4px solid #92cc41;
        }

        .is-loss-card {
          border-left: 4px solid #e76e55;
        }

        .match-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.55rem;
        }

        .match-type {
          color: #fbed64;
          letter-spacing: 1px;
        }

        .match-date {
          color: #717682;
        }

        .match-duel {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #0c0d10;
          border: 1px solid #1f232b;
          border-radius: 4px;
          padding: 8px 12px;
        }

        .team-side {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex: 1;
        }

        .home-side {
          align-items: flex-start;
        }

        .away-side {
          align-items: flex-end;
        }

        .team-duel-name {
          font-size: 0.65rem;
          color: #fff;
        }

        .opponent-name {
          color: #ff9800;
        }

        .team-duel-score {
          font-size: 1.2rem;
          font-weight: bold;
          line-height: 1;
        }

        .score-win {
          color: #4ade80;
          text-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
        }

        .score-neutral {
          color: #888;
        }

        .vs-divider {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 0 8px;
        }

        .vs-text {
          font-size: 0.55rem;
          color: #555;
        }

        .result-tag {
          font-size: 0.45rem;
          padding: 1px 4px;
          border-radius: 2px;
          font-weight: bold;
        }

        .tag-win {
          background-color: #224b1d;
          color: #92cc41;
        }

        .tag-loss {
          background-color: #4b1d1d;
          color: #e76e55;
        }
      `}</style>
    </section>
  );
}
