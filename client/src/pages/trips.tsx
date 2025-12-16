import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TripLogCard } from "@/components/fleet/TripLogCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, ClipboardList } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Trip, InsertTrip, Vehicle, Driver } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const purposes = [
  "Entrega",
  "Reunião com Cliente",
  "Reposição de Estoque",
  "Transfer Aeroporto",
  "Transferência de Peças",
  "Chamado de Serviço",
  "Pessoal",
  "Outro",
];

export default function Trips() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "ongoing" | "completed">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({
    vehicleId: "",
    vehiclePlate: "",
    driverId: "",
    driverName: "",
    startLocation: "",
    purpose: "",
  });

  const { data: trips = [], isLoading } = useQuery<Trip[]>({
    queryKey: ["/api/trips"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const createTripMutation = useMutation({
    mutationFn: async (trip: Partial<InsertTrip>) => {
      const res = await apiRequest("POST", "/api/trips", trip);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      toast({ title: "Viagem iniciada com sucesso!" });
      setIsAddDialogOpen(false);
      setNewTrip({ vehicleId: "", vehiclePlate: "", driverId: "", driverName: "", startLocation: "", purpose: "" });
    },
    onError: () => {
      toast({ title: "Erro ao iniciar viagem", variant: "destructive" });
    },
  });

  const filteredTrips = trips.filter(t => {
    const matchesSearch = t.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      t.driverName.toLowerCase().includes(search.toLowerCase()) ||
      t.startLocation.toLowerCase().includes(search.toLowerCase());
    const isOngoing = !t.endTime;
    const matchesFilter = filter === "all" ||
      (filter === "ongoing" && isOngoing) ||
      (filter === "completed" && !isOngoing);
    return matchesSearch && matchesFilter;
  });

  const handleStartTrip = () => {
    if (!newTrip.vehiclePlate || !newTrip.driverName || !newTrip.startLocation) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    createTripMutation.mutate({
      vehicleId: newTrip.vehicleId || "manual",
      vehiclePlate: newTrip.vehiclePlate,
      driverId: newTrip.driverId || null,
      driverName: newTrip.driverName,
      startLocation: newTrip.startLocation,
      purpose: newTrip.purpose || undefined,
    });
  };

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setNewTrip({ ...newTrip, vehicleId, vehiclePlate: vehicle.plate });
    }
  };

  const handleDriverSelect = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      setNewTrip({ ...newTrip, driverId, driverName: driver.name });
    }
  };

  const tripCounts = {
    all: trips.length,
    ongoing: trips.filter(t => !t.endTime).length,
    completed: trips.filter(t => t.endTime).length,
  };

  const filterLabels = {
    all: "Todas",
    ongoing: "Em Andamento",
    completed: "Concluídas",
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Registro de Viagens</h1>
          <p className="text-muted-foreground">Acompanhe e registre as viagens dos veículos</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-start-trip">
              <Plus className="h-4 w-4 mr-2" />
              Iniciar Viagem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Iniciar Nova Viagem</DialogTitle>
              <DialogDescription>
                Registre o início de uma nova viagem.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="vehicle">Veículo</Label>
                {vehicles.length > 0 ? (
                  <Select
                    value={newTrip.vehicleId}
                    onValueChange={handleVehicleSelect}
                  >
                    <SelectTrigger data-testid="select-trip-vehicle">
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.plate} - {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="vehiclePlate"
                    placeholder="ABC-1234"
                    value={newTrip.vehiclePlate}
                    onChange={(e) => setNewTrip({ ...newTrip, vehiclePlate: e.target.value })}
                    data-testid="input-trip-plate"
                  />
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="driver">Motorista</Label>
                {drivers.length > 0 ? (
                  <Select
                    value={newTrip.driverId}
                    onValueChange={handleDriverSelect}
                  >
                    <SelectTrigger data-testid="select-trip-driver">
                      <SelectValue placeholder="Selecione um motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map(driver => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="driverName"
                    placeholder="João Silva"
                    value={newTrip.driverName}
                    onChange={(e) => setNewTrip({ ...newTrip, driverName: e.target.value })}
                    data-testid="input-trip-driver"
                  />
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startLocation">Local de Partida</Label>
                <Input
                  id="startLocation"
                  placeholder="Armazém Central"
                  value={newTrip.startLocation}
                  onChange={(e) => setNewTrip({ ...newTrip, startLocation: e.target.value })}
                  data-testid="input-trip-start"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purpose">Finalidade</Label>
                <Select
                  value={newTrip.purpose}
                  onValueChange={(v) => setNewTrip({ ...newTrip, purpose: v })}
                >
                  <SelectTrigger data-testid="select-trip-purpose">
                    <SelectValue placeholder="Selecione a finalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {purposes.map(purpose => (
                      <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleStartTrip} 
                disabled={createTripMutation.isPending}
                data-testid="button-confirm-trip"
              >
                {createTripMutation.isPending ? "Iniciando..." : "Iniciar Viagem"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar viagens..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-trips"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "ongoing", "completed"] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {filterLabels[f]} ({tripCounts[f]})
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrips.map(trip => (
            <TripLogCard
              key={trip.id}
              id={trip.id}
              vehiclePlate={trip.vehiclePlate}
              driverName={trip.driverName}
              startLocation={trip.startLocation}
              destination={trip.destination ?? undefined}
              endLocation={trip.endLocation ?? undefined}
              startTime={trip.startTime?.toISOString() ?? new Date().toISOString()}
              endTime={trip.endTime?.toISOString()}
              distance={trip.distance ?? undefined}
              purpose={trip.purpose ?? undefined}
              startLat={trip.startLat ?? undefined}
              startLng={trip.startLng ?? undefined}
              currentLat={trip.currentLat ?? undefined}
              currentLng={trip.currentLng ?? undefined}
              onClick={() => {}}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {trips.length === 0 
              ? "Nenhuma viagem registrada. Inicie sua primeira viagem!" 
              : "Nenhuma viagem encontrada."}
          </p>
        </div>
      )}
    </div>
  );
}
