import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FleetMap } from "@/components/fleet/FleetMap";
import { VehicleCard } from "@/components/fleet/VehicleCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, List, MapPin, Clock, Briefcase } from "lucide-react";
import type { VehicleStatus } from "@/components/fleet/StatusBadge";
import type { Vehicle, Driver, Trip } from "@shared/schema";

export default function LiveMap() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | undefined>();
  const [search, setSearch] = useState("");

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time tracking
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: trips = [], isLoading: tripsLoading } = useQuery<Trip[]>({
    queryKey: ["/api/trips"],
    refetchInterval: 3000, // Refresh every 3 seconds for real-time route tracking
  });

  const [showSidebar, setShowSidebar] = useState(true);

  // Debug logging for trip data
  useEffect(() => {
    if (selectedVehicle && trips.length > 0) {
      const activeTrip = trips.find(t => t.vehicleId === selectedVehicle && t.status === "active");
      console.log("Selected vehicle:", selectedVehicle);
      console.log("Total trips:", trips.length);
      console.log("Active trip for vehicle:", activeTrip);
    }
  }, [selectedVehicle, trips]);

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
      
      const route = {
        vehicleId: t.vehicleId,
        startLat,
        startLng,
        currentLat,
        currentLng,
        destLat: t.destLat ?? undefined,
        destLng: t.destLng ?? undefined,
        destination: t.destination ?? undefined,
      };
      console.log("Active route for vehicle", t.vehicleId, route);
      return route;
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

  const getDriverName = (driverId: string | null) => {
    if (!driverId) return undefined;
    const driver = drivers.find(d => d.id === driverId);
    return driver?.name;
  };

  const getActiveTrip = (vehicleId: string) => {
    return trips.find(t => t.vehicleId === vehicleId && t.status === "active");
  };

  const vehiclesWithLocation = vehicles.filter(v => v.lat && v.lng);

  const filteredVehicles = vehiclesWithLocation.filter(v =>
    v.plate.toLowerCase().includes(search.toLowerCase()) ||
    getDriverName(v.driverId)?.toLowerCase().includes(search.toLowerCase())
  );

  const selected = vehicles.find(v => v.id === selectedVehicle);

  if (vehiclesLoading) {
    return (
      <div className="h-full flex relative">
        <div className="w-80 border-r bg-background flex flex-col">
          <div className="p-4 border-b">
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex relative">
      {showSidebar && (
        <div className="w-80 border-r bg-background flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="font-semibold">Veículos</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-map"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {filteredVehicles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum veículo com localização disponível
                </p>
              ) : (
                filteredVehicles.map(vehicle => {
                  const activeTrip = getActiveTrip(vehicle.id);
                  return (
                    <div
                      key={vehicle.id}
                      className={`p-3 rounded-md cursor-pointer hover-elevate ${
                        selectedVehicle === vehicle.id ? "bg-accent" : "bg-card"
                      }`}
                      onClick={() => setSelectedVehicle(vehicle.id)}
                      data-testid={`map-vehicle-item-${vehicle.id}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-sm font-semibold">{vehicle.plate}</span>
                        <span className={`h-2 w-2 rounded-full ${
                          vehicle.status === "active" ? "bg-green-500" :
                          vehicle.status === "idle" ? "bg-amber-500" :
                          vehicle.status === "maintenance" ? "bg-blue-500" : "bg-red-500"
                        }`} />
                      </div>
                      {vehicle.driverId && (
                        <p className="text-xs text-muted-foreground mt-1">{getDriverName(vehicle.driverId)}</p>
                      )}
                      {activeTrip && (
                        <div className="mt-2 pt-2 border-t border-border space-y-1">
                          <p className="text-xs font-semibold text-foreground">Rota Ativa</p>
                          <p className="text-xs text-muted-foreground truncate" data-testid={`trip-origin-${vehicle.id}`}>
                            De: {activeTrip.startLocation}
                          </p>
                          <p className="text-xs text-muted-foreground truncate" data-testid={`trip-destination-${vehicle.id}`}>
                            Para: {activeTrip.destination || "Não definido"}
                          </p>
                        </div>
                      )}
                      {!activeTrip && vehicle.location && (
                        <p className="text-xs text-muted-foreground truncate mt-1">{vehicle.location}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      <div className="flex-1 relative">
        {!showSidebar && (
          <Button
            className="absolute top-4 left-4 z-10"
            size="sm"
            variant="secondary"
            onClick={() => setShowSidebar(true)}
          >
            <List className="h-4 w-4 mr-2" />
            Mostrar Lista
          </Button>
        )}

        <FleetMap
          vehicles={vehiclesWithLocation.map(v => ({
            id: v.id,
            plate: v.plate,
            lat: v.lat!,
            lng: v.lng!,
            status: v.status as VehicleStatus,
            driver: getDriverName(v.driverId),
          }))}
          activeRoutes={activeRoutes}
          selectedVehicleId={selectedVehicle}
          onVehicleClick={setSelectedVehicle}
        />

        {selected && (
          <Card className="absolute bottom-4 left-4 w-96 z-10 max-h-[calc(100vh-120px)] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3 sticky top-0 bg-background z-10">
              <CardTitle className="text-base font-mono">{selected.plate}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedVehicle(undefined)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
              <VehicleCard
                id={selected.id}
                plate={selected.plate}
                make={selected.make}
                model={selected.model}
                year={selected.year}
                status={selected.status as VehicleStatus}
                driver={getDriverName(selected.driverId)}
                location={selected.location || undefined}
                fuelLevel={selected.fuelLevel || undefined}
                odometer={selected.odometer || undefined}
                showOdometerWarning={false}
                onView={() => console.log("View", selected.id)}
                onEdit={() => console.log("Edit", selected.id)}
                onAssignDriver={() => console.log("Assign", selected.id)}
              />
              
              {tripsLoading ? (
                <div className="pt-4 border-t space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : getActiveTrip(selected.id) ? (
                <div className="pt-4 border-t space-y-3">
                  <h3 className="font-semibold text-sm">Detalhes da Viagem</h3>
                  
                  <div className="flex gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Origem</p>
                      <p className="text-sm break-words">{getActiveTrip(selected.id)?.startLocation}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Destino</p>
                      <p className="text-sm break-words">{getActiveTrip(selected.id)?.destination || "Não definido"}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Início</p>
                      <p className="text-sm">
                        {getActiveTrip(selected.id)?.startTime 
                          ? new Date(getActiveTrip(selected.id)!.startTime).toLocaleTimeString('pt-AO')
                          : "-"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Propósito</p>
                      <p className="text-sm break-words">{getActiveTrip(selected.id)?.purpose || "-"}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
