import { describe, it, expect, vi } from 'vitest';

vi.mock('@azure/msal-browser', () => {
  return {
    PublicClientApplication: vi.fn().mockImplementation(() => ({
      getAllAccounts: () => [],
      loginPopup: vi.fn(),
      acquireTokenSilent: vi.fn()
    }))
  };
});

const { getToken } = await import('./auth');

describe('getToken', () => {
  it('returns undefined when no accounts are available', async () => {
    const token = await getToken(['User.Read']);
    expect(token).toBeUndefined();
  });
});
