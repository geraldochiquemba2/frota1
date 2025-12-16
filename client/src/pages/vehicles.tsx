import { useState } from "react";
import { VehicleCard } from "@/components/fleet/VehicleCard";
import { StatusBadge, type VehicleStatus } from "@/components/fleet/StatusBadge";
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
import { Plus, Search, Filter } from "lucide-react";

// todo: remove mock functionality
const mockVehicles = [
  { id: "v1", plate: "ABC-1234", make: "Ford", model: "Transit", year: 2022, status: "active" as VehicleStatus, driver: "João Silva", location: "Av. Paulista, 1000", fuelLevel: 75, odometer: 45230 },
  { id: "v2", plate: "XYZ-5678", make: "Mercedes", model: "Sprinter", year: 2021, status: "idle" as VehicleStatus, driver: "Maria Santos", location: "Rua Augusta, 500", fuelLevel: 42, odometer: 78500 },
  { id: "v3", plate: "DEF-9012", make: "Volkswagen", model: "Delivery", year: 2020, status: "maintenance" as VehicleStatus, location: "Oficina Central", fuelLevel: 90, odometer: 120000 },
  { id: "v4", plate: "GHI-3456", make: "Fiat", model: "Ducato", year: 2023, status: "alert" as VehicleStatus, driver: "Carlos Oliveira", location: "BR-116 km 45", fuelLevel: 12, odometer: 15000 },
  { id: "v5", plate: "JKL-7890", make: "Iveco", model: "Daily", year: 2022, status: "active" as VehicleStatus, driver: "Ana Silva", location: "Centro, RJ", fuelLevel: 88, odometer: 32000 },
  { id: "v6", plate: "MNO-2345", make: "Renault", model: "Master", year: 2021, status: "idle" as VehicleStatus, location: "Patio Central", fuelLevel: 65, odometer: 55000 },
];

export default function Vehicles() {
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "all">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plate: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
  });

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.driver?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddVehicle = () => {
    const id = `v${Date.now()}`;
    setVehicles([...vehicles, {
      ...newVehicle,
      id,
      status: "idle" as VehicleStatus,
      fuelLevel: 100,
      odometer: 0,
      location: "Não atribuído",
    }]);
    setNewVehicle({ plate: "", make: "", model: "", year: new Date().getFullYear() });
    setIsAddDialogOpen(false);
    console.log("Vehicle added:", newVehicle);
  };

  const statusCounts = {
    all: vehicles.length,
    active: vehicles.filter(v => v.status === "active").length,
    idle: vehicles.filter(v => v.status === "idle").length,
    maintenance: vehicles.filter(v => v.status === "maintenance").length,
    alert: vehicles.filter(v => v.status === "alert").length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Veículos</h1>
          <p className="text-muted-foreground">Gerencie os veículos da sua frota</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-vehicle">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Veículo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Veículo</DialogTitle>
              <DialogDescription>
                Insira os dados do veículo para adicioná-lo à sua frota.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="plate">Placa</Label>
                <Input
                  id="plate"
                  placeholder="ABC-1234"
                  value={newVehicle.plate}
                  onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                  data-testid="input-plate"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="make">Marca</Label>
                  <Input
                    id="make"
                    placeholder="Ford"
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                    data-testid="input-make"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    placeholder="Transit"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    data-testid="input-model"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">Ano</Label>
                <Input
                  id="year"
                  type="number"
                  value={newVehicle.year}
                  onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                  data-testid="input-year"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddVehicle} data-testid="button-confirm-add">Adicionar Veículo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar veículos..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as VehicleStatus | "all")}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos ({statusCounts.all})</SelectItem>
            <SelectItem value="active">Ativo ({statusCounts.active})</SelectItem>
            <SelectItem value="idle">Parado ({statusCounts.idle})</SelectItem>
            <SelectItem value="maintenance">Manutenção ({statusCounts.maintenance})</SelectItem>
            <SelectItem value="alert">Alerta ({statusCounts.alert})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          Todos ({statusCounts.all})
        </Button>
        {(["active", "idle", "maintenance", "alert"] as VehicleStatus[]).map(status => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="gap-2"
          >
            <StatusBadge status={status} />
            <span>({statusCounts[status]})</span>
          </Button>
        ))}
      </div>

      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVehicles.map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              {...vehicle}
              onView={() => console.log("View", vehicle.id)}
              onEdit={() => console.log("Edit", vehicle.id)}
              onAssignDriver={() => console.log("Assign", vehicle.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum veículo encontrado com os critérios informados.</p>
        </div>
      )}
    </div>
  );
}
