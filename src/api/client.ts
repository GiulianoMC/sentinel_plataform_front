const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8001';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

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
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }

  if (!res.ok) throw new Error(await errorDetail(res));

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const get = <T>(path: string) => authedFetch<T>(path);

export const post = <T>(path: string, body: unknown = null) =>
  authedFetch<T>(path, {
    method: 'POST',
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