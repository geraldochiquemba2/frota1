const TOKEN_KEY = "fleettrack_token";
const API_URL_KEY = "fleettrack_api_url_v2";

// Cloudflare Workers API URL
const CLOUDFLARE_API_URL = "https://frota.20230043.workers.dev";

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getApiUrl(): string {
  // Check stored URL (must be non-empty)
  if (typeof window !== 'undefined') {
    const storedUrl = localStorage.getItem(API_URL_KEY);
    if (storedUrl && storedUrl.trim() !== '') {
      return storedUrl;
    }
  }
  
  // Check Vite env var
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check if running on Cloudflare Pages or any non-localhost domain
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('.pages.dev') || 
        hostname.includes('.workers.dev') ||
        (hostname !== 'localhost' && !hostname.startsWith('127.') && !hostname.includes('replit'))) {
      return CLOUDFLARE_API_URL;
    }
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
