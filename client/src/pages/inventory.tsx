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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  DollarSign,
  Layers,
  Pencil,
  Trash2,
  MapPin,
  Hash,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InventoryItem, InsertInventoryItem, Supplier } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_OPTIONS = [
  "Pneus",
  "Filtros",
  "Óleos",
  "Baterias",
  "Freios",
  "Suspensão",
  "Elétrica",
  "Ferramentas",
  "EPI",
  "Outros",
];

export default function Inventory() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    partNumber: "",
    category: "",
    quantity: "",
    minQuantity: "5",
    unit: "unidade",
    unitPrice: "",
    location: "",
    supplierId: "",
    notes: "",
  });

  const { data: inventoryItems = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: lowStockItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/low-stock"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.partNumber?.toLowerCase().includes(search.toLowerCase()) ||
        item.location?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [inventoryItems, search, categoryFilter]);

  const stats = useMemo(() => {
    const totalItems = inventoryItems.length;
    const lowStockCount = lowStockItems.length;
    const totalValue = inventoryItems.reduce(
      (sum, item) => sum + (item.unitPrice || 0) * item.quantity,
      0
    );
    const categories = new Set(inventoryItems.map((item) => item.category)).size;
    return { totalItems, lowStockCount, totalValue, categories };
  }, [inventoryItems, lowStockItems]);

  const createMutation = useMutation({
    mutationFn: async (item: Partial<InsertInventoryItem>) => {
      const res = await apiRequest("POST", "/api/inventory", item);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      toast({ title: "Item adicionado com sucesso!" });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao adicionar item", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InsertInventoryItem>;
    }) => {
      const res = await apiRequest("PATCH", `/api/inventory/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      toast({ title: "Item atualizado com sucesso!" });
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar item", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      toast({ title: "Item excluído com sucesso!" });
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    },
    onError: () => {
      toast({ title: "Erro ao excluir item", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      partNumber: "",
      category: "",
      quantity: "",
      minQuantity: "5",
      unit: "unidade",
      unitPrice: "",
      location: "",
      supplierId: "",
      notes: "",
    });
  };

  const handleAddSubmit = () => {
    if (!formData.name || !formData.category) {
      toast({
        title: "Preencha os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({
      name: formData.name,
      partNumber: formData.partNumber || null,
      category: formData.category,
      quantity: parseInt(formData.quantity) || 0,
      minQuantity: parseInt(formData.minQuantity) || 5,
      unit: formData.unit || "unidade",
      unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : null,
      location: formData.location || null,
      supplierId: formData.supplierId || null,
      notes: formData.notes || null,
    });
  };

  const handleEditSubmit = () => {
    if (!selectedItem || !formData.name || !formData.category) {
      toast({
        title: "Preencha os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate({
      id: selectedItem.id,
      data: {
        name: formData.name,
        partNumber: formData.partNumber || null,
        category: formData.category,
        quantity: parseInt(formData.quantity) || 0,
        minQuantity: parseInt(formData.minQuantity) || 5,
        unit: formData.unit || "unidade",
        unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : null,
        location: formData.location || null,
        supplierId: formData.supplierId || null,
        notes: formData.notes || null,
      },
    });
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      partNumber: item.partNumber || "",
      category: item.category,
      quantity: item.quantity.toString(),
      minQuantity: (item.minQuantity || 5).toString(),
      unit: item.unit || "unidade",
      unitPrice: item.unitPrice?.toString() || "",
      location: item.location || "",
      supplierId: item.supplierId || "",
      notes: item.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
    }).format(value);
  };

  const isLowStock = (item: InventoryItem) => {
    return item.quantity <= (item.minQuantity || 5);
  };

  const getQuantityColor = (item: InventoryItem) => {
    if (item.quantity === 0) return "text-red-600 dark:text-red-400";
    if (isLowStock(item)) return "text-amber-600 dark:text-amber-400";
    return "text-green-600 dark:text-green-400";
  };

  const InventoryForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Ex: Filtro de óleo"
            data-testid="input-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="partNumber">Número da Peça</Label>
          <Input
            id="partNumber"
            value={formData.partNumber}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, partNumber: e.target.value }))
            }
            placeholder="Ex: FO-12345"
            data-testid="input-part-number"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger data-testid="select-category">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unidade</Label>
          <Input
            id="unit"
            value={formData.unit}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, unit: e.target.value }))
            }
            placeholder="Ex: unidade, litro, kg"
            data-testid="input-unit"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, quantity: e.target.value }))
            }
            placeholder="0"
            data-testid="input-quantity"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minQuantity">Quantidade Mínima</Label>
          <Input
            id="minQuantity"
            type="number"
            value={formData.minQuantity}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, minQuantity: e.target.value }))
            }
            placeholder="5"
            data-testid="input-min-quantity"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitPrice">Preço Unitário</Label>
          <Input
            id="unitPrice"
            type="number"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, unitPrice: e.target.value }))
            }
            placeholder="0.00"
            data-testid="input-unit-price"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Localização</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, location: e.target.value }))
            }
            placeholder="Ex: Prateleira A3"
            data-testid="input-location"
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
              {suppliers.map((supplier) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Inventário</h1>
          <p className="text-sm text-muted-foreground">
            Gestão de peças e consumíveis
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
          data-testid="button-add-item"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-items">
              {stats.totalItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Itens em inventário
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Itens em Stock Baixo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold text-amber-600 dark:text-amber-400"
              data-testid="stat-low-stock"
            >
              {stats.lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Abaixo do mínimo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total do Stock
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-value">
              {formatCurrency(stats.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor em inventário
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-categories">
              {stats.categories}
            </div>
            <p className="text-xs text-muted-foreground">
              Categorias em uso
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, código ou localização..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]" data-testid="filter-category">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {CATEGORY_OPTIONS.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Nenhum item encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="relative"
              data-testid={`card-item-${item.id}`}
            >
              {isLowStock(item) && (
                <Badge
                  variant="outline"
                  className="absolute top-3 right-3 border-amber-500 text-amber-600 dark:text-amber-400"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Stock Baixo
                </Badge>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium pr-24">
                  {item.name}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                  {item.partNumber && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {item.partNumber}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Quantidade:
                  </span>
                  <span className={`font-semibold ${getQuantityColor(item)}`}>
                    {item.quantity} {item.unit || "un"}
                  </span>
                </div>
                {item.unitPrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Preço unit.:
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.unitPrice)}
                    </span>
                  </div>
                )}
                {item.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {item.location}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="flex-1"
                    data-testid={`button-edit-${item.id}`}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item)}
                    className="text-destructive"
                    data-testid={`button-delete-${item.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Item ao Inventário</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo item.
            </DialogDescription>
          </DialogHeader>
          <InventoryForm />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              data-testid="button-cancel-add"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddSubmit}
              disabled={createMutation.isPending}
              data-testid="button-submit-add"
            >
              {createMutation.isPending ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
            <DialogDescription>
              Atualize as informações do item.
            </DialogDescription>
          </DialogHeader>
          <InventoryForm isEdit />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              data-testid="button-cancel-edit"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={updateMutation.isPending}
              data-testid="button-submit-edit"
            >
              {updateMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Item</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o item "{selectedItem?.name}"? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedItem && deleteMutation.mutate(selectedItem.id)}
              className="bg-destructive text-destructive-foreground"
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
