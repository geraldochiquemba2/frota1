import { useState } from "react";
import { FleetMap } from "../fleet/FleetMap";

// todo: remove mock functionality
const mockVehicles = [
  { id: "v1", plate: "ABC-1234", lat: -23.5505, lng: -46.6333, status: "active" as const, driver: "John Smith" },
  { id: "v2", plate: "XYZ-5678", lat: -23.5705, lng: -46.6533, status: "idle" as const, driver: "Maria Santos" },
  { id: "v3", plate: "DEF-9012", lat: -23.5305, lng: -46.6133, status: "maintenance" as const },
  { id: "v4", plate: "GHI-3456", lat: -23.5905, lng: -46.6733, status: "alert" as const, driver: "Carlos Oliveira" },
  { id: "v5", plate: "JKL-7890", lat: -23.5405, lng: -46.6433, status: "active" as const, driver: "Ana Silva" },
];

export default function FleetMapExample() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | undefined>();

  return (
    <div className="h-[500px] w-full">
      <FleetMap
        vehicles={mockVehicles}
        selectedVehicleId={selectedVehicle}
        onVehicleClick={(id) => {
          setSelectedVehicle(id);
          console.log("Vehicle clicked:", id);
        }}
      />
    </div>
  );
}
