// src/lib/analytics.js

export function analyzeExpenses(expenses) {
  if (!expenses || expenses.length === 0) {
    return { merchants: [], topDay: 'Unknown', tinyPurchases: { count: 0, total: 0, percentage: 0 }, story: "No data available." };
  }

  let totalSpent = 0;
  let tinyCount = 0;
  let tinyTotal = 0;
  
  const merchantsMap = {};
  const daysMap = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 }; // Sun-Sat amounts
  const monthlyBreakdownMap = {}; // Last 30 days category breakdown
  const paymentBreakdownMap = {};
  let monthlyTotal = 0;

  const knownMerchants = ['starbucks', 'oxxo', 'uber', 'amazon', 'costco', 'spotify', 'farmacia', 'cinepolis'];

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

  expenses.forEach(exp => {
    totalSpent += exp.amount;

    // 1. Tiny Purchases (< 100)
    if (exp.amount < 100) {
      tinyCount++;
      tinyTotal += exp.amount;
    }

    // Payment Method grouping
    const method = exp.payment_method ? exp.payment_method.toLowerCase().trim() : 'unknown';
    const formattedMethod = method.charAt(0).toUpperCase() + method.slice(1);
    paymentBreakdownMap[formattedMethod] = (paymentBreakdownMap[formattedMethod] || 0) + exp.amount;

    // 2. Rhythm (Day of Week)
    let isRecent30Days = false;
    if (exp.date) {
      // Need to handle different date formats safely, typically YYYY-MM-DD
      const dateStr = exp.date.includes(' ') ? exp.date.split(' ')[0] : exp.date;
      const dateObj = new Date(dateStr);
      // Adding time offsets can mess up days, so we use UTC or simple parsing
      const day = new Date(dateObj.getTime() + Math.abs(dateObj.getTimezoneOffset() * 60000)).getDay();
      if (!isNaN(day)) {
        daysMap[day] += exp.amount;
      }
      if (dateObj >= thirtyDaysAgo) {
        isRecent30Days = true;
      }
    }

    // 3. Category grouping (Monthly)
    if (isRecent30Days) {
      monthlyBreakdownMap[exp.category] = (monthlyBreakdownMap[exp.category] || 0) + exp.amount;
      monthlyTotal += exp.amount;
    }

    // 4. Merchant Detection
    let desc = exp.description ? exp.description.toLowerCase() : '';
    let foundMerchant = null;
    
    for (const m of knownMerchants) {
      if (desc.includes(m)) {
        foundMerchant = m.charAt(0).toUpperCase() + m.slice(1); // Capitalize
        break;
      }
    }
    
    // Fallback if no known merchant but description is short
    if (!foundMerchant && desc.length > 0 && desc.length < 20) {
      // Just use the description directly capitalized
      foundMerchant = desc.charAt(0).toUpperCase() + desc.slice(1);
    }
    
    if (foundMerchant) {
       merchantsMap[foundMerchant] = (merchantsMap[foundMerchant] || 0) + exp.amount;
    }
  });

  // Top Merchants
  const sortedMerchants = Object.entries(merchantsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, val]) => ({ name, amount: val }));

  // Top Day
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let topDayIdx = 0;
  let maxDaySpend = 0;
  Object.keys(daysMap).forEach(k => {
    if (daysMap[k] > maxDaySpend) {
      maxDaySpend = daysMap[k];
      topDayIdx = parseInt(k);
    }
  });

  const tinyPercentage = totalSpent > 0 ? Math.round((tinyTotal / totalSpent) * 100) : 0;

  // Storytelling Logic
  let story = `Ah, let me look at your ledger... `;
  if (sortedMerchants.length > 0) {
    story += `It seems you have a strong affinity for ${sortedMerchants[0].name}, where much of your gold flows. `;
  }
  story += `Be wary on ${dayNames[topDayIdx]}s, that is statistically your most expensive day of the week! `;
  
  if (tinyPercentage > 15) {
    story += `And beware "death by a thousand cuts": ${tinyPercentage}% of your total spending comes from small transactions under $100 MXN!`;
  } else {
    story += `You're doing great at avoiding tiny impulse purchases.`;
  }

  return {
    merchants: sortedMerchants,
    topDay: dayNames[topDayIdx],
    tinyPurchases: { count: tinyCount, total: tinyTotal, percentage: tinyPercentage },
    story,
    totalSpent,
    monthlyBreakdown: monthlyBreakdownMap,
    monthlyTotal: monthlyTotal,
    paymentBreakdown: paymentBreakdownMap
  };
}

export function analyzeWorkouts(workouts) {
  if (!workouts || workouts.length === 0) {
    return {
      workoutCount: 0,
      totalMinutes: 0,
      averageMinutes: 0,
      xp: 0,
      level: 1,
      xpNextLevel: 200,
      xpProgress: 0,
      typesBreakdown: {},
      story: "Trainer says: No quest entries found. Let's get moving to level up your stats!"
    };
  }

  const workoutCount = workouts.length;
  const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
  const averageMinutes = Math.round(totalMinutes / workoutCount);

  // RPG Progression: 1 XP per minute active. Level up every 200 XP.
  const xp = totalMinutes;
  const level = Math.floor(xp / 200) + 1;
  const xpInCurrentLevel = xp % 200;
  const xpProgress = Math.round((xpInCurrentLevel / 200) * 100);
  const xpNextLevel = 200 - xpInCurrentLevel;

  // Breakdown by type
  const typesBreakdown = {};
  workouts.forEach(w => {
    const type = w.workout_type || 'General';
    typesBreakdown[type] = (typesBreakdown[type] || 0) + (w.duration_minutes || 0);
  });

  // Trainer motivational commentary
  let story = `Trainer says: `;
  if (totalMinutes >= 150) {
    story += `Outstanding! You've achieved ${totalMinutes} active minutes, crushing the weekly standard. Your stamina is at peak capacity!`;
  } else if (workoutCount >= 4) {
    story += `Your consistency is legendary! ${workoutCount} workouts recorded. Keep grinding to level up your card!`;
  } else if (totalMinutes > 0) {
    story += `Good effort! You've earned ${xp} XP this week. Just ${xpNextLevel} XP left to level up to Level ${level + 1}!`;
  } else {
    story += `A journey of a thousand miles begins with a single step. Complete a workout to start your training log.`;
  }

  return {
    workoutCount,
    totalMinutes,
    averageMinutes,
    xp,
    level,
    xpNextLevel,
    xpProgress,
    typesBreakdown,
    story
  };
}

