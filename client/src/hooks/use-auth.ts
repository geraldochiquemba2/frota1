import { useQuery } from "@tanstack/react-query";
import { getToken, getApiUrl, removeToken, setToken } from "@/lib/auth-token";
import { queryClient } from "@/lib/queryClient";

interface AuthUser {
  id: string;
  phone: string;
  name: string;
  type?: "admin" | "driver";
}

async function fetchUser(): Promise<AuthUser | null> {
  const token = getToken();
  
  if (!token) {
    return null;
  }
  
  const apiUrl = getApiUrl();
  const url = apiUrl ? `${apiUrl}/api/auth/user` : "/api/auth/user";
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    removeToken();
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
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
      body: JSON.stringify({ phone, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao fazer login");
    }

    const data = await response.json();
    
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
      body: JSON.stringify({ phone, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao criar conta");
    }

    const data = await response.json();
    
    if (data.token) {
      setToken(data.token);
    }
    
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    
    return data;
  };

  const logout = async () => {
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
