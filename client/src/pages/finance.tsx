import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  Plus,
  Search,
  Pencil,
  Trash2,
  Building2,
  CreditCard,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BankAccount, InsertBankAccount, Transaction, InsertTransaction, Vehicle } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TRANSACTION_CATEGORIES = [
  "Combustível",
  "Manutenção",
  "Seguro",
  "IPVA",
  "Multas",
  "Aluguel",
  "Salários",
  "Serviços",
  "Peças",
  "Outros",
];

interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyTransactions: number;
}

export default function FinancePage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("transactions");

  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false);
  const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] = useState(false);
  const [isDeleteTransactionDialogOpen, setIsDeleteTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false);
  const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

  const [transactionFormData, setTransactionFormData] = useState({
    bankAccountId: "",
    type: "",
    category: "",
    amount: "",
    description: "",
    vehicleId: "",
    vehiclePlate: "",
    invoiceRef: "",
  });

  const [accountFormData, setAccountFormData] = useState({
    name: "",
    bank: "",
    accountNumber: "",
    balance: "",
    isActive: true,
    notes: "",
  });

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/finance/transactions"],
  });

  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery<BankAccount[]>({
    queryKey: ["/api/finance/accounts"],
  });

  const { data: summary } = useQuery<FinanceSummary>({
    queryKey: ["/api/finance/summary"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.description?.toLowerCase().includes(search.toLowerCase()) ||
        transaction.category.toLowerCase().includes(search.toLowerCase()) ||
        transaction.vehiclePlate?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || transaction.type === typeFilter;
      const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  const createTransactionMutation = useMutation({
    mutationFn: async (data: Partial<InsertTransaction>) => {
      const res = await apiRequest("POST", "/api/finance/transactions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/finance/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/finance/accounts"] });
      toast({ title: "Transação registrada com sucesso!" });
      setIsAddTransactionDialogOpen(false);
      resetTransactionForm();
    },
    onError: () => {
      toast({ title: "Erro ao registrar transação", variant: "destructive" });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTransaction> }) => {
      const res = await apiRequest("PATCH", `/api/finance/transactions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/finance/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/finance/accounts"] });
      toast({ title: "Transação atualizada com sucesso!" });
      setIsEditTransactionDialogOpen(false);
      setSelectedTransaction(null);
      resetTransactionForm();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar transação", variant: "destructive" });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/finance/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/finance/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/finance/accounts"] });
      toast({ title: "Transação excluída com sucesso!" });
      setIsDeleteTransactionDialogOpen(false);
      setSelectedTransaction(null);
    },
    onError: () => {
      toast({ title: "Erro ao excluir transação", variant: "destructive" });
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: Partial<InsertBankAccount>) => {
      const res = await apiRequest("POST", "/api/finance/accounts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/accounts"] });
      toast({ title: "Conta bancária criada com sucesso!" });
      setIsAddAccountDialogOpen(false);
      resetAccountForm();
    },
    onError: () => {
      toast({ title: "Erro ao criar conta bancária", variant: "destructive" });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBankAccount> }) => {
      const res = await apiRequest("PATCH", `/api/finance/accounts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/accounts"] });
      toast({ title: "Conta bancária atualizada com sucesso!" });
      setIsEditAccountDialogOpen(false);
      setSelectedAccount(null);
      resetAccountForm();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar conta bancária", variant: "destructive" });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/finance/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/accounts"] });
      toast({ title: "Conta bancária excluída com sucesso!" });
      setIsDeleteAccountDialogOpen(false);
      setSelectedAccount(null);
    },
    onError: () => {
      toast({ title: "Erro ao excluir conta bancária", variant: "destructive" });
    },
  });

  const resetTransactionForm = () => {
    setTransactionFormData({
      bankAccountId: "",
      type: "",
      category: "",
      amount: "",
      description: "",
      vehicleId: "",
      vehiclePlate: "",
      invoiceRef: "",
    });
  };

  const resetAccountForm = () => {
    setAccountFormData({
      name: "",
      bank: "",
      accountNumber: "",
      balance: "",
      isActive: true,
      notes: "",
    });
  };

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (vehicle) {
      setTransactionFormData((prev) => ({
        ...prev,
        vehicleId: vehicle.id,
        vehiclePlate: vehicle.plate,
      }));
    } else {
      setTransactionFormData((prev) => ({
        ...prev,
        vehicleId: "",
        vehiclePlate: "",
      }));
    }
  };

  const handleAddTransactionSubmit = () => {
    if (!transactionFormData.type || !transactionFormData.category || !transactionFormData.amount) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    createTransactionMutation.mutate({
      bankAccountId: transactionFormData.bankAccountId || null,
      type: transactionFormData.type,
      category: transactionFormData.category,
      amount: parseFloat(transactionFormData.amount),
      description: transactionFormData.description || null,
      vehicleId: transactionFormData.vehicleId || null,
      vehiclePlate: transactionFormData.vehiclePlate || null,
      invoiceRef: transactionFormData.invoiceRef || null,
    });
  };

  const handleEditTransactionSubmit = () => {
    if (!selectedTransaction || !transactionFormData.type || !transactionFormData.category || !transactionFormData.amount) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    updateTransactionMutation.mutate({
      id: selectedTransaction.id,
      data: {
        bankAccountId: transactionFormData.bankAccountId || null,
        type: transactionFormData.type,
        category: transactionFormData.category,
        amount: parseFloat(transactionFormData.amount),
        description: transactionFormData.description || null,
        vehicleId: transactionFormData.vehicleId || null,
        vehiclePlate: transactionFormData.vehiclePlate || null,
        invoiceRef: transactionFormData.invoiceRef || null,
      },
    });
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTransactionFormData({
      bankAccountId: transaction.bankAccountId || "",
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description || "",
      vehicleId: transaction.vehicleId || "",
      vehiclePlate: transaction.vehiclePlate || "",
      invoiceRef: transaction.invoiceRef || "",
    });
    setIsEditTransactionDialogOpen(true);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteTransactionDialogOpen(true);
  };

  const handleAddAccountSubmit = () => {
    if (!accountFormData.name) {
      toast({ title: "Preencha o nome da conta", variant: "destructive" });
      return;
    }
    createAccountMutation.mutate({
      name: accountFormData.name,
      bank: accountFormData.bank || null,
      accountNumber: accountFormData.accountNumber || null,
      balance: parseFloat(accountFormData.balance) || 0,
      isActive: accountFormData.isActive,
      notes: accountFormData.notes || null,
    });
  };

  const handleEditAccountSubmit = () => {
    if (!selectedAccount || !accountFormData.name) {
      toast({ title: "Preencha o nome da conta", variant: "destructive" });
      return;
    }
    updateAccountMutation.mutate({
      id: selectedAccount.id,
      data: {
        name: accountFormData.name,
        bank: accountFormData.bank || null,
        accountNumber: accountFormData.accountNumber || null,
        balance: parseFloat(accountFormData.balance) || 0,
        isActive: accountFormData.isActive,
        notes: accountFormData.notes || null,
      },
    });
  };

  const handleEditAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    setAccountFormData({
      name: account.name,
      bank: account.bank || "",
      accountNumber: account.accountNumber || "",
      balance: account.balance?.toString() || "0",
      isActive: account.isActive ?? true,
      notes: account.notes || "",
    });
    setIsEditAccountDialogOpen(true);
  };

  const handleDeleteAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    setIsDeleteAccountDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
    }).format(value);
  };

  const TransactionForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo *</Label>
          <Select
            value={transactionFormData.type}
            onValueChange={(value) => setTransactionFormData((prev) => ({ ...prev, type: value }))}
          >
            <SelectTrigger data-testid="select-transaction-type">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select
            value={transactionFormData.category}
            onValueChange={(value) => setTransactionFormData((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger data-testid="select-transaction-category">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {TRANSACTION_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor (AOA) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={transactionFormData.amount}
            onChange={(e) => setTransactionFormData((prev) => ({ ...prev, amount: e.target.value }))}
            placeholder="0.00"
            data-testid="input-transaction-amount"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account">Conta Bancária</Label>
          <Select
            value={transactionFormData.bankAccountId}
            onValueChange={(value) => setTransactionFormData((prev) => ({ ...prev, bankAccountId: value }))}
          >
            <SelectTrigger data-testid="select-transaction-account">
              <SelectValue placeholder="Selecione a conta" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} - {account.bank}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle">Veículo</Label>
          <Select
            value={transactionFormData.vehicleId}
            onValueChange={handleVehicleChange}
          >
            <SelectTrigger data-testid="select-transaction-vehicle">
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
          <Label htmlFor="invoiceRef">Referência/Fatura</Label>
          <Input
            id="invoiceRef"
            value={transactionFormData.invoiceRef}
            onChange={(e) => setTransactionFormData((prev) => ({ ...prev, invoiceRef: e.target.value }))}
            placeholder="Número da fatura"
            data-testid="input-transaction-invoice"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={transactionFormData.description}
          onChange={(e) => setTransactionFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Descrição da transação"
          data-testid="input-transaction-description"
        />
      </div>
    </div>
  );

  const AccountForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Conta *</Label>
          <Input
            id="name"
            value={accountFormData.name}
            onChange={(e) => setAccountFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Conta Principal"
            data-testid="input-account-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bank">Banco</Label>
          <Input
            id="bank"
            value={accountFormData.bank}
            onChange={(e) => setAccountFormData((prev) => ({ ...prev, bank: e.target.value }))}
            placeholder="Ex: Banco BAI"
            data-testid="input-account-bank"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Número da Conta</Label>
          <Input
            id="accountNumber"
            value={accountFormData.accountNumber}
            onChange={(e) => setAccountFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
            placeholder="Ex: 0001234567890"
            data-testid="input-account-number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="balance">Saldo Inicial (AOA)</Label>
          <Input
            id="balance"
            type="number"
            step="0.01"
            value={accountFormData.balance}
            onChange={(e) => setAccountFormData((prev) => ({ ...prev, balance: e.target.value }))}
            placeholder="0.00"
            data-testid="input-account-balance"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="isActive"
          checked={accountFormData.isActive}
          onCheckedChange={(checked) => setAccountFormData((prev) => ({ ...prev, isActive: checked }))}
          data-testid="switch-account-active"
        />
        <Label htmlFor="isActive">Conta Ativa</Label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={accountFormData.notes}
          onChange={(e) => setAccountFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Observações sobre a conta"
          data-testid="input-account-notes"
        />
      </div>
    </div>
  );

  if (isLoadingTransactions || isLoadingAccounts) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Finanças</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">Gestão financeira da frota</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-total-income">
              {formatCurrency(summary?.totalIncome || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-total-expenses">
              {formatCurrency(summary?.totalExpenses || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${(summary?.balance || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
              data-testid="text-balance"
            >
              {formatCurrency(summary?.balance || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações do Mês</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-monthly-transactions">
              {summary?.monthlyTransactions || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="transactions" data-testid="tab-transactions">Transações</TabsTrigger>
          <TabsTrigger value="accounts" data-testid="tab-accounts">Contas Bancárias</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar transações..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                  data-testid="input-search-transactions"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40" data-testid="filter-transaction-type">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-44" data-testid="filter-transaction-category">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {TRANSACTION_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsAddTransactionDialogOpen(true)} data-testid="button-add-transaction">
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhuma transação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                      <TableCell>
                        {transaction.date
                          ? format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === "income" ? "default" : "destructive"}>
                          {transaction.type === "income" ? "Receita" : "Despesa"}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {transaction.description || "-"}
                      </TableCell>
                      <TableCell>{transaction.vehiclePlate || "-"}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          transaction.type === "income" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTransaction(transaction)}
                            data-testid={`button-edit-transaction-${transaction.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTransaction(transaction)}
                            data-testid={`button-delete-transaction-${transaction.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsAddAccountDialogOpen(true)} data-testid="button-add-account">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-8">
                Nenhuma conta bancária cadastrada
              </div>
            ) : (
              accounts.map((account) => (
                <Card key={account.id} data-testid={`card-account-${account.id}`}>
                  <CardHeader className="flex flex-row items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{account.name}</CardTitle>
                        <CardDescription>{account.bank || "Sem banco"}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      <span>{account.accountNumber || "Sem número"}</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(account.balance || 0)}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAccount(account)}
                        data-testid={`button-edit-account-${account.id}`}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAccount(account)}
                        data-testid={`button-delete-account-${account.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddTransactionDialogOpen} onOpenChange={setIsAddTransactionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
            <DialogDescription>Registre uma nova transação financeira</DialogDescription>
          </DialogHeader>
          <TransactionForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTransactionDialogOpen(false)} data-testid="button-cancel-add-transaction">
              Cancelar
            </Button>
            <Button
              onClick={handleAddTransactionSubmit}
              disabled={createTransactionMutation.isPending}
              data-testid="button-submit-add-transaction"
            >
              {createTransactionMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTransactionDialogOpen} onOpenChange={setIsEditTransactionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
            <DialogDescription>Atualize os dados da transação</DialogDescription>
          </DialogHeader>
          <TransactionForm isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTransactionDialogOpen(false)} data-testid="button-cancel-edit-transaction">
              Cancelar
            </Button>
            <Button
              onClick={handleEditTransactionSubmit}
              disabled={updateTransactionMutation.isPending}
              data-testid="button-submit-edit-transaction"
            >
              {updateTransactionMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteTransactionDialogOpen} onOpenChange={setIsDeleteTransactionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-transaction">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedTransaction && deleteTransactionMutation.mutate(selectedTransaction.id)}
              data-testid="button-confirm-delete-transaction"
            >
              {deleteTransactionMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isAddAccountDialogOpen} onOpenChange={setIsAddAccountDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Conta Bancária</DialogTitle>
            <DialogDescription>Cadastre uma nova conta bancária</DialogDescription>
          </DialogHeader>
          <AccountForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAccountDialogOpen(false)} data-testid="button-cancel-add-account">
              Cancelar
            </Button>
            <Button
              onClick={handleAddAccountSubmit}
              disabled={createAccountMutation.isPending}
              data-testid="button-submit-add-account"
            >
              {createAccountMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditAccountDialogOpen} onOpenChange={setIsEditAccountDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Conta Bancária</DialogTitle>
            <DialogDescription>Atualize os dados da conta</DialogDescription>
          </DialogHeader>
          <AccountForm isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAccountDialogOpen(false)} data-testid="button-cancel-edit-account">
              Cancelar
            </Button>
            <Button
              onClick={handleEditAccountSubmit}
              disabled={updateAccountMutation.isPending}
              data-testid="button-submit-edit-account"
            >
              {updateAccountMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta Bancária</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta conta bancária? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-account">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedAccount && deleteAccountMutation.mutate(selectedAccount.id)}
              data-testid="button-confirm-delete-account"
            >
              {deleteAccountMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
