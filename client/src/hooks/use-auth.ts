import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface AuthUser {
  id: string;
  phone: string;
  name: string;
  type?: "admin" | "driver";
}

async function fetchUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) {
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
    const response = await fetch("/api/auth/login", {
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
    
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    
    return data;
  };

  const register = async (phone: string, password: string, name: string) => {
    const response = await fetch("/api/auth/register", {
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
    
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    
    return data;
  };

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
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
