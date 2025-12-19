import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getProvinces, getMunicipalities, getNeighborhoods } from "@/data/angola-locations";
import { RouteMap } from "@/components/RouteMap";
import { 
  Car, 
  MapPin, 
  Bell, 
  Clock, 
  Play, 
  Square, 
  Route,
  Gauge,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Camera,
  Target,
  Loader2
} from "lucide-react";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Driver, Trip, Alert, Vehicle } from "@shared/schema";

export default function DriverDashboard() {
  const { toast } = useToast();
  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  
  // Start location cascading selection
  const [startSelectedProvince, setStartSelectedProvince] = useState("");
  const [startSelectedMunicipality, setStartSelectedMunicipality] = useState("");
  const [startSelectedNeighborhood, setStartSelectedNeighborhood] = useState("");
  
  // Destination cascading selection
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const [purpose, setPurpose] = useState("");
  const [startOdometer, setStartOdometer] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [endOdometer, setEndOdometer] = useState("");
  
  const provinces = getProvinces();
  
  // Start location derived values
  const startMunicipalities = startSelectedProvince ? getMunicipalities(startSelectedProvince) : [];
  const startNeighborhoods = startSelectedProvince && startSelectedMunicipality 
    ? getNeighborhoods(startSelectedProvince, startSelectedMunicipality) 
    : [];
  
  // Destination derived values
  const municipalities = selectedProvince ? getMunicipalities(selectedProvince) : [];
  const neighborhoods = selectedProvince && selectedMunicipality 
    ? getNeighborhoods(selectedProvince, selectedMunicipality) 
    : [];

  // Update startLocation when cascading selection changes
  useEffect(() => {
    const parts = [startSelectedNeighborhood, startSelectedMunicipality, startSelectedProvince].filter(Boolean);
    if (parts.length > 0) {
      setStartLocation(parts.join(", "));
    }
  }, [startSelectedProvince, startSelectedMunicipality, startSelectedNeighborhood]);

  // Update destination when cascading selection changes
  useEffect(() => {
    const parts = [selectedNeighborhood, selectedMunicipality, selectedProvince].filter(Boolean);
    if (parts.length > 0) {
      setDestination(parts.join(", "));
    }
  }, [selectedProvince, selectedMunicipality, selectedNeighborhood]);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"needs_permission" | "requesting" | "active" | "error" | "ip_fallback">("needs_permission");
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied" | "unknown">("unknown");
  const [usingIpLocation, setUsingIpLocation] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const watchIdRef = useRef<number | null>(null);
  const startLocationRef = useRef(startLocation);
  
  // Keep ref in sync with state
  useEffect(() => {
    startLocationRef.current = startLocation;
  }, [startLocation]);

  // Get location by IP address as fallback
  const getLocationByIP = async () => {
    try {
      setGpsStatus("requesting");
      console.log("IP Location: Fetching location by IP...");
      
      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) throw new Error("Failed to fetch IP location");
      
      const data = await response.json();
      console.log("IP Location: Got data", data);
      
      if (data.latitude && data.longitude) {
        setGpsCoords({ lat: data.latitude, lng: data.longitude });
        setGpsStatus("ip_fallback");
        setUsingIpLocation(true);
        setGpsError(null);
        
        // Set location with city/region info
        const locationName = [data.city, data.region, data.country_name]
          .filter(Boolean)
          .join(", ");
        
        if (!startLocationRef.current) {
          setStartLocation(locationName || `${data.latitude.toFixed(5)}, ${data.longitude.toFixed(5)}`);
        }
        
        toast({
          title: "Localização por IP",
          description: `Localização aproximada: ${data.city || "sua região"}`,
        });
        
        return true;
      }
      throw new Error("No location data");
    } catch (error) {
      console.error("IP Location: Error", error);
      setGpsStatus("error");
      setGpsError("Não foi possível obter localização. Por favor, digite manualmente.");
      return false;
    }
  };

  // Check permission state on mount
  useEffect(() => {
    const checkPermission = async () => {
      // Check secure context first
      if (!window.isSecureContext) {
        console.log("GPS: Not secure context, trying IP location...");
        await getLocationByIP();
        return;
      }
      
      if (!("geolocation" in navigator)) {
        console.log("GPS: Not available, trying IP location...");
        await getLocationByIP();
        return;
      }
      
      console.log("GPS: Checking permission state...");
      
      try {
        if ("permissions" in navigator) {
          const result = await navigator.permissions.query({ name: "geolocation" });
          console.log("GPS: Permission state:", result.state);
          setPermissionState(result.state as "prompt" | "granted" | "denied");
          
          if (result.state === "granted") {
            // Already have permission, start tracking
            console.log("GPS: Permission already granted, starting tracking...");
            startGpsTracking();
          } else if (result.state === "denied") {
            console.log("GPS: Permission denied, trying IP location...");
            await getLocationByIP();
          }
          
          // Listen for permission changes
          result.addEventListener("change", () => {
            console.log("GPS: Permission changed to:", result.state);
            setPermissionState(result.state as "prompt" | "granted" | "denied");
            if (result.state === "granted") {
              startGpsTracking();
            }
          });
        }
      } catch (e) {
        console.log("GPS: Permissions API not supported, will need user click", e);
        // Permissions API not supported, will need user click
        setPermissionState("prompt");
      }
    };
    
    checkPermission();
  }, []);

  // Request GPS permission - MUST be triggered by user click (like Google Maps)
  const requestGpsPermission = () => {
    console.log("GPS: User clicked to request permission");
    console.log("GPS: Secure context?", window.isSecureContext);
    console.log("GPS: Protocol:", window.location.protocol);
    console.log("GPS: Geolocation available?", "geolocation" in navigator);
    
    if (!window.isSecureContext) {
      const httpsUrl = window.location.href.replace('http:', 'https:');
      setGpsStatus("error");
      setGpsError(`O GPS requer HTTPS. Copie e abra este link: ${httpsUrl}`);
      toast({
        title: "Site não seguro",
        description: "Abra o site usando HTTPS para o GPS funcionar.",
        variant: "destructive",
      });
      return;
    }
    
    if (!("geolocation" in navigator)) {
      setGpsStatus("error");
      setGpsError("GPS não suportado neste navegador. Use Chrome ou Safari.");
      toast({
        title: "GPS não suportado",
        description: "Este navegador não suporta GPS. Use Chrome ou Safari.",
        variant: "destructive",
      });
      return;
    }

    setGpsStatus("requesting");
    setGpsError(null);
    
    console.log("GPS: Calling getCurrentPosition...");

    // First, use getCurrentPosition to trigger the permission popup (requires user gesture)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Permission granted! Now start continuous tracking
        const { latitude, longitude, accuracy } = position.coords;
        console.log("GPS: Success!", latitude, longitude, "accuracy:", accuracy);
        setGpsCoords({ lat: latitude, lng: longitude });
        setGpsStatus("active");
        setPermissionState("granted");
        
        toast({
          title: "GPS ativo",
          description: `Localização obtida (precisão: ${Math.round(accuracy)}m)`,
        });
        
        // Start continuous tracking
        startGpsTracking();
      },
      (error) => {
        console.error("GPS: Error!", error.code, error.message);
        setGpsStatus("error");
        
        // Try IP location as fallback for any GPS error
        console.log("GPS: Error, trying IP location fallback...");
        getLocationByIP().then((ipSuccess) => {
          if (!ipSuccess) {
            switch (error.code) {
              case 1: // PERMISSION_DENIED
                setPermissionState("denied");
                setGpsError("GPS bloqueado. Usando localização aproximada por IP.");
                break;
              case 2: // POSITION_UNAVAILABLE
                setGpsError("GPS indisponível. Usando localização aproximada por IP.");
                break;
              case 3: // TIMEOUT
                setGpsError("GPS demorou. Usando localização aproximada por IP.");
                break;
              default:
                setGpsError("Erro no GPS. Digite a localização manualmente.");
            }
          }
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0 // Force fresh position for permission request
      }
    );
  };

  // Start continuous GPS tracking (called after permission is granted)
  const startGpsTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsCoords({ lat: latitude, lng: longitude });
        setGpsStatus("active");
        setGpsError(null);
        
        // Set start location if not set yet
        if (!startLocationRef.current) {
          setStartLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          // Try to get address name in background with detailed address info
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`)
            .then(res => res.json())
            .then(data => {
              if (data.address) {
                const addr = data.address;
                // Build location from most specific to least specific
                const parts = [
                  addr.road || addr.street || addr.pedestrian,
                  addr.suburb || addr.neighbourhood || addr.quarter || addr.residential,
                  addr.city || addr.town || addr.municipality || addr.village || addr.county,
                  addr.state || addr.province || addr.region
                ].filter(Boolean);
                
                if (parts.length > 0) {
                  setStartLocation(parts.slice(0, 4).join(", "));
                }
              } else if (data.display_name) {
                setStartLocation(data.display_name.split(",").slice(0, 4).join(", "));
              }
            })
            .catch(() => {});
        }
      },
      (error) => {
        console.error("GPS tracking error:", error.code, error.message);
        // Don't change status to error if we already have coords - just log
        if (!gpsCoords) {
          setGpsStatus("error");
          setGpsError("Erro no rastreamento GPS. Tente novamente.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 60000,
        maximumAge: 5000 // Accept positions up to 5 seconds old for smoother tracking
      }
    );
  };

  // Cleanup GPS watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

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

  // Pre-fill odometer with vehicle's current odometer when vehicle loads
  const [odometerManuallyEdited, setOdometerManuallyEdited] = useState(false);
  
  useEffect(() => {
    if (vehicle?.odometer !== undefined && vehicle?.odometer !== null && !odometerManuallyEdited) {
      setStartOdometer(vehicle.odometer.toString());
    }
  }, [vehicle?.odometer, odometerManuallyEdited]);
  
  // Reset manual edit flag when vehicle changes
  useEffect(() => {
    setOdometerManuallyEdited(false);
  }, [vehicle?.id]);

  const startTripMutation = useMutation({
    mutationFn: async (data: { 
      startLocation: string; 
      destination: string;
      purpose: string; 
      startOdometer?: number;
      startLat?: number;
      startLng?: number;
      destLat?: number;
      destLng?: number;
    }) => {
      return apiRequest("POST", "/api/driver/trips/start", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver/trips/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/vehicle"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setStartLocation("");
      setDestination("");
      setStartSelectedProvince("");
      setStartSelectedMunicipality("");
      setStartSelectedNeighborhood("");
      setSelectedProvince("");
      setSelectedMunicipality("");
      setSelectedNeighborhood("");
      setPurpose("");
      setStartOdometer("");
      setOdometerManuallyEdited(false);
      toast({
        title: "Viagem iniciada",
        description: "Boa viagem! A central pode ver sua localização e rota.",
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
      queryClient.invalidateQueries({ queryKey: ["/api/driver/vehicle"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setEndLocation("");
      setEndOdometer("");
      toast({
        title: "Viagem finalizada",
        description: "Viagem registrada e odômetro atualizado!",
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
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    },
  });

  const lastUpdateRef = useRef<number>(0);
  const UPDATE_INTERVAL = 5000; // Update every 5 seconds for real-time tracking

  // Send location updates to server when there's an active trip
  useEffect(() => {
    if (activeTrip && activeTrip.status === "active" && gpsCoords) {
      setTrackingActive(true);
      
      // Send update immediately if enough time has passed
      const now = Date.now();
      if (now - lastUpdateRef.current >= UPDATE_INTERVAL) {
        lastUpdateRef.current = now;
        updateLocationMutation.mutate({
          tripId: activeTrip.id,
          currentLat: gpsCoords.lat,
          currentLng: gpsCoords.lng,
        });
      }
    } else {
      setTrackingActive(false);
    }
  }, [activeTrip?.id, activeTrip?.status, gpsCoords?.lat, gpsCoords?.lng]);

  const handleStartTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields first
    if (!destination) {
      toast({
        title: "Destino obrigatório",
        description: "Por favor, informe o destino da viagem",
        variant: "destructive",
      });
      return;
    }
    if (!vehicle) {
      toast({
        title: "Viatura não atribuída",
        description: "Você precisa ter uma viatura atribuída para iniciar uma viagem",
        variant: "destructive",
      });
      return;
    }
    
    // Try to geocode destination for admin map route display (optional, non-blocking)
    let destLat: number | undefined;
    let destLng: number | undefined;
    try {
      const destQuery = encodeURIComponent(`${destination}, Angola`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${destQuery}&limit=1`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          destLat = parseFloat(data[0].lat);
          destLng = parseFloat(data[0].lon);
        }
      }
    } catch (err) {
      console.log("Could not geocode destination (continuing anyway):", err);
    }
    
    // Always proceed with trip start regardless of geocoding result
    startTripMutation.mutate({
      startLocation: startLocation || profile?.homeBase || "Localização não informada",
      destination,
      purpose: purpose || "Viagem de trabalho",
      startOdometer: startOdometer ? parseInt(startOdometer) : undefined,
      startLat: gpsCoords?.lat,
      startLng: gpsCoords?.lng,
      destLat,
      destLng,
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
          {profile?.status === "available" ? "Disponível" : (profile?.status === "on_trip" || profile?.status === "on-trip") ? "Em Viagem" : profile?.status === "off-duty" ? "Folga" : profile?.status}
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
              <div className="space-y-2">
                <div className="text-2xl font-bold">{vehicle.plate}</div>
                <p className="text-sm text-muted-foreground">
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </p>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {vehicle.odometer || 0} km
                  </span>
                </div>
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
              <CardTitle className="flex items-center justify-between gap-2">
                <span>Iniciar Nova Viagem</span>
                {gpsStatus === "active" && (
                  <Badge variant="default" className="bg-green-600">
                    <Navigation className="h-3 w-3 mr-1" />
                    GPS Ativo
                  </Badge>
                )}
                {gpsStatus === "requesting" && (
                  <Badge variant="secondary">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    A obter GPS...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>


              <form onSubmit={handleStartTrip} className="space-y-4">
                <div className="space-y-2">
                  <Label>Local de Partida *</Label>
                  <div className="grid gap-2">
                    <Select 
                      value={startSelectedProvince} 
                      onValueChange={(value) => {
                        setStartSelectedProvince(value);
                        setStartSelectedMunicipality("");
                        setStartSelectedNeighborhood("");
                      }}
                    >
                      <SelectTrigger data-testid="select-start-province">
                        <SelectValue placeholder="Selecione a Província" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={startSelectedMunicipality} 
                      onValueChange={(value) => {
                        setStartSelectedMunicipality(value);
                        setStartSelectedNeighborhood("");
                      }}
                      disabled={!startSelectedProvince}
                    >
                      <SelectTrigger data-testid="select-start-municipality">
                        <SelectValue placeholder="Selecione o Município" />
                      </SelectTrigger>
                      <SelectContent>
                        {startMunicipalities.map((municipality) => (
                          <SelectItem key={municipality} value={municipality}>
                            {municipality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={startSelectedNeighborhood} 
                      onValueChange={setStartSelectedNeighborhood}
                      disabled={!startSelectedMunicipality}
                    >
                      <SelectTrigger data-testid="select-start-neighborhood">
                        <SelectValue placeholder="Selecione o Bairro" />
                      </SelectTrigger>
                      <SelectContent>
                        {startNeighborhoods.map((neighborhood) => (
                          <SelectItem key={neighborhood} value={neighborhood}>
                            {neighborhood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {startLocation && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Partida: {startLocation}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Destino *</Label>
                  <div className="grid gap-2">
                    <Select 
                      value={selectedProvince} 
                      onValueChange={(value) => {
                        setSelectedProvince(value);
                        setSelectedMunicipality("");
                        setSelectedNeighborhood("");
                      }}
                    >
                      <SelectTrigger data-testid="select-province">
                        <SelectValue placeholder="Selecione a Província" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={selectedMunicipality} 
                      onValueChange={(value) => {
                        setSelectedMunicipality(value);
                        setSelectedNeighborhood("");
                      }}
                      disabled={!selectedProvince}
                    >
                      <SelectTrigger data-testid="select-municipality">
                        <SelectValue placeholder="Selecione o Município" />
                      </SelectTrigger>
                      <SelectContent>
                        {municipalities.map((municipality) => (
                          <SelectItem key={municipality} value={municipality}>
                            {municipality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={selectedNeighborhood} 
                      onValueChange={setSelectedNeighborhood}
                      disabled={!selectedMunicipality}
                    >
                      <SelectTrigger data-testid="select-neighborhood">
                        <SelectValue placeholder="Selecione o Bairro" />
                      </SelectTrigger>
                      <SelectContent>
                        {neighborhoods.map((neighborhood) => (
                          <SelectItem key={neighborhood} value={neighborhood}>
                            {neighborhood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {destination && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Destino: {destination}
                    </p>
                  )}
                </div>

                {/* Route Map */}
                {startLocation && destination && (
                  <div className="space-y-2">
                    <Label>Rota e Distância</Label>
                    <RouteMap 
                      startLocation={startLocation} 
                      destination={destination} 
                    />
                  </div>
                )}

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
                  {vehicle?.odometer !== undefined && (
                    <div className="p-3 bg-muted rounded-md border border-muted-foreground/20 mb-2">
                      <p className="text-sm text-muted-foreground">
                        Actualmente a viatura está com <span className="font-semibold">{vehicle.odometer.toLocaleString()} km</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Caso não rectifique, prossiga com a viagem com este valor
                      </p>
                    </div>
                  )}
                  <Label htmlFor="startOdometer">Odómetro Inicial (km)</Label>
                  <Input
                    id="startOdometer"
                    type="number"
                    placeholder="Quilometragem atual do veículo"
                    value={startOdometer}
                    onChange={(e) => {
                      setStartOdometer(e.target.value);
                      setOdometerManuallyEdited(true);
                    }}
                    data-testid="input-start-odometer"
                  />
                </div>
                
                {!vehicle && (
                  <div className="p-3 rounded-md bg-yellow-500/10 border border-yellow-500/30">
                    <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Você não tem uma viatura atribuída. Contacte o administrador.
                      </span>
                    </div>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={startTripMutation.isPending || !destination || !startLocation || !vehicle}
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
