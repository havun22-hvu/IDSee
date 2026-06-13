import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from './api';

// Avoid jsdom "navigation not implemented" noise on the 401 redirect path.
Object.defineProperty(window, 'location', {
  configurable: true,
  value: { href: '' },
});

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const { ok = true, status = 200 } = init;
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok,
    status,
    json: async () => body,
  });
}

function lastCall() {
  return (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
}

describe('ApiClient.request', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    localStorage.clear();
  });

  it('sends a POST with JSON body to the right endpoint', async () => {
    mockFetchOnce({ user: { id: '1' }, token: 't' });

    await api.login('a@b.nl', 'secret');

    const [url, options] = lastCall();
    expect(url).toBe('http://localhost:3001/auth/login');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ email: 'a@b.nl', password: 'secret' });
  });

  it('attaches a Bearer token when one is stored', async () => {
    localStorage.setItem('token', 'abc123');
    mockFetchOnce([]);

    await api.getAnimals();

    const [, options] = lastCall();
    expect(options.headers.Authorization).toBe('Bearer abc123');
  });

  it('omits the Authorization header when no token is stored', async () => {
    mockFetchOnce([]);

    await api.getCreditBundles();

    const [, options] = lastCall();
    expect(options.headers.Authorization).toBeUndefined();
  });

  it('throws the server error message on a non-ok response', async () => {
    mockFetchOnce({ error: 'Onvoldoende credits' }, { ok: false, status: 400 });

    await expect(api.getCredits()).rejects.toThrow('Onvoldoende credits');
  });

  it('clears the token and throws on a 401', async () => {
    localStorage.setItem('token', 'expired');
    mockFetchOnce({}, { ok: false, status: 401 });

    await expect(api.getMe()).rejects.toThrow('Sessie verlopen');
    expect(localStorage.getItem('token')).toBeNull();
  });
});
