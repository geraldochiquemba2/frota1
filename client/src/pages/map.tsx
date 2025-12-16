import { useState } from "react";
import { FleetMap } from "@/components/fleet/FleetMap";
import { VehicleCard } from "@/components/fleet/VehicleCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, List, Map as MapIcon } from "lucide-react";
import type { VehicleStatus } from "@/components/fleet/StatusBadge";

// todo: remove mock functionality
const mockVehicles = [
  { id: "v1", plate: "ABC-1234", make: "Ford", model: "Transit", year: 2022, status: "active" as VehicleStatus, driver: "João Silva", location: "Av. Paulista, 1000", fuelLevel: 75, odometer: 45230, lat: -23.5505, lng: -46.6333 },
  { id: "v2", plate: "XYZ-5678", make: "Mercedes", model: "Sprinter", year: 2021, status: "idle" as VehicleStatus, driver: "Maria Santos", location: "Rua Augusta, 500", fuelLevel: 42, odometer: 78500, lat: -23.5705, lng: -46.6533 },
  { id: "v3", plate: "DEF-9012", make: "Volkswagen", model: "Delivery", year: 2020, status: "maintenance" as VehicleStatus, location: "Oficina Central", fuelLevel: 90, odometer: 120000, lat: -23.5305, lng: -46.6133 },
  { id: "v4", plate: "GHI-3456", make: "Fiat", model: "Ducato", year: 2023, status: "alert" as VehicleStatus, driver: "Carlos Oliveira", location: "BR-116 km 45", fuelLevel: 12, odometer: 15000, lat: -23.5905, lng: -46.6733 },
  { id: "v5", plate: "JKL-7890", make: "Iveco", model: "Daily", year: 2022, status: "active" as VehicleStatus, driver: "Ana Silva", location: "Centro, RJ", fuelLevel: 88, odometer: 32000, lat: -23.5405, lng: -46.6433 },
];

export default function LiveMap() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);

  const filteredVehicles = mockVehicles.filter(v =>
    v.plate.toLowerCase().includes(search.toLowerCase()) ||
    v.driver?.toLowerCase().includes(search.toLowerCase())
  );

  const selected = mockVehicles.find(v => v.id === selectedVehicle);

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
              {filteredVehicles.map(vehicle => (
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
                  {vehicle.driver && (
                    <p className="text-xs text-muted-foreground mt-1">{vehicle.driver}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">{vehicle.location}</p>
                </div>
              ))}
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
                {...selected}
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
