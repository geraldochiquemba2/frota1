import { useEffect, useRef } from "react";
import L from "leaflet";
import type { VehicleStatus } from "./StatusBadge";

interface VehicleMarker {
  id: string;
  plate: string;
  lat: number;
  lng: number;
  status: VehicleStatus;
  driver?: string;
}

interface ActiveRoute {
  vehicleId: string;
  startLat: number;
  startLng: number;
  currentLat: number;
  currentLng: number;
  destLat?: number;
  destLng?: number;
  destination?: string;
}

interface FleetMapProps {
  vehicles: VehicleMarker[];
  activeRoutes?: ActiveRoute[];
  onVehicleClick?: (vehicleId: string) => void;
  selectedVehicleId?: string;
  className?: string;
}

const statusColors: Record<VehicleStatus, string> = {
  active: "#22c55e",
  idle: "#f59e0b",
  maintenance: "#3b82f6",
  alert: "#ef4444",
};

export function FleetMap({ vehicles, activeRoutes = [], onVehicleClick, selectedVehicleId, className = "" }: FleetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const routeLinesRef = useRef<Map<string, L.Polyline>>(new Map());
  const destMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    leafletMapRef.current = L.map(mapRef.current).setView([-8.8390, 13.2894], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(leafletMapRef.current);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current) return;

    const existingIds = new Set(vehicles.map((v) => v.id));
    markersRef.current.forEach((marker, id) => {
      if (!existingIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    vehicles.forEach((vehicle) => {
      const color = statusColors[vehicle.status];
      const isSelected = vehicle.id === selectedVehicleId;
      
      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: ${isSelected ? "28px" : "24px"};
            height: ${isSelected ? "28px" : "24px"};
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            ${isSelected ? "transform: scale(1.2);" : ""}
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 17h4V5H10z"/><path d="M2 17V7a2 2 0 0 1 2-2h2l1 2h4l1-2h2a2 2 0 0 1 2 2v10"/><circle cx="6" cy="17" r="2"/><circle cx="18" cy="17" r="2"/>
            </svg>
          </div>
        `,
        iconSize: [isSelected ? 28 : 24, isSelected ? 28 : 24],
        iconAnchor: [isSelected ? 14 : 12, isSelected ? 14 : 12],
      });

      let marker = markersRef.current.get(vehicle.id);
      if (marker) {
        marker.setLatLng([vehicle.lat, vehicle.lng]);
        marker.setIcon(icon);
      } else {
        marker = L.marker([vehicle.lat, vehicle.lng], { icon })
          .addTo(leafletMapRef.current!)
          .bindPopup(`
            <div style="min-width: 150px;">
              <strong>${vehicle.plate}</strong>
              ${vehicle.driver ? `<br><span style="color: #666;">Driver: ${vehicle.driver}</span>` : ""}
              <br><span style="color: ${color}; font-weight: 500;">${vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}</span>
            </div>
          `);

        marker.on("click", () => {
          if (onVehicleClick) {
            onVehicleClick(vehicle.id);
          }
        });

        markersRef.current.set(vehicle.id, marker);
      }
    });
  }, [vehicles, selectedVehicleId, onVehicleClick]);

  // Draw route lines for active trips
  useEffect(() => {
    if (!leafletMapRef.current) return;

    // Remove old route lines not in current routes
    const currentRouteIds = new Set(activeRoutes.map(r => r.vehicleId));
    routeLinesRef.current.forEach((line, id) => {
      if (!currentRouteIds.has(id)) {
        line.remove();
        routeLinesRef.current.delete(id);
      }
    });
    destMarkersRef.current.forEach((marker, id) => {
      if (!currentRouteIds.has(id)) {
        marker.remove();
        destMarkersRef.current.delete(id);
      }
    });

    // Draw routes for active trips
    activeRoutes.forEach((route) => {
      const points: L.LatLngExpression[] = [
        [route.startLat, route.startLng],
        [route.currentLat, route.currentLng],
      ];

      // If there's a destination, add a dashed line to it
      if (route.destLat && route.destLng) {
        // Draw completed path (solid line from start to current)
        let completedLine = routeLinesRef.current.get(`${route.vehicleId}-completed`);
        if (completedLine) {
          completedLine.setLatLngs(points);
        } else {
          completedLine = L.polyline(points, {
            color: "#22c55e",
            weight: 4,
            opacity: 0.8,
          }).addTo(leafletMapRef.current!);
          routeLinesRef.current.set(`${route.vehicleId}-completed`, completedLine);
        }

        // Draw remaining path (dashed line from current to destination)
        const remainingPoints: L.LatLngExpression[] = [
          [route.currentLat, route.currentLng],
          [route.destLat, route.destLng],
        ];
        let remainingLine = routeLinesRef.current.get(`${route.vehicleId}-remaining`);
        if (remainingLine) {
          remainingLine.setLatLngs(remainingPoints);
        } else {
          remainingLine = L.polyline(remainingPoints, {
            color: "#3b82f6",
            weight: 3,
            opacity: 0.7,
            dashArray: "10, 10",
          }).addTo(leafletMapRef.current!);
          routeLinesRef.current.set(`${route.vehicleId}-remaining`, remainingLine);
        }

        // Add destination marker
        let destMarker = destMarkersRef.current.get(route.vehicleId);
        const destIcon = L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              width: 24px;
              height: 24px;
              background: #ef4444;
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 24],
        });

        if (destMarker) {
          destMarker.setLatLng([route.destLat, route.destLng]);
        } else {
          destMarker = L.marker([route.destLat, route.destLng], { icon: destIcon })
            .addTo(leafletMapRef.current!)
            .bindPopup(`<strong>Destino:</strong><br>${route.destination || "Destino da viagem"}`);
          destMarkersRef.current.set(route.vehicleId, destMarker);
        }
      } else {
        // Just show path from start to current position
        let line = routeLinesRef.current.get(route.vehicleId);
        if (line) {
          line.setLatLngs(points);
        } else {
          line = L.polyline(points, {
            color: "#22c55e",
            weight: 3,
            opacity: 0.8,
            dashArray: "8, 8",
          }).addTo(leafletMapRef.current!);
          routeLinesRef.current.set(route.vehicleId, line);
        }
      }
    });
  }, [activeRoutes]);

  return (
    <div
      ref={mapRef}
      className={`w-full h-full min-h-[400px] rounded-md ${className}`}
      data-testid="fleet-map"
    />
  );
}
