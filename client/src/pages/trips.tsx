import { useState } from "react";
import { TripLogCard } from "@/components/fleet/TripLogCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// todo: remove mock functionality
const mockTrips = [
  { id: "t1", vehiclePlate: "ABC-1234", driverName: "João Silva", startLocation: "Armazém Central, SP", endLocation: "", startTime: "2024-12-16T08:30:00", purpose: "Entrega" },
  { id: "t2", vehiclePlate: "XYZ-5678", driverName: "Maria Santos", startLocation: "Escritório Central, SP", endLocation: "Cliente, Campinas", startTime: "2024-12-16T07:00:00", endTime: "2024-12-16T09:45:00", distance: 85, purpose: "Reunião com Cliente" },
  { id: "t3", vehiclePlate: "DEF-9012", driverName: "Carlos Oliveira", startLocation: "Centro de Distribuição", endLocation: "Loja #15, Guarulhos", startTime: "2024-12-16T06:00:00", endTime: "2024-12-16T08:30:00", distance: 42, purpose: "Reposição de Estoque" },
  { id: "t4", vehiclePlate: "GHI-3456", driverName: "Ana Silva", startLocation: "Escritório Principal", endLocation: "Aeroporto, GRU", startTime: "2024-12-15T14:00:00", endTime: "2024-12-15T15:30:00", distance: 28, purpose: "Transfer Aeroporto" },
  { id: "t5", vehiclePlate: "JKL-7890", driverName: "Pedro Costa", startLocation: "Fábrica A", endLocation: "Fábrica B", startTime: "2024-12-15T10:00:00", endTime: "2024-12-15T11:15:00", distance: 35, purpose: "Transferência de Peças" },
];

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
  const [trips, setTrips] = useState(mockTrips);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "ongoing" | "completed">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({
    vehiclePlate: "",
    driverName: "",
    startLocation: "",
    purpose: "",
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
    const id = `t${Date.now()}`;
    setTrips([{
      ...newTrip,
      id,
      startTime: new Date().toISOString(),
      endLocation: "",
    }, ...trips]);
    setNewTrip({ vehiclePlate: "", driverName: "", startLocation: "", purpose: "" });
    setIsAddDialogOpen(false);
    console.log("Trip started:", newTrip);
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
                <Label htmlFor="vehiclePlate">Placa do Veículo</Label>
                <Input
                  id="vehiclePlate"
                  placeholder="ABC-1234"
                  value={newTrip.vehiclePlate}
                  onChange={(e) => setNewTrip({ ...newTrip, vehiclePlate: e.target.value })}
                  data-testid="input-trip-plate"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="driverName">Nome do Motorista</Label>
                <Input
                  id="driverName"
                  placeholder="João Silva"
                  value={newTrip.driverName}
                  onChange={(e) => setNewTrip({ ...newTrip, driverName: e.target.value })}
                  data-testid="input-trip-driver"
                />
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
              <Button onClick={handleStartTrip} data-testid="button-confirm-trip">Iniciar Viagem</Button>
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

      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrips.map(trip => (
            <TripLogCard
              key={trip.id}
              {...trip}
              onClick={() => console.log("Trip clicked:", trip.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhuma viagem encontrada.</p>
        </div>
      )}
    </div>
  );
}
