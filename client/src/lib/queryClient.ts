import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getToken, getApiUrl, removeToken } from "./auth-token";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function buildUrl(path: string): string {
  const apiUrl = getApiUrl();
  if (apiUrl) {
    return `${apiUrl}${path}`;
  }
  return path;
}

function getHeaders(includeContentType: boolean = false): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  
  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = buildUrl(url);
  const res = await fetch(fullUrl, {
    method,
    headers: getHeaders(!!data),
    body: data ? JSON.stringify(data) : undefined,
  });

  if (res.status === 401) {
    removeToken();
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const pathParts = queryKey.filter((k): k is string => typeof k === "string");
    const path = pathParts[0] || "";
    const fullUrl = buildUrl(path);
    
    const res = await fetch(fullUrl, {
      headers: getHeaders(),
    });

    if (res.status === 401) {
      removeToken();
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
