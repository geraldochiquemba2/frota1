import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Car, 
  MapPin, 
  Bell, 
  Clock, 
  Play, 
  Square, 
  Route,
  Gauge,
  User,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Camera,
  Target
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Driver, Trip, Alert, Vehicle } from "@shared/schema";

export default function DriverDashboard() {
  const { toast } = useToast();
  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [purpose, setPurpose] = useState("");
  const [startOdometer, setStartOdometer] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [endOdometer, setEndOdometer] = useState("");
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [trackingActive, setTrackingActive] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const watchIdRef = useRef<number | null>(null);

  // Fallback: Get location from IP address (try multiple services)
  const getLocationFromIP = async (): Promise<{ lat: number; lng: number; city: string } | null> => {
    // Try ipapi.co first
    try {
      const response = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(8000) });
      const data = await response.json();
      if (data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city || data.region || "Localização aproximada"
        };
      }
    } catch (e) {
      console.log("ipapi.co failed:", e);
    }
    
    // Try ip-api.com as backup
    try {
      const response = await fetch("http://ip-api.com/json/?fields=status,city,regionName,lat,lon", { signal: AbortSignal.timeout(8000) });
      const data = await response.json();
      if (data.status === "success" && data.lat && data.lon) {
        return {
          lat: data.lat,
          lng: data.lon,
          city: data.city || data.regionName || "Localização aproximada"
        };
      }
    } catch (e) {
      console.log("ip-api.com failed:", e);
    }
    
    return null;
  };

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    
    // CRITICAL: Check if we're in a secure context (HTTPS required for geolocation on mobile)
    if (!window.isSecureContext) {
      toast({
        title: "Site não seguro",
        description: "O GPS só funciona em sites HTTPS. Aceda ao site pelo link oficial do Replit (URL que termina em .replit.app ou .replit.dev).",
        variant: "destructive",
      });
      
      // Try IP fallback anyway
      const ipLocation = await getLocationFromIP();
      if (ipLocation) {
        setGpsCoords({ lat: ipLocation.lat, lng: ipLocation.lng });
        setStartLocation(ipLocation.city);
        toast({
          title: "Localização aproximada",
          description: `Usámos a internet para estimar: ${ipLocation.city}`,
        });
      }
      setGettingLocation(false);
      return;
    }

    // Check geolocation support
    if (!("geolocation" in navigator)) {
      toast({
        title: "GPS não suportado",
        description: "Este navegador não suporta GPS. Use Chrome ou Safari.",
        variant: "destructive",
      });
      setGettingLocation(false);
      return;
    }

    // Check permission status first
    try {
      if ("permissions" in navigator) {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        if (permission.state === "denied") {
          toast({
            title: "GPS bloqueado pelo navegador",
            description: "Vá às Configurações do navegador, procure por Localização/Sites, e permita este site. Depois recarregue a página.",
            variant: "destructive",
          });
          setGettingLocation(false);
          return;
        }
      }
    } catch {
      // Permissions API not supported, continue anyway
    }
    
    // Try GPS
    const getLocationPromise = (highAccuracy: boolean, timeoutMs: number): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: highAccuracy,
          timeout: timeoutMs,
          maximumAge: 120000
        });
      });
    };

    let lastError: GeolocationPositionError | null = null;
    
    // Try GPS with multiple strategies
    for (const attempt of [
      { highAccuracy: true, timeout: 25000 },
      { highAccuracy: false, timeout: 20000 },
      { highAccuracy: false, timeout: 15000 }
    ]) {
      try {
        const position = await getLocationPromise(attempt.highAccuracy, attempt.timeout);
        const { latitude, longitude } = position.coords;
        setGpsCoords({ lat: latitude, lng: longitude });
        
        // Get address from coordinates
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { signal: AbortSignal.timeout(8000) }
          );
          const data = await response.json();
          if (data.display_name) {
            setStartLocation(data.display_name.split(",").slice(0, 3).join(", "));
          } else {
            setStartLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch {
          setStartLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        
        toast({
          title: "Localização obtida com sucesso",
          description: "O GPS detectou a sua posição.",
        });
        setGettingLocation(false);
        return;
      } catch (e) {
        lastError = e as GeolocationPositionError;
        console.log(`GPS attempt failed (highAccuracy=${attempt.highAccuracy}):`, lastError.code, lastError.message);
      }
    }

    // GPS failed - show specific error message
    let errorTitle = "GPS falhou";
    let errorDescription = "";
    
    if (lastError) {
      switch (lastError.code) {
        case 1: // PERMISSION_DENIED
          errorTitle = "Permissão negada";
          errorDescription = "O navegador bloqueou o GPS. Verifique as permissões do site nas configurações do navegador.";
          break;
        case 2: // POSITION_UNAVAILABLE
          errorTitle = "GPS indisponível";
          errorDescription = "O telemóvel não conseguiu obter posição. Verifique se o GPS está ligado nas configurações do sistema.";
          break;
        case 3: // TIMEOUT
          errorTitle = "GPS demorou muito";
          errorDescription = "O GPS não respondeu a tempo. Tente ao ar livre ou perto de uma janela.";
          break;
        default:
          errorDescription = lastError.message || "Erro desconhecido.";
      }
    }

    // Try IP fallback
    toast({
      title: errorTitle,
      description: errorDescription + " A tentar localização aproximada...",
    });
    
    const ipLocation = await getLocationFromIP();
    if (ipLocation) {
      setGpsCoords({ lat: ipLocation.lat, lng: ipLocation.lng });
      setStartLocation(ipLocation.city);
      toast({
        title: "Localização aproximada obtida",
        description: `Usámos a internet: ${ipLocation.city}. Pode editar se necessário.`,
      });
      setGettingLocation(false);
      return;
    }

    // All methods failed - use default location based on profile
    // Use homeBase from profile, or set a default
    const defaultLocation = profile?.homeBase || "Luanda, Angola";
    setStartLocation(defaultLocation);
    
    toast({
      title: "Localização automática",
      description: `Usámos "${defaultLocation}" como ponto de partida. Pode editar acima se necessário.`,
    });
    setGettingLocation(false);
  };

  const { data: profile, isLoading: profileLoading } = useQuery<Driver>({
    queryKey: ["/api/driver/profile"],
  });

  const { data: activeTrip, isLoading: tripLoading } = useQuery<Trip | null>({
    queryKey: ["/api/driver/trips/active"],
  });

  const { data: trips = [] } = useQuery<Trip[]>({
    queryKey: ["/api/driver/trips"],
  });

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/driver/alerts"],
  });

  const { data: vehicle } = useQuery<Vehicle | null>({
    queryKey: ["/api/driver/vehicle"],
  });

  const startTripMutation = useMutation({
    mutationFn: async (data: { 
      startLocation: string; 
      destination: string;
      purpose: string; 
      startOdometer?: number;
      startLat?: number;
      startLng?: number;
    }) => {
      return apiRequest("POST", "/api/driver/trips/start", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver/trips/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      setStartLocation("");
      setDestination("");
      setPurpose("");
      setStartOdometer("");
      toast({
        title: "Viagem iniciada",
        description: "Boa viagem! A central pode ver sua localização.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao iniciar viagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePhotoMutation = useMutation({
    mutationFn: async (photo: string) => {
      return apiRequest("PATCH", "/api/driver/profile", { photo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver/profile"] });
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar foto",
        variant: "destructive",
      });
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        updatePhotoMutation.mutate(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const completeTripMutation = useMutation({
    mutationFn: async (data: { tripId: string; endLocation: string; endOdometer?: number }) => {
      return apiRequest("POST", `/api/driver/trips/${data.tripId}/complete`, { endLocation: data.endLocation, endOdometer: data.endOdometer });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver/trips/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/alerts"] });
      setEndLocation("");
      setEndOdometer("");
      toast({
        title: "Viagem finalizada",
        description: "Viagem registrada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao finalizar viagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const dismissAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return apiRequest("PATCH", `/api/driver/alerts/${alertId}/dismiss`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver/alerts"] });
      toast({
        title: "Alerta dispensado",
      });
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: async ({ tripId, currentLat, currentLng }: { tripId: string; currentLat: number; currentLng: number }) => {
      return apiRequest("PATCH", `/api/driver/trips/${tripId}/location`, { currentLat, currentLng });
    },
    onSuccess: () => {
      // Invalidate to keep driver UI and map in sync
      queryClient.invalidateQueries({ queryKey: ["/api/driver/trips/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    },
  });

  const lastUpdateRef = useRef<number>(0);
  const UPDATE_INTERVAL = 10000; // Only update every 10 seconds

  useEffect(() => {
    if (activeTrip && activeTrip.status === "active" && "geolocation" in navigator) {
      setTrackingActive(true);
      // Reset throttle to ensure first GPS fix is sent immediately
      lastUpdateRef.current = 0;
      
      // Mobile-optimized settings for continuous tracking
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setGpsCoords({ lat: latitude, lng: longitude });
          
          // Throttle updates to prevent excessive API calls
          const now = Date.now();
          if (now - lastUpdateRef.current >= UPDATE_INTERVAL) {
            lastUpdateRef.current = now;
            updateLocationMutation.mutate({
              tripId: activeTrip.id,
              currentLat: latitude,
              currentLng: longitude,
            });
          }
        },
        (error) => {
          console.error("GPS tracking error:", error);
          // On mobile, if high accuracy fails, the watch will continue trying
          // We only log the error but don't stop tracking
          if (error.code === 3) { // TIMEOUT
            console.log("GPS timeout during tracking, will retry automatically");
          }
        },
        { 
          enableHighAccuracy: true,
          timeout: 60000, // Increased timeout for mobile (60 seconds)
          maximumAge: 30000 // Accept positions up to 30 seconds old on mobile
        }
      );
    }
    
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        setTrackingActive(false);
      }
    };
  }, [activeTrip?.id, activeTrip?.status]);

  const handleStartTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination) {
      toast({
        title: "Destino obrigatório",
        description: "Por favor, informe o destino da viagem",
        variant: "destructive",
      });
      return;
    }
    startTripMutation.mutate({
      startLocation: startLocation || profile?.homeBase || "Localização não informada",
      destination,
      purpose: purpose || "Viagem de trabalho",
      startOdometer: startOdometer ? parseInt(startOdometer) : undefined,
      startLat: gpsCoords?.lat,
      startLng: gpsCoords?.lng,
    });
  };

  const handleCompleteTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;
    completeTripMutation.mutate({
      tripId: activeTrip.id,
      endLocation: endLocation || "Destino não informado",
      endOdometer: endOdometer ? parseInt(endOdometer) : undefined,
    });
  };

  const recentTrips = trips.filter(t => t.status === "completed").slice(0, 5);

  if (profileLoading || tripLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-14 w-14">
              <AvatarImage src={profile?.photo || undefined} alt={profile?.name} />
              <AvatarFallback>
                {profile?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "M"}
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              ref={photoInputRef}
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background border flex items-center justify-center hover-elevate active-elevate-2"
              onClick={() => photoInputRef.current?.click()}
              disabled={updatePhotoMutation.isPending}
              data-testid="button-change-photo"
            >
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-driver-name">
              Olá, {profile?.name || "Motorista"}
            </h1>
            <p className="text-muted-foreground">Área do Motorista</p>
          </div>
        </div>
        <Badge variant={profile?.status === "available" ? "default" : "secondary"} data-testid="badge-driver-status">
          {profile?.status === "available" ? "Disponível" : profile?.status === "on_trip" ? "Em Viagem" : profile?.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card data-testid="card-vehicle-info">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veículo Atribuído</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {vehicle ? (
              <div>
                <div className="text-2xl font-bold">{vehicle.plate}</div>
                <p className="text-sm text-muted-foreground">
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum veículo atribuído</p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-trips-count">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Viagens</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trips.length}</div>
            <p className="text-sm text-muted-foreground">viagens realizadas</p>
          </CardContent>
        </Card>

        <Card data-testid="card-alerts-count">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-sm text-muted-foreground">alertas pendentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {activeTrip ? (
          <Card className="border-primary" data-testid="card-active-trip">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                Viagem em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span>Origem: {activeTrip.startLocation}</span>
                </div>
                {activeTrip.destination && (
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-red-500" />
                    <span>Destino: {activeTrip.destination}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Início: {format(new Date(activeTrip.startTime), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </span>
                </div>
                {activeTrip.startOdometer && (
                  <div className="flex items-center gap-2 text-sm">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <span>Odômetro inicial: {activeTrip.startOdometer} km</span>
                  </div>
                )}
                {trackingActive && gpsCoords && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Navigation className="h-4 w-4 animate-pulse" />
                    <span>GPS ativo: {gpsCoords.lat.toFixed(4)}, {gpsCoords.lng.toFixed(4)}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleCompleteTrip} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="endLocation">Destino Final</Label>
                  <Input
                    id="endLocation"
                    placeholder="Onde você está agora?"
                    value={endLocation}
                    onChange={(e) => setEndLocation(e.target.value)}
                    data-testid="input-end-location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endOdometer">Odômetro Final (km)</Label>
                  <Input
                    id="endOdometer"
                    type="number"
                    placeholder="Quilometragem atual"
                    value={endOdometer}
                    onChange={(e) => setEndOdometer(e.target.value)}
                    data-testid="input-end-odometer"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={completeTripMutation.isPending}
                  data-testid="button-complete-trip"
                >
                  <Square className="h-4 w-4 mr-2" />
                  {completeTripMutation.isPending ? "Finalizando..." : "Finalizar Viagem"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card data-testid="card-start-trip">
            <CardHeader>
              <CardTitle>Iniciar Nova Viagem</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStartTrip} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startLocation">Local de Partida</Label>
                  <div className="flex gap-2">
                    <Input
                      id="startLocation"
                      placeholder={gettingLocation ? "A obter localização..." : "Digite ou clique no ícone GPS"}
                      value={startLocation}
                      onChange={(e) => setStartLocation(e.target.value)}
                      data-testid="input-start-location"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                      data-testid="button-get-location"
                      title="Tentar GPS"
                    >
                      <Navigation className={`h-4 w-4 ${gettingLocation ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                  {gettingLocation && (
                    <p className="text-xs text-muted-foreground animate-pulse">
                      A tentar obter localização... aguarde até 30 segundos
                    </p>
                  )}
                  {gpsCoords && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      GPS: {gpsCoords.lat.toFixed(4)}, {gpsCoords.lng.toFixed(4)}
                    </p>
                  )}
                  {!gpsCoords && !gettingLocation && (
                    <p className="text-xs text-muted-foreground">
                      Pode digitar o local manualmente acima
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destino *</Label>
                  <Input
                    id="destination"
                    placeholder="Para onde você vai?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    data-testid="input-destination"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Motivo da Viagem</Label>
                  <Input
                    id="purpose"
                    placeholder="Entrega, coleta, etc."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    data-testid="input-purpose"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startOdometer">Odômetro Inicial (km)</Label>
                  <Input
                    id="startOdometer"
                    type="number"
                    placeholder="Quilometragem atual do veículo"
                    value={startOdometer}
                    onChange={(e) => setStartOdometer(e.target.value)}
                    data-testid="input-start-odometer"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={startTripMutation.isPending || !destination}
                  data-testid="button-start-trip"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {startTripMutation.isPending ? "Iniciando..." : "Iniciar Viagem"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card data-testid="card-alerts">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Meus Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum alerta pendente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className="flex items-start justify-between gap-3 p-3 rounded-md bg-muted/50"
                    data-testid={`alert-item-${alert.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissAlertMutation.mutate(alert.id)}
                      data-testid={`button-dismiss-alert-${alert.id}`}
                    >
                      OK
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-recent-trips">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Viagens Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTrips.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">
              Nenhuma viagem realizada ainda
            </p>
          ) : (
            <div className="space-y-3">
              {recentTrips.map((trip) => (
                <div 
                  key={trip.id} 
                  className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/30"
                  data-testid={`trip-item-${trip.id}`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">
                        {trip.startLocation} → {trip.endLocation || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(trip.startTime), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        {trip.distance && ` • ${trip.distance} km`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{trip.purpose || "Viagem"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
