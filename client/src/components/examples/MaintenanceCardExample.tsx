import { MaintenanceCard } from "../fleet/MaintenanceCard";

export default function MaintenanceCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MaintenanceCard
        id="m1"
        vehiclePlate="ABC-1234"
        serviceType="Oil Change"
        scheduledDate="2024-12-20"
        status="scheduled"
        description="Regular oil change and filter replacement"
        onComplete={() => console.log("Complete maintenance")}
        onReschedule={() => console.log("Reschedule maintenance")}
      />
      <MaintenanceCard
        id="m2"
        vehiclePlate="XYZ-5678"
        serviceType="Brake Inspection"
        scheduledDate="2024-12-18"
        status="in-progress"
        description="Full brake system inspection and pad replacement"
        onComplete={() => console.log("Complete maintenance")}
      />
      <MaintenanceCard
        id="m3"
        vehiclePlate="DEF-9012"
        serviceType="Tire Rotation"
        scheduledDate="2024-12-10"
        status="overdue"
        description="Tire rotation and pressure check"
        onComplete={() => console.log("Complete maintenance")}
        onReschedule={() => console.log("Reschedule maintenance")}
      />
      <MaintenanceCard
        id="m4"
        vehiclePlate="GHI-3456"
        serviceType="Engine Tune-up"
        scheduledDate="2024-12-01"
        status="completed"
        description="Complete engine tune-up and diagnostics"
      />
    </div>
  );
}
