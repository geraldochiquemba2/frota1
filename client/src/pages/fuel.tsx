import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Fuel,
  DollarSign,
  Gauge,
  TrendingUp,
  Pencil,
  Trash2,
  Calendar,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { FuelLog, InsertFuelLog, Vehicle, Supplier, Driver } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const FUEL_TYPES = [
  "Gasolina",
  "Diesel",
  "Etanol",
  "GNV",
  "Gasolina Aditivada",
  "Diesel S10",
];

interface FuelStats {
  totalLiters: number;
  totalCost: number;
  avgEfficiency: number;
  recentLogs: FuelLog[];
}

export default function FuelPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [fuelTypeFilter, setFuelTypeFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<FuelLog | null>(null);
  const [formData, setFormData] = useState({
    vehicleId: "",
    vehiclePlate: "",
    driverId: "",
    driverName: "",
    odometer: "",
    liters: "",
    pricePerLiter: "",
    totalCost: "",
    fuelType: "",
    station: "",
    supplierId: "",
    notes: "",
  });

  const { data: fuelLogs = [], isLoading } = useQuery<FuelLog[]>({
    queryKey: ["/api/fuel"],
  });

  const { data: stats } = useQuery<FuelStats>({
    queryKey: ["/api/fuel/stats"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const filteredLogs = useMemo(() => {
    return fuelLogs.filter((log) => {
      const matchesSearch =
        log.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
        log.station?.toLowerCase().includes(search.toLowerCase()) ||
        log.driverName?.toLowerCase().includes(search.toLowerCase());
      const matchesVehicle =
        vehicleFilter === "all" || log.vehicleId === vehicleFilter;
      const matchesFuelType =
        fuelTypeFilter === "all" || log.fuelType === fuelTypeFilter;
      return matchesSearch && matchesVehicle && matchesFuelType;
    });
  }, [fuelLogs, search, vehicleFilter, fuelTypeFilter]);

  const createMutation = useMutation({
    mutationFn: async (log: Partial<InsertFuelLog>) => {
      const res = await apiRequest("POST", "/api/fuel", log);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fuel"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fuel/stats"] });
      toast({ title: "Abastecimento registrado com sucesso!" });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao registrar abastecimento", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertFuelLog> }) => {
      const res = await apiRequest("PATCH", `/api/fuel/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fuel"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fuel/stats"] });
      toast({ title: "Abastecimento atualizado com sucesso!" });
      setIsEditDialogOpen(false);
      setSelectedLog(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar abastecimento", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/fuel/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fuel"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fuel/stats"] });
      toast({ title: "Abastecimento excluído com sucesso!" });
      setIsDeleteDialogOpen(false);
      setSelectedLog(null);
    },
    onError: () => {
      toast({ title: "Erro ao excluir abastecimento", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      vehicleId: "",
      vehiclePlate: "",
      driverId: "",
      driverName: "",
      odometer: "",
      liters: "",
      pricePerLiter: "",
      totalCost: "",
      fuelType: "",
      station: "",
      supplierId: "",
      notes: "",
    });
  };

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (vehicle) {
      setFormData((prev) => ({
        ...prev,
        vehicleId: vehicle.id,
        vehiclePlate: vehicle.plate,
        odometer: vehicle.odometer?.toString() || prev.odometer,
      }));
    }
  };

  const handleDriverChange = (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (driver) {
      setFormData((prev) => ({
        ...prev,
        driverId: driver.id,
        driverName: driver.name,
      }));
    }
  };

  const handleLitersChange = (liters: string) => {
    const litersNum = parseFloat(liters) || 0;
    const pricePerLiter = parseFloat(formData.pricePerLiter) || 0;
    setFormData((prev) => ({
      ...prev,
      liters,
      totalCost: (litersNum * pricePerLiter).toFixed(2),
    }));
  };

  const handlePriceChange = (pricePerLiter: string) => {
    const priceNum = parseFloat(pricePerLiter) || 0;
    const liters = parseFloat(formData.liters) || 0;
    setFormData((prev) => ({
      ...prev,
      pricePerLiter,
      totalCost: (liters * priceNum).toFixed(2),
    }));
  };

  const handleAddSubmit = () => {
    if (!formData.vehicleId || !formData.odometer || !formData.liters || !formData.pricePerLiter) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      vehicleId: formData.vehicleId,
      vehiclePlate: formData.vehiclePlate,
      driverId: formData.driverId || null,
      driverName: formData.driverName || null,
      odometer: parseInt(formData.odometer),
      liters: parseFloat(formData.liters),
      pricePerLiter: parseFloat(formData.pricePerLiter),
      totalCost: parseFloat(formData.totalCost),
      fuelType: formData.fuelType || null,
      station: formData.station || null,
      supplierId: formData.supplierId || null,
      notes: formData.notes || null,
    });
  };

  const handleEditSubmit = () => {
    if (!selectedLog || !formData.vehicleId || !formData.odometer || !formData.liters || !formData.pricePerLiter) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    updateMutation.mutate({
      id: selectedLog.id,
      data: {
        vehicleId: formData.vehicleId,
        vehiclePlate: formData.vehiclePlate,
        driverId: formData.driverId || null,
        driverName: formData.driverName || null,
        odometer: parseInt(formData.odometer),
        liters: parseFloat(formData.liters),
        pricePerLiter: parseFloat(formData.pricePerLiter),
        totalCost: parseFloat(formData.totalCost),
        fuelType: formData.fuelType || null,
        station: formData.station || null,
        supplierId: formData.supplierId || null,
        notes: formData.notes || null,
      },
    });
  };

  const handleEdit = (log: FuelLog) => {
    setSelectedLog(log);
    setFormData({
      vehicleId: log.vehicleId,
      vehiclePlate: log.vehiclePlate,
      driverId: log.driverId || "",
      driverName: log.driverName || "",
      odometer: log.odometer.toString(),
      liters: log.liters.toString(),
      pricePerLiter: log.pricePerLiter.toString(),
      totalCost: log.totalCost.toString(),
      fuelType: log.fuelType || "",
      station: log.station || "",
      supplierId: log.supplierId || "",
      notes: log.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (log: FuelLog) => {
    setSelectedLog(log);
    setIsDeleteDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
    }).format(value);
  };

  const FuelLogForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle">Veículo *</Label>
          <Select
            value={formData.vehicleId}
            onValueChange={handleVehicleChange}
          >
            <SelectTrigger data-testid="select-vehicle">
              <SelectValue placeholder="Selecione o veículo" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.make} {vehicle.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="driver">Motorista</Label>
          <Select
            value={formData.driverId}
            onValueChange={handleDriverChange}
          >
            <SelectTrigger data-testid="select-driver">
              <SelectValue placeholder="Selecione o motorista" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="odometer">Quilometragem *</Label>
          <Input
            id="odometer"
            type="number"
            value={formData.odometer}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, odometer: e.target.value }))
            }
            placeholder="Ex: 50000"
            data-testid="input-odometer"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fuelType">Tipo de Combustível</Label>
          <Select
            value={formData.fuelType}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, fuelType: value }))
            }
          >
            <SelectTrigger data-testid="select-fuel-type">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {FUEL_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="liters">Litros *</Label>
          <Input
            id="liters"
            type="number"
            step="0.01"
            value={formData.liters}
            onChange={(e) => handleLitersChange(e.target.value)}
            placeholder="Ex: 50.00"
            data-testid="input-liters"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pricePerLiter">Preço/Litro *</Label>
          <Input
            id="pricePerLiter"
            type="number"
            step="0.01"
            value={formData.pricePerLiter}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="Ex: 350.00"
            data-testid="input-price"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalCost">Custo Total</Label>
          <Input
            id="totalCost"
            type="number"
            step="0.01"
            value={formData.totalCost}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, totalCost: e.target.value }))
            }
            placeholder="Calculado automaticamente"
            data-testid="input-total"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="station">Posto</Label>
          <Input
            id="station"
            value={formData.station}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, station: e.target.value }))
            }
            placeholder="Nome do posto"
            data-testid="input-station"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier">Fornecedor</Label>
          <Select
            value={formData.supplierId}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, supplierId: value }))
            }
          >
            <SelectTrigger data-testid="select-supplier">
              <SelectValue placeholder="Selecione o fornecedor" />
            </SelectTrigger>
            <SelectContent>
              {suppliers
                .filter((s) => s.categories?.includes("Combustível"))
                .map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Observações adicionais..."
          data-testid="input-notes"
        />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Combustível</h1>
          <p className="text-sm text-muted-foreground">
            Gestão de abastecimentos da frota
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
          data-testid="button-add-fuel"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Abastecimento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Litros</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-liters">
              {stats?.totalLiters?.toFixed(2) || "0.00"} L
            </div>
            <p className="text-xs text-muted-foreground">
              Todos os abastecimentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-cost">
              {formatCurrency(stats?.totalCost || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Investimento em combustível
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência Média</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-efficiency">
              {stats?.avgEfficiency?.toFixed(2) || "0.00"} km/L
            </div>
            <p className="text-xs text-muted-foreground">
              Rendimento da frota
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registros</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-count">
              {fuelLogs.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de abastecimentos
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle>Histórico de Abastecimentos</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-[200px]"
                  data-testid="input-search"
                />
              </div>
              <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                <SelectTrigger className="w-[180px]" data-testid="filter-vehicle">
                  <SelectValue placeholder="Filtrar por veículo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os veículos</SelectItem>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={fuelTypeFilter} onValueChange={setFuelTypeFilter}>
                <SelectTrigger className="w-[180px]" data-testid="filter-fuel-type">
                  <SelectValue placeholder="Tipo de combustível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {FUEL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Fuel className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Nenhum abastecimento encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Motorista</TableHead>
                    <TableHead>Combustível</TableHead>
                    <TableHead className="text-right">Litros</TableHead>
                    <TableHead className="text-right">Preço/L</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Km</TableHead>
                    <TableHead>Posto</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} data-testid={`row-fuel-${log.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(log.date), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.vehiclePlate}</Badge>
                      </TableCell>
                      <TableCell>{log.driverName || "-"}</TableCell>
                      <TableCell>
                        {log.fuelType ? (
                          <Badge variant="secondary">{log.fuelType}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {log.liters.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(log.pricePerLiter)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(log.totalCost)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {log.odometer.toLocaleString()}
                      </TableCell>
                      <TableCell>{log.station || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(log)}
                            data-testid={`button-edit-${log.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(log)}
                            data-testid={`button-delete-${log.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Abastecimento</DialogTitle>
            <DialogDescription>
              Registre um novo abastecimento de combustível
            </DialogDescription>
          </DialogHeader>
          <FuelLogForm />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddSubmit}
              disabled={createMutation.isPending}
              data-testid="button-submit-add"
            >
              {createMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Abastecimento</DialogTitle>
            <DialogDescription>
              Atualize os dados do abastecimento
            </DialogDescription>
          </DialogHeader>
          <FuelLogForm isEdit />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={updateMutation.isPending}
              data-testid="button-submit-edit"
            >
              {updateMutation.isPending ? "Atualizando..." : "Atualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro de abastecimento?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedLog && deleteMutation.mutate(selectedLog.id)}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
