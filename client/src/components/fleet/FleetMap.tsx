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

interface FleetMapProps {
  vehicles: VehicleMarker[];
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

export function FleetMap({ vehicles, onVehicleClick, selectedVehicleId, className = "" }: FleetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    leafletMapRef.current = L.map(mapRef.current).setView([-23.5505, -46.6333], 11);

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

  return (
    <div
      ref={mapRef}
      className={`w-full h-full min-h-[400px] rounded-md ${className}`}
      data-testid="fleet-map"
    />
  );
}
