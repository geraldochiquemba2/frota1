import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/fleet/ThemeToggle";
import { Truck, MapPin, Bell, Wrench, Users, BarChart3, Phone, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const features = [
  {
    icon: Truck,
    title: "Gestão de Veículos",
    description: "Controle completo da sua frota com informações detalhadas de cada veículo.",
  },
  {
    icon: MapPin,
    title: "Rastreamento em Tempo Real",
    description: "Acompanhe a localização de todos os veículos em um mapa interativo.",
  },
  {
    icon: Bell,
    title: "Sistema de Alertas",
    description: "Receba notificações sobre manutenções, combustível baixo e muito mais.",
  },
  {
    icon: Wrench,
    title: "Controle de Manutenção",
    description: "Gerencie o histórico e agendamentos de manutenção preventiva.",
  },
  {
    icon: Users,
    title: "Gestão de Motoristas",
    description: "Cadastro completo de motoristas com controle de documentação.",
  },
  {
    icon: BarChart3,
    title: "Relatórios e Métricas",
    description: "Visualize estatísticas e tome decisões baseadas em dados.",
  },
];

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao fazer login");
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Login realizado",
        description: "Bem-vindo ao FleetTrack!",
      });
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Credenciais inválidas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, password, name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao criar conta");
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Conta criada",
        description: "Bem-vindo ao FleetTrack!",
      });
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: error instanceof Error ? error.message : "Erro ao criar conta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showRegister) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Truck className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <p className="text-muted-foreground">Preencha seus dados para começar</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    data-testid="input-register-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-phone">Número de Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-phone"
                    type="text"
                    placeholder="912345678"
                    className="pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    data-testid="input-register-phone"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Crie uma senha"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-register-password"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register-submit">
                {isLoading ? "Criando conta..." : "Cadastrar"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => {
                    setShowRegister(false);
                    setShowLogin(true);
                    setName("");
                    setPhone("");
                    setPassword("");
                  }}
                  data-testid="link-go-to-login"
                >
                  Entre aqui
                </button>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowRegister(false);
                  setName("");
                  setPhone("");
                  setPassword("");
                }}
                data-testid="button-register-back"
              >
                Voltar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Truck className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl">FleetTrack</CardTitle>
            <p className="text-muted-foreground">Entre com suas credenciais</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Número de Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="text"
                    placeholder="912345678"
                    className="pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    data-testid="input-phone"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-password"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login-submit">
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => {
                    setShowLogin(false);
                    setShowRegister(true);
                    setPhone("");
                    setPassword("");
                  }}
                  data-testid="link-go-to-register"
                >
                  Cadastre-se
                </button>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowLogin(false)}
                data-testid="button-back"
              >
                Voltar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Truck className="h-6 w-6" />
            </div>
            <h1 className="font-semibold text-lg">FleetTrack</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={() => setShowRegister(true)} data-testid="button-header-register">
              Cadastrar
            </Button>
            <Button onClick={() => setShowLogin(true)} data-testid="button-header-login">
              Entrar
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Gestão de Frotas Simplificada
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Acompanhe seus veículos, motoristas e manutenções em um único lugar. 
              Tome decisões inteligentes com dados em tempo real.
            </p>
            <Button size="lg" onClick={() => setShowLogin(true)} data-testid="button-hero-login">
              Começar Agora
            </Button>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto">
            <h3 className="text-2xl font-semibold text-center mb-12">
              Tudo que você precisa para gerenciar sua frota
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="hover-elevate">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-2xl">
            <h3 className="text-2xl font-semibold mb-4">
              Pronto para começar?
            </h3>
            <p className="text-muted-foreground mb-8">
              Entre agora e comece a gerenciar sua frota de forma eficiente.
            </p>
            <Button size="lg" onClick={() => setShowLogin(true)} data-testid="button-cta-login">
              Acessar Sistema
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>FleetTrack - Sistema de Gestão de Frotas</p>
        </div>
      </footer>
    </div>
  );
}
