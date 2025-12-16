import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AlertItem, type AlertType } from "@/components/fleet/AlertItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Bell, CheckCheck } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Alert } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Alerts() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AlertType | "all">("all");

  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const dismissAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/alerts/${id}/dismiss`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({ title: "Alerta dispensado!" });
    },
    onError: () => {
      toast({ title: "Erro ao dispensar alerta", variant: "destructive" });
    },
  });

  const dismissAllMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/alerts/dismiss-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({ title: "Todos os alertas foram dispensados!" });
    },
    onError: () => {
      toast({ title: "Erro ao dispensar alertas", variant: "destructive" });
    },
  });

  const formatTimestamp = (timestamp: Date | null) => {
    if (!timestamp) return "";
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ptBR });
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

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
          <Button 
            variant="outline" 
            onClick={() => dismissAllMutation.mutate()}
            disabled={dismissAllMutation.isPending}
            data-testid="button-dismiss-all"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            {dismissAllMutation.isPending ? "Dispensando..." : "Dispensar Todos"}
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

      {isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </CardContent>
        </Card>
      ) : filteredAlerts.length > 0 ? (
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
                id={alert.id}
                type={alert.type as AlertType}
                title={alert.title}
                description={alert.description}
                timestamp={formatTimestamp(alert.timestamp)}
                onDismiss={() => dismissAlertMutation.mutate(alert.id)}
                onClick={() => {}}
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
