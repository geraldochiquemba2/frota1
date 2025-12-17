import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { getApiUrl, getToken, setToken, removeToken } from "@/lib/auth-token";

interface AuthUser {
  id: string;
  phone: string;
  name: string;
  type?: "admin" | "driver";
}

async function fetchUser(): Promise<AuthUser | null> {
  const apiUrl = getApiUrl();
  const url = apiUrl ? `${apiUrl}/api/auth/user` : "/api/auth/user";
  const token = getToken();
  
  console.log("[Auth Debug] fetchUser called:", { apiUrl, hasToken: !!token, url });
  
  // If no token stored and we're hitting external API, user is not authenticated
  if (!token && apiUrl) {
    console.log("[Auth Debug] No token and external API, returning null");
    return null;
  }
  
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  console.log("[Auth Debug] Making request with headers:", Object.keys(headers));
  
  const response = await fetch(url, {
    credentials: "include",
    headers,
  });

  console.log("[Auth Debug] Response status:", response.status);

  if (response.status === 401) {
    // Token is invalid, remove it
    console.log("[Auth Debug] 401 received, removing token");
    removeToken();
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("[Auth Debug] User data received:", { id: data.id, type: data.type });
  return data;
}

export function useAuth() {
  const { data: user, isLoading, refetch } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const login = async (phone: string, password: string) => {
    const apiUrl = getApiUrl();
    const url = apiUrl ? `${apiUrl}/api/auth/login` : "/api/auth/login";
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ phone, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao fazer login");
    }

    const data = await response.json();
    
    // Store the JWT token
    if (data.token) {
      setToken(data.token);
    }
    
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    
    return data;
  };

  const register = async (phone: string, password: string, name: string) => {
    const apiUrl = getApiUrl();
    const url = apiUrl ? `${apiUrl}/api/auth/register` : "/api/auth/register";
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ phone, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao criar conta");
    }

    const data = await response.json();
    
    // Store the JWT token
    if (data.token) {
      setToken(data.token);
    }
    
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    
    return data;
  };

  const logout = async () => {
    const apiUrl = getApiUrl();
    const url = apiUrl ? `${apiUrl}/api/auth/logout` : "/api/auth/logout";
    
    await fetch(url, {
      method: "POST",
      credentials: "include",
    });
    
    // Remove the stored token
    removeToken();
    
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isDriver: user?.type === "driver",
    isAdmin: user?.type === "admin" || !user?.type,
    refetch,
    login,
    register,
    logout,
  };
}
