import { useState } from "react";
import { MetricCard } from "@/components/fleet/MetricCard";
import { VehicleCard } from "@/components/fleet/VehicleCard";
import { AlertItem } from "@/components/fleet/AlertItem";
import { FleetMap } from "@/components/fleet/FleetMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Users, AlertTriangle, Wrench, ArrowRight, MapPin } from "lucide-react";
import { Link } from "wouter";

// todo: remove mock functionality
const mockMetrics = {
  totalVehicles: 48,
  activeDrivers: 32,
  activeAlerts: 7,
  maintenanceDue: 4,
};

const mockVehicles = [
  { id: "v1", plate: "ABC-1234", make: "Ford", model: "Transit", year: 2022, status: "active" as const, driver: "João Silva", location: "Av. Paulista, 1000", fuelLevel: 75, odometer: 45230, lat: -23.5505, lng: -46.6333 },
  { id: "v2", plate: "XYZ-5678", make: "Mercedes", model: "Sprinter", year: 2021, status: "idle" as const, driver: "Maria Santos", location: "Rua Augusta, 500", fuelLevel: 42, odometer: 78500, lat: -23.5705, lng: -46.6533 },
  { id: "v3", plate: "DEF-9012", make: "Volkswagen", model: "Delivery", year: 2020, status: "maintenance" as const, location: "Oficina Central", fuelLevel: 90, odometer: 120000, lat: -23.5305, lng: -46.6133 },
  { id: "v4", plate: "GHI-3456", make: "Fiat", model: "Ducato", year: 2023, status: "alert" as const, driver: "Carlos Oliveira", location: "BR-116 km 45", fuelLevel: 12, odometer: 15000, lat: -23.5905, lng: -46.6733 },
];

const mockAlerts = [
  { id: "a1", type: "fuel" as const, title: "Alerta de Combustível Baixo", description: "Veículo GHI-3456 com nível de combustível abaixo de 15%", timestamp: "10 minutos atrás" },
  { id: "a2", type: "document" as const, title: "CNH Expirando", description: "CNH da motorista Maria Santos expira em 15 dias", timestamp: "1 hora atrás" },
  { id: "a3", type: "maintenance" as const, title: "Manutenção Atrasada", description: "Veículo ABC-1234 está atrasado para troca de óleo", timestamp: "2 horas atrás" },
];

export default function Dashboard() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | undefined>();
  const [alerts, setAlerts] = useState(mockAlerts);

  const handleDismissAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Painel</h1>
          <p className="text-muted-foreground">Visão geral da frota e informações rápidas</p>
        </div>
        <Button asChild data-testid="button-add-vehicle">
          <Link href="/vehicles">
            <Truck className="h-4 w-4 mr-2" />
            Gerenciar Veículos
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Veículos"
          value={mockMetrics.totalVehicles}
          icon={Truck}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Motoristas Ativos"
          value={mockMetrics.activeDrivers}
          icon={Users}
          trend={{ value: 5, isPositive: true }}
        />
        <MetricCard
          title="Alertas Ativos"
          value={mockMetrics.activeAlerts}
          icon={AlertTriangle}
          trend={{ value: 15, isPositive: false }}
        />
        <MetricCard
          title="Manutenção Pendente"
          value={mockMetrics.maintenanceDue}
          icon={Wrench}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Mapa da Frota ao Vivo
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/map">
                  Ver Mapa Completo <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] rounded-md overflow-hidden">
                <FleetMap
                  vehicles={mockVehicles.map(v => ({
                    id: v.id,
                    plate: v.plate,
                    lat: v.lat,
                    lng: v.lng,
                    status: v.status,
                    driver: v.driver,
                  }))}
                  selectedVehicleId={selectedVehicle}
                  onVehicleClick={setSelectedVehicle}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas Recentes
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/alerts">Ver Todos</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.length > 0 ? (
                alerts.map(alert => (
                  <AlertItem
                    key={alert.id}
                    {...alert}
                    onDismiss={() => handleDismissAlert(alert.id)}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum alerta ativo</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-semibold">Veículos Recentes</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/vehicles">Ver Todos <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockVehicles.map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              {...vehicle}
              onView={() => console.log("View", vehicle.id)}
              onEdit={() => console.log("Edit", vehicle.id)}
              onAssignDriver={() => console.log("Assign", vehicle.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
