// Smart API Client with Dual Environment Support:
// 1. In Development (`npm run dev`):
//    - Tries Local Backend (port 5001, then port 5000)
//    - If Localhost is down or unreachable, seamlessly fails over to Live Render Backend
// 2. In Production (`vite build` / hosted):
//    - Automatically uses Live Render Backend (https://sdb-backend-3ry0.onrender.com/api/v1)
// 3. User can also manually toggle or override via localStorage ('sdb_admin_api_env': 'live' | 'local')

export const LIVE_BACKEND_URL = 'https://sdb-backend-3ry0.onrender.com/api/v1';
export const LOCAL_BACKEND_URL_5001 = 'http://localhost:5001/api/v1';
export const LOCAL_BACKEND_URL_5000 = 'http://localhost:5000/api/v1';
export const API_BASE = import.meta.env.VITE_API_URL || LIVE_BACKEND_URL;

// Check if explicit override exists in Vite env
const ENV_CONFIG_URL = import.meta.env.VITE_API_URL?.trim();

// Active resolved base URL cache
let cachedApiBase: string | null = null;

export function getPreferredBaseUrl(): string {
  // If explicitly overridden in localStorage
  const savedPref = localStorage.getItem('sdb_admin_api_env');
  if (savedPref === 'live') return LIVE_BACKEND_URL;
  if (savedPref === 'local') return LOCAL_BACKEND_URL_5001;

  // If explicit .env variable provided
  if (ENV_CONFIG_URL && ENV_CONFIG_URL.length > 0) {
    return ENV_CONFIG_URL;
  }

  // In production build (hosting mode), default to Live Cloud Backend
  if (import.meta.env.PROD) {
    return LIVE_BACKEND_URL;
  }

  // In development mode, default to local backend
  return LOCAL_BACKEND_URL_5001;
}

export function getCurrentApiBase(): string {
  return cachedApiBase || getPreferredBaseUrl();
}

export function setApiEnvironmentPreference(mode: 'live' | 'local' | 'auto') {
  if (mode === 'auto') {
    localStorage.removeItem('sdb_admin_api_env');
  } else {
    localStorage.setItem('sdb_admin_api_env', mode);
  }
  cachedApiBase = null;
  window.location.reload();
}

/**
 * Perform an API request with dual environment fallback.
 * If local development backend is unreachable, automatically fallbacks to live cloud backend.
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; errors?: any; meta?: any }> {
  const token = localStorage.getItem('sdb_admin_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Determine candidate URLs based on mode
  const candidates: string[] = [];
  const primary = getCurrentApiBase();
  candidates.push(primary);

  // In development mode or auto mode, add fallback candidates
  if (import.meta.env.DEV) {
    if (primary.includes('5001')) {
      candidates.push(LOCAL_BACKEND_URL_5000);
      candidates.push(LIVE_BACKEND_URL);
    } else if (primary.includes('5000')) {
      candidates.push(LOCAL_BACKEND_URL_5001);
      candidates.push(LIVE_BACKEND_URL);
    } else if (primary === LIVE_BACKEND_URL) {
      candidates.push(LOCAL_BACKEND_URL_5001);
      candidates.push(LOCAL_BACKEND_URL_5000);
    }
  } else {
    // In production, live is primary; if it fails and local is desired, keep fallback
    if (!candidates.includes(LIVE_BACKEND_URL)) {
      candidates.push(LIVE_BACKEND_URL);
    }
  }

  let lastError: any = null;

  for (let i = 0; i < candidates.length; i++) {
    const baseUrl = candidates[i];
    try {
      // 10s timeout for failover
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: options.signal || controller.signal,
      });

      clearTimeout(timeoutId);

      // If we got a valid HTTP response (even 4xx/5xx from the server), the server is alive!
      cachedApiBase = baseUrl;

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 && !endpoint.includes('/auth/login')) {
          localStorage.removeItem('sdb_admin_token');
          localStorage.removeItem('sdb_admin_user');
          window.location.reload();
        }
        throw new Error(data.message || 'Request failed');
      }
      return data;
    } catch (error: any) {
      lastError = error;
      // Network failure (server down, CORS, connection refused, or timeout)
      const isNetworkError =
        error.name === 'AbortError' ||
        error.name === 'TypeError' ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError');

      if (isNetworkError && i < candidates.length - 1) {
        console.warn(`[DualBackend] Failed to reach ${baseUrl}${endpoint}, failing over to ${candidates[i + 1]}...`);
        continue;
      }

      // If it's a regular API error (e.g. 400 Bad Request, 401 Unauthorized), don't try other hosts
      console.error(`API Error [${baseUrl}${endpoint}]:`, error);
      throw error;
    }
  }

  throw lastError || new Error('Unable to connect to backend server');
}
