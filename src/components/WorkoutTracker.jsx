import React, { useState, useEffect } from 'react';
import { analyzeWorkouts } from '../lib/analytics.js';

// --- GITHUB STYLE WORKOUT HEATMAP COMPONENT ---
function WorkoutHeatmap({ workouts }) {
  const minutesMap = {};
  workouts.forEach(w => {
    if (w.date) {
      const dateStr = w.date.split(' ')[0]; // Extract YYYY-MM-DD
      minutesMap[dateStr] = (minutesMap[dateStr] || 0) + (w.duration_minutes || 0);
    }
  });

  const now = new Date();
  const currentDayOfWeek = now.getDay();
  
  // Generate 53 weeks ending on the current week's Saturday (371 days total)
  const days = [];
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - currentDayOfWeek));
  const startDate = new Date(endDate.getTime());
  startDate.setDate(endDate.getDate() - 370);
  
  for (let i = 0; i < 371; i++) {
    const d = new Date(startDate.getTime());
    d.setDate(startDate.getDate() + i);
    days.push(d);
  }

  const columns = [];
  for (let i = 0; i < days.length; i += 7) {
    columns.push(days.slice(i, i + 7));
  }

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getColor = (minutes) => {
    if (minutes === 0) return '#1a1c1e';
    if (minutes < 30) return '#224b1d';
    if (minutes < 60) return '#3d7930';
    if (minutes < 90) return '#92cc41';
    return '#e7ff5c';
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabels = [];
  let lastMonth = -1;
  columns.forEach((week, colIdx) => {
    const firstDayOfWeek = week[0];
    const month = firstDayOfWeek.getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ colIdx, label: monthNames[month] });
      lastMonth = month;
    }
  });

  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ overflowX: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        
        {/* Month Labels */}
        <div style={{ display: 'flex', gap: '3px', height: '15px', fontSize: '0.5rem', color: '#888', minWidth: '700px', marginLeft: '28px' }}>
          {columns.map((_, colIdx) => {
            const labelObj = monthLabels.find(l => l.colIdx === colIdx);
            return (
              <div key={colIdx} style={{ width: '10px', flexShrink: 0, textAlign: 'left' }}>
                {labelObj ? labelObj.label : ''}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '3px', minWidth: '700px' }}>
          {/* Days Labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', justifyContent: 'space-between', fontSize: '0.45rem', color: '#888', marginRight: '8px', width: '20px', height: '88px', paddingTop: '2px', paddingBottom: '2px' }}>
            <span>Sun</span>
            <span>Wed</span>
            <span>Sat</span>
          </div>

          {/* Grid Cells */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {columns.map((column, colIdx) => (
              <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {column.map(day => {
                  const formatted = formatDate(day);
                  const minutes = minutesMap[formatted] || 0;
                  const isFuture = day > now;
                  const cellColor = isFuture ? '#121314' : getColor(minutes);
                  const tooltip = isFuture 
                    ? `Future Quest` 
                    : `${formatted}: ${minutes} active minutes`;

                  return (
                    <div
                      key={formatted}
                      title={tooltip}
                      style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: cellColor,
                        borderRadius: '1px',
                        border: '1px solid #212529',
                        boxSizing: 'border-box'
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '5px', fontSize: '0.5rem', color: '#888', marginTop: '15px' }}>
        <span>Less</span>
        <div style={{ width: '10px', height: '10px', backgroundColor: '#1a1c1e', borderRadius: '1px' }}></div>
        <div style={{ width: '10px', height: '10px', backgroundColor: '#224b1d', borderRadius: '1px' }}></div>
        <div style={{ width: '10px', height: '10px', backgroundColor: '#3d7930', borderRadius: '1px' }}></div>
        <div style={{ width: '10px', height: '10px', backgroundColor: '#92cc41', borderRadius: '1px' }}></div>
        <div style={{ width: '10px', height: '10px', backgroundColor: '#e7ff5c', borderRadius: '1px' }}></div>
        <span>More</span>
      </div>
    </div>
  );
}

// --- MAIN WORKOUT TRACKER PAGE ---
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

      {/* 1.5. Workout Heatmap Section */}
      <section className="nes-container with-title is-dark" style={{ marginBottom: '30px' }}>
        <p className="title">Quest Map (Contribution Grid)</p>
        <WorkoutHeatmap workouts={workoutsData} />
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
