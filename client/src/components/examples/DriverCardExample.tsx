import { DriverCard } from "../fleet/DriverCard";

export default function DriverCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DriverCard
        id="d1"
        name="John Smith"
        phone="+55 11 99999-1234"
        email="john.smith@example.com"
        licenseExpiry="2025-06-15"
        status="on-trip"
        assignedVehicle="ABC-1234"
        onClick={() => console.log("Driver clicked")}
      />
      <DriverCard
        id="d2"
        name="Maria Santos"
        phone="+55 11 88888-5678"
        email="maria.santos@example.com"
        licenseExpiry="2025-01-10"
        status="available"
        onClick={() => console.log("Driver clicked")}
      />
      <DriverCard
        id="d3"
        name="Carlos Oliveira"
        phone="+55 11 77777-9012"
        email="carlos.oliveira@example.com"
        licenseExpiry="2024-12-20"
        status="off-duty"
        assignedVehicle="XYZ-5678"
        onClick={() => console.log("Driver clicked")}
      />
    </div>
  );
}
