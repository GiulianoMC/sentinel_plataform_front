const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8001';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

/**
 * Erro de API que preserva o status HTTP e o Retry-After.
 * Sem isto o front não consegue distinguir 429 (rate limit) de 503 (cota
 * esgotada) nem saber quanto tempo esperar antes de reativar o botão.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function setTokens(at: string | null, rt: string | null) {
  accessToken = at;
  refreshToken = rt;
  if (rt) localStorage.setItem('refreshToken', rt);
  else localStorage.removeItem('refreshToken');
}

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) throw new Error('Refresh failed');
    const data = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return data.access_token;
  })();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function errorDetail(res: Response): Promise<string> {
  const detail = await res.json().catch(() => ({}));
  return (detail as { detail?: string }).detail ?? `HTTP ${res.status}`;
}

// O back envia Access-Control-Expose-Headers: Retry-After, por isso este
// header é legível mesmo cross-origin.
function parseRetryAfter(res: Response): number | undefined {
  const raw = res.headers.get('Retry-After');
  if (!raw) return undefined;
  const seconds = Number(raw);
  return Number.isFinite(seconds) ? seconds : undefined;
}

export async function authedFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  let res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 401 && accessToken && refreshToken) {
    try {
      const newAt = await refreshAccessToken();
      headers.set('Authorization', `Bearer ${newAt}`);
      res = await fetch(`${BASE}${path}`, { ...init, headers });
    } catch {
      setTokens(null, null);
      window.location.href = '/login';
      throw new ApiError(401, 'Sessão expirada. Faça login novamente.');
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, await errorDetail(res), parseRetryAfter(res));
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const get = <T>(path: string, init?: RequestInit) => authedFetch<T>(path, init);

export const post = <T>(path: string, body: unknown = null, init?: RequestInit) =>
  authedFetch<T>(path, {
    method: 'POST',
    ...init,
    ...(body !== null && {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  });

export const patch = <T>(path: string, body: unknown) =>
  authedFetch<T>(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const del = <T>(path: string) => authedFetch<T>(path, { method: 'DELETE' });
