import { PublicClientApplication, type AuthenticationResult } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: 'YOUR_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
    redirectUri: '/',
  }
};

const msalInstance = new PublicClientApplication(msalConfig);

export async function login(): Promise<AuthenticationResult | void> {
  try {
    return await msalInstance.loginPopup({ scopes: ['User.Read'] });
  } catch (e) {
    console.error('Login failed', e);
  }
}

export async function getToken(scopes: string[]): Promise<string | undefined> {
  const account = msalInstance.getAllAccounts()[0];
  if (!account) return undefined;
  try {
    const response = await msalInstance.acquireTokenSilent({ account, scopes });
    return response.accessToken;
  } catch (e) {
    console.error('Token acquisition failed', e);
    return undefined;
  }
}
