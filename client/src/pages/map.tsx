import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FleetMap } from "@/components/fleet/FleetMap";
import { VehicleCard } from "@/components/fleet/VehicleCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, List } from "lucide-react";
import type { VehicleStatus } from "@/components/fleet/StatusBadge";
import type { Vehicle, Driver } from "@shared/schema";

export default function LiveMap() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | undefined>();
  const [search, setSearch] = useState("");

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time tracking
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const [showSidebar, setShowSidebar] = useState(true);

  const getDriverName = (driverId: string | null) => {
    if (!driverId) return undefined;
    const driver = drivers.find(d => d.id === driverId);
    return driver?.name;
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
                filteredVehicles.map(vehicle => (
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
                    {vehicle.location && (
                      <p className="text-xs text-muted-foreground truncate">{vehicle.location}</p>
                    )}
                  </div>
                ))
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
          selectedVehicleId={selectedVehicle}
          onVehicleClick={setSelectedVehicle}
        />

        {selected && (
          <Card className="absolute bottom-4 left-4 right-4 max-w-md z-10">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-base font-mono">{selected.plate}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedVehicle(undefined)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
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
                onView={() => console.log("View", selected.id)}
                onEdit={() => console.log("Edit", selected.id)}
                onAssignDriver={() => console.log("Assign", selected.id)}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
