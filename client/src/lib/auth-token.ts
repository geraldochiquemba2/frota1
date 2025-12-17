const TOKEN_KEY = "fleettrack_token";
const API_URL_KEY = "fleettrack_api_url";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getApiUrl(): string {
  const storedUrl = localStorage.getItem(API_URL_KEY);
  if (storedUrl) {
    return storedUrl;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return "";
}

export function setApiUrl(url: string): void {
  localStorage.setItem(API_URL_KEY, url);
}

export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }
  return {
    "Content-Type": "application/json",
  };
}
