import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, type VehicleStatus } from "./StatusBadge";
import { MapPin, MoreVertical, Fuel, Gauge, Image, UserMinus } from "lucide-react";
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
  photos?: string[];
  onView?: () => void;
  onEdit?: () => void;
  onAssignDriver?: () => void;
  onRemoveDriver?: () => void;
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
  photos,
  onView,
  onEdit,
  onAssignDriver,
  onRemoveDriver,
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
            {driver && (
              <DropdownMenuItem onClick={onRemoveDriver} data-testid={`menu-item-remove-driver-${id}`} className="text-destructive">
                <UserMinus className="h-4 w-4 mr-2" />
                Remover Motorista
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        {photos && photos.length > 0 && (
          <div className="flex gap-1 overflow-x-auto">
            {photos.slice(0, 3).map((photo, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img 
                  src={photo} 
                  alt={`${plate} foto ${index + 1}`} 
                  className={`h-12 w-12 object-cover rounded-md ${index === 0 ? "ring-2 ring-primary" : ""}`}
                />
                {index === 0 && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] bg-primary text-primary-foreground px-1 rounded">Capa</span>
                )}
              </div>
            ))}
            {photos.length > 3 && (
              <div className="h-12 w-12 flex items-center justify-center bg-muted rounded-md flex-shrink-0">
                <span className="text-xs text-muted-foreground">+{photos.length - 3}</span>
              </div>
            )}
          </div>
        )}
        <div className="text-sm">
          <span className="text-muted-foreground">Motorista:</span>{" "}
          <span className={driver ? "font-medium" : "text-muted-foreground italic"}>{driver || "Sem Motorista"}</span>
        </div>
        {location && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{location}</span>
          </div>
        )}
        {fuelLevel !== undefined && (
          <div className="flex items-center gap-1.5 text-sm">
            <Fuel className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Combustível:</span>{" "}
            <span className="font-medium">{fuelLevel}%</span>
          </div>
        )}
        {odometer !== undefined && (
          <div className="flex items-center gap-1.5 text-sm">
            <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Actualmente a viatura está com</span>{" "}
            <span className="font-medium">{odometer.toLocaleString()} km</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
