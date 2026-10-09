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
