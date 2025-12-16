import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Gauge, User } from "lucide-react";

interface TripLogCardProps {
  id: string;
  vehiclePlate: string;
  driverName: string;
  startLocation: string;
  endLocation?: string;
  startTime: string;
  endTime?: string;
  distance?: number;
  purpose?: string;
  onClick?: () => void;
}

export function TripLogCard({
  id,
  vehiclePlate,
  driverName,
  startLocation,
  endLocation,
  startTime,
  endTime,
  distance,
  purpose,
  onClick,
}: TripLogCardProps) {
  const isOngoing = !endTime;

  return (
    <Card
      className="hover-elevate cursor-pointer"
      onClick={onClick}
      data-testid={`card-trip-${id}`}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <div>
          <CardTitle className="text-base font-mono">{vehiclePlate}</CardTitle>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>{driverName}</span>
          </div>
        </div>
        {isOngoing && (
          <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Em Andamento
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <div className="flex flex-col items-center">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div className="w-0.5 h-4 bg-border" />
              <div className={`h-2 w-2 rounded-full ${isOngoing ? "bg-muted" : "bg-red-500"}`} />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Partida</p>
                <p className="text-sm">{startLocation}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Destino</p>
                <p className="text-sm">{endLocation || "—"}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{new Date(startTime).toLocaleTimeString('pt-BR', { hour: "2-digit", minute: "2-digit" })}</span>
            {endTime && (
              <>
                <span>-</span>
                <span>{new Date(endTime).toLocaleTimeString('pt-BR', { hour: "2-digit", minute: "2-digit" })}</span>
              </>
            )}
          </div>
          {distance && (
            <div className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5" />
              <span>{distance} km</span>
            </div>
          )}
        </div>
        {purpose && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Finalidade:</span> {purpose}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
