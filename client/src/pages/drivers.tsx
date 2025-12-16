import { useState } from "react";
import { DriverCard } from "@/components/fleet/DriverCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Search } from "lucide-react";

// todo: remove mock functionality
const mockDrivers = [
  { id: "d1", name: "João Silva", phone: "+55 11 99999-1234", email: "joao.silva@exemplo.com", licenseExpiry: "2025-06-15", status: "on-trip" as const, assignedVehicle: "ABC-1234" },
  { id: "d2", name: "Maria Santos", phone: "+55 11 88888-5678", email: "maria.santos@exemplo.com", licenseExpiry: "2025-01-10", status: "available" as const },
  { id: "d3", name: "Carlos Oliveira", phone: "+55 11 77777-9012", email: "carlos.oliveira@exemplo.com", licenseExpiry: "2024-12-20", status: "off-duty" as const, assignedVehicle: "XYZ-5678" },
  { id: "d4", name: "Ana Silva", phone: "+55 11 66666-3456", email: "ana.silva@exemplo.com", licenseExpiry: "2026-03-20", status: "on-trip" as const, assignedVehicle: "JKL-7890" },
  { id: "d5", name: "Pedro Costa", phone: "+55 11 55555-7890", email: "pedro.costa@exemplo.com", licenseExpiry: "2025-09-01", status: "available" as const },
  { id: "d6", name: "Lucia Ferreira", phone: "+55 11 44444-2345", email: "lucia.ferreira@exemplo.com", licenseExpiry: "2025-04-15", status: "off-duty" as const },
];

export default function Drivers() {
  const [drivers, setDrivers] = useState(mockDrivers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "on-trip" | "off-duty">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    email: "",
    licenseExpiry: "",
  });

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search);
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddDriver = () => {
    const id = `d${Date.now()}`;
    setDrivers([...drivers, {
      ...newDriver,
      id,
      status: "available" as const,
    }]);
    setNewDriver({ name: "", phone: "", email: "", licenseExpiry: "" });
    setIsAddDialogOpen(false);
    console.log("Driver added:", newDriver);
  };

  const statusCounts = {
    all: drivers.length,
    available: drivers.filter(d => d.status === "available").length,
    "on-trip": drivers.filter(d => d.status === "on-trip").length,
    "off-duty": drivers.filter(d => d.status === "off-duty").length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Motoristas</h1>
          <p className="text-muted-foreground">Gerencie os motoristas da sua frota</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-driver">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Motorista
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Motorista</DialogTitle>
              <DialogDescription>
                Insira os dados do motorista para adicioná-lo à sua frota.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="João da Silva"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  data-testid="input-driver-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="+55 11 99999-0000"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                  data-testid="input-driver-phone"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="motorista@exemplo.com"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                  data-testid="input-driver-email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="licenseExpiry">Data de Validade da CNH</Label>
                <Input
                  id="licenseExpiry"
                  type="date"
                  value={newDriver.licenseExpiry}
                  onChange={(e) => setNewDriver({ ...newDriver, licenseExpiry: e.target.value })}
                  data-testid="input-driver-license"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddDriver} data-testid="button-confirm-add-driver">Adicionar Motorista</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar motoristas..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-drivers"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "available", "on-trip", "off-duty"] as const).map(status => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status === "all" ? "Todos" : status === "on-trip" ? "Em Viagem" : status === "off-duty" ? "Folga" : "Disponível"}
            {" "}({statusCounts[status]})
          </Button>
        ))}
      </div>

      {filteredDrivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrivers.map(driver => (
            <DriverCard
              key={driver.id}
              {...driver}
              onClick={() => console.log("Driver clicked:", driver.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum motorista encontrado com os critérios informados.</p>
        </div>
      )}
    </div>
  );
}
