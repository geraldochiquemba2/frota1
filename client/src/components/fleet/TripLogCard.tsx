import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Gauge, User, Navigation, Target } from "lucide-react";

interface TripLogCardProps {
  id: string;
  vehiclePlate: string;
  driverName: string;
  startLocation: string;
  destination?: string;
  endLocation?: string;
  startTime: string;
  endTime?: string;
  distance?: number;
  purpose?: string;
  startLat?: number;
  startLng?: number;
  currentLat?: number;
  currentLng?: number;
  onClick?: () => void;
}

export function TripLogCard({
  id,
  vehiclePlate,
  driverName,
  startLocation,
  destination,
  endLocation,
  startTime,
  endTime,
  distance,
  purpose,
  startLat,
  startLng,
  currentLat,
  currentLng,
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
              <div className={`h-2 w-2 rounded-full ${isOngoing ? "bg-yellow-500" : "bg-red-500"}`} />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Partida</p>
                <p className="text-sm">{startLocation}</p>
                {startLat && startLng && (
                  <p className="text-xs text-muted-foreground">GPS: {startLat.toFixed(4)}, {startLng.toFixed(4)}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Destino Planejado</p>
                <p className="text-sm">{destination || endLocation || "—"}</p>
              </div>
              {endLocation && destination && endLocation !== destination && (
                <div>
                  <p className="text-xs text-muted-foreground">Destino Final</p>
                  <p className="text-sm">{endLocation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {isOngoing && currentLat && currentLng && (
          <div className="flex items-center gap-2 text-xs bg-muted/50 p-2 rounded-md">
            <Navigation className="h-3.5 w-3.5 text-blue-500" />
            <span>Posição atual: {currentLat.toFixed(4)}, {currentLng.toFixed(4)}</span>
          </div>
        )}
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
