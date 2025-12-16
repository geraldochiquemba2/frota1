import { useState } from "react";
import { AlertItem, type AlertType } from "@/components/fleet/AlertItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Bell, CheckCheck } from "lucide-react";

// todo: remove mock functionality
const mockAlerts = [
  { id: "a1", type: "fuel" as AlertType, title: "Alerta de Combustível Baixo", description: "Veículo GHI-3456 com nível de combustível abaixo de 15%", timestamp: "10 minutos atrás" },
  { id: "a2", type: "document" as AlertType, title: "CNH Expirando", description: "CNH da motorista Maria Santos expira em 15 dias", timestamp: "1 hora atrás" },
  { id: "a3", type: "maintenance" as AlertType, title: "Manutenção Atrasada", description: "Veículo ABC-1234 está atrasado para troca de óleo em 500km", timestamp: "2 horas atrás" },
  { id: "a4", type: "speed" as AlertType, title: "Excesso de Velocidade", description: "Veículo XYZ-5678 ultrapassou limite de velocidade na BR-116", timestamp: "3 horas atrás" },
  { id: "a5", type: "document" as AlertType, title: "Seguro Expirando", description: "Seguro do veículo DEF-9012 expira em 7 dias", timestamp: "5 horas atrás" },
  { id: "a6", type: "maintenance" as AlertType, title: "Pressão de Pneu Baixa", description: "Veículo JKL-7890 com pressão baixa no pneu traseiro esquerdo", timestamp: "6 horas atrás" },
  { id: "a7", type: "fuel" as AlertType, title: "Consumo de Combustível Anormal", description: "Veículo MNO-2345 apresentando consumo 30% acima da média", timestamp: "1 dia atrás" },
  { id: "a8", type: "speed" as AlertType, title: "Frenagem Brusca Detectada", description: "Veículo ABC-1234 teve 3 eventos de frenagem brusca hoje", timestamp: "1 dia atrás" },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AlertType | "all">("all");

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDismiss = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    console.log("Alert dismissed:", id);
  };

  const handleDismissAll = () => {
    setAlerts([]);
    console.log("All alerts dismissed");
  };

  const typeCounts = {
    all: alerts.length,
    maintenance: alerts.filter(a => a.type === "maintenance").length,
    document: alerts.filter(a => a.type === "document").length,
    fuel: alerts.filter(a => a.type === "fuel").length,
    speed: alerts.filter(a => a.type === "speed").length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Alertas</h1>
          <p className="text-muted-foreground">Monitore e gerencie os alertas da frota</p>
        </div>
        {alerts.length > 0 && (
          <Button variant="outline" onClick={handleDismissAll} data-testid="button-dismiss-all">
            <CheckCheck className="h-4 w-4 mr-2" />
            Dispensar Todos
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar alertas..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-alerts"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={typeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("all")}
        >
          Todos ({typeCounts.all})
        </Button>
        <Button
          variant={typeFilter === "maintenance" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("maintenance")}
        >
          Manutenção ({typeCounts.maintenance})
        </Button>
        <Button
          variant={typeFilter === "document" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("document")}
        >
          Documentos ({typeCounts.document})
        </Button>
        <Button
          variant={typeFilter === "fuel" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("fuel")}
        >
          Combustível ({typeCounts.fuel})
        </Button>
        <Button
          variant={typeFilter === "speed" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("speed")}
        >
          Velocidade ({typeCounts.speed})
        </Button>
      </div>

      {filteredAlerts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas Ativos ({filteredAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredAlerts.map(alert => (
              <AlertItem
                key={alert.id}
                {...alert}
                onDismiss={() => handleDismiss(alert.id)}
                onClick={() => console.log("Alert clicked:", alert.id)}
              />
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {alerts.length === 0 ? "Nenhum alerta ativo. Sua frota está funcionando bem!" : "Nenhum alerta corresponde à sua busca."}
          </p>
        </div>
      )}
    </div>
  );
}
