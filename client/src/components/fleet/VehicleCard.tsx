import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, type VehicleStatus } from "./StatusBadge";
import { MapPin, MoreVertical, Fuel, Gauge } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VehicleCardProps {
  id: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  status: VehicleStatus;
  driver?: string;
  location?: string;
  fuelLevel?: number;
  odometer?: number;
  onView?: () => void;
  onEdit?: () => void;
  onAssignDriver?: () => void;
}

export function VehicleCard({
  id,
  plate,
  make,
  model,
  year,
  status,
  driver,
  location,
  fuelLevel,
  odometer,
  onView,
  onEdit,
  onAssignDriver,
}: VehicleCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-vehicle-${id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold tracking-wide">{plate}</span>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {year} {make} {model}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-vehicle-menu-${id}`}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView} data-testid={`menu-item-view-${id}`}>Ver Detalhes</DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit} data-testid={`menu-item-edit-${id}`}>Editar Veículo</DropdownMenuItem>
            <DropdownMenuItem onClick={onAssignDriver} data-testid={`menu-item-assign-${id}`}>Atribuir Motorista</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        {driver && (
          <div className="text-sm">
            <span className="text-muted-foreground">Motorista:</span>{" "}
            <span className="font-medium">{driver}</span>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{location}</span>
          </div>
        )}
        <div className="flex items-center gap-4 text-sm">
          {fuelLevel !== undefined && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Fuel className="h-3.5 w-3.5" />
              <span>{fuelLevel}%</span>
            </div>
          )}
          {odometer !== undefined && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" />
              <span>{odometer.toLocaleString()} km</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
