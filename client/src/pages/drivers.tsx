import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DriverCard } from "@/components/fleet/DriverCard";
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
import { Plus, Search } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Driver, InsertDriver } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type DriverStatus = "available" | "on-trip" | "off-duty";

export default function Drivers() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DriverStatus>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    email: "",
    licenseExpiry: "",
  });

  const { data: drivers = [], isLoading } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const createDriverMutation = useMutation({
    mutationFn: async (driver: Partial<InsertDriver>) => {
      const res = await apiRequest("POST", "/api/drivers", driver);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({ title: "Motorista adicionado com sucesso!" });
      setIsAddDialogOpen(false);
      setNewDriver({ name: "", phone: "", email: "", licenseExpiry: "" });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar motorista", variant: "destructive" });
    },
  });

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search);
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddDriver = () => {
    if (!newDriver.name || !newDriver.phone || !newDriver.email || !newDriver.licenseExpiry) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    createDriverMutation.mutate({
      name: newDriver.name,
      phone: newDriver.phone,
      email: newDriver.email,
      licenseExpiry: newDriver.licenseExpiry,
      status: "available",
    });
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
              <Button 
                onClick={handleAddDriver} 
                disabled={createDriverMutation.isPending}
                data-testid="button-confirm-add-driver"
              >
                {createDriverMutation.isPending ? "Adicionando..." : "Adicionar Motorista"}
              </Button>
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : filteredDrivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrivers.map(driver => (
            <DriverCard
              key={driver.id}
              id={driver.id}
              name={driver.name}
              phone={driver.phone}
              email={driver.email}
              licenseExpiry={driver.licenseExpiry}
              status={driver.status as DriverStatus}
              assignedVehicle={driver.assignedVehicleId ?? undefined}
              onClick={() => {}}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {drivers.length === 0 
              ? "Nenhum motorista cadastrado. Adicione seu primeiro motorista!" 
              : "Nenhum motorista encontrado com os critérios informados."}
          </p>
        </div>
      )}
    </div>
  );
}
