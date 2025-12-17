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
      console.log("[API URL Debug] Using stored URL:", storedUrl);
      return storedUrl;
    }
  }
  
  // Check Vite env var
  if (import.meta.env.VITE_API_URL) {
    console.log("[API URL Debug] Using VITE_API_URL:", import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Check if running on Cloudflare Pages or any non-localhost domain
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    console.log("[API URL Debug] Current hostname:", hostname);
    
    // If already on the workers domain, use relative URLs (API is on same domain)
    if (hostname === 'frota.20230043.workers.dev') {
      console.log("[API URL Debug] On workers domain, using relative URLs");
      return "";
    }
    
    // If on the Cloudflare Pages domain, use absolute URL to Workers API
    if (hostname.includes('frota-8j7.pages.dev') || hostname === '293beec1.frota-8j7.pages.dev') {
      console.log("[API URL Debug] On Cloudflare Pages, using Workers API URL");
      return CLOUDFLARE_API_URL;
    }
    
    if (hostname.includes('.pages.dev') || 
        hostname.includes('.workers.dev') ||
        (hostname !== 'localhost' && !hostname.startsWith('127.') && !hostname.includes('replit'))) {
      console.log("[API URL Debug] Production detected, using Cloudflare API URL");
      return CLOUDFLARE_API_URL;
    }
  }
  
  console.log("[API URL Debug] Using local/relative URLs");
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
