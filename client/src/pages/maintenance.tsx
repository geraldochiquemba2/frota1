import { useState } from "react";
import { MaintenanceCard } from "@/components/fleet/MaintenanceCard";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Calendar, Wrench } from "lucide-react";

// todo: remove mock functionality
const mockMaintenance = [
  { id: "m1", vehiclePlate: "ABC-1234", serviceType: "Troca de Óleo", scheduledDate: "2024-12-20", status: "scheduled" as const, description: "Troca de óleo e filtro regular" },
  { id: "m2", vehiclePlate: "XYZ-5678", serviceType: "Inspeção de Freios", scheduledDate: "2024-12-18", status: "in-progress" as const, description: "Inspeção completa do sistema de freios e troca de pastilhas" },
  { id: "m3", vehiclePlate: "DEF-9012", serviceType: "Rodízio de Pneus", scheduledDate: "2024-12-10", status: "overdue" as const, description: "Rodízio de pneus e verificação de pressão" },
  { id: "m4", vehiclePlate: "GHI-3456", serviceType: "Revisão do Motor", scheduledDate: "2024-12-01", status: "completed" as const, description: "Revisão completa do motor e diagnóstico" },
  { id: "m5", vehiclePlate: "JKL-7890", serviceType: "Serviço de Câmbio", scheduledDate: "2024-12-22", status: "scheduled" as const, description: "Troca de óleo do câmbio" },
  { id: "m6", vehiclePlate: "MNO-2345", serviceType: "Troca de Filtro de Ar", scheduledDate: "2024-12-25", status: "scheduled" as const, description: "Troca dos filtros de ar do motor e cabine" },
];

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
  const [maintenance, setMaintenance] = useState(mockMaintenance);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "scheduled" | "in-progress" | "completed" | "overdue">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    vehiclePlate: "",
    serviceType: "",
    scheduledDate: "",
    description: "",
  });

  const filteredMaintenance = maintenance.filter(m => {
    const matchesSearch = m.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      m.serviceType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddMaintenance = () => {
    const id = `m${Date.now()}`;
    setMaintenance([...maintenance, {
      ...newMaintenance,
      id,
      status: "scheduled" as const,
    }]);
    setNewMaintenance({ vehiclePlate: "", serviceType: "", scheduledDate: "", description: "" });
    setIsAddDialogOpen(false);
    console.log("Maintenance scheduled:", newMaintenance);
  };

  const handleComplete = (id: string) => {
    setMaintenance(maintenance.map(m =>
      m.id === id ? { ...m, status: "completed" as const } : m
    ));
    console.log("Maintenance completed:", id);
  };

  const statusCounts = {
    all: maintenance.length,
    scheduled: maintenance.filter(m => m.status === "scheduled").length,
    "in-progress": maintenance.filter(m => m.status === "in-progress").length,
    overdue: maintenance.filter(m => m.status === "overdue").length,
    completed: maintenance.filter(m => m.status === "completed").length,
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
                <Label htmlFor="vehiclePlate">Placa do Veículo</Label>
                <Input
                  id="vehiclePlate"
                  placeholder="ABC-1234"
                  value={newMaintenance.vehiclePlate}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, vehiclePlate: e.target.value })}
                  data-testid="input-maintenance-plate"
                />
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
              <Button onClick={handleAddMaintenance} data-testid="button-confirm-schedule">Agendar</Button>
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

      {filteredMaintenance.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaintenance.map(item => (
            <MaintenanceCard
              key={item.id}
              {...item}
              onComplete={() => handleComplete(item.id)}
              onReschedule={() => console.log("Reschedule", item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum registro de manutenção encontrado.</p>
        </div>
      )}
    </div>
  );
}
