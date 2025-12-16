import { VehicleCard } from "../fleet/VehicleCard";

export default function VehicleCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <VehicleCard
        id="v1"
        plate="ABC-1234"
        make="Ford"
        model="Transit"
        year={2022}
        status="active"
        driver="John Smith"
        location="Av. Paulista, 1000"
        fuelLevel={75}
        odometer={45230}
        onView={() => console.log("View vehicle")}
        onEdit={() => console.log("Edit vehicle")}
        onAssignDriver={() => console.log("Assign driver")}
      />
      <VehicleCard
        id="v2"
        plate="XYZ-5678"
        make="Mercedes"
        model="Sprinter"
        year={2021}
        status="idle"
        driver="Maria Santos"
        location="Rua Augusta, 500"
        fuelLevel={42}
        odometer={78500}
      />
      <VehicleCard
        id="v3"
        plate="DEF-9012"
        make="Volkswagen"
        model="Delivery"
        year={2020}
        status="maintenance"
        location="Oficina Central"
        fuelLevel={90}
        odometer={120000}
      />
    </div>
  );
}
