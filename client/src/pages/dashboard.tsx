import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MetricCard } from "@/components/fleet/MetricCard";
import { VehicleCard } from "@/components/fleet/VehicleCard";
import { AlertItem } from "@/components/fleet/AlertItem";
import { FleetMap } from "@/components/fleet/FleetMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck, Users, AlertTriangle, Wrench, ArrowRight, MapPin } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Vehicle, Alert, Trip } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | undefined>();

  const { data: metrics, isLoading: metricsLoading } = useQuery<{
    totalVehicles: number;
    activeDrivers: number;
    activeAlerts: number;
    maintenanceDue: number;
  }>({
    queryKey: ["/api/metrics"],
  });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const { data: trips = [] } = useQuery<Trip[]>({
    queryKey: ["/api/trips"],
    refetchInterval: 3000,
  });

  const dismissAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/alerts/${id}/dismiss`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
    },
  });

  const formatTimestamp = (timestamp: Date | null) => {
    if (!timestamp) return "";
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ptBR });
  };

  const recentVehicles = vehicles.slice(0, 4);

  // Build active routes from trips - also show vehicle location if trip is active
  const activeRoutes = trips
    .filter(t => t.status === "active" && t.vehicleId)
    .map(t => {
      // Get the vehicle for this trip
      const vehicle = vehicles.find(v => v.id === t.vehicleId);
      
      // Use trip coordinates if available, otherwise use vehicle location
      const startLat = t.startLat || vehicle?.lat;
      const startLng = t.startLng || vehicle?.lng;
      const currentLat = t.currentLat || vehicle?.lat;
      const currentLng = t.currentLng || vehicle?.lng;
      
      // Only include if we have coordinates
      if (!startLat || !startLng || !currentLat || !currentLng) {
        return null;
      }
      
      return {
        vehicleId: t.vehicleId,
        startLat,
        startLng,
        currentLat,
        currentLng,
        destLat: t.destLat ?? undefined,
        destLng: t.destLng ?? undefined,
        destination: t.destination ?? undefined,
      };
    })
    .filter(Boolean) as Array<{
      vehicleId: string;
      startLat: number;
      startLng: number;
      currentLat: number;
      currentLng: number;
      destLat?: number;
      destLng?: number;
      destination?: string;
    }>;

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
        {metricsLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <MetricCard
              title="Total de Veículos"
              value={metrics?.totalVehicles ?? 0}
              icon={Truck}
            />
            <MetricCard
              title="Motoristas Ativos"
              value={metrics?.activeDrivers ?? 0}
              icon={Users}
            />
            <MetricCard
              title="Alertas Ativos"
              value={metrics?.activeAlerts ?? 0}
              icon={AlertTriangle}
            />
            <MetricCard
              title="Manutenção Pendente"
              value={metrics?.maintenanceDue ?? 0}
              icon={Wrench}
            />
          </>
        )}
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
                {vehiclesLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <FleetMap
                    vehicles={vehicles.filter(v => v.lat && v.lng).map(v => ({
                      id: v.id,
                      plate: v.plate,
                      lat: v.lat!,
                      lng: v.lng!,
                      status: v.status as "active" | "idle" | "maintenance" | "alert",
                      driver: v.driverId ?? undefined,
                    }))}
                    activeRoutes={activeRoutes}
                    selectedVehicleId={selectedVehicle}
                    onVehicleClick={setSelectedVehicle}
                  />
                )}
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
              {alertsLoading ? (
                <>
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </>
              ) : alerts.length > 0 ? (
                alerts.slice(0, 5).map(alert => (
                  <AlertItem
                    key={alert.id}
                    id={alert.id}
                    type={alert.type as "fuel" | "maintenance" | "document" | "speed"}
                    title={alert.title}
                    description={alert.description}
                    timestamp={formatTimestamp(alert.timestamp)}
                    onDismiss={() => dismissAlertMutation.mutate(alert.id)}
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
          {vehiclesLoading ? (
            <>
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </>
          ) : recentVehicles.length > 0 ? (
            recentVehicles.map(vehicle => (
              <VehicleCard
                key={vehicle.id}
                id={vehicle.id}
                plate={vehicle.plate}
                make={vehicle.make}
                model={vehicle.model}
                year={vehicle.year}
                status={vehicle.status as "active" | "idle" | "maintenance" | "alert"}
                driver={vehicle.driverId ?? undefined}
                location={vehicle.location ?? undefined}
                fuelLevel={vehicle.fuelLevel ?? 0}
                odometer={vehicle.odometer ?? 0}
                showOdometerWarning={false}
                onView={() => {}}
                onEdit={() => {}}
                onAssignDriver={() => {}}
              />
            ))
          ) : (
            <p className="text-muted-foreground col-span-full text-center py-4">
              Nenhum veículo cadastrado. Adicione seu primeiro veículo!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
