// Basketball League API Client & Utilities

const DEFAULT_API_URL = 'https://jarvis-life-tracker-production.up.railway.app';

export async function fetchTournaments() {
  const baseUrl = import.meta.env.PUBLIC_API_URL || DEFAULT_API_URL;
  const token = import.meta.env.PUBLIC_API_TOKEN || '';
  const headers = {};
  if (token) {
    headers['X-API-Token'] = token;
  }

  try {
    const res = await fetch(`${baseUrl}/api/basket/tournaments`, {
      headers,
      signal: AbortSignal.timeout(8000)
    });

    if (!res.ok) {
      return { data: [], error: `API error: Status ${res.status}` };
    }

    const data = await res.json();
    if (Array.isArray(data)) {
      return { data, error: null };
    }

    return { data: [], error: 'Invalid API response format' };
  } catch (err) {
    return { data: [], error: err.message || 'Could not connect to API' };
  }
}

export function formatMXN(amount) {
  const num = Number(amount) || 0;
  return `$${num.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Safely parses various date formats (ISO, SQL datetime, Date objects) into timestamps.
 */
export function parseDateTimestamp(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (val instanceof Date) return val.getTime();
  if (typeof val === 'string') {
    const isoStr = val.includes(' ') && !val.includes('T') ? val.replace(' ', 'T') : val;
    const ts = Date.parse(isoStr);
    return isNaN(ts) ? 0 : ts;
  }
  return 0;
}

/**
 * Calculates the latest activity timestamp for a tournament across:
 * - Matches played or recorded (date, created_at, updated_at)
 * - Player payments received (payment_date, date, created_at)
 * - Tournament entity updates (created_at, updated_at)
 */
export function getLatestActivityTimestamp(tournamentData) {
  if (!tournamentData) return 0;
  let latest = 0;
  const check = (val) => {
    const ts = parseDateTimestamp(val);
    if (ts > latest) latest = ts;
  };

  if (tournamentData.tournament?.created_at) check(tournamentData.tournament.created_at);
  if (tournamentData.tournament?.updated_at) check(tournamentData.tournament.updated_at);

  (tournamentData.matches || []).forEach(m => {
    check(m.date);
    check(m.created_at);
    check(m.updated_at);
  });

  const players = [
    ...(tournamentData.active_players || []),
    ...(tournamentData.inactive_players || [])
  ];

  players.forEach(p => {
    (p.payments || []).forEach(pay => {
      if (typeof pay === 'string') {
        check(pay);
      } else if (pay && typeof pay === 'object') {
        check(pay.payment_date);
        check(pay.date);
        check(pay.created_at);
      }
    });
  });

  return latest;
}

/**
 * Finds the index of the tournament with the most recent activity (record match or player payment).
 */
export function findMostRecentTournamentIndex(tournaments) {
  if (!Array.isArray(tournaments) || tournaments.length === 0) return 0;
  let bestIdx = 0;
  let maxTs = -1;

  tournaments.forEach((t, i) => {
    const ts = getLatestActivityTimestamp(t);
    if (ts > maxTs) {
      maxTs = ts;
      bestIdx = i;
    }
  });

  return bestIdx;
}

