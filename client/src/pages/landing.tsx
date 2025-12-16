import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/fleet/ThemeToggle";
import { Truck, MapPin, Bell, Wrench, Users, BarChart3 } from "lucide-react";

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
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

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
            <Button onClick={handleLogin} data-testid="button-header-login">
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
            <Button size="lg" onClick={handleLogin} data-testid="button-hero-login">
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
            <Button size="lg" onClick={handleLogin} data-testid="button-cta-login">
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
