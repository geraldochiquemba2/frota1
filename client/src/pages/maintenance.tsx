import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MaintenanceCard } from "@/components/fleet/MaintenanceCard";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Wrench } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Maintenance as MaintenanceType, InsertMaintenance, Vehicle } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type MaintenanceStatus = "scheduled" | "in-progress" | "completed" | "overdue";

const serviceTypes = [
  "Troca de Óleo",
  "Inspeção de Freios",
  "Rodízio de Pneus",
  "Revisão do Motor",
  "Serviço de Câmbio",
  "Troca de Filtro de Ar",
  "Verificação de Bateria",
  "Troca de Fluido de Arrefecimento",
  "Inspeção Geral",
];

export default function Maintenance() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MaintenanceStatus>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    vehicleId: "",
    vehiclePlate: "",
    serviceType: "",
    scheduledDate: "",
    description: "",
  });

  const { data: maintenanceRecords = [], isLoading } = useQuery<MaintenanceType[]>({
    queryKey: ["/api/maintenance"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: async (record: Partial<InsertMaintenance>) => {
      const res = await apiRequest("POST", "/api/maintenance", record);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({ title: "Manutenção agendada com sucesso!" });
      setIsAddDialogOpen(false);
      setNewMaintenance({ vehicleId: "", vehiclePlate: "", serviceType: "", scheduledDate: "", description: "" });
    },
    onError: () => {
      toast({ title: "Erro ao agendar manutenção", variant: "destructive" });
    },
  });

  const updateMaintenanceMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/maintenance/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({ title: "Manutenção atualizada!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar manutenção", variant: "destructive" });
    },
  });

  const filteredMaintenance = maintenanceRecords.filter(m => {
    const matchesSearch = m.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      m.serviceType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddMaintenance = () => {
    if (!newMaintenance.vehiclePlate || !newMaintenance.serviceType || !newMaintenance.scheduledDate) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    createMaintenanceMutation.mutate({
      vehicleId: newMaintenance.vehicleId || null,
      vehiclePlate: newMaintenance.vehiclePlate,
      serviceType: newMaintenance.serviceType,
      scheduledDate: newMaintenance.scheduledDate,
      description: newMaintenance.description || null,
      status: "scheduled",
    });
  };

  const handleComplete = (id: string) => {
    updateMaintenanceMutation.mutate({ id, status: "completed" });
  };

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setNewMaintenance({ ...newMaintenance, vehicleId, vehiclePlate: vehicle.plate });
    }
  };

  const statusCounts = {
    all: maintenanceRecords.length,
    scheduled: maintenanceRecords.filter(m => m.status === "scheduled").length,
    "in-progress": maintenanceRecords.filter(m => m.status === "in-progress").length,
    overdue: maintenanceRecords.filter(m => m.status === "overdue").length,
    completed: maintenanceRecords.filter(m => m.status === "completed").length,
  };

  const statusLabels = {
    all: "Todas",
    scheduled: "Agendadas",
    "in-progress": "Em Andamento",
    overdue: "Atrasadas",
    completed: "Concluídas",
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Manutenção</h1>
          <p className="text-muted-foreground">Agende e acompanhe a manutenção dos veículos</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-schedule-maintenance">
              <Plus className="h-4 w-4 mr-2" />
              Agendar Manutenção
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Manutenção</DialogTitle>
              <DialogDescription>
                Agende um serviço de manutenção para um veículo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="vehicle">Veículo</Label>
                {vehicles.length > 0 ? (
                  <Select
                    value={newMaintenance.vehicleId}
                    onValueChange={handleVehicleSelect}
                  >
                    <SelectTrigger data-testid="select-maintenance-vehicle">
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
                    value={newMaintenance.vehiclePlate}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, vehiclePlate: e.target.value })}
                    data-testid="input-maintenance-plate"
                  />
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="serviceType">Tipo de Serviço</Label>
                <Select
                  value={newMaintenance.serviceType}
                  onValueChange={(v) => setNewMaintenance({ ...newMaintenance, serviceType: v })}
                >
                  <SelectTrigger data-testid="select-service-type">
                    <SelectValue placeholder="Selecione o tipo de serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scheduledDate">Data Agendada</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={newMaintenance.scheduledDate}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, scheduledDate: e.target.value })}
                  data-testid="input-maintenance-date"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Detalhes adicionais..."
                  value={newMaintenance.description}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                  data-testid="input-maintenance-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleAddMaintenance} 
                disabled={createMaintenanceMutation.isPending}
                data-testid="button-confirm-schedule"
              >
                {createMaintenanceMutation.isPending ? "Agendando..." : "Agendar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar manutenção..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-maintenance"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "scheduled", "in-progress", "overdue", "completed"] as const).map(status => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {statusLabels[status]} ({statusCounts[status]})
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : filteredMaintenance.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaintenance.map(item => (
            <MaintenanceCard
              key={item.id}
              id={item.id}
              vehiclePlate={item.vehiclePlate}
              serviceType={item.serviceType}
              scheduledDate={item.scheduledDate}
              status={item.status as MaintenanceStatus}
              description={item.description ?? undefined}
              onComplete={() => handleComplete(item.id)}
              onReschedule={() => {}}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {maintenanceRecords.length === 0 
              ? "Nenhuma manutenção agendada. Agende a primeira!" 
              : "Nenhum registro de manutenção encontrado."}
          </p>
        </div>
      )}
    </div>
  );
}
