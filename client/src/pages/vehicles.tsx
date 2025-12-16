import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { VehicleCard } from "@/components/fleet/VehicleCard";
import { StatusBadge, type VehicleStatus } from "@/components/fleet/StatusBadge";
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
import { Plus, Search, Filter, Camera, X, UserPlus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Vehicle, InsertVehicle, Driver } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Vehicles() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "all">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [newVehicle, setNewVehicle] = useState({
    plate: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    odometer: 0,
    photos: [] as string[],
  });
  const [editVehicle, setEditVehicle] = useState({
    plate: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    odometer: 0,
    photos: [] as string[],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (vehicle: Partial<InsertVehicle>) => {
      const res = await apiRequest("POST", "/api/vehicles", vehicle);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({ title: "Veículo adicionado com sucesso!" });
      setIsAddDialogOpen(false);
      setNewVehicle({ plate: "", make: "", model: "", year: new Date().getFullYear(), odometer: 0, photos: [] });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar veículo", variant: "destructive" });
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertVehicle> }) => {
      const res = await apiRequest("PATCH", `/api/vehicles/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({ title: "Veículo atualizado com sucesso!" });
      setIsEditDialogOpen(false);
      setSelectedVehicle(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar veículo", variant: "destructive" });
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({ title: "Veículo excluído com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir veículo", variant: "destructive" });
    },
  });

  const assignDriverMutation = useMutation({
    mutationFn: async ({ vehicleId, driverId }: { vehicleId: string; driverId: string | null }) => {
      const res = await apiRequest("POST", `/api/vehicles/${vehicleId}/assign-driver`, { driverId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      toast({ title: "Motorista atribuído com sucesso!" });
      setIsAssignDialogOpen(false);
      setSelectedVehicle(null);
      setSelectedDriverId("");
    },
    onError: () => {
      toast({ title: "Erro ao atribuir motorista", variant: "destructive" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        if (isEdit) {
          setEditVehicle(prev => ({ ...prev, photos: [...prev.photos, base64] }));
        } else {
          setNewVehicle(prev => ({ ...prev, photos: [...prev.photos, base64] }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number, isEdit: boolean = false) => {
    if (isEdit) {
      setEditVehicle(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
    } else {
      setNewVehicle(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
    }
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setEditVehicle({
      plate: vehicle.plate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      odometer: vehicle.odometer || 0,
      photos: vehicle.photos || [],
    });
    setIsEditDialogOpen(true);
  };

  const openAssignDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setSelectedDriverId(vehicle.driverId || "");
    setIsAssignDialogOpen(true);
  };

  const handleAssignDriver = () => {
    if (!selectedVehicle) return;
    assignDriverMutation.mutate({
      vehicleId: selectedVehicle.id,
      driverId: selectedDriverId === "none" || !selectedDriverId ? null : selectedDriverId,
    });
  };

  const getDriverName = (driverId: string | null) => {
    if (!driverId) return undefined;
    const driver = drivers.find(d => d.id === driverId);
    return driver?.name;
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddVehicle = () => {
    if (!newVehicle.plate || !newVehicle.make || !newVehicle.model) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    createVehicleMutation.mutate({
      plate: newVehicle.plate,
      make: newVehicle.make,
      model: newVehicle.model,
      year: newVehicle.year,
      status: "idle",
      fuelLevel: 100,
      odometer: newVehicle.odometer,
      photos: newVehicle.photos.length > 0 ? newVehicle.photos : undefined,
    });
  };

  const handleEditVehicle = () => {
    if (!selectedVehicle || !editVehicle.plate || !editVehicle.make || !editVehicle.model) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    updateVehicleMutation.mutate({
      id: selectedVehicle.id,
      data: {
        plate: editVehicle.plate,
        make: editVehicle.make,
        model: editVehicle.model,
        year: editVehicle.year,
        odometer: editVehicle.odometer,
        photos: editVehicle.photos.length > 0 ? editVehicle.photos : undefined,
      },
    });
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
              <div className="grid grid-cols-2 gap-4">
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
                <div className="grid gap-2">
                  <Label htmlFor="odometer">Quilometragem (km)</Label>
                  <Input
                    id="odometer"
                    type="number"
                    placeholder="0"
                    value={newVehicle.odometer}
                    onChange={(e) => setNewVehicle({ ...newVehicle, odometer: parseInt(e.target.value) || 0 })}
                    data-testid="input-odometer"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Fotos do Veículo (opcional)</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileChange(e, false)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-add-photos"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Adicionar Fotos
                </Button>
                {newVehicle.photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newVehicle.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img src={photo} alt={`Foto ${index + 1}`} className="h-16 w-16 object-cover rounded-md" />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-5 w-5"
                          onClick={() => removePhoto(index, false)}
                          data-testid={`button-remove-photo-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleAddVehicle} 
                disabled={createVehicleMutation.isPending}
                data-testid="button-confirm-add"
              >
                {createVehicleMutation.isPending ? "Adicionando..." : "Adicionar Veículo"}
              </Button>
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVehicles.map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              id={vehicle.id}
              plate={vehicle.plate}
              make={vehicle.make}
              model={vehicle.model}
              year={vehicle.year}
              status={vehicle.status as VehicleStatus}
              driver={getDriverName(vehicle.driverId)}
              location={vehicle.location ?? undefined}
              fuelLevel={vehicle.fuelLevel ?? 0}
              odometer={vehicle.odometer ?? 0}
              photos={vehicle.photos ?? undefined}
              onView={() => openEditDialog(vehicle)}
              onEdit={() => openEditDialog(vehicle)}
              onAssignDriver={() => openAssignDialog(vehicle)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {vehicles.length === 0 
              ? "Nenhum veículo cadastrado. Adicione seu primeiro veículo!" 
              : "Nenhum veículo encontrado com os critérios informados."}
          </p>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Veículo</DialogTitle>
            <DialogDescription>
              Atualize os dados do veículo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-plate">Placa</Label>
              <Input
                id="edit-plate"
                placeholder="ABC-1234"
                value={editVehicle.plate}
                onChange={(e) => setEditVehicle({ ...editVehicle, plate: e.target.value })}
                data-testid="input-edit-plate"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-make">Marca</Label>
                <Input
                  id="edit-make"
                  placeholder="Ford"
                  value={editVehicle.make}
                  onChange={(e) => setEditVehicle({ ...editVehicle, make: e.target.value })}
                  data-testid="input-edit-make"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-model">Modelo</Label>
                <Input
                  id="edit-model"
                  placeholder="Transit"
                  value={editVehicle.model}
                  onChange={(e) => setEditVehicle({ ...editVehicle, model: e.target.value })}
                  data-testid="input-edit-model"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-year">Ano</Label>
                <Input
                  id="edit-year"
                  type="number"
                  value={editVehicle.year}
                  onChange={(e) => setEditVehicle({ ...editVehicle, year: parseInt(e.target.value) })}
                  data-testid="input-edit-year"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-odometer">Quilometragem (km)</Label>
                <Input
                  id="edit-odometer"
                  type="number"
                  placeholder="0"
                  value={editVehicle.odometer}
                  onChange={(e) => setEditVehicle({ ...editVehicle, odometer: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-odometer"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Fotos do Veículo</Label>
              <input
                type="file"
                ref={editFileInputRef}
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileChange(e, true)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => editFileInputRef.current?.click()}
                data-testid="button-edit-add-photos"
              >
                <Camera className="h-4 w-4 mr-2" />
                Adicionar Fotos
              </Button>
              {editVehicle.photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editVehicle.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img src={photo} alt={`Foto ${index + 1}`} className="h-16 w-16 object-cover rounded-md" />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5"
                        onClick={() => removePhoto(index, true)}
                        data-testid={`button-edit-remove-photo-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleEditVehicle} 
              disabled={updateVehicleMutation.isPending}
              data-testid="button-confirm-edit"
            >
              {updateVehicleMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Motorista</DialogTitle>
            <DialogDescription>
              Selecione um motorista para atribuir ao veículo {selectedVehicle?.plate}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="driver-select">Motorista</Label>
            <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
              <SelectTrigger className="mt-2" data-testid="select-driver">
                <UserPlus className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Selecione um motorista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum (remover atribuição)</SelectItem>
                {drivers.map(driver => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name} {driver.assignedVehicleId && driver.assignedVehicleId !== selectedVehicle?.id ? "(já atribuído)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleAssignDriver} 
              disabled={assignDriverMutation.isPending}
              data-testid="button-confirm-assign"
            >
              {assignDriverMutation.isPending ? "Atribuindo..." : "Atribuir Motorista"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
