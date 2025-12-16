import { TripLogCard } from "../fleet/TripLogCard";

export default function TripLogCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TripLogCard
        id="t1"
        vehiclePlate="ABC-1234"
        driverName="John Smith"
        startLocation="Warehouse Central, SP"
        endLocation=""
        startTime="2024-12-16T08:30:00"
        purpose="Delivery"
        onClick={() => console.log("Trip clicked")}
      />
      <TripLogCard
        id="t2"
        vehiclePlate="XYZ-5678"
        driverName="Maria Santos"
        startLocation="Office HQ, SP"
        endLocation="Client Site, Campinas"
        startTime="2024-12-16T07:00:00"
        endTime="2024-12-16T09:45:00"
        distance={85}
        purpose="Client Meeting"
        onClick={() => console.log("Trip clicked")}
      />
      <TripLogCard
        id="t3"
        vehiclePlate="DEF-9012"
        driverName="Carlos Oliveira"
        startLocation="Distribution Center"
        endLocation="Store #15, Guarulhos"
        startTime="2024-12-16T06:00:00"
        endTime="2024-12-16T08:30:00"
        distance={42}
        purpose="Stock Replenishment"
        onClick={() => console.log("Trip clicked")}
      />
    </div>
  );
}
