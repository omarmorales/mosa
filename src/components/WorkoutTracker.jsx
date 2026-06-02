import React, { useState, useEffect } from 'react';
import { analyzeWorkouts } from '../lib/analytics.js';

export default function WorkoutTracker() {
  const [summaryData, setSummaryData] = useState(null);
  const [workoutsData, setWorkoutsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = import.meta.env.PUBLIC_API_TOKEN || '';
    const headers = { 'X-API-Token': token };

    Promise.all([
      fetch('https://jarvis-life-tracker-production.up.railway.app/api/summary', { headers }).then(r => r.json()),
      fetch('https://jarvis-life-tracker-production.up.railway.app/api/workouts', { headers }).then(r => r.json())
    ])
      .then(([summary, workouts]) => {
        setSummaryData(summary);
        setWorkoutsData(workouts);
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
        <p>Syncing Training Logs & Loading Trainer Module...</p>
        <progress className="nes-progress is-primary" value="50" max="100"></progress>
      </div>
    );
  }

  if (!summaryData || !workoutsData) return <p>Error loading workout logs.</p>;

  const analytics = analyzeWorkouts(workoutsData);
  const colors = ['is-primary', 'is-success', 'is-warning', 'is-error', 'is-pattern'];

  return (
    <div>
      {/* 1. RPG Player Stats / Level Card */}
      <section className="nes-container with-title is-dark" style={{ marginBottom: '30px', marginTop: '20px' }}>
        <p className="title">Player Profile (Fitness RPG)</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Level Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem', color: '#92cc41' }}>LEVEL {analytics.level}</span>
            <span style={{ fontSize: '0.8rem', color: '#209cee' }}>TOTAL XP: {analytics.xp} (1 XP/Min)</span>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.7rem' }}>
              <span>XP to next level: {analytics.xp % 200} / 200</span>
              <span>{analytics.xpProgress}%</span>
            </div>
            <progress className="nes-progress is-success" value={analytics.xpProgress} max="100" style={{ height: '24px' }}></progress>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
            <div className="nes-container is-dark is-rounded" style={{ flex: 1, minWidth: '200px' }}>
              <p style={{ color: '#fbed64', fontSize: '0.7rem', marginBottom: '10px' }}>Consistency (7d)</p>
              <p style={{ fontSize: '1.1rem' }}>{analytics.workoutCount} Quests <i className="nes-icon trophy is-small"></i></p>
            </div>
            
            <div className="nes-container is-dark is-rounded" style={{ flex: 1, minWidth: '200px' }}>
              <p style={{ color: '#209cee', fontSize: '0.7rem', marginBottom: '10px' }}>Total Active Volume</p>
              <p style={{ fontSize: '1.1rem' }}>{analytics.totalMinutes} Mins <i className="nes-icon heart is-small"></i></p>
            </div>

            <div className="nes-container is-dark is-rounded" style={{ flex: 1, minWidth: '200px' }}>
              <p style={{ color: '#92cc41', fontSize: '0.7rem', marginBottom: '10px' }}>Average Pace</p>
              <p style={{ fontSize: '1.1rem' }}>{analytics.averageMinutes} Mins/Quest</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Fitness Trainer Dialogue Balloon */}
      <section style={{ marginBottom: '40px', marginTop: '20px' }}>
        <p style={{ color: '#92cc41', marginBottom: '10px' }}>Fitness Coach Insight</p>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'nowrap' }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <img 
              src="/trainer.png" 
              alt="Trainer" 
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

      {/* 3. Workout Type / Category Breakdown */}
      <section className="nes-container with-title is-dark" style={{ marginBottom: '30px' }}>
        <p className="title">Quest Breakdown (Active Minutes)</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(analytics.typesBreakdown).map(([type, duration], index) => {
            const percentage = analytics.totalMinutes > 0 ? Math.round((duration / analytics.totalMinutes) * 100) : 0;
            const colorClass = colors[index % colors.length];
            return (
              <div key={type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.8rem' }}>
                  <span>{type}</span>
                  <span>{duration} Mins ({percentage}%)</span>
                </div>
                <progress className={`nes-progress ${colorClass}`} value={percentage} max="100"></progress>
              </div>
            );
          })}
          {Object.keys(analytics.typesBreakdown).length === 0 && (
            <p style={{ fontSize: '0.8rem', textAlign: 'center' }}>No workout breakdown available.</p>
          )}
        </div>
      </section>

      {/* 4. Monospace Quest Log (Ledger) */}
      <section className="nes-container with-title is-dark" style={{ marginBottom: '30px' }}>
        <p className="title">Quest Log (History)</p>
        <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '5px', fontFamily: 'monospace', color: '#0f0', fontSize: '0.7rem', overflowX: 'auto', lineHeight: '1.8' }}>
          {workoutsData.map(workout => (
            <div key={workout.id} style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px', borderBottom: '1px dashed #333', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
                <span>[{workout.date?.split(' ')[0]}] {workout.workout_type}</span>
                <span style={{ color: '#209cee' }}>+ {workout.duration_minutes} XP ({workout.duration_minutes} Mins)</span>
              </div>
              {workout.intensity && (
                <div style={{ color: '#fbed64', fontSize: '0.65rem', marginTop: '2px' }}>
                  Intensity: {workout.intensity.toUpperCase()}
                </div>
              )}
              <span style={{ opacity: 0.7, marginTop: '4px' }}>Details: {workout.description || 'No description provided.'}</span>
            </div>
          ))}
          {workoutsData.length === 0 && <p>&gt; NO QUEST ENTRIES FOUND IN DATABASE.</p>}
          <p style={{ marginTop: '10px' }}>&gt; END OF LOG</p>
        </div>
      </section>
    </div>
  );
}
