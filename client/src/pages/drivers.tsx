import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DriverCard } from "@/components/fleet/DriverCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import type { Driver } from "@shared/schema";

type DriverStatus = "available" | "on-trip" | "off-duty";

export default function Drivers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DriverStatus>("all");

  const { data: drivers = [], isLoading } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      d.phone.includes(search);
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: drivers.length,
    available: drivers.filter(d => d.status === "available").length,
    "on-trip": drivers.filter(d => d.status === "on-trip").length,
    "off-duty": drivers.filter(d => d.status === "off-duty").length,
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Motoristas</h1>
        <p className="text-muted-foreground">Gerencie os motoristas da sua frota</p>
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
              email={driver.email ?? ""}
              licenseExpiry={driver.licenseExpiry ?? ""}
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
              ? "Nenhum motorista cadastrado." 
              : "Nenhum motorista encontrado com os critérios informados."}
          </p>
        </div>
      )}
    </div>
  );
}
