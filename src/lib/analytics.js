// src/lib/analytics.js

export function isCurrentMonth(dateStr) {
  if (!dateStr) return false;
  const cleanDate = dateStr.split(' ')[0]; // "YYYY-MM-DD"
  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return cleanDate.startsWith(currentYM);
}

export function getCurrentMonthName() {
  return new Date().toLocaleString('en-US', { month: 'long' });
}

export function getCurrentMonthYear() {
  const now = new Date();
  const monthName = now.toLocaleString('en-US', { month: 'long' });
  return `${monthName} ${now.getFullYear()}`;
}

export function getCurrentMonthStats(expenses = [], workouts = []) {
  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthName = now.toLocaleString('en-US', { month: 'long' });

  const monthExpenses = (expenses || []).filter(e => e && e.date && isCurrentMonth(e.date));
  const monthWorkouts = (workouts || []).filter(w => w && w.date && isCurrentMonth(w.date));

  const expensesTotal = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const workoutCount = monthWorkouts.length;
  const workoutMinutes = monthWorkouts.reduce((sum, w) => sum + (Number(w.duration_minutes) || 0), 0);

  return {
    monthName,
    year: now.getFullYear(),
    currentYM,
    expensesTotal,
    expensesCount: monthExpenses.length,
    workoutCount,
    workoutMinutes
  };
}

export function getMonthlyComparison(expenses = []) {
  if (!expenses || expenses.length === 0) {
    return { months: [], maxSpent: 1, trend: null };
  }

  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthsMap = {};
  expenses.forEach(exp => {
    if (exp && exp.date && exp.amount) {
      const dateStr = exp.date.includes(' ') ? exp.date.split(' ')[0] : exp.date;
      const ym = dateStr.substring(0, 7);
      if (!monthsMap[ym]) {
        monthsMap[ym] = { ym, total: 0, count: 0 };
      }
      monthsMap[ym].total += Number(exp.amount) || 0;
      monthsMap[ym].count += 1;
    }
  });

  const monthKeys = Object.keys(monthsMap).sort();
  const months = monthKeys.map(ym => {
    const [year, monthNum] = ym.split('-');
    const dateObj = new Date(parseInt(year, 10), parseInt(monthNum, 10) - 1, 1);
    const monthName = dateObj.toLocaleString('en-US', { month: 'short' });
    const fullLabel = `${monthName} ${year}`;
    const total = monthsMap[ym].total;
    return {
      ym,
      label: fullLabel,
      shortLabel: monthName,
      year,
      total,
      count: monthsMap[ym].count,
      isCurrent: ym === currentYM
    };
  });

  const maxSpent = months.reduce((max, m) => Math.max(max, m.total), 0) || 1;

  let trend = null;
  if (months.length >= 2) {
    const currentMonthObj = months[months.length - 1];
    const prevMonthObj = months[months.length - 2];
    const diff = currentMonthObj.total - prevMonthObj.total;
    const percentage = prevMonthObj.total > 0 ? Math.round((diff / prevMonthObj.total) * 100) : 0;
    
    trend = {
      currentLabel: currentMonthObj.label,
      prevLabel: prevMonthObj.label,
      diff: Math.abs(diff),
      percentage: Math.abs(percentage),
      isDecrease: diff < 0,
      isIncrease: diff > 0,
      isEqual: diff === 0
    };
  }

  return { months, maxSpent, trend };
}

export function analyzeExpenses(expenses) {
  if (!expenses || expenses.length === 0) {
    return { merchants: [], topDay: 'Unknown', tinyPurchases: { count: 0, total: 0, percentage: 0 }, story: "No data available." };
  }

  let totalSpent = 0;
  let tinyCount = 0;
  let tinyTotal = 0;
  
  const merchantsMap = {};
  const daysMap = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 }; // Sun-Sat amounts
  const monthlyBreakdownMap = {}; // Current month category breakdown
  const paymentBreakdownMap = {};
  let monthlyTotal = 0;

  const knownMerchants = ['starbucks', 'oxxo', 'uber', 'amazon', 'costco', 'spotify', 'farmacia', 'cinepolis'];

  expenses.forEach(exp => {
    totalSpent += exp.amount;

    // 1. Tiny Purchases (< 100)
    if (exp.amount < 100) {
      tinyCount++;
      tinyTotal += exp.amount;
    }

    // Payment Method grouping
    const method = normalizePaymentMethod(exp.payment_method);
    paymentBreakdownMap[method] = (paymentBreakdownMap[method] || 0) + exp.amount;

    // 2. Rhythm (Day of Week)
    let inCurrentMonth = false;
    if (exp.date) {
      // Need to handle different date formats safely, typically YYYY-MM-DD
      const dateStr = exp.date.includes(' ') ? exp.date.split(' ')[0] : exp.date;
      const dateObj = new Date(dateStr);
      // Adding time offsets can mess up days, so we use UTC or simple parsing
      const day = new Date(dateObj.getTime() + Math.abs(dateObj.getTimezoneOffset() * 60000)).getDay();
      if (!isNaN(day)) {
        daysMap[day] += exp.amount;
      }
      if (isCurrentMonth(exp.date)) {
        inCurrentMonth = true;
      }
    }

    // 3. Category grouping (Monthly)
    if (inCurrentMonth) {
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

export function normalizePaymentMethod(rawMethod) {
  if (!rawMethod) return 'Unknown';
  const clean = rawMethod.trim().toLowerCase();

  // Normalize Card / Tarjeta / Credit / Debit
  if (clean === 'card' || clean === 'tarjeta' || clean === 'credit' || clean === 'debit' || clean.includes('card') || clean.includes('tarjeta')) {
    return 'Card';
  }

  // Normalize Cash / Efectivo
  if (clean === 'cash' || clean === 'efectivo' || clean.includes('cash') || clean.includes('efectivo')) {
    return 'Cash';
  }

  // Normalize Transfer / Transferencia / SPEI
  if (clean === 'transfer' || clean === 'transferencia' || clean === 'spei') {
    return 'Transfer';
  }

  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function normalizeWorkoutType(rawType) {
  if (!rawType) return 'General';
  const clean = rawType.trim().toLowerCase();

  // Normalize Gym / Weightlifting / Pesas / Gimnasio
  if (clean === 'gym' || clean === 'weightlifting' || clean === 'pesas' || clean === 'gimnasio' || clean === 'strength training' || clean.includes('weightlifting')) {
    return 'Weightlifting / Gym';
  }

  // Normalize Basketball / Baloncesto
  if (clean === 'baloncesto' || clean === 'basketball' || clean === 'basquetbol' || clean === 'básquetbol' || clean === 'basquet') {
    return 'Basketball';
  }

  // Normalize Walking / Caminata
  if (clean === 'walking' || clean === 'caminata' || clean === 'caminar' || clean === 'walk') {
    return 'Walking';
  }

  return rawType.charAt(0).toUpperCase() + rawType.slice(1);
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

  // Breakdown by type (using normalized workout names)
  const typesBreakdown = {};
  workouts.forEach(w => {
    const type = normalizeWorkoutType(w.workout_type);
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

