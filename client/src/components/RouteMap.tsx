import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Loader2, MapPin, Route } from "lucide-react";

interface RouteMapProps {
  startLocation: string;
  destination: string;
  className?: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteInfo {
  distance: number;
  duration: number;
  geometry: [number, number][];
}

async function tryGeocode(query: string): Promise<Coordinates | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

async function geocodeLocation(location: string): Promise<Coordinates | null> {
  const parts = location.split(",").map(p => p.trim()).filter(Boolean);
  
  const queries = [
    `${location}, Angola`,
    parts.length >= 2 ? `${parts.slice(1).join(", ")}, Angola` : null,
    parts.length >= 3 ? `${parts.slice(2).join(", ")}, Angola` : null,
    parts.length >= 1 ? `${parts[parts.length - 1]}, Angola` : null,
  ].filter(Boolean) as string[];
  
  for (const query of queries) {
    const result = await tryGeocode(query);
    if (result) {
      console.log(`Geocoded "${location}" using query "${query}"`);
      return result;
    }
  }
  
  console.warn(`Could not geocode location: ${location}`);
  return null;
}

async function getRoute(start: Coordinates, end: Coordinates): Promise<RouteInfo | null> {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: route.distance / 1000,
        duration: route.duration / 60,
        geometry: route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]])
      };
    }
    return null;
  } catch (error) {
    console.error("Routing error:", error);
    return null;
  }
}

export function RouteMap({ startLocation, destination, className = "" }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView([-8.8390, 13.2894], 7);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(leafletMapRef.current);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!startLocation || !destination || !leafletMapRef.current) {
      setRouteInfo(null);
      return;
    }

    const calculateRoute = async () => {
      setLoading(true);
      setError(null);
      
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
        routeLayerRef.current = null;
      }

      const [startCoords, endCoords] = await Promise.all([
        geocodeLocation(startLocation),
        geocodeLocation(destination)
      ]);

      if (!startCoords || !endCoords) {
        setError("Não foi possível encontrar as coordenadas das localizações");
        setLoading(false);
        return;
      }

      const startIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #22c55e;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const endIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #ef4444;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const startMarker = L.marker([startCoords.lat, startCoords.lng], { icon: startIcon })
        .addTo(leafletMapRef.current!)
        .bindPopup(`<strong>Partida:</strong><br>${startLocation}`);
      
      const endMarker = L.marker([endCoords.lat, endCoords.lng], { icon: endIcon })
        .addTo(leafletMapRef.current!)
        .bindPopup(`<strong>Destino:</strong><br>${destination}`);

      markersRef.current = [startMarker, endMarker];

      const route = await getRoute(startCoords, endCoords);

      if (route) {
        routeLayerRef.current = L.polyline(route.geometry as L.LatLngExpression[], {
          color: "#3b82f6",
          weight: 4,
          opacity: 0.8
        }).addTo(leafletMapRef.current!);

        setRouteInfo(route);

        // Use polyline bounds to ensure entire route is visible
        const bounds = routeLayerRef.current.getBounds();
        leafletMapRef.current!.fitBounds(bounds, { padding: [50, 50] });
      } else {
        const straightLine = L.polyline([
          [startCoords.lat, startCoords.lng],
          [endCoords.lat, endCoords.lng]
        ], {
          color: "#3b82f6",
          weight: 3,
          opacity: 0.6,
          dashArray: "10, 10"
        }).addTo(leafletMapRef.current!);
        
        routeLayerRef.current = straightLine;

        const directDistance = leafletMapRef.current!.distance(
          L.latLng(startCoords.lat, startCoords.lng),
          L.latLng(endCoords.lat, endCoords.lng)
        ) / 1000;

        setRouteInfo({
          distance: directDistance,
          duration: directDistance * 1.5,
          geometry: [[startCoords.lat, startCoords.lng], [endCoords.lat, endCoords.lng]]
        });

        // Use polyline bounds for fallback straight line
        const bounds = routeLayerRef.current.getBounds();
        leafletMapRef.current!.fitBounds(bounds, { padding: [50, 50] });
      }

      setLoading(false);
    };

    calculateRoute();
  }, [startLocation, destination]);

  return (
    <div className={`space-y-3 ${className}`}>
      {routeInfo && (
        <div className="flex flex-wrap items-center gap-4 p-3 rounded-md bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Distância: {routeInfo.distance.toFixed(1)} km
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Tempo estimado: {Math.round(routeInfo.duration)} min
            </span>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="flex items-center justify-center gap-2 p-3 rounded-md bg-muted/50">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">A calcular rota...</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30">
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      <div
        ref={mapRef}
        className="w-full h-64 rounded-md border"
        data-testid="route-map"
      />
    </div>
  );
}
